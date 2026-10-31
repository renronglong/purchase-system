"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { initData } from "@/lib/store";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/", label: "采购单管理", icon: "clipboard" },
  { href: "/inventory", label: "库存管理", icon: "inventory" },
  { href: "/products", label: "产品库", icon: "package" },
  { href: "/suppliers", label: "供应商", icon: "users" },
  { href: "/outsourcing", label: "委外加工", icon: "settings" },
  { href: "/delivery", label: "送货单管理", icon: "truck" },
  { href: "/orders", label: "订单管理", icon: "cart" },
  { href: "/quote", label: "报价单管理", icon: "document-quote" },
  { href: "/reconciliation", label: "对帐单管理", icon: "document-check" },
  { href: "/contract", label: "购销合同管理", icon: "contract" },
  { href: "/customers", label: "客户管理", icon: "building" },
  { href: "/companies", label: "公司信息管理", icon: "building" },
  { href: "/customer-account", label: "汇总表", icon: "account" },
];

function NavIcon({ type, className }: { type: string; className?: string }) {
  const cls = cn("w-5 h-5", className);
  switch (type) {
    case "upload":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "package":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "truck":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      );
    case "building":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "account":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "document-check":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "contract":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "inventory":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "document-quote":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 001 1h4" />
        </svg>
      );
    case "cart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { currentUser, changePassword, logout } = useAuth();

  // 左下角「设置」：菜单开合
  const [menuOpen, setMenuOpen] = useState(false);
  // 修改密码弹窗
  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const openPwdDialog = () => {
    setMenuOpen(false);
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError("");
    setPwdOpen(true);
  };

  const handleChangePassword = async () => {
    setPwdError("");
    if (!oldPwd) return setPwdError("请输入原密码");
    if (newPwd.length < 6) return setPwdError("新密码至少 6 位");
    if (newPwd !== confirmPwd) return setPwdError("两次输入的新密码不一致");
    setPwdLoading(true);
    const res = await changePassword(oldPwd, newPwd);
    setPwdLoading(false);
    if (!res.success) {
      setPwdError(res.error || "密码修改失败");
      return;
    }
    setPwdOpen(false);
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    if (typeof window !== "undefined") {
      window.alert("密码修改成功，下次请用新密码登录");
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    if (typeof window !== "undefined" && !window.confirm("确定要退出登录吗？")) return;
    logout();
  };

  const displayName = currentUser?.displayName || currentUser?.username || "未登录";
  const displayEmail = currentUser?.email || "";
  const avatarText = (displayName || "U").trim().charAt(0).toUpperCase();

  return (
    <>
    <aside
      className={cn(
        "bg-slate-900 text-white flex flex-col shrink-0",
        // 移动端：fixed 抽屉，默认左侧收起，open 时滑出
        "fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full",
        // 桌面端：静态占位，正常在左侧
        "md:static md:translate-x-0 md:min-h-screen"
      )}
    >
      <div className="px-5 py-5 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold tracking-wide">零配件生产销售管理系统</h1>
          <p className="text-[10px] text-slate-500 mt-1">v2.2</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white md:hidden p-1"
          aria-label="关闭菜单"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <NavIcon type={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="relative border-t border-slate-700 px-2 py-2">
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-full left-2 right-2 mb-1 z-10 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
              <button
                onClick={openPwdDialog}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                修改密码
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                退出登录
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors",
            menuOpen ? "bg-slate-800" : "hover:bg-slate-800"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {avatarText}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs text-slate-200">{displayName}</span>
            <span className="block truncate text-[10px] text-slate-500">{displayEmail}</span>
          </span>
          <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>

    {pwdOpen && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        onClick={() => !pwdLoading && setPwdOpen(false)}
      >
        <div
          className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-1 text-base font-semibold text-slate-900">修改密码</h3>
          <p className="mb-4 text-xs text-slate-500">当前账号：{displayEmail || displayName}</p>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-600">原密码</label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                placeholder="请输入当前密码"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">新密码</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="至少 6 位"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">确认新密码</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="再输入一次新密码"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChangePassword();
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {pwdError && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{pwdError}</div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setPwdOpen(false)}
              disabled={pwdLoading}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pwdLoading ? "提交中..." : "确认修改"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
