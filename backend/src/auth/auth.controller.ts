import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // POST /auth/login
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /*
   * GET /auth/profile
   * API mẫu để test thử tính năng bảo vệ Route bằng Guard.
   * Chỉ những request có kèm Header "Authorization: Bearer <token>" hợp lệ mới được vào.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // Thông tin user được tự động trích xuất từ Token thông qua JwtStrategy và gắn vào req.user
    return {
      message: 'Đây là dữ liệu tuyệt mật, chỉ người có token mới thấy!',
      user: req.user, // req.user được trả về từ hàm validate() bên jwt.strategy.ts
    };
  }
}
