import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapedProductsService } from './scraped-products.service';
import { ScrapedProductsController } from './scraped-products.controller';
import { ScrapedProduct, ScrapedProductSchema } from './schemas/scraped-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScrapedProduct.name, schema: ScrapedProductSchema }])
  ],
  controllers: [ScrapedProductsController],
  providers: [ScrapedProductsService],
  exports: [ScrapedProductsService, MongooseModule]
})
export class ScrapedProductsModule {}
