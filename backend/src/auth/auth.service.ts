import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // 1. Hàm Đăng Ký
  async register(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    
    // Sinh mã OTP 6 số ngẫu nhiên (vd: 345612)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5); // Hết hạn sau 5 phút

    // Cập nhật OTP vào DB
    await this.usersService.updateCodeId(newUser.email, otp, expiredAt);

    // Gửi email (dùng catch để không crash app nếu lỗi gửi mail)
    this.mailService.sendOtpEmail(newUser.email, otp).catch(console.error);
    
    const { password, ...userObject } = newUser.toObject();
    
    return {
      message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để lấy mã OTP.',
      data: userObject,
    };
  }

  // 2. Xác thực OTP
  async verify(verifyDto: VerifyDto) {
    const { email, otp } = verifyDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');
    if (user.isActive) throw new BadRequestException('Tài khoản đã được kích hoạt từ trước');
    if (user.codeId !== otp) throw new BadRequestException('Mã OTP không chính xác');
    if (user.codeExpired < new Date()) throw new BadRequestException('Mã OTP đã hết hạn');

    // Kích hoạt
    await this.usersService.activateUser(email);
    return { message: 'Xác thực tài khoản thành công! Giờ đây bạn có thể đăng nhập.' };
  }

  // 3. Đăng Nhập
  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    
    // Tìm user bằng số điện thoại
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new UnauthorizedException('Số điện thoại không chính xác');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Mật khẩu không chính xác');

    // Bắt buộc xác thực email mới cho login
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản chưa được xác thực OTP! Vui lòng kiểm tra email.');
    }

    const payload = { sub: user._id, email: user.email };
    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
      user: { email: user.email, isActive: user.isActive },
    };
  }

  // 4. Quên Mật Khẩu
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');

    // Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5); 

    await this.usersService.updateCodeId(user.email, otp, expiredAt);
    this.mailService.sendOtpEmail(user.email, otp).catch(console.error);

    return { message: 'Mã OTP khôi phục mật khẩu đã được gửi qua email của bạn.' };
  }

  // 5. Đặt Lại Mật Khẩu
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');

    if (user.codeId !== otp) throw new BadRequestException('Mã OTP không chính xác');
    if (user.codeExpired < new Date()) throw new BadRequestException('Mã OTP đã hết hạn');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersService.updatePassword(email, hashedPassword);

    return { message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' };
  }
}
