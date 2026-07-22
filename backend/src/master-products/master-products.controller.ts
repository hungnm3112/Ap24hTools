import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MasterProductsService } from './master-products.service';
import { CreateMasterProductDto } from './dto/create-master-product.dto';
import { UpdateMasterProductDto } from './dto/update-master-product.dto';

@Controller('master-products')
export class MasterProductsController {
  constructor(private readonly masterProductsService: MasterProductsService) {}

  @Post()
  create(@Body() createMasterProductDto: CreateMasterProductDto) {
    return this.masterProductsService.create(createMasterProductDto);
  }

  @Get()
  findAll() {
    return this.masterProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMasterProductDto: UpdateMasterProductDto) {
    return this.masterProductsService.update(+id, updateMasterProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterProductsService.remove(+id);
  }
}
