"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/components/auth-provider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // 路由变化时自动收起移动端抽屉
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 未登录：只渲染登录/注册卡片，无侧边栏、无菜单（R04）
  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 移动端顶部栏（仅 <md 显示） */}
      <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-900 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1 -ml-1"
          aria-label="打开菜单"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium">零配件生产销售管理系统</span>
        <span className="w-6" />
      </div>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* 侧边栏：移动端抽屉（fixed 滑出）/ 桌面静态占位 */}
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
      </div>
    </div>
  );
}