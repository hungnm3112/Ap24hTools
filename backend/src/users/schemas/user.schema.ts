import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/*
 * @Schema(): Decorator khai báo class User ánh xạ tới một collection trong MongoDB.
 * timestamps: true -> Mongoose sẽ tự động sinh thêm 2 trường createdAt và updatedAt.
 */
@Schema({ timestamps: true })
export class User {
  /*
   * @Prop(): Định nghĩa các thuộc tính của document.
   * - required: true -> Bắt buộc phải có
   * - unique: true -> Đảm bảo giá trị này là duy nhất trong toàn collection
   */
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  // Lưu mật khẩu đã được băm (hashed) bằng bcrypt, không lưu dạng thô (plaintext)
  @Prop({ required: true })
  password: string;

  // Trạng thái tài khoản (sẽ chuyển thành true sau khi xác thực OTP)
  @Prop({ default: false })
  isActive: boolean;

  // Mã OTP dùng để xác thực hoặc quên mật khẩu
  @Prop()
  codeId: string;

  // Thời gian hết hạn của mã OTP
  @Prop()
  codeExpired: Date;
}

// Chuyển đổi class User thành Schema để Mongoose biên dịch thành collection
export const UserSchema = SchemaFactory.createForClass(User);
