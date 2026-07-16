# Tóm tắt Kiến thức: Thực Hành FullStack Next.js/Nest.js (Typescript) Dự Án JWT

Bài học (được trích xuất từ transcript) hướng dẫn chi tiết cách xây dựng một hệ thống Fullstack hoàn chỉnh từ con số 0, kết hợp Next.js cho Frontend, Nest.js cho Backend, với ngôn ngữ lập trình TypeScript. Trọng tâm của bài học là triển khai hệ thống xác thực người dùng (Authentication) thực tế bằng JWT.

## 1. Stack Công nghệ
- **Frontend:** Next.js 14 (App Router, Server Components, Server Actions), TypeScript, TailwindCSS, Ant Design (antd) cho UI.
- **Backend:** Nest.js v10, TypeScript.
- **Cơ sở dữ liệu:** MongoDB (được thiết lập và chạy nhanh chóng thông qua Docker).
- **Các thư viện/công cụ phụ trợ:**
  - `NextAuth` (hay Auth.js v5) để quản lý phiên bản đăng nhập phía Frontend.
  - `nodemailer` và `handlebars` (template engine) để gửi email chứa giao diện HTML.
  - `dayjs` để xử lý thời gian (thay cho moment).

### Thuật ngữ & Thư viện (Phần 1)
- **NextAuth (Auth.js)**: Thư viện xác thực (Authentication) dành cho Next.js, giúp xử lý các luồng đăng nhập, bảo vệ route (ví dụ: tự động điều hướng người dùng về trang đăng nhập nếu chưa có quyền truy cập).
- **Docker**: Nền tảng containerisation, bài học sử dụng Docker để tạo cơ sở dữ liệu MongoDB một cách nhanh chóng thông qua file cấu hình `docker` cung cấp sẵn mà không cần cài đặt phần mềm CSDL trên máy. Nếu không dùng Docker, người học được hướng dẫn có thể dùng MongoDB Atlas miễn phí.
- **dayjs**: Một thư viện quản lý, xử lý ngày tháng (date/time) nhẹ và hiện đại, được tác giả dùng để thay thế cho thư viện `moment` vốn từng là "huyền thoại" nhưng nay đã trở nên nặng nề.
- **Nodemailer & Handlebars**: Thư viện dùng để thiết lập luồng gửi email bên phía backend. `Handlebars` đóng vai trò là một template engine cho phép truyền động các biến (như tên người dùng, mã code) vào trong một khuôn mẫu HTML (template) thay vì phải nối chuỗi thủ công.

## 2. Kiến thức Frontend (Next.js & React)
- **Thiết lập dự án an toàn:** Khởi tạo dự án và ghim cứng (pin) phiên bản các thư viện quan trọng trong `package.json` (React, Next.js, ESLint, TypeScript) để tránh xung đột Breaking Changes trong tương lai.
- **Thiết kế UI & Xử lý Form:** 
  - Sử dụng Ant Design để dựng các màn hình Đăng nhập, Đăng ký, Quên mật khẩu và Modal nhập mã xác thực.
  - Xử lý các Form phức tạp bằng cách kết hợp Hook của antd (`Form.useForm()`, `setFieldsValue()`) và các React Hooks (`useState`, `useEffect`) để truyền dữ liệu giữa các luồng (VD: tự động gán email từ màn hình đăng nhập bị lỗi sang màn hình gửi lại mã kích hoạt).
- **Giao tiếp API:** 
  - Xây dựng lớp wrapper tùy chỉnh sử dụng `fetch` API.
  - Quản lý bộ đệm (cache) trong Next.js với `revalidateTag` khi thực hiện các thao tác CRUD.

### Thuật ngữ & Thư viện (Phần 2)
- **App Router & Server Component**: Các tính năng kiến trúc mới của Next.js (từ bản 13+), giúp phân chia rõ ràng component nào được render trực tiếp trên máy chủ (server) và component nào chạy trên trình duyệt (client).
- **revalidateTag**: Tính năng caching của Next.js cho phép vô hiệu hóa (xóa) bộ nhớ đệm theo "nhãn (tag)" sau khi chạy Server Actions. Trong bài học, nó dùng để ép trang web gọi lại dữ liệu mới nhất (update danh sách) sau khi thực hiện thao tác xóa một user.
- **fetch API**: Chuẩn API có sẵn trên trình duyệt và Node.js. Thay vì dùng các thư viện bên thứ 3 (như axios), bài học xây dựng một lớp "wrapper" (hàm bao bọc) tự viết dựa trên `fetch` API để tối ưu với tính năng cache mới của Next.js.
- **Hooks của Ant Design (Form.useForm)**: Công cụ của thư viện UI `antd` giúp điều khiển và cập nhật giá trị Form (qua hàm `setFieldsValue`). Trong bài học, do form render qua lại giữa các bước, tác giả hướng dẫn kết hợp hook này với `useEffect` của React để ép form phải nhận giá trị mặc định (initial value) mong muốn (ví dụ tự động điền lại email).

## 3. Kiến thức Backend (Nest.js)
- **Gửi Email chuyên nghiệp:**
  - Hướng dẫn cấu hình kết nối SMTP Server với Gmail (sử dụng *Google App Passwords* và bắt buộc bật xác thực 2 bước).
  - Tích hợp và cấu hình Template Engine (`handlebars`) để gửi email HTML có chứa biến động (như tên người dùng, mã OTP).
  - Sửa đổi cấu hình `nest-cli.json` (phần compiler options) để NestJS tự động sao chép thư mục chứa template HTML/HBS sang thư mục `dist` khi build.
- **Bảo mật và JWT:**
  - Thiết lập luồng cấp phát JWT và tích hợp Passport trong NestJS để bảo vệ các endpoints (cơ chế Bearer Token).
  - Đọc cấu hình bảo mật từ biến môi trường (`.env`) an toàn bằng `ConfigService`.

### Thuật ngữ & Thư viện (Phần 3)
- **Google App Passwords (Mật khẩu ứng dụng)**: Chức năng bảo mật của Google (bắt buộc tài khoản đã bật Xác thực 2 bước). Cung cấp một dãy mật khẩu tĩnh (16 ký tự) chuyên biệt để dùng trong ứng dụng/code (server Nest.js) nhằm đăng nhập và gửi email tự động (SMTP) mà không bị lộ mật khẩu thật của tài khoản Google.
- **nest-cli.json (Compiler Options)**: Tệp cấu hình quá trình dịch mã (compile) của Nest.js. Bài học cấu hình các thuộc tính `assets` và `watchAssets` để NestJS tự động sao chép các tệp giao diện (template `.hbs` / HTML) từ thư mục gốc (src) sang thư mục mã đã dịch (dist). Nếu không có cấu hình này, khi gửi mail, ứng dụng sẽ báo lỗi "không tìm thấy tệp".
- **Passport & Bearer Token (JWT)**: `Passport` là thư viện xác thực nổi tiếng của Node.js. `JWT (JSON Web Token)` là kỹ thuật mã hóa dữ liệu phiên đăng nhập thành một chuỗi (token). Chuỗi token này sẽ được đính kèm ở định dạng `Bearer Token` trong các request gọi API, qua đó backend sẽ xác nhận và bảo vệ các endpoint.
- **ConfigService**: Tiện ích nội bộ của NestJS dùng để đọc các biến từ tệp môi trường `.env` (chứa thông tin nhạy cảm như email, mật khẩu app, secret key), tránh việc lộ cấu hình (hard-code) khi tải mã nguồn lên mạng.

## 4. Xây dựng Luồng Xác thực (Authentication Flows)
Bài học mô tả cặn kẽ cách xử lý các tình huống thực tế mà người dùng gặp phải:
- **Đăng ký (Register) & Kích hoạt tài khoản:**
  - Sinh mã kích hoạt (OTP) có thời hạn (ví dụ: 5 phút) lưu vào cơ sở dữ liệu.
  - Gửi mã này qua email ngay sau khi đăng ký. Tài khoản ở trạng thái "Chưa kích hoạt" (`isActive = false`).
  - Người dùng nhập OTP trên UI để kích hoạt tài khoản.
- **Đăng nhập (Login):**
  - Chặn đăng nhập nếu tài khoản chưa được kích hoạt, đồng thời gợi ý UI cho phép người dùng gửi lại mã xác thực (Resend Email).
- **Gửi lại mã xác thực (Retry Active):**
  - Nhận email từ người dùng, Backend kiểm tra, cập nhật mã OTP mới và thời hạn mới, sau đó gửi lại qua email.
- **Quên mật khẩu (Forgot Password):**
  - Luồng khôi phục: Nhập email -> Nhận OTP qua email -> Nhập OTP kèm mật khẩu mới -> Cập nhật mật khẩu trong database.

## 5. Kỹ năng thực tế (Best Practices)
- Xử lý và đọc logs để debug lỗi cấu hình đường dẫn tuyệt đối/tương đối khi làm việc với thư mục bằng module `path` của Node.js (`join`, `process.cwd()`).
- Cách tiếp cận giải quyết lỗi step-by-step (đặt breakpoint, log response).
- Giữ code có tính linh hoạt cao bằng cách đưa biến cấu hình vào biến môi trường, thiết kế hàm tái sử dụng.

## 6. So sánh Node.js MVC thuần và kiến trúc Next.js/Nest.js

Đối với những người đã quen thuộc với kiến trúc MVC truyền thống trên Node.js (như Express.js kết hợp EJS/Pug/HBS), việc chuyển đổi sang mô hình Next.js + Nest.js mang lại sự thay đổi lớn về tư duy kiến trúc:

### Sự khác biệt cốt lõi
1. **Chia tách Frontend và Backend (Decoupling):** 
   - *Node.js MVC thuần*: View (Giao diện) và Controller (Logic xử lý) gắn chặt trong cùng một dự án. Máy chủ Node.js vừa sinh ra HTML vừa xử lý truy vấn dữ liệu.
   - *Next.js & Nest.js*: Kiến trúc phân tán. **Nest.js (Backend)** đóng vai trò là một API Server thuần túy (chủ yếu trả về JSON). **Next.js (Frontend)** đảm nhiệm toàn bộ phần View và logic UI, giao tiếp với Backend thông qua các HTTP request (fetch API).
2. **TypeScript so với JavaScript:** 
   - *Node.js MVC thuần*: Thường được code bằng JavaScript, mang tính linh hoạt cao nhưng dễ phát sinh lỗi ngầm do lỏng lẻo về mặt kiểu dữ liệu.
   - *Next.js & Nest.js*: TypeScript được coi là tiêu chuẩn bắt buộc (first-class citizen), giúp kiểm soát chặt chẽ kiểu dữ liệu, interface và hỗ trợ tự động gợi ý code (IntelliSense) rất mạnh mẽ.
3. **Mô hình kiến trúc Backend:**
   - *Express MVC*: Linh hoạt đến mức tự do, lập trình viên phải tự quy định cấu trúc thư mục, thiết kế luồng router theo ý cá nhân.
   - *Nest.js*: Khắt khe và bài bản. Nest.js đưa người code vào một khuôn khổ chuẩn mực dựa trên Lập trình hướng đối tượng (OOP), Tiêm phụ thuộc (Dependency Injection - DI) và Decorator (như `@Get()`, `@Injectable()`), lấy cảm hứng lớn từ kiến trúc của Angular và Java Spring Boot.
4. **Rendering & Trải nghiệm giao diện:**
   - *Node.js MVC thuần*: Phụ thuộc hoàn toàn vào Server-Side Rendering (SSR). Mỗi lần chuyển trang, trình duyệt phải tải lại toàn bộ nội dung web.
   - *Next.js*: Trải nghiệm mượt mà như một ứng dụng đơn trang (SPA) nhờ kiến trúc linh hoạt lai giữa Server-Side và Client-Side Rendering, đồng thời tối ưu tốt cho SEO.

### Phương hướng tiếp cận tối ưu cho người tự học
Nếu bạn đi lên từ Node.js MVC thuần, đây là lộ trình tiếp thu hiệu quả để tránh bị "ngợp":

1. **Làm quen với TypeScript trước:** Đừng vội lao vào code framework ngay. Hãy học cách khai báo kiểu dữ liệu cơ bản, Interface, Class trong TypeScript. Đây là "xương sống" bắt buộc của cả Next.js và Nest.js.
2. **Tiếp cận Next.js qua lăng kính UI độc lập:** 
   - Hãy coi Next.js là một phần ứng dụng độc lập chuyên hiển thị giao diện. Đừng mang tư duy "gọi thẳng database trong màn hình" của MVC sang đây.
   - Tập trung học cách thiết kế component với React, và cách lấy dữ liệu bằng fetch API.
3. **Tiếp cận Nest.js qua lăng kính OOP:**
   - Cần quên đi cách viết hàm xử lý route tự do kiểu Express. Thay vào đó, hãy làm quen với nguyên tắc: **Module** (để nhóm chức năng), **Controller** (để nhận Request/trả Response) và **Service** (để xử lý tính toán, gọi DB).
   - Hãy để Dependency Injection (DI) làm nhiệm vụ liên kết các lớp thay vì tạo object thủ công bằng `new`.
4. **Thích nghi với mô hình xác thực tách biệt (Stateless Authentication):**
   - Trong MVC thuần, bạn thường dùng Session/Cookie trên cùng một máy chủ để duy trì đăng nhập. 
   - Với Next.js/Nest.js, hãy nắm vững cơ chế **JWT (JSON Web Token)**. Nest.js sẽ cấp phát JWT sau khi đăng nhập thành công. Next.js lưu token này lại và gửi đính kèm vào header (`Authorization: Bearer <token>`) mỗi khi cần truy xuất thông tin từ Nest.js.
