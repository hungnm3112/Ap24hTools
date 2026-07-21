'use server';
import { cookies } from 'next/headers';

export async function loginAction(phone: string, password: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (phone === '0329308373' && password === '123456') {
      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: { token: 'fake-jwt', user: { id: '1', name: 'Admin', role: 'admin' } }
      };
    } else {
      return { success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác' }
    }
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Lỗi đăng nhập' };
      }

      // Lưu Token vào Cookie HTTP-Only của Next.js Server
      // Trong Next.js 15, cookies() là một hàm bất đồng bộ, cần dùng await
      const cookieStore = await cookies();
      cookieStore.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 // 1 ngày
      });

      return { success: true, message: data.message, data: data.user };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
  }
}

export async function registerAction(name: string, phone: string, email: string, password: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Đăng ký thành công, vui lòng kiểm tra email để lấy mã OTP' };
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, message: msg || 'Lỗi đăng ký' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
  }
}

export async function verifyAction(email: string, otp: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Xác thực thành công, vui lòng đăng nhập' };
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, message: msg || 'Lỗi xác thực' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
  }
}

export async function forgotPasswordAction(email: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Email đã được gửi, vui lòng kiểm tra email để lấy mã OTP' };
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, message: msg || 'Lỗi gửi yêu cầu' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
  }
}

export async function resetPasswordAction(email: string, otp: string, newPassword: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' };
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        return { success: false, message: msg || 'Lỗi đặt lại mật khẩu' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
  }
}
