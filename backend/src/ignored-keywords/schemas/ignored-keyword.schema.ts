import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type IgnoredKeywordDocument = IgnoredKeyword & Document;

@Schema({ timestamps: true })
export class IgnoredKeyword {
  @Prop({ required: true, unique: true })
  keyword: string; // Từ khóa rác (vd: "chính hãng", "vn/a")

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
  categoryId: any; // Áp dụng cho danh mục cụ thể, nếu null là áp dụng toàn hệ thống
}

export const IgnoredKeywordSchema = SchemaFactory.createForClass(IgnoredKeyword);
