import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được bỏ trống' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;
}
