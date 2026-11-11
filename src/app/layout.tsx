import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import AppShell from '@/components/app-shell';
import { AuthProvider, AuthGuard } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: '零配件生产销售管理系统',
  description:
    '面向零配件（型材/板材/物料/组件）加工企业的生产销售一体化管理系统，覆盖采购、库存、委外加工、报价、订单、合同、送货、对账全流程，打通从生产到销售的业务闭环。',
  metadataBase: new URL('https://www.baojia.bond'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.baojia.bond',
    siteName: '零配件生产销售管理系统',
    title: '零配件生产销售管理系统',
    description:
      '面向零配件（型材/板材/物料/组件）加工企业的生产销售一体化管理系统，覆盖采购、库存、委外加工、报价、订单、合同、送货、对账全流程。',
    images: [
      {
        url: '/og-cover.png',
        width: 1200,
        height: 630,
        alt: '零配件生产销售管理系统',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '零配件生产销售管理系统',
    description:
      '面向零配件加工企业的生产销售一体化管理系统，覆盖采购、库存、委外、报价、订单、合同、送货、对账全流程。',
    images: ['/og-cover.png'],
  },
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
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
