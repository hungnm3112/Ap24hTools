import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/*
 * DTO (Data Transfer Object): Định nghĩa cấu trúc dữ liệu khi Frontend gọi API tạo User.
 * Kết hợp với ValidationPipe (đã cấu hình ở main.ts), dữ liệu sẽ được tự động check.
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được bỏ trống' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;
}
