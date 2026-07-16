# Tài liệu Mô tả Logic Hoạt động của Dự án AutoAP24h

Dự án này là một bộ công cụ tự động hóa được viết bằng Node.js, có chức năng chính là cào dữ liệu (scrape), đối chiếu giá sản phẩm (đặc biệt là iPad) giữa hai hệ thống AP24h và CellphoneS, sau đó tự động cập nhật giá mới lên hệ thống quản trị của AP24h thông qua Puppeteer.

Dự án bao gồm 4 luồng xử lý chính tương ứng với 4 file script:

## 1. Trích xuất và Đối chiếu Dữ liệu (`extract.js`)
- **Đầu vào:** Các file HTML tĩnh được tải sẵn về máy tính, chứa danh sách sản phẩm từ CellphoneS và AP24h.
- **Xử lý:**
  - Đọc nội dung file HTML và sử dụng biểu thức chính quy (Regex) để trích xuất **tên sản phẩm** và **giá tiền**.
  - **Chuẩn hóa chuỗi (Normalization):** Tên sản phẩm được đưa về chữ thường, loại bỏ các từ khóa rác hoặc chung chung (như "chính hãng", "apple", "2024", "inch", "wifi",...) để dễ so sánh hơn.
  - **Thuật toán ghép nối (Matching):** Tách tên sản phẩm thành các từ (token) và đếm số lượng từ trùng khớp giữa sản phẩm của AP24h và CellphoneS. Nếu tỷ lệ trùng khớp vượt trên 60% (>0.6), hệ thống sẽ coi là cùng một sản phẩm (ghép nối thành công).
- **Đầu ra:** Xuất dữ liệu đã xử lý vào file `extracted_products.json`, bao gồm các sản phẩm khớp nhau (kèm theo chênh lệch giá), các sản phẩm không khớp và dữ liệu gốc.

## 2. Tạo Báo cáo Trực quan (`generate_html.js`)
- **Đầu vào:** File dữ liệu `extracted_products.json` vừa được tạo.
- **Xử lý:** 
  - Đọc và loại bỏ các sản phẩm trùng lặp.
  - Chạy lại luồng đối chiếu để cấu trúc lại dữ liệu cho bảng.
  - Sử dụng template chuỗi HTML (bao gồm sẵn CSS và Javascript nội bộ) để xây dựng một trang web báo cáo dạng bảng (Table).
- **Đầu ra:** Tạo ra file `doi_chieu_gia_cps.html`. File này cho phép người dùng mở trên trình duyệt xem báo cáo so sánh giá rất trực quan, có thể tìm kiếm, lọc sản phẩm đã khớp/chưa khớp, đồng thời xem được tỷ lệ % chênh lệch giá.

## 3. Khởi tạo Phiên Đăng nhập (`index.js`)
- **Đầu vào:** Tùy chọn cấu hình Puppeteer.
- **Xử lý:** 
  - Khởi chạy một trình duyệt Chrome (thông qua Puppeteer) ở chế độ có giao diện (headless: false).
  - Trình duyệt tự động điều hướng đến trang đăng nhập hệ thống quản trị: `https://ap24h.vn/admin`.
  - Script sẽ in ra thông báo và đợi người dùng **đăng nhập thủ công** trên trình duyệt vừa mở.
- **Đầu ra:** Toàn bộ thông tin phiên đăng nhập (Cookies, LocalStorage, Session...) được trình duyệt tự động lưu lại vào thư mục `user_data` cục bộ. Các script chạy sau này sẽ sử dụng lại thư mục này để giữ nguyên trạng thái đã đăng nhập.

## 4. Tự động Cập nhật Giá (`auto_update_prices.js`)
- **Đầu vào:** Dữ liệu sản phẩm cần cập nhật từ `extracted_products.json` và Phiên đăng nhập đã lưu trong `user_data`.
- **Xử lý:**
  - Khởi chạy trình duyệt Puppeteer (sử dụng lại `user_data` nên đã có sẵn quyền admin, không cần đăng nhập lại).
  - Lọc ra những sản phẩm có dữ liệu giá từ cả 2 bên. (Script có hỗ trợ `TEST_MODE` để chạy thử nghiệm trên 1 sản phẩm mà không lưu thật).
  - **Vòng lặp tự động cho từng sản phẩm:**
    1. Truy cập vào danh sách sản phẩm quản trị: `https://ap24h.vn/administrator/products`.
    2. Điền tên sản phẩm (của AP24h) vào ô tìm kiếm và bấm nút tìm kiếm.
    3. Đợi trang tải và lấy link "Sửa" (Edit) của kết quả đầu tiên, sau đó truy cập vào trang chỉnh sửa.
    4. Chuyển sang tab **"Giá sản phẩm"**.
    5. Dùng Javascript tương tác trực tiếp với DOM web để tìm ô input **"Giá thanh toán"** chung và giá của các phiên bản trong bảng bên dưới.
    6. Xóa giá cũ, điền giá mới (giá lấy từ CellphoneS) và kích hoạt các event Javascript để web ghi nhận thay đổi.
    7. Bấm nút **"Lưu"** và đợi trang tải lại xong trước khi chuyển sang sản phẩm tiếp theo.
- **Đầu ra:** Giá trên hệ thống website AP24h được cập nhật tự động bằng với giá của CellphoneS theo dữ liệu đã map.
