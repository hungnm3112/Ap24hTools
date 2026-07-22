'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, Switch, Button, App, TreeSelect, Space, Card, Steps, Select, Spin, Alert, List, Typography, Badge } from 'antd';
import { PlusOutlined, MinusCircleOutlined, DeleteOutlined, BugOutlined } from '@ant-design/icons';
import { createCompetitorAction, updateCompetitorAction } from '@/actions/competitor.action';
import { getCategoriesAction } from '@/actions/category.action';
import { ICategory, ICompetitor, IScrapingUrl } from '@/types';

const { Text } = Typography;

interface CompetitorModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData: ICompetitor | null;
}

const SELECTOR_FIELDS = [
  { key: 'productItem', label: 'Khung sản phẩm (Chứa toàn bộ SP)' },
  { key: 'productName', label: 'Tên sản phẩm' },
  { key: 'productPrice', label: 'Giá sản phẩm' },
  { key: 'productImage', label: 'Ảnh sản phẩm' },
  { key: 'nextPageButton', label: 'Nút sang trang tiếp theo (Next Page)' },
];

export default function CompetitorModal({ open, onCancel, onSuccess, editData }: CompetitorModalProps) {
  const [form] = Form.useForm();
  const { message, notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<ICategory[]>([]);

  // State quản lý Wizard (Steps)
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>(null); // Lưu trữ dữ liệu từ Step 1

  // State cho Iframe (Step 2)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [iframeLoading, setIframeLoading] = useState(false);
  
  // State chế độ Xóa
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // State quản lý việc gán HTML cho trường nào
  const [activeField, setActiveField] = useState<string>('productItem'); // Trường đang được chọn
  const [selectorsData, setSelectorsData] = useState<Record<string, string>>({}); // Lưu trữ HTML tạm thời cho từng trường

  useEffect(() => {
    if (open) {
      fetchCategories();
      setCurrentStep(0);
      setFormData(null);
      setActiveUrl('');
      setIsDeleteMode(false);
      setActiveField('productItem');
      setSelectorsData({});

      if (editData) {
        const formatUrls = editData.scrapingUrls?.map((item: IScrapingUrl) => {
          const cat = item.categoryId as any; 
          return {
            categoryId: cat._id || cat,
            url: item.url
          };
        }) || [];

        form.setFieldsValue({
          name: editData.name,
          domain: editData.domain,
          isActive: editData.isActive,
          scrapingUrls: formatUrls,
          testUrl: formatUrls.length > 0 ? formatUrls[0].url : undefined
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, scrapingUrls: [] });
      }
    }
  }, [open, editData, form]);

  // Lắng nghe sự kiện Bật/Tắt Delete Mode và bắn tin nhắn vào Iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const msg = isDeleteMode ? 'TOGGLE_DELETE_MODE_ON' : 'TOGGLE_DELETE_MODE_OFF';
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, [isDeleteMode]);

  // Lắng nghe sự kiện click phần tử từ Iframe truyền ra ngoài (postMessage)
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_ELEMENT') {
        const { html, tagName, className } = event.data;
        
        // Gán mã HTML vào trường đang Active
        setSelectorsData(prev => ({
          ...prev,
          [activeField]: html
        }));

        message.success(`Đã lấy mã HTML cho: ${SELECTOR_FIELDS.find(f => f.key === activeField)?.label}`);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [activeField, message]);

  const fetchCategories = async () => {
    const res = await getCategoriesAction();
    if (res.success) {
      const formatTree = (nodes: ICategory[]): any[] => {
        return nodes.map(node => ({
          title: node.name,
          value: node._id,
          children: node.children ? formatTree(node.children) : undefined,
        }));
      };
      setCategoriesTree(formatTree(res.data));
    }
  };

  // Lấy danh sách URL hiện tại trong form để đưa vào dropdown chọn Test URL
  const watchScrapingUrls = Form.useWatch('scrapingUrls', form);

  // Nút "Tiếp theo" ở Bước 1
  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      if (!values.scrapingUrls || values.scrapingUrls.length === 0) {
        message.error('Phải thêm ít nhất 1 URL để cào dữ liệu');
        return;
      }
      if (!values.testUrl) {
        message.error('Vui lòng chọn 1 URL làm mẫu để cấu hình Selectors');
        return;
      }

      setFormData(values);
      setActiveUrl(values.testUrl);
      setCurrentStep(1);
    } catch (error) {
      // validate thất bại
    }
  };

  const handleFinish = async () => {
    // Tạm thời chưa gọi API lưu Selector, ta mới chỉ test HTML
    message.info('Tính năng lưu Selector sẽ được gọi ở Phase 3.4 sau khi AI trả kết quả');
  };

  return (
    <Modal
      title={editData ? 'Sửa Đối thủ' : 'Thêm Đối thủ mới'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1400} // Cần width rất to để chứa 2 cột (Cột Menu + Cột Iframe)
      style={{ top: 20 }}
      destroyOnHidden
    >
      <Steps
        current={currentStep}
        className="mb-6"
        items={[
          { title: 'Thông tin cơ bản' },
          { title: 'Cấu hình Selectors' },
        ]}
      />

      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Form form={form} layout="vertical">
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
                        style={{ width: 600 }}
                      >
                        <Input placeholder="Nhập đường link chứa sản phẩm..." />
                      </Form.Item>

                      <MinusCircleOutlined 
                        className="text-red-500 hover:text-red-700 cursor-pointer text-lg ml-2" 
                        onClick={() => {
                          remove(name);
                          // Nếu xóa đúng URL đang chọn làm mẫu, thì reset testUrl
                          const currentUrls = form.getFieldValue('scrapingUrls');
                          const testUrl = form.getFieldValue('testUrl');
                          if (currentUrls && testUrl && !currentUrls.some((u: any) => u.url === testUrl)) {
                             form.setFieldsValue({ testUrl: undefined });
                          }
                        }} 
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

            <Form.Item
              name="testUrl"
              label="Chọn URL làm mẫu để cấu hình Selectors (Bắt buộc)"
              rules={[{ required: true, message: 'Bắt buộc chọn 1 URL làm mẫu' }]}
            >
              <Select 
                placeholder="--- Vui lòng chọn 1 URL từ danh sách phía trên ---"
                options={(watchScrapingUrls || []).filter((u: any) => u?.url).map((u: any) => ({
                  label: u.url,
                  value: u.url,
                }))}
              />
            </Form.Item>
          </Card>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" onClick={handleNext}>Tiếp theo</Button>
          </div>
        </Form>
      </div>

      {currentStep === 1 && (
        <div className="grid grid-cols-12 gap-6 h-[75vh]">
          {/* Cột trái (Bảng Điều khiển) */}
          <div className="col-span-3 flex flex-col border-r pr-4 h-full overflow-y-auto">
            <div className="mb-4">
              <Alert 
                title="Vũ khí Hủy diệt (Delete Mode)" 
                description="Bật chế độ này để click xóa các Banner quảng cáo/Cookie che khuất màn hình. Nhớ tắt đi để chọn phần tử!" 
                type={isDeleteMode ? "error" : "warning"}
                showIcon 
                className="mb-2"
                icon={isDeleteMode ? <DeleteOutlined /> : <BugOutlined />}
              />
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
                <span className="font-semibold">{isDeleteMode ? 'ĐANG BẬT XÓA RÁC' : 'Chế độ Xóa Rác'}</span>
                <Switch 
                  checked={isDeleteMode} 
                  onChange={setIsDeleteMode} 
                  checkedChildren="BẬT" 
                  unCheckedChildren="TẮT"
                />
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">Các trường cần thu thập</h3>
            <p className="text-sm text-gray-500 mb-4">Click chọn 1 trường bên dưới, sau đó click vào Iframe bên phải để lấy mã HTML.</p>

            <List
              itemLayout="horizontal"
              dataSource={SELECTOR_FIELDS}
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer transition-all border-l-4 mb-2 p-3 bg-white shadow-sm rounded-r
                    ${activeField === item.key ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}
                  `}
                  onClick={() => {
                    setActiveField(item.key);
                    setIsDeleteMode(false); // Tự động tắt Delete Mode khi user chuẩn bị chọn phần tử
                  }}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${activeField === item.key ? 'text-blue-600' : ''}`}>
                        {item.label}
                      </span>
                      {selectorsData[item.key] && (
                        <Badge status="success" text="Đã lấy" />
                      )}
                    </div>
                    {selectorsData[item.key] ? (
                      <div className="text-xs font-mono text-gray-500 truncate max-w-[250px]">
                        {selectorsData[item.key]}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa có dữ liệu</span>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>

          {/* Cột phải (Iframe) */}
          <div className="col-span-9 h-full flex flex-col">
             <div className="flex items-center gap-4 mb-2">
              <span className="font-semibold whitespace-nowrap">URL đang giả lập:</span>
              <Input value={activeUrl} readOnly disabled className="bg-gray-100" />
            </div>

            <div className="relative border-4 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center flex-grow">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spin size="large" tip="Playwright đang tẩy não JS trang đích (10-20s)..." />
                </div>
              )}
              
              {activeUrl ? (
                <iframe 
                  ref={iframeRef}
                  src={`${process.env.NEXT_PUBLIC_API_URL}/scraping/proxy?url=${encodeURIComponent(activeUrl)}`}
                  className={`w-full h-full border-none transition-all ${isDeleteMode ? 'cursor-crosshair opacity-80 ring-4 ring-red-500 inset-0' : ''}`}
                  onLoad={() => setIframeLoading(false)}
                />
              ) : (
                <p className="text-gray-400">Vui lòng chọn URL</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
              <div className="flex gap-2">
                <Button onClick={onCancel} disabled={loading}>Hủy</Button>
                <Button type="primary" onClick={handleFinish} loading={loading}>
                  Tiếp tục - AI Phân tích
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
