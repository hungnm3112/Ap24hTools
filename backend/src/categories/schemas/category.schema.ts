import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

/* 
 * LÝ DO THIẾT KẾ SCHEMA (WHY?):
 * 1. @Schema({ timestamps: true }): Tự động thêm trường createdAt và updatedAt. 
 *    Điều này rất quan trọng để audit (truy vết) xem danh mục được tạo/sửa khi nào mà không cần tự code tay.
 * 2. Thiết kế dữ liệu theo dạng NoSQL: Bảng Category chỉ cần thiết kế đơn giản, 
 *    không cần chứa các reference (khóa ngoại) phức tạp trừ khi cần thiết. 
 *    Ở đây Category đóng vai trò như một bảng tra cứu (Lookup table).
 */
@Schema({ timestamps: true })
export class Category {
  /*
   * @Prop({ required: true, unique: true }): 
   * Tên danh mục (ví dụ: Điện thoại, Laptop) bắt buộc phải nhập và không được trùng lặp.
   * Ràng buộc unique ở cấp độ Database giúp ngăn chặn lỗi dữ liệu rác.
   */
  @Prop({ required: true, unique: true })
  name: string;

  /*
   * @Prop({ default: true }):
   * Trạng thái hiển thị/hoạt động. Thay vì xóa vật lý (hard delete) một danh mục,
   * chúng ta sử dụng cờ isActive để ẩn danh mục đó đi (soft delete).
   * Tại sao? Vì danh mục có thể đã được liên kết với nhiều sản phẩm khác, xóa vật lý sẽ làm hỏng dữ liệu.
   */
  @Prop({ default: true })
  isActive: boolean;

  /*
   * LÝ DO: Thiết kế dạng Parent Reference (Tham chiếu cha).
   * Nếu parentId = null (hoặc không có), đây là danh mục gốc (Root Category).
   * Nếu parentId có giá trị (tham chiếu đến _id của một Category khác), đây là danh mục con.
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId;
}

// Biên dịch class Category thành Schema của Mongoose
export const CategorySchema = SchemaFactory.createForClass(Category);
