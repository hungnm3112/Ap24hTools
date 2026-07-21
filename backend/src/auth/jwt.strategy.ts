import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/*
 * PassportStrategy: Định nghĩa "Chiến lược" xác thực JWT.
 * NestJS tự động gọi hàm validate() mỗi khi có request gửi kèm Access Token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Cấu hình JwtStrategy
    super({
      // Chỉ định cách lấy token từ request (Authorization: Bearer <token>)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Nếu token hết hạn -> báo lỗi 401 ngay
      ignoreExpiration: false,
      // Chìa khóa bí mật dùng để giải mã token (lấy từ .env)
      // Nếu không tìm thấy biến JWT_SECRET trong .env, sẽ fallback về chuỗi mặc định '0329308373' để tránh lỗi undefined
      secretOrKey: configService.get<string>('JWT_SECRET') || '0329308373',
    });
  }

  /*
   * Hàm validate() được gọi tự động NẾU quá trình giải mã (verify) JWT thành công.
   * Biến 'payload' chứa thông tin (thường là sub, email) mà ta đã nhét vào lúc login.
   */
  async validate(payload: any) {
    // Truy vấn DB để kiểm tra xem tài khoản có còn tồn tại không
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }
    
    // Đối tượng return ở đây sẽ tự động được NestJS gán vào biến `request.user`
    return { userId: payload.sub, email: payload.email, isActive: user.isActive };
  }
}
