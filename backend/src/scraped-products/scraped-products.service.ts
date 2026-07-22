import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapedProduct, ScrapedProductDocument } from './schemas/scraped-product.schema';

@Injectable()
export class ScrapedProductsService {
  constructor(
    @InjectModel(ScrapedProduct.name) private scrapedProductModel: Model<ScrapedProductDocument>,
  ) {}

  async upsertProduct(productData: any) {
    // Upsert dựa trên productUrl
    return this.scrapedProductModel.findOneAndUpdate(
      { productUrl: productData.productUrl },
      { $set: productData },
      { new: true, upsert: true }
    );
  }

  async findAll() {
    return this.scrapedProductModel.find().populate('siteId').populate('masterProductId').exec();
  }
}
