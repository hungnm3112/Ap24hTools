'use server';

import { cookies } from 'next/headers';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || ''}`,
  };
}

export async function getCompetitorsAction() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitors`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store', 
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Lỗi khi lấy danh sách đối thủ' };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function createCompetitorAction(payload: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitors`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: Array.isArray(data.message) ? data.message[0] : data.message };
    }
    return { success: true, message: 'Thêm đối thủ thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function updateCompetitorAction(id: string, payload: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitors/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: Array.isArray(data.message) ? data.message[0] : data.message };
    }
    return { success: true, message: 'Cập nhật đối thủ thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function deleteCompetitorAction(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitors/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Lỗi xóa đối thủ' };
    }
    return { success: true, message: 'Xóa đối thủ thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
