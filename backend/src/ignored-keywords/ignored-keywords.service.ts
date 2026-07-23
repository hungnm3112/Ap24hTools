import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IgnoredKeyword, IgnoredKeywordDocument } from './schemas/ignored-keyword.schema';

@Injectable()
export class IgnoredKeywordsService implements OnModuleInit {
  private keywordsCache: string[] = [];

  constructor(
    @InjectModel(IgnoredKeyword.name) private ignoredKeywordModel: Model<IgnoredKeywordDocument>,
  ) {}

  async onModuleInit() {
    // 1. Khởi tạo một số từ khóa rác thông dụng nếu DB trống (Pre-seed data)
    const count = await this.ignoredKeywordModel.countDocuments();
    if (count === 0) {
      const defaultKeywords = [
        'chính hãng', 'vna', 'vn/a', 'giá sốc', 'mới 100%', 
        'likenew', 'cũ', '99%', 'trôi bảo hành', 'đã kích hoạt',
        'nhập khẩu', 'xách tay', 'điện thoại', 'máy tính bảng', 'laptop'
      ];
      const docs = defaultKeywords.map(kw => ({ keyword: kw }));
      await this.ignoredKeywordModel.insertMany(docs);
    }
    
    // 2. Load cache vào memory để hàm normalize chạy cực nhanh mà không cần Query DB
    await this.refreshCache();
  }

  async refreshCache() {
    const docs = await this.ignoredKeywordModel.find().lean().exec();
    this.keywordsCache = docs.map(d => d.keyword.toLowerCase());
  }

  // Thuật toán Normalize (Tiền xử lý chuỗi) - Bước 2.1 trong Implementation Plan
  normalizeProductName(rawName: string): string {
    if (!rawName) return '';
    // 1. Đổi sang chữ thường
    let normalized = rawName.toLowerCase();
    
    // 2. Xóa các từ khóa rác trong từ điển (dùng Regex \b để tránh xóa nhầm từ trong từ)
    for (const kw of this.keywordsCache) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape ký tự đặc biệt
      // Vì tiếng Việt có dấu, \b đôi khi hoạt động không chuẩn 100%, nhưng tạm đủ tốt
      const regex = new RegExp(`(^|\\s)${escapedKw}(\\s|$)`, 'gi');
      normalized = normalized.replace(regex, ' ');
    }

    // 3. Xóa các ký tự đặc biệt (chỉ giữ lại chữ cái, số tiếng Anh/Việt, và khoảng trắng)
    // Dùng \p{L} để match mọi ký tự chữ cái (bao gồm tiếng Việt) trong Unicode
    normalized = normalized.replace(/[^\p{L}0-9\s]/gu, ' ');

    // 4. Xóa khoảng trắng thừa
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  // Các hàm CRUD API
  create(createDto: any) {
    return this.ignoredKeywordModel.create(createDto);
  }

  findAll() {
    return this.ignoredKeywordModel.find().exec();
  }

  findOne(id: string) {
    return this.ignoredKeywordModel.findById(id).exec();
  }

  update(id: string, updateDto: any) {
    return this.ignoredKeywordModel.findByIdAndUpdate(id, updateDto, { returnDocument: 'after' }).exec();
  }

  remove(id: string) {
    return this.ignoredKeywordModel.findByIdAndDelete(id).exec();
  }
}
