'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, Switch, Button, App, TreeSelect, Space, Card, Steps, Select, Spin, Alert, List, Typography, Badge, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined, DeleteOutlined, BugOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { createCompetitorAction, updateCompetitorAction, generateAiSelectorAction } from '@/actions/competitor.action';
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
  const [activeField, setActiveField] = useState<string>('productItem'); 
  const [selectorsData, setSelectorsData] = useState<Record<string, string>>({}); // Lưu trữ HTML tạm thời

  // State cho AI (Step 3)
  const [finalSelectors, setFinalSelectors] = useState<Record<string, string>>({}); // Lưu CSS Selector cuối cùng
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({}); // Trạng thái loading của từng field khi gọi AI

  useEffect(() => {
    if (open) {
      fetchCategories();
      setCurrentStep(0);
      setFormData(null);
      setActiveUrl('');
      setIsDeleteMode(false);
      setActiveField('productItem');
      setSelectorsData({});
      setFinalSelectors({});
      setAiLoading({});

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

        if (editData.selectors) {
          setFinalSelectors(editData.selectors as any);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, scrapingUrls: [] });
      }
    }
  }, [open, editData, form]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const msg = isDeleteMode ? 'TOGGLE_DELETE_MODE_ON' : 'TOGGLE_DELETE_MODE_OFF';
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, [isDeleteMode]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_ELEMENT') {
        const { html } = event.data;
        
        setSelectorsData(prev => ({
          ...prev,
          [activeField]: html
        }));

        // Reset finalSelector cũ để AI có thể phân tích lại HTML mới này khi sang Bước 3
        setFinalSelectors(prev => ({
          ...prev,
          [activeField]: ''
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

  const watchScrapingUrls = Form.useWatch('scrapingUrls', form);

  // --- HÀM XỬ LÝ CHUYỂN BƯỚC ---

  const handleNextToStep2 = async () => {
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
      setIframeLoading(true); // Hiển thị icon xoay (Loading) cho Iframe
      setCurrentStep(1);
    } catch (error) {
      // form validate failed
    }
  };

  const handleNextToStep3 = () => {
    setCurrentStep(2);

    // Kích hoạt gọi AI phân tích ngay lập tức cho các trường đã bắt được HTML
    SELECTOR_FIELDS.forEach(field => {
      const htmlSnippet = selectorsData[field.key];
      // Chỉ gọi AI nếu có mã HTML VÀ chưa có Selector thủ công (hoặc muốn AI ghi đè)
      // Để an toàn, nếu đã có finalSelectors rồi thì thôi, còn nếu rỗng thì gọi AI
      if (htmlSnippet && !finalSelectors[field.key]) {
        fetchAiSelector(field.key, htmlSnippet);
      }
    });
  };

  const fetchAiSelector = async (fieldKey: string, htmlSnippet: string) => {
    setAiLoading(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const fieldLabel = SELECTOR_FIELDS.find(f => f.key === fieldKey)?.label || fieldKey;
      const res = await generateAiSelectorAction(htmlSnippet, fieldLabel);
      
      if (res.success && res.data?.selector) {
        setFinalSelectors(prev => ({ ...prev, [fieldKey]: res.data.selector }));
        notification.success({ message: `AI đã phân tích xong: ${fieldLabel}`, placement: 'bottomRight' });
      } else {
        notification.error({ message: `Lỗi AI phân tích ${fieldLabel}`, description: res.message, placement: 'bottomRight' });
      }
    } catch (error) {
      notification.error({ message: `Ngoại lệ khi gọi AI cho ${fieldKey}` });
    } finally {
      setAiLoading(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  // --- HÀM LƯU DỮ LIỆU CUỐI CÙNG ---
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        selectors: finalSelectors
      };

      const res = editData 
        ? await updateCompetitorAction(editData._id, payload)
        : await createCompetitorAction(payload);
        
      if (res.success) {
        message.success(res.message);
        onSuccess();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu');
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
      width="96%" // Tăng kích thước modal lên gần tràn viền
      style={{ top: 20, maxWidth: '1800px' }} // Đảm bảo không quá to trên màn 4K nhưng vẫn rộng rãi
      destroyOnHidden
    >
      <Steps
        current={currentStep}
        className="mb-6"
        items={[
          { title: 'Thông tin cơ bản' },
          { title: 'Cấu hình Selectors' },
          { title: 'AI Phân tích & Hoàn tất', icon: <RobotOutlined /> }
        ]}
      />

      {/* --- BƯỚC 1: THÔNG TIN CƠ BẢN --- */}
      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Tên đối thủ" rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: CellphoneS" />
            </Form.Item>
            <Form.Item name="domain" label="Tên miền (Domain)" rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: cellphones.com.vn" />
            </Form.Item>
          </div>

          <Card size="small" title="Danh sách URL cần theo dõi" className="mb-4">
            <Form.List name="scrapingUrls">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'categoryId']} rules={[{ required: true }]} style={{ width: 250 }}>
                        <TreeSelect treeData={categoriesTree} placeholder="Chọn danh mục" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'url']} rules={[{ required: true }, { type: 'url' }]} style={{ width: 600 }}>
                        <Input placeholder="Nhập đường link..." />
                      </Form.Item>
                      <MinusCircleOutlined className="text-red-500 hover:text-red-700 cursor-pointer text-lg ml-2" onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm URL</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item name="testUrl" label="Chọn URL làm mẫu để cấu hình Selectors (Bắt buộc)" rules={[{ required: true }]}>
              <Select 
                options={(watchScrapingUrls || []).filter((u: any) => u?.url).map((u: any) => ({ label: u.url, value: u.url }))}
              />
            </Form.Item>
          </Card>

          <Form.Item name="customCookies" label="Giả lập Cookie (Ví dụ: province_id=3 để cấu hình lấy hàng tại Hà Nội)" tooltip="Hữu ích khi bạn muốn Bot cào dữ liệu dựa trên một khu vực hoặc phiên cụ thể. Cấu trúc giống HTTP Cookie (vd: province_id=3; cookie_2=abc). Để trống nếu muốn cào mặc định toàn quốc.">
            <Input.TextArea rows={2} placeholder="Nhập chuỗi Cookie ở đây (Nếu có)..." />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" onClick={handleNextToStep2}>Tiếp theo</Button>
          </div>
        </Form>
      </div>

      {/* --- BƯỚC 2: CẤU HÌNH SELECTOR BẰNG IFRAME --- */}
      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
        <div className="grid grid-cols-12 gap-6 h-[75vh]">
          {/* Cột trái */}
          <div className="col-span-3 flex flex-col border-r pr-4 h-full overflow-y-auto">
            <div className="mb-4">
              <Alert 
                title="Vũ khí Hủy diệt (Delete Mode)" 
                description="Bật chế độ này để click xóa Banner." 
                type={isDeleteMode ? "error" : "warning"}
                showIcon className="mb-2" icon={isDeleteMode ? <DeleteOutlined /> : <BugOutlined />}
              />
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
                <span className="font-semibold">{isDeleteMode ? 'ĐANG BẬT XÓA RÁC' : 'Chế độ Xóa Rác'}</span>
                <Switch checked={isDeleteMode} onChange={setIsDeleteMode} checkedChildren="BẬT" unCheckedChildren="TẮT" />
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">Các trường cần thu thập</h3>
            <List
              itemLayout="horizontal"
              dataSource={SELECTOR_FIELDS}
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer transition-all border-l-4 mb-2 p-3 bg-white shadow-sm rounded-r
                    ${activeField === item.key ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
                  onClick={() => { setActiveField(item.key); setIsDeleteMode(false); }}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${activeField === item.key ? 'text-blue-600' : ''}`}>{item.label}</span>
                      {(selectorsData[item.key] || finalSelectors[item.key]) && (
                        <Badge status="success" text={finalSelectors[item.key] ? "Đã có Selector" : "Đã lấy HTML"} />
                      )}
                    </div>
                    {(selectorsData[item.key] || finalSelectors[item.key]) && (
                      <details className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <summary className="cursor-pointer text-xs text-blue-500 hover:underline outline-none">
                          {finalSelectors[item.key] ? 'Xem CSS Selector đã lưu' : 'Xem HTML đã lấy'}
                        </summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono max-h-32 overflow-y-auto break-all border border-gray-200 shadow-inner text-gray-600">
                          {finalSelectors[item.key] || selectorsData[item.key]}
                        </div>
                      </details>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>

          {/* Cột phải Iframe */}
          <div className="col-span-9 h-full flex flex-col">
            <div className="relative border-4 border-dashed border-gray-300 rounded bg-gray-50 flex flex-grow overflow-hidden">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spin size="large" tip="Đang tải proxy..." />
                </div>
              )}
              {activeUrl && (
                <iframe 
                  ref={iframeRef}
                  src={`${process.env.NEXT_PUBLIC_API_URL}/scraping/proxy?url=${encodeURIComponent(activeUrl)}${formData?.customCookies ? `&customCookies=${encodeURIComponent(formData.customCookies)}` : ''}`}
                  className={`w-full h-full border-none transition-all ${isDeleteMode ? 'cursor-crosshair opacity-80 ring-4 ring-red-500' : ''}`}
                  onLoad={() => setIframeLoading(false)}
                />
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button onClick={() => setCurrentStep(0)}>Quay lại Bước 1</Button>
              <Button type="primary" onClick={handleNextToStep3} icon={<RobotOutlined />}>
                Tiếp tục - Gửi cho AI Phân tích
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BƯỚC 3: AI PHÂN TÍCH VÀ KIỂM DUYỆT --- */}
      <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
        <Alert 
          message="Gemini AI đang làm việc" 
          description="Hệ thống đang sử dụng Google Gemini để phân tích các đoạn mã HTML bạn vừa cung cấp và chuyển đổi chúng thành CSS Selectors tối ưu nhất. Bạn có thể tự chỉnh sửa lại nếu thấy AI nhận diện chưa chính xác."
          type="info" showIcon icon={<RobotOutlined />} className="mb-6"
        />

        <Row gutter={[24, 24]}>
          {SELECTOR_FIELDS.map(field => (
            <Col span={12} key={field.key}>
              <Card 
                size="small" 
                title={
                  <Space>
                    {field.label}
                    {aiLoading[field.key] ? <Spin size="small" /> : <CheckCircleOutlined className="text-green-500" />}
                  </Space>
                }
              >
                <div className="mb-2">
                  <Text type="secondary" className="text-xs">HTML thu thập được:</Text>
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono truncate text-gray-500 h-8">
                    {selectorsData[field.key] || 'Chưa thu thập'}
                  </div>
                </div>
                <div>
                  <Text strong className="text-sm block mb-1">CSS Selector (AI Sinh ra):</Text>
                  <Input 
                    placeholder="VD: .product-title"
                    value={finalSelectors[field.key] || ''}
                    onChange={(e) => setFinalSelectors(prev => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={aiLoading[field.key]}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <Button onClick={() => setCurrentStep(1)}>Quay lại cấu hình Iframe</Button>
          <div className="flex gap-2">
            <Button onClick={onCancel} disabled={loading}>Hủy bỏ</Button>
            <Button type="primary" onClick={handleSaveAll} loading={loading}>
              Lưu Đối thủ
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
