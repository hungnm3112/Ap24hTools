'use client';
import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth.action';

export default function ResetPasswordPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { otp: string; newPassword: string }) => {
    if (!email) {
      message.error('Không tìm thấy thông tin email. Vui lòng thử lại.');
      return;
    }
    try {
      setLoading(true);
      const result = await resetPasswordAction(email, values.otp, values.newPassword);
      if (result.success) {
        message.success(result.message);
        router.push('/login');
      } else {
        message.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Đặt lại mật khẩu</h2>
      <p className="mb-6 text-gray-600 text-center">
        Vui lòng nhập mã OTP và mật khẩu mới của bạn.
      </p>

      <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item
          name="otp"
          label="Mã OTP"
          rules={[
            { required: true, message: 'Vui lòng nhập mã OTP!' },
            { len: 6, message: 'Mã OTP phải có đúng 6 chữ số!' }
          ]}
        >
          <Input maxLength={6} className="text-center text-xl tracking-[1em]" />
        </Form.Item>
        
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Xác nhận đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
