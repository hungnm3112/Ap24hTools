import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Competitor } from '../../competitors/schemas/competitor.schema';
import { MasterProduct } from '../../master-products/schemas/master-product.schema';

export type ScrapedProductDocument = ScrapedProduct & Document;

@Schema({ timestamps: true })
export class ScrapedProduct {
  // Logic: Tạo document schema cho ScrapedProduct (Sản phẩm lấy về từ các web)
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Competitor', required: true })
  siteId: Competitor; // ID của website/đối thủ

  @Prop({ required: true, unique: true })
  productUrl: string; // URL của sản phẩm (dùng làm unique key để cập nhật)

  @Prop({ required: true })
  productName: string; // Tên sản phẩm hiển thị trên web đó

  @Prop({ required: true })
  productPrice: number; // Giá bán (đã parse sang số)

  @Prop({ required: true })
  productImage: string; // URL ảnh sản phẩm

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MasterProduct', default: null })
  masterProductId: MasterProduct; // ID của Sản phẩm Chuẩn (nếu đã được map)

  @Prop({ default: false })
  isAiMatched: boolean; // Đánh dấu đây là kết quả map tự động của AI

  @Prop({ default: false })
  isAdminApproved: boolean; // Đánh dấu Admin đã duyệt cái mapping này
}

export const ScrapedProductSchema = SchemaFactory.createForClass(ScrapedProduct);
// Index URL để tìm kiếm / upsert nhanh
ScrapedProductSchema.index({ productUrl: 1 });
