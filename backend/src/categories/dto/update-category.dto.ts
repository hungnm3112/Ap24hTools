import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/*
 * LÝ DO SỬ DỤNG PartialType (WHY?):
 * Khi Update, chúng ta thường không cần truyền toàn bộ các trường như lúc Create.
 * PartialType giúp kế thừa toàn bộ các validation rules (IsString, IsNotEmpty...) từ CreateCategoryDto,
 * nhưng biến TẤT CẢ các trường thành @IsOptional() một cách tự động.
 * Điều này tuân thủ nguyên tắc DRY (Don't Repeat Yourself), không cần viết lại logic xác thực.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
