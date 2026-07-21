import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

/*
 * Mọi request đến /users sẽ chạy vào class Controller này.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /*
   * Method: POST /users
   * Body: JSON chứa email, phone, password
   * Nhờ Global ValidationPipe, DTO sẽ tự động check lỗi trước khi chạy vào hàm create này.
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);

    // Loại bỏ trường password trước khi trả về cho Client để bảo mật
    // Lỗi delete: Trong TypeScript strict mode, không thể dùng toán tử `delete` lên một thuộc tính bắt buộc (required).
    // Giải pháp: Dùng cú pháp Destructuring (Rest parameter) để tách riêng biến password ra, phần còn lại gom vào biến userObject.
    const { password, ...userObject } = newUser.toObject();

    return {
      message: 'Tạo tài khoản thành công',
      data: userObject,
    };
  }
}
