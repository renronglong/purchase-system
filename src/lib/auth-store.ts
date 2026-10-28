// Authentication store - 数据服务端化后认证走后端中转
// 说明：浏览器不再直连 supabase.co（该域名在部分网络下无法解析），
// 注册/登录/会话校验全部改由 Vercel 后端 /api/auth/* 中转，服务端去连 Supabase。
// 登录成功拿到 access_token 存 localStorage（sb-access-token），
// 后续数据层 /api/* 以它为 Bearer 认证（见 client.ts）。

import { setAccessToken, getAccessToken } from "./api/client";
import { setCurrentUserId, getCurrentUserId } from "./user-storage";

export interface AppUser {
  id: string; // Supabase auth.users.id
  username: string; // 兼容字段 = email
  email: string;
  displayName: string;
  company: string;
  createdAt: string;
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data?.error || `请求失败 (${res.status})`);
  }
  return data as T;
}

export const authStore = {
  async register(email: string, password: string, displayName: string, company: string) {
    if (!email.trim()) return { success: false, error: "邮箱不能为空" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: "请输入有效的邮箱地址" };
    }
    if (password.length < 6) return { success: false, error: "密码至少6位" };
    if (!displayName.trim()) return { success: false, error: "显示名称不能为空" };

    try {
      await postJson("/api/auth/register", {
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        company: company.trim(),
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // 注册成功（免邮箱验证），自动登录拿会话
    const loginRes = await this.login(email, password);
    if (loginRes.success && loginRes.user) {
      return { success: true, user: loginRes.user };
    }
    return { success: true };
  },

  async login(email: string, password: string) {
    if (!email.trim() || !password)
      return { success: false, error: "请输入邮箱和密码" };
    try {
      const data = await postJson<{ token: string; user: AppUser }>("/api/auth/login", {
        email: email.trim(),
        password,
      });
      if (!data?.token) return { success: false, error: "登录失败" };
      setAccessToken(data.token);
      setCurrentUserId(data.user.id);
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const token = getAccessToken();
    if (!token) return null; // 无 token 直接未登录，不触发任何网络请求
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.user) return null;
      setCurrentUserId(data.user.id);
      return data.user;
    } catch {
      return null; // 网络异常一律按未登录处理，绝不阻塞页面
    }
  },

  async logout(): Promise<void> {
    setAccessToken(null);
    setCurrentUserId(null);
  },
};

export const getSessionUserId = getCurrentUserId;