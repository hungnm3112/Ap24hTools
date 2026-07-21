import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/*
 * @Catch(HttpException): Decorator này nói cho NestJS biết filter này sẽ "bắt" (catch) 
 * tất cả các lỗi thuộc kiểu HttpException (hoặc các lớp kế thừa từ nó như BadRequestException...).
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /*
   * Hàm catch() sẽ được kích hoạt mỗi khi có lỗi xảy ra.
   * - exception: Chứa thông tin về lỗi (mã lỗi, thông báo lỗi).
   * - host: Cung cấp quyền truy cập vào các object của HTTP (Request/Response).
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // Lấy context của HTTP request
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Lấy mã HTTP status (ví dụ: 400 Bad Request, 404 Not Found)
    const status = exception.getStatus();
    
    // Lấy chi tiết thông báo lỗi (có thể là một chuỗi hoặc một object do class-validator ném ra)
    const exceptionResponse = exception.getResponse();

    /*
     * Định dạng lại cấu trúc JSON trả về cho Frontend.
     * Thay vì trả về lỗi mặc định của NestJS đôi khi không nhất quán,
     * chúng ta ép nó về một cấu trúc cố định để Frontend dễ dàng xử lý.
     */
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Nếu exceptionResponse là object (thường chứa mảng các lỗi validation), ta giữ nguyên nó
      // Nếu là chuỗi, ta bọc nó vào object { message }
      error: typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse },
    });
  }
}
