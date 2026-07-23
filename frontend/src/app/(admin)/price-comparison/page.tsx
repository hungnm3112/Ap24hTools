import React from 'react';
import MatrixTable from './MatrixTable';

export const metadata = {
  title: 'Ma Trận Đối Chiếu Giá',
};

export default function PriceComparisonPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ma Trận Đối Chiếu Giá (N-Web)</h1>
          <p className="text-gray-500 mt-1">Phân tích giá thị trường theo thời gian thực và tự động điều chỉnh giá bán.</p>
        </div>
      </div>
      
      {/* Container của Bảng Ma Trận */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-[calc(100vh-200px)]">
        <MatrixTable />
      </div>
    </div>
  );
}
