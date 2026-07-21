'use client';
import { Card, Col, Row, Statistic } from 'antd';

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard - Tổng quan</h2>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Tổng sản phẩm" value={1254} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Từ khóa đang theo dõi" value={320} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Đối thủ cạnh tranh" value={15} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Sản phẩm chênh lệch giá" value={42} styles={{ content: { color: '#cf1322' } }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
