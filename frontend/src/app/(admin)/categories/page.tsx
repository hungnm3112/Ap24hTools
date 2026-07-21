'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, App, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategoriesAction, deleteCategoryAction } from '@/actions/category.action';
import CategoryModal from './CategoryModal';

/*
 * LÝ DO SỬ DỤNG CLIENT COMPONENT Ở ĐÂY (WHY?):
 * Mặc dù Next.js khuyến khích dùng Server Component để fetch data. 
 * Tuy nhiên, trang CRUD này chứa Bảng (Table) hỗ trợ Sorting, Pagination và chứa Modal (State).
 * Với Ant Design, Table tương tác mạnh (interactive) đòi hỏi phải chạy ở môi trường Client ('use client').
 */
export default function CategoriesPage() {
  const { message } = App.useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null); // null = mode Create, có data = mode Edit

  // 1. Hàm fetch data từ Backend
  const fetchCategories = async () => {
    setLoading(true);
    const res = await getCategoriesAction();
    if (res.success) {
      setCategories(res.data);
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };

  // Gọi fetch lần đầu khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Hàm xử lý xóa Danh mục
  const handleDelete = async (id: string) => {
    const res = await deleteCategoryAction(id);
    if (res.success) {
      message.success(res.message);
      fetchCategories(); // Gọi lại API để làm mới bảng
    } else {
      message.error(res.message);
    }
  };

  // 3. Định nghĩa các cột cho Table Antd
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Đang hoạt động' : 'Đã ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      // Format ngày tháng đơn giản
      render: (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditData(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục?"
            description="Bạn có chắc chắn muốn xóa danh mục này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditData(null); // Clear data cũ để mở mode Tạo mới
            setIsModalOpen(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <Table 
        dataSource={categories} 
        columns={columns} 
        rowKey="_id" // Xác định trường nào làm key duy nhất cho mỗi dòng
        loading={loading}
        bordered
      />

      <CategoryModal
        open={isModalOpen}
        editData={editData}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false); // Tắt modal
          fetchCategories();     // Refresh lại dữ liệu bảng
        }}
      />
    </div>
  );
}
