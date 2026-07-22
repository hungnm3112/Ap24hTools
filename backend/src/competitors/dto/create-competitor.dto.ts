import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsMongoId, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

/*
 * LÝ DO SỬ DỤNG LỚP CON TRONG DTO (WHY?):
 * Vì schema Competitor có nhúng một mảng các object (scrapingUrls),
 * ta cần phải tạo một class DTO con (ScrapingUrlDto) để validate từng phần tử trong mảng đó.
 * Sử dụng @ValidateNested() kết hợp @Type() để Class-validator biết cách chạy validation đệ quy.
 */

export class ScrapingUrlDto {
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @IsMongoId({ message: 'ID Danh mục không hợp lệ' })
  categoryId: string;

  @IsNotEmpty({ message: 'URL không được để trống' })
  @IsUrl({}, { message: 'Định dạng URL không hợp lệ' })
  url: string;
}

export class SelectorsDto {
  @IsOptional()
  @IsString()
  productItem?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productPrice?: string;

  @IsOptional()
  @IsString()
  productImage?: string;

  @IsOptional()
  @IsString()
  nextPageButton?: string;
}

export class CreateCompetitorDto {
  @IsString({ message: 'Tên đối thủ phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đối thủ không được để trống' })
  name: string;

  @IsString({ message: 'Tên miền phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên miền không được để trống' })
  domain: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách URL phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ScrapingUrlDto)
  scrapingUrls?: ScrapingUrlDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SelectorsDto)
  selectors?: SelectorsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

