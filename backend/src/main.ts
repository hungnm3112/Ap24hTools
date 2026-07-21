import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/*
 * Hàm bootstrap() là entry point (điểm khởi chạy) của toàn bộ ứng dụng NestJS.
 */
async function bootstrap() {
  /*
   * NestFactory.create(): Tạo ra một instance của ứng dụng dựa trên AppModule (module gốc).
   * Nó sẽ tự động đệ quy và khởi tạo tất cả các Module, Controller, Service được liên kết bên trong AppModule.
   */
  const app = await NestFactory.create(AppModule);

  // TODO (Phase 1.3): Cấu hình Global ValidationPipe và ExceptionFilter ở đây!

  /*
   * Khởi động server HTTP lắng nghe trên port được chỉ định trong file .env.
   * Nếu file .env không có, nó sẽ fallback (chạy dự phòng) trên port 3001.
   */
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
