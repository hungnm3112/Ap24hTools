import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã OTP không được bỏ trống' })
  otp: string;
}
