import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type CompetitorDocument = Competitor & Document;

/*
 * LÝ DO THIẾT KẾ SCHEMA NHÚNG (EMBEDDED DOCUMENT):
 * Thay vì tạo một Collection `scraping_urls` riêng biệt và dùng khóa ngoại (Reference), 
 * ta nhúng mảng `scrapingUrls` trực tiếp vào trong `Competitor`.
 * Tại sao (WHY)?
 * 1. Số lượng URL cho mỗi đối thủ thường ít (vài chục danh mục), không làm phình kích thước document (giới hạn MongoDB là 16MB).
 * 2. Tăng tốc độ truy vấn: Lấy thông tin đối thủ là có luôn toàn bộ link cào mà không cần phải `$lookup` (JOIN) đắt đỏ.
 * 3. Atomic Updates: Thêm/xóa URL diễn ra trong cùng 1 transaction lưu đối thủ.
 */

// Schema phụ cho mỗi dòng URL cào dữ liệu
@Schema({ _id: false }) // Không cần tạo _id tự động cho sub-document để tối ưu dung lượng
export class ScrapingUrl {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  url: string;
}
export const ScrapingUrlSchema = SchemaFactory.createForClass(ScrapingUrl);

// Schema phụ cho Cấu hình Selectors (Dùng cho Phase 3.4)
@Schema({ _id: false })
export class Selectors {
  @Prop()
  productItem?: string; // Ví dụ: '.product-item'

  @Prop()
  productName?: string; // Ví dụ: '.product-name'

  @Prop()
  productPrice?: string; // Ví dụ: '.price'

  @Prop()
  productImage?: string; // Ví dụ: 'img.thumbnail'

  @Prop()
  nextPageButton?: string; // Ví dụ: '.pagination-next'
}
export const SelectorsSchema = SchemaFactory.createForClass(Selectors);


@Schema({ timestamps: true })
export class Competitor {
  @Prop({ required: true, unique: true })
  name: string; // Tên đối thủ (VD: CellphoneS)

  @Prop({ required: true })
  domain: string; // Tên miền (VD: cellphones.com.vn)

  @Prop({ type: [ScrapingUrlSchema], default: [] })
  scrapingUrls: ScrapingUrl[]; // Mảng nhúng danh sách URL cào dữ liệu theo từng danh mục

  @Prop({ type: SelectorsSchema, default: {} })
  selectors: Selectors; // Cấu hình CSS Selector

  @Prop()
  customCookies?: string; // Chuỗi Cookie giả lập (VD: vị trí địa lý, session)

  @Prop({ default: true })
  isActive: boolean;
}

export const CompetitorSchema = SchemaFactory.createForClass(Competitor);
