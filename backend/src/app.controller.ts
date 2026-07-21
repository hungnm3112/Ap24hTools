import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/*
 * @Controller(): Decorator này định nghĩa class bên dưới đóng vai trò là một Controller.
 * Nhiệm vụ của Controller là tiếp nhận các HTTP Request từ client (như GET, POST),
 * điều hướng sang Service tương ứng để xử lý logic, và trả về HTTP Response.
 * (Nếu truyền param vào đây, vd: @Controller('api/users'), mọi route bên trong sẽ có tiền tố đó).
 */
@Controller()
export class AppController {
  /*
   * constructor: Cơ chế Dependency Injection (DI) của NestJS.
   * Chữ `private readonly` giúp tự động khởi tạo biến this.appService mà không cần khai báo lặp lại.
   * Chúng ta không bao giờ gõ `new AppService()`, NestJS sẽ tự động tạo và tiêm vào đây.
   */
  constructor(private readonly appService: AppService) {}

  /*
   * @Get(): Bắt phương thức GET của HTTP.
   * Vì Controller không có tiền tố và @Get() cũng trống, nên route này chính là root: GET /
   */
  @Get()
  getHello(): string {
    // Luôn tuân thủ quy tắc: Controller chỉ điều hướng, còn logic thực tế nằm ở Service.
    return this.appService.getHello();
  }
}
