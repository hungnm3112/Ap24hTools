'use client';
/*
  BÀI HỌC MỚI: BẢNG DỮ LIỆU (ANT DESIGN TABLE)
  Trang này hướng dẫn cách sử dụng Component <Table> của Ant Design để hiển thị dữ liệu dạng lưới.
  Hai thành phần quan trọng nhất của Table là:
  1. dataSource: Mảng chứa dữ liệu thực tế (danh sách các object).
  2. columns: Mảng định nghĩa cấu trúc của các cột (tiêu đề cột, cách render dữ liệu...).
*/

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN
// ==========================================
// TODO 1.1: Import React và useState từ 'react'
// TODO 1.2: Import { Table, Tag, Button, Input, Space } từ 'antd'
// TODO 1.3: Import icon { SearchOutlined } từ '@ant-design/icons'

// ==========================================
// BƯỚC 2: TẠO MOCK DATA
// ==========================================
// TODO 2.1: Tạo mảng 'mockData' chứa 3-4 object sản phẩm. Mỗi object có cấu trúc:
// { key: '1', productName: 'iPhone 15 Pro Max 256GB', ap24hPrice: 28990000, competitorPrice: 28590000, status: 'Cao hơn đối thủ', url: 'https...' }

export default function PricingPage() {
  // TODO 2.2: Tạo state 'data' với giá trị khởi tạo là 'mockData' ở trên

  // ==========================================
  // BƯỚC 3: ĐỊNH NGHĨA CỘT (COLUMNS)
  // ==========================================
  // TODO 3.1: Tạo mảng 'columns' định nghĩa các cột cho bảng:
  /* Gợi ý cấu trúc:
    const columns = [
      {
        title: 'Tên Sản phẩm',
        dataIndex: 'productName', // Phải khớp với key trong mockData
        key: 'productName',
      },
      {
        title: 'Giá AP24h',
        dataIndex: 'ap24hPrice',
        key: 'ap24hPrice',
        render: (price) => price.toLocaleString('vi-VN') + ' đ' // Hàm render giúp format tiền tệ
      },
      // TODO 3.2: Thêm cột 'Giá Đối thủ' (cũng format tiền tệ giống ở trên)
      
      // TODO 3.3: Thêm cột 'Trạng thái' (Dùng thẻ <Tag> của Antd để tô màu: Đỏ nếu cao hơn, Xanh nếu thấp hơn)
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
           // Gợi ý logic: return <Tag color={status === 'Cao hơn đối thủ' ? 'red' : 'green'}>{status}</Tag>
        }
      },
      // TODO 3.4: Thêm cột 'Hành động' (Chứa 1 nút Button "Xem chi tiết")
    ];
  */

  // ==========================================
  // BƯỚC 4: RENDER GIAO DIỆN
  // ==========================================
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Đối chiếu giá</h2>
        {/* TODO 4.1: Render ô tìm kiếm <Input prefix={<SearchOutlined />} placeholder="Tìm sản phẩm..." style={{ width: 300 }} /> */}
      </div>

      {/* TODO 4.2: Render Component <Table> và truyền 2 thuộc tính: columns={columns} và dataSource={data} */}
    </div>
  );
}
