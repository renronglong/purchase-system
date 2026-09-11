import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import Sidebar from '@/components/sidebar';
import { AuthProvider, AuthGuard } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: '铝型材采购管理系统',
  description: '铝型材产品采购订单管理系统 - 佛山市碧利金属',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        <AuthProvider>
          <AuthGuard>
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
