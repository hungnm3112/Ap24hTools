import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

/*
 * LÝ DO SỬ DỤNG DTO (WHY?):
 * DTO (Data Transfer Object) dùng để lọc và xác thực (validate) luồng dữ liệu đầu vào.
 * Lợi ích:
 * 1. Chặn các dữ liệu rác hoặc sai định dạng ngay từ Controller, không cho lọt vào Service hay DB.
 * 2. Tự động sinh ra lỗi HTTP 400 rõ ràng nếu Frontend truyền sai dữ liệu (nhờ ValidationPipe đã cấu hình ở main.ts).
 */
export class CreateCategoryDto {
  /*
   * Tên danh mục là bắt buộc, không được để trống và phải là chuỗi (string)
   */
  @IsString({ message: 'Tên danh mục phải là một chuỗi văn bản' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  /*
   * Trạng thái isActive là tùy chọn (optional) khi tạo mới. 
   * Nếu Frontend không gửi, Schema MongoDB sẽ tự mặc định là true.
   */
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean (true/false)' })
  isActive?: boolean;

  /*
   * LÝ DO: parentId là tuỳ chọn. Nếu được truyền, nó phải chuẩn định dạng ObjectId của MongoDB.
   */
  @IsOptional()
  @IsMongoId({ message: 'ID danh mục cha không đúng định dạng' })
  parentId?: string;
}
