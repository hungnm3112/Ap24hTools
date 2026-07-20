'use client';

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN
// ==========================================
// TODO 1.1: Import React và useState từ 'react'
// TODO 1.2: Import { Form, Input, Button, message } từ 'antd'
// TODO 1.3: Import useRouter từ 'next/navigation'
// TODO 1.4: Import hàm 'verifyAction' từ '@/actions/auth.action'
import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { verifyAction } from '@/actions/auth.action';

export default function VerifyPage() {
  // ==========================================
  // BƯỚC 2: KHỞI TẠO HOOKS & STATE
  // ==========================================
  // TODO 2.1: Khởi tạo router và state 'loading' (mặc định false)
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ==========================================
  // BƯỚC 3: HÀM XỬ LÝ SUBMIT FORM
  // ==========================================
  // TODO 3.1: Viết hàm async 'onFinish(values)'
  // - Bật loading
  // - Gọi hàm verifyAction(values.otp) bằng await
  // - Nếu success: báo thành công và gọi router.push('/login') để quay về trang đăng nhập
  // - Nếu thất bại: báo lỗi
  // - Tắt loading bằng finally
  const onFinish = async (values: { otp: string }) => {
    setLoading(true);
    const result = await verifyAction(values.otp);
    if (result.success) {
      message.success(result.message);
      router.push('/login');
    } else {
      message.error(result.message);
    }
    setLoading(false);
  }
  // ==========================================
  // BƯỚC 4: RENDER GIAO DIỆN (JSX)
  // ==========================================
  return (
    <div>
      {/* TODO 4.1: Thẻ <h2> "Xác thực tài khoản" (CSS: text-2xl font-bold mb-4 text-center) */}
      <h2 className="text-2xl font-bold mb-4 text-center">Xác thực tài khoản</h2>
      {/* TODO 4.2: Thẻ <p> "Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn." (CSS: mb-6 text-gray-600 text-center) */}
      <p className="mb-6 text-gray-600 text-center">Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn.</p>
      {/* TODO 4.3: Thẻ <Form onFinish={onFinish} layout="vertical"> */}

      {/* TODO 4.4: <Form.Item> cho "Mã OTP" (name="otp", required) 
            - Bên trong dùng thẻ <Input maxLength={6} className="text-center text-xl tracking-[1em]" /> để format đẹp mắt 
        */}

      {/* TODO 4.5: <Form.Item> chứa thẻ <Button> Xác nhận (type="primary", htmlType="submit", block, loading={loading}) */}

      {/* Đóng form */}
      <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="otp"
          label="Mã OTP"
          rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
        >
          <Input maxLength={6} className="text-center text-xl tracking-[1em]" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>

    </div>
  );
}
