import { Injectable } from '@nestjs/common';
import { CreateMasterProductDto } from './dto/create-master-product.dto';
import { UpdateMasterProductDto } from './dto/update-master-product.dto';

@Injectable()
export class MasterProductsService {
  create(createMasterProductDto: CreateMasterProductDto) {
    return 'This action adds a new masterProduct';
  }

  findAll() {
    return `This action returns all masterProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} masterProduct`;
  }

  update(id: number, updateMasterProductDto: UpdateMasterProductDto) {
    return `This action updates a #${id} masterProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} masterProduct`;
  }
}
