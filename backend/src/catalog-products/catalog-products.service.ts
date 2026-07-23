import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogProduct, CatalogProductDocument } from './schemas/catalog-product.schema';

@Injectable()
export class CatalogProductsService {
  constructor(
    @InjectModel(CatalogProduct.name) private catalogProductModel: Model<CatalogProductDocument>,
  ) {}

  // Bước 2.2 & 2.3: MongoDB Text Search tìm 20 ứng viên gần giống nhất
  async findSimilarProducts(normalizedName: string): Promise<CatalogProductDocument[]> {
    if (!normalizedName) return [];
    
    // Sử dụng $text index để tìm kiếm siêu tốc
    // MongoDB sẽ tự động chấm điểm (textScore) dựa trên mức độ trùng khớp từ khóa
    return this.catalogProductModel.find(
      { $text: { $search: normalizedName } },
      { score: { $meta: 'textScore' } } // Yêu cầu trả về score
    )
    .sort({ score: { $meta: 'textScore' } }) // Sắp xếp giảm dần theo độ trùng khớp
    .limit(20) // Chỉ lấy tối đa 20 ứng viên sáng giá nhất
    .exec();
  }

  // Bước 4: Tạo mới Catalog Product nếu AI trả về 'NEW'
  async findOrCreateCatalogProduct(rawName: string, normalizedName: string): Promise<CatalogProductDocument> {
    // Upsert để đảm bảo không tạo trùng nếu chạy đồng thời
    const result = await this.catalogProductModel.findOneAndUpdate(
      { normalizedName },
      { 
        $setOnInsert: { 
          name: rawName,
          normalizedName: normalizedName
        } 
      },
      { new: true, upsert: true }
    );
    return result;
  }

  // Các hàm CRUD mặc định
  create(createCatalogProductDto: any) {
    const createdProduct = new this.catalogProductModel(createCatalogProductDto);
    return createdProduct.save();
  }

  findAll() {
    return this.catalogProductModel.find().exec();
  }

  findOne(id: string) {
    return this.catalogProductModel.findById(id).exec();
  }

  update(id: string, updateCatalogProductDto: any) {
    // Sử dụng findByIdAndUpdate, { new: true } để trả về document sau khi đã update
    return this.catalogProductModel.findByIdAndUpdate(id, updateCatalogProductDto, { new: true }).exec();
  }

  remove(id: string) {
    // Sử dụng findByIdAndDelete để xóa document
    return this.catalogProductModel.findByIdAndDelete(id).exec();
  }
}
