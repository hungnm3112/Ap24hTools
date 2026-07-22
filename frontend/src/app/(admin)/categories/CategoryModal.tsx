'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, App, TreeSelect } from 'antd';
import { createCategoryAction, updateCategoryAction, getCategoriesAction } from '@/actions/category.action';
import { ICategory } from '@/types';

interface CategoryModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData: ICategory | null; 
}

/*
 * LÝ DO THIẾT KẾ COMPONENT RIÊNG (WHY?):
 * Modal thêm/sửa có logic Form riêng. Nếu nhét hết vào page.tsx thì file page sẽ rất dài và khó đọc.
 * Tách CategoryModal ra giúp code gọn gàng, có thể tái sử dụng nếu sau này cần gọi modal từ chỗ khác.
 */
export default function CategoryModal({ open, onCancel, onSuccess, editData }: CategoryModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<ICategory[]>([]);

  // Lắng nghe sự kiện: Mỗi khi modal mở lên, ta sẽ gọi API lấy danh sách danh mục (để đưa vào select box)
  useEffect(() => {
    if (open) {
      fetchTreeData();
      if (editData) {
        form.setFieldsValue({
          name: editData.name,
          isActive: editData.isActive,
          parentId: editData.parentId,
        });
      } else {
        // Mặc định khi thêm mới
        form.resetFields();
        form.setFieldsValue({ isActive: true, parentId: null });
      }
    }
  }, [open, editData, form]);

  const fetchTreeData = async () => {
    const res = await getCategoriesAction();
    if (res.success) {
      const formatTree = (nodes: ICategory[]): any[] => {
        return nodes.map(node => ({
          title: node.name,
          value: node._id,
          children: node.children ? formatTree(node.children) : undefined,
          disabled: editData && editData._id === node._id
        }));
      };
      setCategoriesTree(formatTree(res.data));
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editData) {
        // Cập nhật
        const res = await updateCategoryAction(editData._id, values);
        if (res.success) {
          message.success(res.message);
          onSuccess();
        } else {
          message.error(res.message);
        }
      } else {
        // Thêm mới
        const res = await createCategoryAction(values);
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
      title={editData ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}
      open={open}
      onCancel={onCancel}
      footer={null} // Ẩn footer mặc định của antd modal, ta dùng nút Submit riêng trong Form
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input placeholder="Nhập tên danh mục..." />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Danh mục cha"
        >
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Chọn danh mục cha (Để trống nếu là danh mục gốc)"
            allowClear
            treeDefaultExpandAll
            treeData={categoriesTree}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái hiển thị"
          valuePropName="checked" // Switch của Antd dùng 'checked' thay vì 'value'
        >
          <Switch checkedChildren="Đang Bật" unCheckedChildren="Đã Tắt" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} disabled={loading}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editData ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
