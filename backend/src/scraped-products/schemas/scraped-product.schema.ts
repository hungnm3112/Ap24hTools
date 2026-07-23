import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Competitor } from '../../competitors/schemas/competitor.schema';
import { CatalogProduct } from '../../catalog-products/schemas/catalog-product.schema';

export type ScrapedProductDocument = ScrapedProduct & Document;

@Schema({ timestamps: true })
export class ScrapedProduct {
  // Logic: Tạo document schema cho ScrapedProduct (Sản phẩm lấy về từ các web)
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Competitor', required: true })
  siteId: Competitor | Types.ObjectId; // ID của website/đối thủ

  @Prop({ required: true })
  siteName: string; // Tên của website (Denormalized từ Competitor để truy vấn nhanh)

  @Prop({ required: true, unique: true })
  productUrl: string; // URL của sản phẩm (dùng làm unique key để cập nhật)

  @Prop({ required: true })
  productName: string; // Tên sản phẩm hiển thị trên web đó

  @Prop({ required: true })
  productPrice: number; // Giá bán (đã parse sang số)

  @Prop({ required: true })
  productImage: string; // URL ảnh sản phẩm

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CatalogProduct', default: null })
  catalogProductId: CatalogProduct | Types.ObjectId; // ID của Sản phẩm Chuẩn (nếu đã được map)

  @Prop({ default: null })
  catalogProductName: string; // Tên sản phẩm chuẩn (Denormalized từ CatalogProduct để truy vấn nhanh)

  @Prop({ default: false })
  isAiMatched: boolean; // Đánh dấu đây là kết quả map tự động của AI

  @Prop({ default: 0 })
  matchScore: number; // Điểm số khớp (0-100) do AI đánh giá

  @Prop({ default: 'LOW' })
  aiConfidence: string; // Độ tự tin của AI (LOW, MEDIUM, HIGH)

  @Prop({ default: false })
  isAdminApproved: boolean; // Đánh dấu Admin đã duyệt cái mapping này
}

export const ScrapedProductSchema = SchemaFactory.createForClass(ScrapedProduct);
