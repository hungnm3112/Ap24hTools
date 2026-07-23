import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { CompetitorsModule } from '../competitors/competitors.module';
import { ScrapedProductsModule } from '../scraped-products/scraped-products.module';
import { CatalogProductsModule } from '../catalog-products/catalog-products.module';

@Module({
  imports: [CompetitorsModule, ScrapedProductsModule, CatalogProductsModule],
  controllers: [ScrapingController],
  providers: [ScrapingService]
})
export class ScrapingModule {}
