import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MasterProductDocument = MasterProduct & Document;

@Schema({ timestamps: true })
export class MasterProduct {
  // Logic: Tạo document schema cho MasterProduct (Sản phẩm chuẩn/Sản phẩm gốc)
  // Đây là trục chính để các sản phẩm cào được từ các trang web liên kết vào.
  
  @Prop({ required: true, unique: true })
  name: string; // Tên chuẩn hiển thị (vd: iPhone 16 Pro Max 256GB)
  
  @Prop({ required: true })
  normalizedName: string; // Tên chuẩn hóa chữ thường, bỏ dấu để phục vụ lọc thô nhanh
}

export const MasterProductSchema = SchemaFactory.createForClass(MasterProduct);
// Index text search để tìm kiếm siêu nhanh ứng viên
MasterProductSchema.index({ normalizedName: 'text' });
