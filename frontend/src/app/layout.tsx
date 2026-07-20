import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoAP24h - Hệ thống Quản lý Giá",
  description: "Hệ thống quản lý và đối chiếu giá tự động giữa AP24h và đối thủ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#6366f1',
                borderRadius: 8,
                fontFamily: 'var(--font-geist-sans), sans-serif',
                colorBgContainer: '#ffffff',
              },
              components: {
                Button: {
                  controlHeight: 40,
                  borderRadius: 8,
                },
                Input: {
                  controlHeight: 40,
                  borderRadius: 8,
                }
              }
            }}
          >
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
