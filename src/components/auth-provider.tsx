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
  const [loadFailed, setLoadFailed] = useState(false);

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

  const register = useCallback(async (email: string, password: string, displayName: string, company: string) => {
    const result = await authStore.register(email, password, displayName, company);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error, emailConfirmRequired: result.emailConfirmRequired };
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
      try {
        const user = await authStore.getCurrentUser();
        if (cancelled) return;
        if (user) {
          setCurrentUserId(user.id);
          initData();
        }
        setCurrentUser(user);
      } catch {
        if (cancelled) return;
        setLoadFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      if (!cancelled) {
        setLoadFailed(true);
        setLoading(false);
      }
    }, 15000);
    boot();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (loadFailed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-sm px-6">
          <p className="text-slate-500 text-sm mb-4">
            加载失败，可能是网络或认证服务异常
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

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
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
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