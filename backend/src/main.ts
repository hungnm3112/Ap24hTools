import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/*
 * Hàm bootstrap() là entry point (điểm khởi chạy) của toàn bộ ứng dụng NestJS.
 */
async function bootstrap() {
  /*
   * NestFactory.create(): Tạo ra một instance của ứng dụng dựa trên AppModule (module gốc).
   * Nó sẽ tự động đệ quy và khởi tạo tất cả các Module, Controller, Service được liên kết bên trong AppModule.
   */
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Bật CORS để cho phép Frontend gọi API
  app.setGlobalPrefix('api'); // Thiết lập tiền tố /api cho toàn bộ dự án
  
  /*
   * 1. Cấu hình Global ValidationPipe
   * Khi gắn ValidationPipe ở mức global, mọi API request gửi lên sẽ tự động chạy qua ống nước (pipe) này.
   * Kết hợp với class-validator trên các class DTO (Data Transfer Object), NestJS sẽ tự động
   * kiểm tra dữ liệu đầu vào. Nếu dữ liệu sai (vd: email thiếu @), nó sẽ tự động ném lỗi 400.
   * - whitelist: true -> Tự động loại bỏ các trường thừa gửi lên mà không có trong DTO (tăng tính bảo mật).
   */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  /*
   * 2. Cấu hình Global Exception Filter
   * Áp dụng bộ lọc lỗi mà ta vừa viết cho toàn bộ ứng dụng. 
   * Đảm bảo mọi lỗi xảy ra đều được format về một cấu trúc JSON đồng nhất (có statusCode, timestamp, error, path).
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /*
   * Khởi động server HTTP lắng nghe trên port được chỉ định trong file .env.
   * Nếu file .env không có, nó sẽ fallback (chạy dự phòng) trên port 3000.
   */
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
