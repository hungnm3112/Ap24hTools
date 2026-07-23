'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getPriceMatrix } from '@/actions/matrix.action';
import { Tag } from 'antd'; // Tận dụng Tag của antd cho đẹp

export default function MatrixTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const matrixData = await getPriceMatrix();
      setData(matrixData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Format tiền tệ
  const formatCurrency = (value: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Trích xuất danh sách tất cả các đối thủ để tạo cột động
  const columns = useMemo(() => {
    // Cột Sản phẩm cố định
    const baseColumns: GridColDef[] = [
      { 
        field: 'catalogProductName', 
        headerName: 'Sản Phẩm Chuẩn', 
        width: 350,
        renderCell: (params) => {
          const pricesArray = params.row.prices || [];
          const imgUrl = pricesArray.find((p: any) => p.image)?.image || '';
          return (
            <div className="flex items-center gap-3">
              {imgUrl ? (
                <img src={imgUrl} alt={params.value} className="w-12 h-12 object-contain rounded border border-gray-200 bg-white" />
              ) : (
                <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Img</div>
              )}
              <div className="font-medium text-gray-800 break-words line-clamp-2" title={params.value}>{params.value}</div>
            </div>
          )
        }
      }
    ];

    // Tìm tất cả các siteName duy nhất từ toàn bộ dữ liệu
    const uniqueSites = new Set<string>();
    data.forEach(row => {
      if (Array.isArray(row.prices)) {
        row.prices.forEach((p: any) => uniqueSites.add(p.siteName));
      }
    });

    // Tạo các cột động cho từng Đối thủ
    const dynamicColumns: GridColDef[] = Array.from(uniqueSites).map(site => ({
      field: `site_${site}`, // Field ảo, sẽ dùng valueGetter hoặc renderCell
      headerName: site,
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const pricesArray = params.row.prices || [];
        const siteData = pricesArray.find((p: any) => p.siteName === site);
        
        if (!siteData) {
          return <div className="text-gray-300 italic text-sm">N/A</div>;
        }

        const validPrices = pricesArray.map((p: any) => p.price).filter((price: number) => price > 0);
        const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
        const highestPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

        const isLowest = siteData.price === lowestPrice && validPrices.length > 1;
        const isHighest = siteData.price === highestPrice && validPrices.length > 1;

        return (
          <div className={`w-full h-full p-2 flex flex-col justify-center rounded transition-colors
            ${isLowest ? 'bg-green-50 border-l-4 border-green-500' : ''}
            ${isHighest ? 'bg-red-50 border-l-4 border-red-500' : ''}
          `}>
            <div className="flex items-center justify-between">
              <a href={siteData.url} target="_blank" rel="noopener noreferrer" className={`font-semibold hover:underline ${isLowest ? 'text-green-700' : isHighest ? 'text-red-700' : 'text-gray-700'}`}>
                {formatCurrency(siteData.price)}
              </a>
            </div>
            {siteData.isAiMatched && (
              <div className="mt-1">
                <Tag color={siteData.aiConfidence === 'HIGH' ? 'green' : 'orange'} className="text-[10px] m-0 leading-[14px]">
                  AI Match
                </Tag>
              </div>
            )}
          </div>
        );
      }
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [data]);

  // DataGrid yêu cầu mỗi row phải có 'id'
  const rows = useMemo(() => {
    return data.map(row => ({
      ...row,
      id: row._id
    }));
  }, [data]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      getRowHeight={() => 'auto'} // Để cell tự động co giãn theo nội dung (Tag)
      sx={{
        border: 0,
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid #f0f0f0',
          paddingTop: '8px',
          paddingBottom: '8px',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#fafafa',
          color: '#333',
          fontWeight: 'bold',
          borderBottom: '1px solid #e0e0e0',
        },
      }}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 25 },
        },
      }}
      pageSizeOptions={[25, 50, 100]}
      disableRowSelectionOnClick
    />
  );
}
