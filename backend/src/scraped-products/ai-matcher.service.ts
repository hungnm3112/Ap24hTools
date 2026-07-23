import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapedProduct, ScrapedProductDocument } from './schemas/scraped-product.schema';
import { IgnoredKeywordsService } from '../ignored-keywords/ignored-keywords.service';
import { CatalogProductsService } from '../catalog-products/catalog-products.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AiMatcherService {
  private readonly logger = new Logger(AiMatcherService.name);
  private genAI: GoogleGenerativeAI;
  private isProcessing = false;

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

  // Chạy ngầm mỗi phút để quét các sản phẩm chưa match
  @Cron(CronExpression.EVERY_MINUTE)
  async processUnmatchedProducts() {
    if (!this.genAI) return;
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    try {
      // Lấy ra 10 sản phẩm chưa map
      const unmatchedProducts = await this.scrapedProductModel.find({ isAiMatched: false, catalogProductId: null }).limit(10);
      if (unmatchedProducts.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`[AI Matcher] Bắt đầu xử lý Batch ${unmatchedProducts.length} sản phẩm...`);

      // Khởi tạo model AI JSON
      const geminiModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.5-flash';
      const model = this.genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: { responseMimeType: "application/json" }
      });

      // Lọc thô và lấy ứng viên cho mỗi sản phẩm
      const batchData: any[] = [];
      for (const p of unmatchedProducts) {
        const normalizedName = this.ignoredKeywordsService.normalizeProductName(p.productName);
        const candidates = await this.catalogProductsService.findSimilarProducts(normalizedName);
        
        if (candidates.length === 0) {
          // Tự tạo luôn nếu không có ứng viên
          const newCatalog = await this.catalogProductsService.findOrCreateCatalogProduct(p.productName, normalizedName);
          p.catalogProductId = newCatalog._id;
          p.isAiMatched = true;
          p.matchScore = 100;
          p.aiConfidence = 'HIGH';
          await p.save();
        } else {
          batchData.push({
            scrapedId: p._id.toString(),
            name: p.productName,
            normalized: normalizedName,
            candidates: candidates.map(c => ({ id: c._id.toString(), name: c.name }))
          });
        }
      }

      if (batchData.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Xây dựng Prompt Batching
      const prompt = `Bạn là chuyên gia dữ liệu E-commerce. Dưới đây là danh sách ${batchData.length} sản phẩm mới cào được (kèm danh sách ứng viên chuẩn cho từng sản phẩm).
      Nhiệm vụ: Phân tích và map mỗi sản phẩm vào MỘT id ứng viên chuẩn xác nhất.
      Nếu không có ứng viên nào khớp (hoặc khác phiên bản bộ nhớ/màu sắc), hãy trả về id là "NEW".
      
      Danh sách đầu vào:
      ${JSON.stringify(batchData, null, 2)}
      
      Yêu cầu đầu ra: TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON ARRAY SAU (Không chứa markdown, không có text dư thừa):
      [
        { "scrapedId": "...", "matchedCandidateId": "..." },
        ...
      ]`;

      const result = await model.generateContent(prompt);
      let aiResponseText = result.response.text().trim();
      
      // Cleanup markdown nếu AI vô tình trả về
      if (aiResponseText.startsWith('```json')) {
        aiResponseText = aiResponseText.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      const parsedMatches = JSON.parse(aiResponseText);

      // Cập nhật lại vào DB
      let successCount = 0;
      for (const match of parsedMatches) {
        const { scrapedId, matchedCandidateId } = match;
        const product = unmatchedProducts.find(p => p._id.toString() === scrapedId);
        
        if (product) {
          if (matchedCandidateId === 'NEW') {
            const batchItem = batchData.find(b => b.scrapedId === scrapedId);
            const newCatalog = await this.catalogProductsService.findOrCreateCatalogProduct(product.productName, batchItem.normalized);
            product.catalogProductId = newCatalog._id;
            product.isAiMatched = true;
            product.matchScore = 100;
            product.aiConfidence = 'HIGH';
          } else {
            product.catalogProductId = matchedCandidateId;
            product.isAiMatched = true;
            product.matchScore = 90;
            product.aiConfidence = 'MEDIUM';
          }
          await product.save();
          successCount++;
        }
      }
      this.logger.log(`[AI Matcher] Hoàn thành map ${successCount}/${batchData.length} sản phẩm.`);
    } catch (error) {
      this.logger.error(`[AI Matcher] Lỗi xử lý AI Batch: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
