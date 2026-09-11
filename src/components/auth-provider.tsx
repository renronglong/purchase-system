"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authStore, type AppUser } from "@/lib/auth-store";
import { setCurrentUserId } from "@/lib/user-storage";
import { initData } from "@/lib/store";

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
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

  useEffect(() => {
    const user = authStore.getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
      initData();
    }
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authStore.login(username, password);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const register = useCallback(async (username: string, password: string, displayName: string) => {
    const result = await authStore.register(username, password, displayName);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      initData();
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    authStore.logout();
    setCurrentUser(null);
    setCurrentUserId(null);
    window.location.href = "/login";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-400 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border-b border-l border-slate-200 rounded-bl-lg shadow-sm">
        <span className="text-xs text-slate-500">当前用户：</span>
        <span className="text-xs font-medium text-slate-700">{currentUser.displayName}</span>
        <button
          onClick={logout}
          className="text-xs text-red-500 hover:text-red-700 ml-2"
        >
          退出
        </button>
      </div>
      {children}
    </>
  );
}
