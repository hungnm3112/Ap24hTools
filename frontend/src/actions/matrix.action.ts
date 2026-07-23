'use server';

export async function getPriceMatrix() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraped-products/matrix`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch price matrix: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Lỗi khi gọi API getPriceMatrix:', error);
    return [];
  }
}
