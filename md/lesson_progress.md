# Lộ Trình Học Tập (Lesson Progress)

## 🎯 Các Kỹ Năng Đã Thông Thạo (Mastered Skills)

### Frontend (Next.js)
1. **Kiến trúc Next.js App Router**: Phân biệt Client Component (`'use client'`) và Server Component.
2. **Next.js Server Actions**: Gọi logic backend trực tiếp từ UI.
3. **Quản lý Trạng Thái (State)**: Vận dụng `useState` điều khiển UI loading, toggle.
4. **Hook Điều Hướng**: Dùng `useRouter` từ `next/navigation`.
5. **UI & Layout**: Sử dụng Ant Design cơ bản (Form, Input) và xây dựng Admin Layout (Nested Routes).

### Backend (NestJS)
6. **Kiến trúc NestJS Cơ Bản**: Nắm vững vòng đời từ `main.ts` -> `Module` -> `Controller` (nhận request) -> `Service` (xử lý logic).
7. **Cơ chế Dependency Injection (DI)**: Hiểu cách NestJS tự động tiêm các `Provider` (@Injectable) vào class thông qua constructor.
8. **Cấu hình Global**: Thiết lập `ValidationPipe` (class-validator) và `HttpExceptionFilter` (bắt lỗi JSON chuẩn).
9. **Kết nối Database**: Cấu hình MongoDB qua `MongooseModule.forRootAsync` và `ConfigService`.
10. **Thiết kế Schema & DTO**: Ánh xạ class với Database bằng `@Schema()`, `@Prop()`; kiểm soát đầu vào bằng DTO (`@IsEmail()`,...).
11. **Bảo mật Dữ liệu**: Dùng `bcrypt` băm mật khẩu, dùng cú pháp destructuring (Rest parameter) để ẩn trường nhạy cảm khi trả response.

## 🚀 Các Kỹ Năng Mới Sẽ Học Ở Phase Tiếp Theo (2.2 & 2.3)
1. **Xác thực JWT (JSON Web Token)**: Hiểu cơ chế cấp phát (Sign) và kiểm tra (Verify) Access Token.
2. **NestJS Guards (Bảo vệ Route)**: Viết custom Guard (`JwtAuthGuard`) chặn các request API trái phép.
3. **Passport Strategy**: Dùng chiến lược `passport-jwt` tiêu chuẩn để bóc tách thông tin user từ Header.
4. **Nodemailer**: Gửi email OTP thực tế thông qua SMTP Server (như Gmail).
