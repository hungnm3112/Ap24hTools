import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScrapedProductsService } from './scraped-products.service';

@Controller('scraped-products')
export class ScrapedProductsController {
  constructor(private readonly scrapedProductsService: ScrapedProductsService) {}

  @Get()
  findAll() {
    return this.scrapedProductsService.findAll();
  }
}
