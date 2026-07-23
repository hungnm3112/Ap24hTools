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

    // 2. Nếu chưa có mapping (SP mới tinh hoặc chưa map được), tiến hành AI Matching
    if (!catalogProductId && this.genAI) {
      try {
        // Bước 2.1: Lọc thô - Tiền xử lý
        const normalizedName = this.ignoredKeywordsService.normalizeProductName(productData.productName);

        // Bước 2.2: Lọc thô - Tìm 20 ứng viên gần giống bằng MongoDB Text Search
        const candidates = await this.catalogProductsService.findSimilarProducts(normalizedName);

        if (candidates.length === 0) {
          // Bảng Catalog hoàn toàn trống hoặc không có gì giống -> Tạo mới luôn không cần gọi AI
          const newCatalog = await this.catalogProductsService.findOrCreateCatalogProduct(productData.productName, normalizedName);
          catalogProductId = newCatalog._id;
          isAiMatched = false;
          matchScore = 100;
          aiConfidence = 'HIGH';
        } else {
          // Bước 3: Gửi cho Gemini AI phán đoán
          const prompt = `Bạn là một chuyên gia dữ liệu E-commerce. Nhiệm vụ của bạn là map sản phẩm mới cào được vào 1 Sản phẩm Chuẩn (Catalog Product) trong danh sách ứng viên.
                          Sản phẩm mới: "${productData.productName}" (Đã chuẩn hóa: "${normalizedName}")
                          Danh sách ứng viên (ID | Tên):
                          ${candidates.map(c => `- ${c._id} | ${c.name}`).join('\n')}

                          Luật lệ bắt buộc:
                          1. Nếu bạn chắc chắn sản phẩm mới trùng khớp với 1 ứng viên trong danh sách, hãy trả về CHỈ MỘT ID CỦA ỨNG VIÊN ĐÓ.
                          2. Nếu bạn thấy sản phẩm mới hoàn toàn khác biệt (khác dòng máy, khác bộ nhớ, không thuộc về ứng viên nào), hãy trả về chữ "NEW".
                          3. CHỈ TRẢ VỀ ĐÚNG 1 DÒNG TEXT CHỨA ID HOẶC CHỮ NEW, KHÔNG GIẢI THÍCH THÊM BẤT KỲ ĐIỀU GÌ.`;

          const geminiModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.5-flash';
          const model = this.genAI.getGenerativeModel({ model: geminiModel });
          const result = await model.generateContent(prompt);
          const aiResponse = result.response.text().trim();

          if (aiResponse === 'NEW' || aiResponse.length > 30) { // length > 30 đề phòng AI trả lời luyên thuyên
            // AI báo là sản phẩm hoàn toàn mới -> Tạo mới vào Từ điển Catalog
            const newCatalog = await this.catalogProductsService.findOrCreateCatalogProduct(productData.productName, normalizedName);
            catalogProductId = newCatalog._id;
            isAiMatched = true;
            matchScore = 100; // Vì nó là chính nó
            aiConfidence = 'HIGH';
          } else {
            // AI đã chọn 1 ID
            const matchedCandidate = candidates.find(c => c._id.toString() === aiResponse);
            if (matchedCandidate) {
              catalogProductId = matchedCandidate._id;
              isAiMatched = true;
              matchScore = 90; // AI match thường cho điểm 90
              aiConfidence = 'MEDIUM'; // Cần Admin review lại trên giao diện
            } else {
              // AI trả về ID linh tinh không có trong mảng -> Bạo dạn tạo mới fallback
              const newCatalog = await this.catalogProductsService.findOrCreateCatalogProduct(productData.productName, normalizedName);
              catalogProductId = newCatalog._id;
            }
          }
        }
      } catch (error) {
        this.logger.error(`AI Matching failed for ${productData.productName}: ${error.message}`);
      }
    }

    // 3. Cập nhật vào Scraped Product
    const payload = {
      ...productData,
      catalogProductId,
      isAiMatched,
      matchScore,
      aiConfidence
    };

    return this.scrapedProductModel.findOneAndUpdate(
      { productUrl: productData.productUrl },
      { $set: payload },
      { new: true, upsert: true }
    );
  }

  async findAll() {
    return this.scrapedProductModel.find().populate('siteId').populate('catalogProductId').exec();
  }
}
