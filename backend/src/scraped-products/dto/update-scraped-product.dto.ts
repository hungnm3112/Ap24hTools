import { PartialType } from '@nestjs/mapped-types';
import { CreateScrapedProductDto } from './create-scraped-product.dto';

export class UpdateScrapedProductDto extends PartialType(CreateScrapedProductDto) {}
