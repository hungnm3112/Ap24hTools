'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, App, TreeSelect, Space, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { createCompetitorAction, updateCompetitorAction } from '@/actions/competitor.action';
import { getCategoriesAction } from '@/actions/category.action';

interface CompetitorModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData: any | null;
}

export default function CompetitorModal({ open, onCancel, onSuccess, editData }: CompetitorModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (editData) {
        // Dữ liệu từ Backend (populate) trả về `categoryId` là object { _id, name }
        // Ta cần map lại thành string (_id) để hiển thị đúng giá trị trong TreeSelect
        const formatUrls = editData.scrapingUrls?.map((item: any) => ({
          categoryId: item.categoryId?._id || item.categoryId,
          url: item.url
        })) || [];

        form.setFieldsValue({
          name: editData.name,
          domain: editData.domain,
          isActive: editData.isActive,
          scrapingUrls: formatUrls,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, scrapingUrls: [] });
      }
    }
  }, [open, editData, form]);

  const fetchCategories = async () => {
    const res = await getCategoriesAction();
    if (res.success) {
      const formatTree = (nodes: any[]): any[] => {
        return nodes.map(node => ({
          title: node.name,
          value: node._id,
          children: node.children ? formatTree(node.children) : undefined,
        }));
      };
      setCategoriesTree(formatTree(res.data));
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editData) {
        const res = await updateCompetitorAction(editData._id, values);
        if (res.success) {
          message.success(res.message);
          onSuccess();
        } else {
          message.error(res.message);
        }
      } else {
        const res = await createCompetitorAction(values);
        if (res.success) {
          message.success(res.message);
          onSuccess();
        } else {
          message.error(res.message);
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editData ? 'Sửa Đối thủ' : 'Thêm Đối thủ mới'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800} // Tăng độ rộng Modal để Form.List hiển thị thoải mái hơn
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Tên đối thủ"
            rules={[{ required: true, message: 'Vui lòng nhập tên đối thủ' }]}
          >
            <Input placeholder="Ví dụ: CellphoneS" />
          </Form.Item>

          <Form.Item
            name="domain"
            label="Tên miền (Domain)"
            rules={[{ required: true, message: 'Vui lòng nhập tên miền' }]}
          >
            <Input placeholder="Ví dụ: cellphones.com.vn" />
          </Form.Item>
        </div>

        {/* 
          LÝ DO SỬ DỤNG Form.List (WHY?):
          Để tạo ra form nhập liệu động (Dynamic form), cho phép người dùng bấm [Thêm URL]
          rồi tự sinh ra các ô nhập liệu mới. Dữ liệu khi Submit sẽ tự động gom thành mảng `scrapingUrls[]`.
        */}
        <Card size="small" title="Danh sách URL cần theo dõi (Scraping URLs)" className="mb-4">
          <Form.List name="scrapingUrls">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'categoryId']}
                      rules={[{ required: true, message: 'Chưa chọn danh mục' }]}
                      style={{ width: 250 }}
                    >
                      <TreeSelect
                        showSearch
                        treeDefaultExpandAll
                        treeData={categoriesTree}
                        placeholder="Chọn danh mục"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      rules={[
                        { required: true, message: 'Chưa nhập URL' },
                        { type: 'url', message: 'URL không hợp lệ' }
                      ]}
                      style={{ width: 400 }}
                    >
                      <Input placeholder="Nhập đường link chứa sản phẩm..." />
                    </Form.Item>

                    <MinusCircleOutlined 
                      className="text-red-500 hover:text-red-700 cursor-pointer text-lg ml-2" 
                      onClick={() => remove(name)} 
                    />
                  </Space>
                ))}
                
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm URL theo dõi
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Tạm dừng" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} disabled={loading}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editData ? 'Lưu thay đổi' : 'Tạo Đối thủ'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
