'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, App, Tag, Popconfirm, Popover, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { getCompetitorsAction, deleteCompetitorAction } from '@/actions/competitor.action';
import { runManualScrapingAction } from '@/actions/scraping.action';
import CompetitorModal from './CompetitorModal';
import { ICompetitor } from '@/types';
import { useRouter } from 'next/navigation';

export default function CompetitorsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [competitors, setCompetitors] = useState<ICompetitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<ICompetitor | null>(null);

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

  const handleScrapeSpecificUrl = (competitorId: string, url: string) => {
    router.push(`/test-scraping?competitorId=${competitorId}&targetUrl=${encodeURIComponent(url)}`);
  };

  const columns = [
    {
      title: 'Tên Domain',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ICompetitor) => (
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
      render: (_: any, record: ICompetitor) => {
        const content = (
          <List
            size="small"
            dataSource={record.scrapingUrls || []}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    type="primary"
                    icon={<CloudDownloadOutlined />}
                    onClick={() => handleScrapeSpecificUrl(record._id, item.url)}
                  >
                    Cào
                  </Button>
                ]}
              >
                <div style={{ maxWidth: 350, display: 'flex', flexDirection: 'column' }} title={item.url}>
                  {item.categoryId?.name && (
                    <span className="font-semibold text-gray-700">{item.categoryId.name}</span>
                  )}
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-gray-400 truncate hover:text-blue-500">
                    {item.url}
                  </a>
                </div>
              </List.Item>
            )}
          />
        );
        return (
          <Popover content={content} title="Danh sách URL cần cào" trigger="click" placement="right">
            <Button size="small" type="dashed">
              <Tag color="purple" style={{ margin: 0, cursor: 'pointer' }}>{record.scrapingUrls?.length || 0} URLs</Tag>
            </Button>
          </Popover>
        );
      }
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
      render: (_: any, record: ICompetitor) => (
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
            title="Xóa Domain?"
            description="Bạn có chắc chắn muốn xóa Domain này và toàn bộ dữ liệu cào liên quan không?"
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
          <h1 className="text-2xl font-bold">Quản lý Domain</h1>
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
          Thêm Domain mới
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
