import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { CompetitorsModule } from '../competitors/competitors.module';
import { ScrapedProductsModule } from '../scraped-products/scraped-products.module';
import { MasterProductsModule } from '../master-products/master-products.module';

@Module({
  imports: [CompetitorsModule, ScrapedProductsModule, MasterProductsModule],
  controllers: [ScrapingController],
  providers: [ScrapingService]
})
export class ScrapingModule {}
