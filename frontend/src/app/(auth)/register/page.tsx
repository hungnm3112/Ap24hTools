'use client';
// Tương tự như trang Login, trang Đăng ký cũng là Client Component để có thể quản lý state form và loading.

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN
// ==========================================
// TODO 1.1: Import React và useState từ 'react'
// TODO 1.2: Import { Form, Input, Button, message } từ 'antd'
// TODO 1.3: Import useRouter từ 'next/navigation'
// TODO 1.4: Import hàm 'registerAction' từ '@/actions/auth.action'
// TODO 1.5: Import thẻ <Link> từ 'next/link' (để làm nút quay lại trang đăng nhập)

import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/actions/auth.action';

export default function RegisterPage() {
  const { message } = App.useApp();
  // ==========================================
  // BƯỚC 2: KHỞI TẠO HOOKS & STATE
  // ==========================================
  // TODO 2.1: Khởi tạo biến 'router' bằng hook useRouter()
  // TODO 2.2: Khởi tạo state 'loading' kiểu boolean, mặc định là false
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ==========================================
  // BƯỚC 3: HÀM XỬ LÝ SUBMIT FORM ĐĂNG KÝ
  // ==========================================
  // TODO 3.1: Viết hàm async 'onFinish(values)'
  // - Bật loading = true
  // - Gọi hàm registerAction(values.name, values.phone, values.email, values.password) bằng await
  // - Nếu success: Dùng message.success() báo thành công, và gọi router.push('/verify') để chuyển trang
  // - Nếu thất bại: Dùng message.error()
  // - Tắt loading = false ở cuối hàm (dùng finally)
  const onFinish = async (values: { name: string; phone: string; email: string; password: string }) => {
    setLoading(true);
    const result = await registerAction(values.name, values.phone, values.email, values.password);
    if (result.success) {
      message.success(result.message);
      router.push('/verify');
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
      {/* 
        TODO 4.1: Render một Tiêu đề <h2> "Đăng ký tài khoản mới" (class text-2xl font-bold mb-4)
      */}
      <h2 className="text-2xl font-bold mb-4">Đăng ký tài khoản mới</h2>
      {/* 
        TODO 4.2: Khởi tạo thẻ <Form> của Ant Design
        - Truyền hàm onFinish
        - layout="vertical"
        - style={{ maxWidth: 400, margin: '0 auto' }}
      */}

      {/* TODO 4.3: <Form.Item> cho "Họ và tên" (name="name", required) */}

      {/* TODO 4.4: <Form.Item> cho "Số điện thoại" (name="phone", required) */}

      {/* TODO 4.5: <Form.Item> cho "Email" (name="email", required, có thêm type="email" trong thẻ <Input type="email" />) */}

      {/* TODO 4.6: <Form.Item> cho "Mật khẩu" (name="password", required, dùng thẻ <Input.Password />) */}

      {/* TODO 4.7: <Form.Item> chứa thẻ <Button> Đăng ký (type="primary", htmlType="submit", block, loading={loading}) */}

      {/* 
        TODO 4.8: Phía dưới Form, dùng thẻ <p> và <Link href="/login"> của Next.js để tạo nút:
        "Đã có tài khoản? Đăng nhập ngay" (Trang trí bằng class của Tailwind cho đẹp nhé)
      */}
      <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <p className="mt-4 text-center">
        <Link href="/login" className="text-blue-500 hover:underline">
          Đã có tài khoản? Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
