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
    let isAiMatched = existing?.isAiMatched || false;
    let matchScore = existing?.matchScore || 0;
    let aiConfidence = existing?.aiConfidence || 'LOW';

    // 2. Chỉ lưu thô (Không gọi AI ở đây nữa)
    // Tiến trình AI Matcher (chạy ngầm) sẽ chịu trách nhiệm quét các sản phẩm chưa match để xử lý sau.
    
    const payload = {
      ...productData,
      catalogProductId: catalogProductId, // Giữ lại ID cũ nếu đã từng match thành công
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
      
      // 2. Lookup để lấy tên Web Đối thủ (Competitor)
      {
        $lookup: {
          from: 'competitors', 
          localField: 'siteId',
          foreignField: '_id',
          as: 'site'
        }
      },
      { $unwind: { path: '$site', preserveNullAndEmptyArrays: true } },

      // 3. Lookup để lấy thông tin Sản phẩm chuẩn (Catalog Product)
      {
        $lookup: {
          from: 'catalogproducts', // Mongoose mặc định thêm 's' thành catalogproducts
          localField: 'catalogProductId',
          foreignField: '_id',
          as: 'catalog'
        }
      },
      { $unwind: { path: '$catalog', preserveNullAndEmptyArrays: true } },

      // 4. Gom nhóm (Group) theo Catalog Product
      {
        $group: {
          _id: '$catalogProductId',
          catalogProductName: { $first: '$catalog.name' },
          prices: {
            $push: {
              siteId: '$site._id',
              siteName: '$site.name',
              price: '$productPrice',
              url: '$productUrl',
              isAiMatched: '$isAiMatched',
              matchScore: '$matchScore',
              aiConfidence: '$aiConfidence'
            }
          }
        }
      },

      // 5. Thêm các trường tính toán (Thấp nhất, Cao nhất)
      {
        $addFields: {
          lowestPrice: { $min: '$prices.price' },
          highestPrice: { $max: '$prices.price' }
        }
      },

      // 6. Sắp xếp danh sách (tuỳ chọn) theo tên sản phẩm A-Z
      { $sort: { catalogProductName: 1 } }
    ]).exec();
  }
}
