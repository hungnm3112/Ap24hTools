import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapedProduct, ScrapedProductDocument } from './schemas/scraped-product.schema';
import { IgnoredKeywordsService } from '../ignored-keywords/ignored-keywords.service';
import { CatalogProductsService } from '../catalog-products/catalog-products.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScrapedProductsService {
  private readonly logger = new Logger(ScrapedProductsService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(ScrapedProduct.name) private scrapedProductModel: Model<ScrapedProductDocument>,
    private ignoredKeywordsService: IgnoredKeywordsService,
    private catalogProductsService: CatalogProductsService,
    private configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // Thuật toán AI Matching & Caching (Bước 4.2 trong Plan)
  async upsertProduct(productData: any) {
    // 1. Caching: Kiểm tra URL này đã tồn tại chưa
    const existing = await this.scrapedProductModel.findOne({ productUrl: productData.productUrl });

    let catalogProductId = existing?.catalogProductId || null;
    let catalogProductName = existing?.catalogProductName || null;
    let isAiMatched = existing?.isAiMatched || false;
    let matchScore = existing?.matchScore || 0;
    let aiConfidence = existing?.aiConfidence || 'LOW';

    // 2. Chỉ lưu thô (Không gọi AI ở đây nữa)
    // Tiến trình AI Matcher (chạy ngầm) sẽ chịu trách nhiệm quét các sản phẩm chưa match để xử lý sau.
    
    const payload = {
      ...productData,
      catalogProductId: catalogProductId, // Giữ lại ID cũ nếu đã từng match thành công
      catalogProductName: catalogProductName, // Giữ lại tên cũ
      isAiMatched: isAiMatched,
      matchScore: matchScore,
      aiConfidence: aiConfidence
    };

    return this.scrapedProductModel.findOneAndUpdate(
      { productUrl: productData.productUrl },
      { $set: payload },
      { returnDocument: 'after', upsert: true }
    );
  }

  async findAll() {
    return this.scrapedProductModel.find().populate('siteId').populate('catalogProductId').exec();
  }

  // --- API AGGREGATION CHO MATRIX BẢNG GIÁ N-WEB ---
  async getPriceMatrix() {
    return this.scrapedProductModel.aggregate([
      // 1. Chỉ lấy những ScrapedProduct đã được map với Catalog
      { $match: { catalogProductId: { $ne: null } } },

      // 2. Gom nhóm (Group) theo Catalog Product
      {
        $group: {
          _id: '$catalogProductId',
          catalogProductName: { $first: '$catalogProductName' },
          prices: {
            $push: {
              siteId: '$siteId',
              siteName: '$siteName', // Lấy trực tiếp từ schema (Denormalized)
              price: '$productPrice',
              url: '$productUrl',
              image: '$productImage',
              isAiMatched: '$isAiMatched',
              matchScore: '$matchScore',
              aiConfidence: '$aiConfidence'
            }
          }
        }
      },

      // 3. Thêm các trường tính toán (Số lượng site có bán)
      {
        $addFields: {
          siteCount: { $size: '$prices' }
        }
      },

      // 4. Sắp xếp danh sách ưu tiên những SP có mặt trên nhiều web nhất, sau đó theo tên A-Z
      { $sort: { siteCount: -1, catalogProductName: 1 } }
    ]).exec();
  }

  async deleteAll() {
    return this.scrapedProductModel.deleteMany({}).exec();
  }
}
