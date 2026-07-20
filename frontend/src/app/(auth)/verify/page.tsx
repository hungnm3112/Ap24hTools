'use client';
import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { useRouter } from 'next/navigation';
import { verifyAction } from '@/actions/auth.action';

export default function VerifyPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { otp: string }) => {
    try {
      setLoading(true);
      const result = await verifyAction(values.otp);
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
      <h2 className="text-2xl font-bold mb-4 text-center">Xác thực tài khoản</h2>
      <p className="mb-6 text-gray-600 text-center">
        Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn.
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
