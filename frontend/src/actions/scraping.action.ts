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
    if (!res.ok) throw new Error('Failed to fetch competitors');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getScrapedProductsAction() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraped-products`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch scraped products');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function runManualScrapingAction(competitorId?: string, targetUrl?: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/run-manual`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ competitorId, targetUrl }),
    });
    if (!res.ok) throw new Error('Failed to run manual scraping');
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteAllScrapedProductsAction() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraped-products/all`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Xóa dữ liệu thất bại');
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu cào' };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}
