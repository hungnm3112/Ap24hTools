import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
 * JwtAuthGuard: Lính canh bảo vệ các endpoint API riêng tư.
 * Khi gắn @UseGuards(JwtAuthGuard) lên một API, nó sẽ kích hoạt JwtStrategy 
 * để kiểm tra token. Chỉ khi hợp lệ, request mới lọt qua được.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
