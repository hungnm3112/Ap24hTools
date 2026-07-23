import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogProductsService } from './catalog-products.service';
import { CatalogProductsController } from './catalog-products.controller';
import { CatalogProduct, CatalogProductSchema } from './schemas/catalog-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CatalogProduct.name, schema: CatalogProductSchema }])
  ],
  controllers: [CatalogProductsController],
  providers: [CatalogProductsService],
  exports: [CatalogProductsService]
})
export class CatalogProductsModule {}
