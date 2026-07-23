'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { getCompetitorsAction, getScrapedProductsAction, runManualScrapingAction } from '@/actions/scraping.action';
import { useSearchParams } from 'next/navigation';

function TestScrapingContent() {
  const searchParams = useSearchParams();
  const initCompetitorId = searchParams?.get('competitorId') || '';
  const initTargetUrl = searchParams?.get('targetUrl') || '';

  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(initCompetitorId);
  const [targetUrl, setTargetUrl] = useState(initTargetUrl);
  const [scrapedProducts, setScrapedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Load competitors
    getCompetitorsAction().then(data => {
      setCompetitors(Array.isArray(data) ? data : []);
    }).catch(err => console.error(err));
      
    // Load scraped products initially
    loadProducts();
  }, []);

  const loadProducts = () => {
    getScrapedProductsAction().then(data => {
      setScrapedProducts(Array.isArray(data) ? data : []);
    }).catch(err => console.error(err));
  };

  const runScraping = async () => {
    setLoading(true);
    try {
      await runManualScrapingAction(selectedCompetitorId || undefined, targetUrl || undefined);
      alert('Cào dữ liệu thành công!');
      loadProducts();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">UI Test - Cơ chế Cào dữ liệu</h1>
      
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Chọn đối thủ</label>
          <select 
            className="border p-2 rounded w-full" 
            value={selectedCompetitorId} 
            onChange={(e) => setSelectedCompetitorId(e.target.value)}
          >
            <option value="">-- Cào Tất Cả Đối Thủ --</option>
            {competitors.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-2 min-w-[300px]">
          <label className="block text-sm font-semibold mb-1">Cào cụ thể 1 URL (Tùy chọn)</label>
          <input 
            type="text"
            className="border p-2 rounded w-full" 
            placeholder="Để trống để cào tất cả URL của đối thủ..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
        </div>

        <button 
          onClick={runScraping}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 h-[42px] rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang chạy (Vui lòng chờ...)' : 'Cào Dữ Liệu Ngay'}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">Danh sách Sản phẩm đã cào ({scrapedProducts.length})</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b">Ảnh</th>
              <th className="p-3 border-b">Tên sản phẩm</th>
              <th className="p-3 border-b">Giá (VNĐ)</th>
              <th className="p-3 border-b">Web Đối thủ</th>
            </tr>
          </thead>
          <tbody>
            {scrapedProducts.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 border-b">
                <td className="p-3">
                  {p.productImage && (
                    <img 
                      src={p.productImage.startsWith('/') 
                        ? (p.siteId?.domain?.startsWith('http') ? p.siteId.domain : `https://${p.siteId?.domain || ''}`) + p.productImage 
                        : p.productImage} 
                      alt={p.productName} 
                      className="w-16 h-16 object-contain" 
                    />
                  )}
                </td>
                <td className="p-3 font-medium text-blue-600">
                  <a href={p.productUrl} target="_blank" rel="noreferrer">{p.productName}</a>
                </td>
                <td className="p-3 text-red-600 font-bold">
                  {p.productPrice?.toLocaleString('vi-VN')}
                </td>
                <td className="p-3">
                  {p.siteId?.name || 'Unknown'}
                </td>
              </tr>
            ))}
            {scrapedProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">Chưa có dữ liệu. Hãy bấm "Cào Dữ Liệu Ngay".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TestScrapingPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <TestScrapingContent />
    </Suspense>
  );
}
