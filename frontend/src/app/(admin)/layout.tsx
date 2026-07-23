'use client';
/*
  GIẢI THÍCH KIẾN THỨC MỚI (NESTED LAYOUT):
  - File layout.tsx này nằm trong thư mục (admin), nghĩa là nó sẽ bọc (wrap) TẤT CẢ các trang nằm bên trong nó (ví dụ: /dashboard, /users, ...).
  - Khác với layout Auth chỉ hiển thị khung tĩnh giữa màn hình, Layout Admin phức tạp hơn vì chứa Trạng thái (State) 
    để Đóng/Mở thanh Sidebar bên trái. Vì vậy, ta phải khai báo file này là Client Component ('use client').
*/

// ==========================================
// BƯỚC 1: IMPORT THƯ VIỆN
// ==========================================
// TODO 1.1: Import React và useState từ 'react'
// TODO 1.2: Import { Layout, Menu, Button, theme, Dropdown } từ 'antd'
// TODO 1.3: Import các icon từ '@ant-design/icons' (gợi ý: MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, UserOutlined, LogoutOutlined, HistoryOutlined, SettingOutlined, TagsOutlined, TeamOutlined, ProfileOutlined)
// TODO 1.4: Import thẻ <Link> từ 'next/link' và hook usePathname, useRouter từ 'next/navigation'
import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Khởi tạo các thành phần con của Layout từ Ant Design
const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ==========================================
  // BƯỚC 2: KHỞI TẠO HOOKS & STATE
  // ==========================================
  // TODO 2.1: Khởi tạo state 'collapsed', kiểu boolean, mặc định là false (dùng để thu gọn/mở rộng Sidebar)
  // TODO 2.2: Khởi tạo biến 'pathname' dùng hook usePathname() để lấy đường dẫn hiện tại (giúp menu sáng lên đúng trang)
  // TODO 2.3: Khởi tạo biến 'router' dùng hook useRouter()
  // TODO 2.4: Lấy mã màu nền mặc định của Antd: const { token: { colorBgContainer } } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { token: { colorBgContainer } } = theme.useToken();

  // ==========================================
  // BƯỚC 3: CẤU HÌNH MENU ITEMS CỦA SIDEBAR
  // ==========================================
  // TODO 3.1: Tạo một mảng 'menuItems' cho Sidebar theo yêu cầu: Dashboard, Đối chiếu giá, Đối thủ, Danh mục, Từ khóa, Lịch sử, Nhân viên
  // Gợi ý cấu trúc 1 item: 
  // { key: '/dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Dashboard</Link> }
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
    { key: '/price-comparison', icon: <DollarOutlined />, label: <Link href="/price-comparison">Đối chiếu giá</Link> },
    { key: '/competitors', icon: <UserOutlined />, label: <Link href="/competitors">Domain</Link> },
    { key: '/categories', icon: <TagsOutlined />, label: <Link href="/categories">Danh mục</Link> },
    { key: '/keywords', icon: <ProfileOutlined />, label: <Link href="/keywords">Từ khóa</Link> },
    { key: '/history', icon: <HistoryOutlined />, label: <Link href="/history">Lịch sử</Link> },
    { key: '/users', icon: <TeamOutlined />, label: <Link href="/users">Nhân viên</Link> },
  ];
  // TODO 3.2: Tạo hàm xử lý đăng xuất 'handleLogout'. Logic: Dọn dẹp token/session (nếu có) và router.push('/login')
  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  }
  // ==========================================
  // BƯỚC 4: RENDER GIAO DIỆN (JSX)
  // ==========================================
  // GỢI Ý CẤU TRÚC CHUẨN CỦA ANT DESIGN PRO:
  /*
  <Layout style={{ minHeight: '100vh' }}>
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="flex h-16 items-center justify-center text-white font-bold text-xl tracking-wider bg-indigo-600/20 m-4 rounded-lg">
        {collapsed ? 'AP' : 'AutoAP24h'}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={menuItems} />
    </Sider>
    
    <Layout>
      <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm z-10">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        
        <div className="flex items-center gap-4 px-4">
           {/* Dropdown User Info & Logout ở đây *}
        </div>
      </Header>
      
      <Content style={{ margin: '24px 16px', padding: 24, background: colorBgContainer, borderRadius: 8, overflow: 'auto' }}>
        {children}
      </Content>
    </Layout>
  </Layout>
  */

  return (
    <div>
      {/* TODO 4.1: Xoá thẻ <div> này, thay bằng cấu trúc <Layout> như gợi ý ở trên và dùng AI sinh code hoàn thiện */} {/* Xoá thẻ <div> ban đầu và thay bằng Layout của Ant Design */}
      <Layout style={{ minHeight: '100vh' }}>

        {/* 1. SIDER (Cột bên trái) - Dùng để điều hướng */}
        <Sider trigger={null} collapsible collapsed={collapsed}>
          {/* Logo và Tên app */}
          <div className="flex h-16 items-center justify-center text-white font-bold text-xl tracking-wider bg-indigo-600/20 m-4 rounded-lg">
            {collapsed ? 'AP' : 'AutoAP24h'}
          </div>

          {/* Menu Sidebar */}
          <Menu
            theme="dark"        // Màu nền tối cho Sidebar
            mode="inline"         // Chế độ hiển thị: từng dòng (không cuộn ngang)
            selectedKeys={[pathname]} // [KEY] Đây là mấu chốt để menu tự động sáng theo trang hiện tại
            items={menuItems}       // Dữ liệu menu đã chuẩn bị ở BƯỚC 3.1
          />
        </Sider>

        {/* 2. LAYOUT (Phần còn lại: Thanh Header và Nội dung) */}
        <Layout>

          {/* HEADER (Thanh trên cùng) */}
          <Header
            style={{ padding: 0, background: colorBgContainer }} // Lấy màu nền chuẩn của Ant Design
            className="flex justify-between items-center px-4 shadow-sm z-10">
            {/* Nút Bấm để Thu gọn/Mở rộng Sidebar */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }} // Kích thước nút cho đẹp
            />

            {/* Dropdown User Info & Logout (Bên phải) */}
            <Dropdown
              menu={{
                items: [
                  { key: '1', icon: <ProfileOutlined />, label: 'Thông tin cá nhân' },
                  { key: '2', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
                ],
              }}
              placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} />
            </Dropdown>
          </Header>

          {/* CONTENT (Nội dung chính) */}
          <Content
            style={{
              margin: '24px 16px', // Khoảng cách lề (24 trên dưới, 16 trái phải)
              padding: 24,         // Padding bên trong Content
              background: colorBgContainer, // Lấy màu nền
              borderRadius: 8,       // Bo góc
              overflow: 'auto'       // Tự động có thanh cuộn nếu nội dung tràn
            }}>
            {children} {/* Render các trang con (/dashboard, /users...) ở đây */}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
