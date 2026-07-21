'use server';

import { cookies } from 'next/headers';

/*
 * LÝ DO SỬ DỤNG SERVER ACTIONS (WHY?):
 * Thay vì viết fetch() tại Client Component, việc bọc nó trong Server Actions mang lại lợi ích:
 * 1. Dễ dàng truy xuất HTTP-Only Cookie (accessToken) thông qua next/headers. Client không thể đọc được cookie này.
 * 2. Bảo mật tốt hơn do API URL ẩn phía sau Server của Next.js.
 */

// Hàm dùng chung để đính kèm token
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || ''}`,
  };
}

export async function getCategoriesAction() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      // cache: 'no-store' đảm bảo Next.js không cache lại kết quả cũ của danh sách này.
      cache: 'no-store', 
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Lỗi khi lấy danh sách danh mục' };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function createCategoryAction(payload: { name: string; isActive?: boolean; parentId?: string | null }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: Array.isArray(data.message) ? data.message[0] : data.message };
    }
    return { success: true, message: 'Tạo danh mục thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function updateCategoryAction(id: string, payload: { name?: string; isActive?: boolean; parentId?: string | null }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: Array.isArray(data.message) ? data.message[0] : data.message };
    }
    return { success: true, message: 'Cập nhật danh mục thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Lỗi xóa danh mục' };
    }
    return { success: true, message: 'Xóa danh mục thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
