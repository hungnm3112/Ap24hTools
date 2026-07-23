'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { getCompetitorsAction, getScrapedProductsAction, runManualScrapingAction } from '@/actions/scraping.action';
import { Loader2 } from 'lucide-react';
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
          <label className="block text-sm font-semibold mb-1">Chọn Domain</label>
          <select 
            className="border p-2 rounded w-full" 
            value={selectedCompetitorId} 
            onChange={(e) => setSelectedCompetitorId(e.target.value)}
          >
            <option value="">-- Cào Tất Cả Domain --</option>
            {competitors.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-2 min-w-[300px]">
          <label className="block text-sm font-semibold mb-1">Cào 1 URL cụ thể (Tùy chọn)</label>
          <select 
            className="border p-2 rounded w-full" 
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={!selectedCompetitorId}
          >
            <option value="">-- Để trống để cào tất cả URL của Domain --</option>
            {selectedCompetitorId && competitors.find(c => c._id === selectedCompetitorId)?.scrapingUrls?.map((u: any, idx: number) => (
              <option key={idx} value={u.url}>{u.url}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={runScraping}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 h-[42px] rounded hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-all min-w-[180px] justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang cào dữ liệu...
            </>
          ) : (
            'Cào Dữ Liệu Ngay'
          )}
        </button>
      </div>

      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm flex items-start gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Hệ thống đang thực hiện cào dữ liệu và phân tích AI...</p>
            <p className="mt-1">
              Quá trình này có thể mất vài phút vì AI cần thời gian để phân tích và map (nhận diện) từng sản phẩm một cách chính xác nhất. Vui lòng không đóng trang web trong lúc này.
            </p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">Danh sách Sản phẩm đã cào ({scrapedProducts.length})</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b">Ảnh</th>
              <th className="p-3 border-b">Tên sản phẩm</th>
              <th className="p-3 border-b">Giá (VNĐ)</th>
              <th className="p-3 border-b">Web Domain</th>
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
