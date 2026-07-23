import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapedProductsService } from './scraped-products.service';
import { ScrapedProductsController } from './scraped-products.controller';
import { ScrapedProduct, ScrapedProductSchema } from './schemas/scraped-product.schema';
import { IgnoredKeywordsModule } from '../ignored-keywords/ignored-keywords.module';
import { CatalogProductsModule } from '../catalog-products/catalog-products.module';
import { ConfigModule } from '@nestjs/config';
import { AiMatcherService } from './ai-matcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScrapedProduct.name, schema: ScrapedProductSchema }]),
    IgnoredKeywordsModule,
    CatalogProductsModule,
    ConfigModule
  ],
  controllers: [ScrapedProductsController],
  providers: [ScrapedProductsService, AiMatcherService],
  exports: [ScrapedProductsService]
})
export class ScrapedProductsModule {}
