'use client';

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN
// ==========================================
// TODO 1.1: Import React và useState từ 'react'
// TODO 1.2: Import { Form, Input, Button, message } từ 'antd'
// TODO 1.3: Import thẻ <Link> từ 'next/link'
// TODO 1.4: Import hàm 'forgotPasswordAction' từ '@/actions/auth.action'

export default function ForgotPasswordPage() {
  // ==========================================
  // BƯỚC 2: KHỞI TẠO HOOKS & STATE
  // ==========================================
  // TODO 2.1: Khởi tạo state 'loading' (mặc định false)
  // TODO 2.2: Khởi tạo state 'isSent' (kiểu boolean, mặc định false) để kiểm tra xem đã gửi email thành công chưa. 
  // (Nếu isSent = true, ta sẽ ẩn form và hiện thông báo đã gửi)

  // ==========================================
  // BƯỚC 3: HÀM XỬ LÝ SUBMIT FORM
  // ==========================================
  // TODO 3.1: Viết hàm async 'onFinish(values)'
  // - Bật loading
  // - Gọi hàm forgotPasswordAction(values.email)
  // - Nếu success: báo message thành công VÀ set state isSent thành true
  // - Nếu thất bại: báo message lỗi
  // - Tắt loading bằng finally

  // ==========================================
  // BƯỚC 4: RENDER GIAO DIỆN (JSX)
  // ==========================================
  // TODO 4.1: Trả về giao diện kiểm tra điều kiện isSent (Sử dụng toán tử 3 ngôi hoặc if sớm)
  // Nếu isSent === true: 
  //   - Trả về khối <div> hiển thị dòng chữ: "Một email chứa hướng dẫn khôi phục mật khẩu đã được gửi đến bạn."
  //   - Kèm theo một thẻ <Link href="/login"> Quay lại đăng nhập </Link>
  
  // Nếu isSent === false, render form nhập email:
  return (
    <div>
      {/* TODO 4.2: Thẻ <h2> "Quên mật khẩu" */}
      {/* TODO 4.3: Thẻ <Form onFinish={onFinish} layout="vertical"> */}
        
        {/* TODO 4.4: <Form.Item> cho "Email đăng ký" (name="email", required, Input type="email") */}
        
        {/* TODO 4.5: <Form.Item> chứa thẻ <Button> Gửi yêu cầu (type="primary", htmlType="submit", block, loading={loading}) */}
        
      {/* Đóng form */}
      
      {/* TODO 4.6: Phía dưới form, thẻ <p> chứa thẻ <Link href="/login"> Quay lại đăng nhập </Link> */}
    </div>
  );
}
