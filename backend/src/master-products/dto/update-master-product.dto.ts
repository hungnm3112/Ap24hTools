import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterProductDto } from './create-master-product.dto';

export class UpdateMasterProductDto extends PartialType(CreateMasterProductDto) {}
