'use server';
/*
  Giải thích: Lệnh 'use server' bắt buộc phải đặt ở dòng đầu tiên để Next.js hiểu rằng
  tất cả các hàm trong file này là Server Actions. Nghĩa là code ở đây sẽ CHỈ CHẠY TRÊN SERVER,
  không bao giờ bị gửi xuống trình duyệt (đảm bảo tính bảo mật).
*/

// ==========================================
// BƯỚC 1: KHAI BÁO HÀM LOGIN (MOCK)
// ==========================================
// TODO 1.1: Tạo hàm async export tên là 'loginAction' nhận vào 2 tham số (phone: string, password: string)
export async function loginAction(phone: string, password: string) {
  // TODO 1.2: Lấy giá trị của biến môi trường NEXT_PUBLIC_USE_MOCK_DATA và kiểm tra xem có bằng 'true' không
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  // Gợi ý: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

  // TODO 1.3: Nếu đang dùng Mock Data (isMock là true)
  if (isMock) {
    // - Cho code ngủ (delay) khoảng 1 giây bằng Promise + setTimeout để giả lập mạng
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // - Viết điều kiện if kiểm tra: nếu phone === '0987654321' và password === '123456'
    if (phone === '0987654321' && password === '123456') {
      //    + Trả về object: { success: true, message: 'Đăng nhập thành công', data: { token: 'fake-jwt', user: { name: 'Admin', role: 'admin' } } }
      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token: 'fake-jwt-token-for-dev',
          user: {
            id: '1',
            name: 'Admin User',
            phone: '0987654321',
            role: 'admin'
          }
        }
      };
    } else {
      return {
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không chính xác'
      }
    }
    // TODO 1.4: Nếu KHÔNG dùng Mock Data (isMock là false)
  } else {
    return {
      success: false,
      message: 'Chưa hỗ trợ API thật'
    }
  }
}

// ==========================================
// BƯỚC 2: KHAI BÁO HÀM REGISTER (MOCK)
// ==========================================
// TODO 2.1: Tạo hàm async export tên là 'registerAction' nhận vào tham số: name, phone, email, password (đều là string)
// TODO 2.2: Lấy giá trị biến môi trường NEXT_PUBLIC_USE_MOCK_DATA tương tự hàm login
// TODO 2.3: Nếu isMock là true:
// - Delay 1 giây (dùng Promise + setTimeout)
// - Trả về object: { success: true, message: 'Đăng ký thành công, vui lòng kiểm tra email để lấy mã OTP' }
// TODO 2.4: Nếu isMock là false: Trả về object { success: false, message: 'Chưa hỗ trợ API thật' }
export async function registerAction(name: string, phone: string, email: string, password: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Đăng ký thành công, vui lòng kiểm tra email để lấy mã OTP'
    };
  } else {
    return {
      success: false,
      message: 'Chưa hỗ trợ API thật'
    }
  }
}

// ==========================================
// BƯỚC 3: KHAI BÁO HÀM VERIFY OTP (MOCK)
// ==========================================
// TODO 3.1: Tạo hàm async export tên là 'verifyAction' nhận tham số: otp (kiểu string)
// TODO 3.2: Lấy biến isMock tương tự trên.
// TODO 3.3: Nếu isMock = true: Delay 1s. Nếu otp === '123456' -> success. Khác -> error.
// TODO 3.4: Nếu isMock = false: Lỗi chưa hỗ trợ API thật.
export async function verifyAction(otp: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Xác thực thành công, vui lòng đăng nhập'
    };
  } else {
    return {
      success: false,
      message: 'Chưa hỗ trợ API thật'
    }
  }
}

// ==========================================
// BƯỚC 4: KHAI BÁO HÀM FORGOT PASSWORD (MOCK)
// ==========================================
// TODO 4.1: Tạo hàm async export 'forgotPasswordAction' nhận tham số: email (kiểu string)
// TODO 4.2: Nếu isMock = true: Delay 1s. Báo gửi thành công.
// TODO 4.3: Nếu isMock = false: Lỗi chưa hỗ trợ API thật.
export async function forgotPasswordAction(email: string) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Email đã được gửi, vui lòng kiểm tra email để lấy mã OTP'
    };
  } else {
    return {
      success: false,
      message: 'Chưa hỗ trợ API thật'
    }
  }
}


