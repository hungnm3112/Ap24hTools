import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // 1. Hàm Đăng Ký
  async register(createUserDto: CreateUserDto) {
    // Dùng lại hàm create của UsersService để lưu user mới vào DB
    const newUser = await this.usersService.create(createUserDto);

    // Tách mật khẩu ra trước khi trả về
    const { password, ...userObject } = newUser.toObject();

    return {
      message: 'Đăng ký tài khoản thành công! Vui lòng xác thực email.',
      data: userObject,
    };
  }

  // 2. Hàm Đăng Nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm user bằng email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không chính xác');
    }

    // So sánh mật khẩu gốc với mật khẩu đã băm (hash) trong DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    /* Tạm tắt check isActive để test đăng nhập trước khi sang Phase 2.3 (OTP)
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản chưa được xác thực OTP!');
    }
    */

    // Tạo nội dung (payload) gửi vào trong Token
    // sub thường được dùng để chứa ID của đối tượng
    const payload = { sub: user._id, email: user.email };

    // Sinh Access Token
    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
      user: { email: user.email, isActive: user.isActive },
    };
  }
}
