'use client';
/* 
  Giải thích: Lệnh 'use client' ở dòng 1 là bắt buộc. Next.js mặc định mọi component là Server Component. 
  Do trang Login này cần tương tác trực tiếp với người dùng (nhập form, click nút) và sử dụng các React Hooks 
  như useState, useRouter, nên ta phải khai báo nó là Client Component.
*/

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN (Hãy dùng IDE gợi ý)
// ==========================================
// TODO 1.1: Import React và useState từ thư viện 'react'
import React, { useState } from 'react';
// TODO 1.2: Import { Form, Input, Button, message } từ thư viện UI 'antd'
import { Form, Input, Button, App } from 'antd';
// TODO 1.3: Import hook useRouter từ 'next/navigation' (Lưu ý: Không dùng 'next/router' ở App Router)
import { useRouter } from 'next/navigation';
// TODO 1.4: Import hàm loginAction từ file '@/actions/auth.action'
import { loginAction } from '@/actions/auth.action';

export default function LoginPage() {
  const { message } = App.useApp();
  // ==========================================
  // BƯỚC 2: KHỞI TẠO HOOKS & STATE
  // ==========================================
  // TODO 2.1: Khởi tạo biến 'router' bằng hook useRouter()
  const router = useRouter();
  // TODO 2.2: Khởi tạo state 'loading' kiểu boolean, mặc định là false, dùng để xoay icon khi đang chờ API
  const [loading, setLoading] = useState(false);

  // ==========================================
  // BƯỚC 3: HÀM XỬ LÝ SUBMIT FORM
  // ==========================================
  // TODO 3.1: Viết một hàm async tên là 'onFinish', nhận tham số 'values' chứa { phone, password }
  // Logic bên trong:
  // - Bật loading thành true
  // - Gọi hàm loginAction với thông tin phone và password (nhớ dùng await)
  // - Kiểm tra thuộc tính 'success' của kết quả trả về:
  //   + Nếu true: Dùng message.success() báo thành công, sau đó dùng router.push() chuyển sang '/dashboard'
  //   + Nếu false: Dùng message.error() hiển thị thông báo lỗi từ kết quả
  // - Dùng khối try/finally hoặc gọi lệnh set lại loading thành false ở cuối cùng.
  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    const result = await loginAction(values.phone, values.password);
    if (result.success) {
      message.success(result.message);
      router.push('/dashboard');
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
        TODO 4.1: Render một Tiêu đề <h2> "Đăng nhập hệ thống" có class margin/font đậm của Tailwind         
      */}
      <h2 className="text-2xl font-bold mb-4">Đăng nhập hệ thống</h2>

      {/* 
        TODO 4.2: Khởi tạo thẻ <Form> của Ant Design
        - Truyền hàm onFinish đã viết ở trên vào thuộc tính 'onFinish' của form.
        - Set thuộc tính layout="vertical" để nhãn (label) nằm trên ô input.        
      */}
      {/* 
          TODO 4.3: Tạo <Form.Item> cho Số điện thoại 
          - Tên trường (name): "phone"
          - Nhãn (label): "Số điện thoại"
          - Thuộc tính rules: [{ required: true, message: 'Vui lòng nhập số điện thoại!' }]
          - Bên trong dùng thẻ <Input />
        */}

      {/* 
          TODO 4.4: Tạo <Form.Item> cho Mật khẩu 
          - Tên trường (name): "password"
          - Nhãn (label): "Mật khẩu"
          - Thuộc tính rules: [{ required: true, message: 'Vui lòng nhập mật khẩu!' }]
          - Bên trong dùng thẻ đặc biệt <Input.Password />
        */}

      {/* 
          TODO 4.5: Tạo <Form.Item> chứa Nút Submit
          - Dùng thẻ <Button> với các thuộc tính:
            + type="primary" (Màu xanh nút chính)
            + htmlType="submit" (Để form hiểu đây là nút xác nhận)
            + block (Kéo dài nút 100% chiều ngang)
            + loading={loading} (Gắn với state loading ở Bước 2)
          - Chữ trên nút: "Đăng nhập"
        */}
      <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input />
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
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Đăng ký ngay
        </a>
      </p>


    </div>
  );
}
