'use client';
import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPasswordAction } from '@/actions/auth.action';

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      const result = await forgotPasswordAction(values.email);
      if (result.success) {
        message.success(result.message);
        router.push('/reset-password?email=' + encodeURIComponent(values.email));
      } else {
        message.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Giao diện mặc định (Form nhập email)
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Quên mật khẩu</h2>
      <p className="mb-6 text-gray-600 text-center">
        Nhập địa chỉ email của bạn, chúng tôi sẽ gửi mã khôi phục mật khẩu.
      </p>

      <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="email"
          label="Email đăng ký"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input type="email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
}
