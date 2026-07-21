'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, App, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { getCompetitorsAction, deleteCompetitorAction } from '@/actions/competitor.action';
import CompetitorModal from './CompetitorModal';

export default function CompetitorsPage() {
  const { message } = App.useApp();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchCompetitors = async () => {
    setLoading(true);
    const res = await getCompetitorsAction();
    if (res.success) {
      setCompetitors(res.data);
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await deleteCompetitorAction(id);
    if (res.success) {
      message.success(res.message);
      fetchCompetitors();
    } else {
      message.error(res.message);
    }
  };

  const columns = [
    {
      title: 'Tên đối thủ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span className="font-semibold text-blue-600">{text}</span>
      )
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => (
        <Space>
          <GlobalOutlined className="text-gray-400" />
          <a href={`https://${text}`} target="_blank" rel="noreferrer">{text}</a>
        </Space>
      )
    },
    {
      title: 'Số lượng URL',
      key: 'urlsCount',
      // Hiển thị đếm số lượng Link đang cấu hình để cào dữ liệu
      render: (_: any, record: any) => (
        <Tag color="purple">{record.scrapingUrls?.length || 0} URLs</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
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
            Sửa & Cấu hình
          </Button>
          <Popconfirm
            title="Xóa đối thủ?"
            description="Bạn có chắc chắn muốn xóa đối thủ này và toàn bộ dữ liệu cào liên quan không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Đồng ý xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
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
        <div>
          <h1 className="text-2xl font-bold">Quản lý Đối thủ</h1>
          <p className="text-gray-500 text-sm mt-1">Cấu hình các website cần theo dõi giá</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
          size="large"
        >
          Thêm đối thủ mới
        </Button>
      </div>

      <Table 
        dataSource={competitors} 
        columns={columns} 
        rowKey="_id"
        loading={loading}
        bordered
      />

      <CompetitorModal
        open={isModalOpen}
        editData={editData}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCompetitors();
        }}
      />
    </div>
  );
}
