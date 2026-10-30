"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authStore, type AppUser } from "@/lib/auth-store";
import { setCurrentUserId } from "@/lib/user-storage";
import { initData } from "@/lib/store";

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithToken: (tokenHash: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string, company: string) => Promise<{ success: boolean; error?: string; emailConfirmRequired?: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authStore.login(email, password);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendCode = useCallback(async (email: string) => {
    const result = await authStore.sendCode(email);
    return result.success ? { success: true } : { success: false, error: result.error };
  }, []);

  const loginWithCode = useCallback(async (email: string, code: string) => {
    const result = await authStore.loginWithCode(email, code);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithToken = useCallback(async (tokenHash: string) => {
    const result = await authStore.loginWithToken(tokenHash);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string, company: string) => {
    const result = await authStore.register(email, password, displayName, company);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    authStore.logout().then(() => {
      setCurrentUser(null);
      setCurrentUserId(null);
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      // getCurrentUser 内部已对会话恢复异常兜底为"未登录"（不抛错、5秒超时），
      // 这里即使再出现任何意外，也按未登录继续渲染表单，绝不让 /register、/login 整页失败。
      const user = await authStore.getCurrentUser().catch(() => null);
      if (cancelled) return;
      if (user) {
        setCurrentUserId(user.id);
        initData();
      }
      setCurrentUser(user);
      if (!cancelled) setLoading(false);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, sendCode, loginWithCode, loginWithToken, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 路由守卫：未登录访问受保护页面 → 重定向到 /login
// /login 与 /register 除外（本身就是未登录入口）
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!currentUser && pathname !== "/login" && pathname !== "/register") {
      router.replace("/login");
    }
  }, [currentUser, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}