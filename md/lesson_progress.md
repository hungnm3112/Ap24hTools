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
12. **Xác thực JWT (JSON Web Token)**: Hiểu cơ chế cấp phát (Sign) và kiểm tra (Verify) Access Token.
13. **NestJS Guards (Bảo vệ Route)**: Viết custom Guard (`JwtAuthGuard`) chặn các request API trái phép.
14. **Passport Strategy**: Dùng chiến lược `passport-jwt` tiêu chuẩn để bóc tách thông tin user từ Header.
15. **Nodemailer**: Gửi email OTP thực tế thông qua SMTP Server (như Gmail).

### Tích hợp Fullstack
16. **Giao tiếp Frontend - Backend**: Dùng Server Actions để `fetch` API trực tiếp, giấu kín endpoint với người dùng.
17. **Xử lý Cookie Server-side**: Lưu trữ và quản lý `accessToken` an toàn bằng `next/headers`.

### Fullstack CRUD (Danh mục & Đối thủ)
28. **NestJS CRUD Generator**: Dùng `npx nest g module/controller/service` để tạo khung sườn API nhanh chóng.
29. **MongoDB Hierarchy Design**: Vận dụng kỹ thuật **Parent Reference** (tham chiếu cha) để thiết kế dữ liệu dạng cây đệ quy trong môi trường NoSQL. Biến đổi dữ liệu phẳng (flat) sang dạng cây bằng Map.
30. **Ant Design Hierarchy Data**: Tích hợp dữ liệu cây lồng nhau (`children`) tự động render bảng phân cấp và Component `TreeSelect` trong UI quản trị.
31. **Mongoose Relationships**: Thiết lập Nhúng (Embedded Document) phức tạp (`scrapingUrls`).
32. **Form Động (Dynamic Form)**: Sử dụng Component `Form.List` của Ant Design để tạo bảng nhập liệu mảng con tự động (Thêm/xóa dòng URL).
33. **Validation Đệ Quy (Nested Validation)**: Dùng `@ValidateNested()` và `@Type()` trong DTO của NestJS để validate các phần tử bên trong mảng nhúng.

### Tích hợp Iframe, Proxy & Playwright (Phase 3.3)
34. **Thiết kế UI Wizard (Nâng cao)**: Phân tách Modal form hiện tại thành nhiều bước (Step 1, Step 2, Step 3) giúp giảm tải nhận thức cho người dùng.
35. **Reverse Proxy bằng Playwright**: Tải trang web đối thủ ở Backend, loại bỏ các mã độc/quảng cáo/redirect script để đưa vào Admin an toàn.
36. **Iframe Communication**: Dùng `postMessage` giao tiếp hai chiều giữa Frontend React và nội dung HTML giả lập bên trong Iframe.
37. **DOM Traversal & Event Delegation**: Viết script JavaScript thuần inject vào trang web đối thủ để chặn mọi cú click chuột, trích xuất HTML của phần tử được click, kết hợp tính năng "Delete Mode" xóa rác DOM.

### Trí Tuệ Nhân Tạo (AI) Sinh Selector (Phase 3.4)
38. **Google Gemini AI API**: Tích hợp `@google/generative-ai` vào backend NestJS để giao tiếp với mô hình AI và dùng biến môi trường để tùy biến cấu hình.
39. **Prompt Engineering cho AI**: Kỹ thuật viết Prompt hiệu quả ép AI đóng vai chuyên gia Web Scraping và trả về dữ liệu chuẩn JSON cho Selector.
40. **Xử lý Đa luồng (Parallel Bất đồng bộ)**: Trải nghiệm thực tế việc Frontend gửi loạt API AI đồng thời để tối ưu thời gian chờ của người dùng.

## 🚀 Các Kỹ Năng Đã Học Ở Phase 4 (So khớp AI & Cào dữ liệu nâng cao)
48. **Thuật toán Chuẩn hóa Text & Lọc rác (Pre-filter)**: Sử dụng MongoDB Text Search kết hợp `IgnoredKeywords` để tìm 20 ứng viên gần giống nhất trước khi gọi AI.
49. **Xử lý Batch & Đa luồng (Concurrency)**: Sử dụng `Promise.all` với kỹ thuật Chunking để Playwright cào 3 URL cùng lúc. Tách rời luồng cào dữ liệu thô và luồng AI Matching.
50. **Cronjob & Task Scheduling**: Sử dụng `@nestjs/schedule` (`@Cron`) tạo tiến trình ngầm `AiMatcherService` quét và xử lý AI hàng loạt mỗi phút.
51. **Prompt Engineering Nâng cao**: Ép Gemini AI trả về mảng JSON chặt chẽ cho nhiều sản phẩm cùng lúc (Batching) để tối ưu Quota (15 req/min).
52. **Mongoose Upsert & Schema Reference**: Lưu hoặc Cập nhật sản phẩm bằng `findOneAndUpdate` và liên kết dữ liệu qua `catalogProductId`.
53. **Thiết kế Bảng so sánh (Matrix UI)**: Xây dựng giao diện Ma trận đối chiếu giá đa chiều, sử dụng MUI DataGrid hoặc Ant Design Table nâng cao.

## 🚀 Các Kỹ Năng Sẽ Học Ở Phase Cuối (Tự động hóa Playwright Auto-Action) - [CHƯA HỌC]
54. **Playwright Tương tác website (Auto-Action)**: Dùng Playwright đăng nhập vào trang chủ AP24h, tìm kiếm ô nhập giá, và submit form tự động!
55. **Vẽ biểu đồ Thống kê (Data Visualization)**: Sử dụng Chart.js hoặc Recharts hiển thị lịch sử biến động giá.
