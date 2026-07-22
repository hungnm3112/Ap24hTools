import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/*
 * LÝ DO SỬ DỤNG PROXY T (TÊN MỚI CỦA MIDDLEWARE) (WHY?):
 * Từ bản cập nhật mới của Next.js (Version 16+), file middleware.ts bị đổi tên thành proxy.ts
 * Vai trò của nó vẫn giữ nguyên: Đứng ở "cửa ngõ" để chặn, chuyển hướng request.
 * Nó giúp ta kiểm tra xem người dùng có Cookie 'accessToken' hay không 
 * NGAY LẬP TỨC trên server, mà không cần phải chờ tải xong trang.
 */
export function proxy(request: NextRequest) {
  // Lấy đường dẫn hiện tại mà người dùng đang muốn truy cập
  const pathname = request.nextUrl.pathname;
  
  // Lấy token từ HTTP-Only Cookie
  const token = request.cookies.get('accessToken')?.value;

  // Danh sách các route công khai không cần đăng nhập
  const publicRoutes = ['/login', '/register', '/verify', '/forgot-password', '/reset-password'];

  // Nếu người dùng đang cố truy cập vào các trang Admin (không nằm trong publicRoutes)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith('/api'); // Không chặn route API nội bộ của Next.js nếu có
  const isStaticFile = pathname.match(/\.(.*)$/); // Bỏ qua file tĩnh (css, js, ảnh)

  if (!isPublicRoute && !isApiRoute && !isStaticFile) {
    // Nếu KHÔNG có token -> Bắt buộc đẩy về trang Đăng nhập
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Ngược lại, nếu đã có token mà lại đi vào trang /login, ta có thể đẩy họ vào /dashboard
  if (isPublicRoute && token && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Nếu đường dẫn là gốc ('/'), tự động đẩy vào dashboard
  if (pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Cho phép request tiếp tục đi tới trang đích
  return NextResponse.next();
}

// Chỉ định Middleware chỉ chạy trên các đường dẫn cụ thể để tối ưu hiệu suất
export const config = {
  matcher: [
    /*
     * Match tất cả đường dẫn trừ:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
