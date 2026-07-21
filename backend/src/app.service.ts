import { Injectable } from '@nestjs/common';

/*
 * @Injectable(): Decorator này đánh dấu class AppService là một "Provider" (nhà cung cấp dịch vụ).
 * Khi được đánh dấu, NestJS có thể quản lý vòng đời của class này và tự động "tiêm" (inject)
 * nó vào các Controller hoặc Service khác khi cần thiết (Dependency Injection).
 */
@Injectable()
export class AppService {
  /*
   * Các hàm xử lý logic nghiệp vụ (business logic) sẽ được viết ở đây.
   * Controller chỉ làm nhiệm vụ nhận request và trả response, còn mọi tính toán,
   * gọi database, hay xử lý dữ liệu thì đẩy hết vào Service để code gọn gàng, dễ test.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
