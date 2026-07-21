import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã OTP không được bỏ trống' })
  otp: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được bỏ trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  newPassword: string;
}
