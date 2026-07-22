import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterProductsService } from './master-products.service';
import { MasterProductsController } from './master-products.controller';
import { MasterProduct, MasterProductSchema } from './schemas/master-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MasterProduct.name, schema: MasterProductSchema }])
  ],
  controllers: [MasterProductsController],
  providers: [MasterProductsService],
  exports: [MasterProductsService, MongooseModule]
})
export class MasterProductsModule {}
