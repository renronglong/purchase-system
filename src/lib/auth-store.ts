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

async function post<T>(path: string, body: any): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("无法连接服务器，请检查网络");
  }
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
      await post("/api/auth/register", {
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
      const data = await post<{ token: string; user: AppUser }>("/api/auth/login", {
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

  /** 发送邮箱验证码（数字验证码，长度由 Supabase 项目配置决定，用于免密码登录/找回入口） */
  async sendCode(email: string) {
    if (!email.trim()) return { success: false, error: "请输入邮箱" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: "请输入有效的邮箱地址" };
    }
    try {
      await post("/api/auth/send-code", { email: email.trim() });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "验证码发送失败" };
    }
  },

  /** 用邮箱验证码登录（忘记密码时也能进系统） */
  async loginWithCode(email: string, code: string) {
    if (!email.trim()) return { success: false, error: "请输入邮箱" };
    if (!/^\d{6,10}$/.test(code.trim())) return { success: false, error: "请输入邮件中的数字验证码" };
    try {
      const data = await post<{ token: string; user: AppUser }>("/api/auth/verify-code", {
        email: email.trim(),
        code: code.trim(),
      });
      if (!data?.token) return { success: false, error: "登录失败" };
      setAccessToken(data.token);
      setCurrentUserId(data.user.id);
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || "验证码校验失败" };
    }
  },

  /** 用邮箱验证码重置密码（忘记密码场景，改完用新密码走普通登录） */
  async resetPassword(email: string, code: string, newPassword: string) {
    if (!email.trim()) return { success: false, error: "请输入邮箱" };
    if (!/^\d{6,10}$/.test(code.trim())) return { success: false, error: "请输入邮件中的数字验证码" };
    if (newPassword.length < 6) return { success: false, error: "新密码至少 6 位" };
    try {
      await post("/api/auth/reset-password", {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "密码修改失败" };
    }
  },

  /** 用邮件链接 hash 里带回的 access_token 直接建立会话（Supabase implicit flow 兜底） */
  async loginWithAccessToken(token: string) {
    if (!token) return { success: false, error: "登录链接无效" };
    try {
      setAccessToken(token);
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAccessToken(null);
        return { success: false, error: "登录链接已过期，请重新获取验证码" };
      }
      const data = await res.json();
      if (!data?.user) {
        setAccessToken(null);
        return { success: false, error: "登录链接已过期，请重新获取验证码" };
      }
      setCurrentUserId(data.user.id);
      return { success: true, user: data.user };
    } catch (e: any) {
      setAccessToken(null);
      return { success: false, error: e?.message || "登录失败" };
    }
  },

  /** 用邮件链接里的 token_hash 换会话（验证码方式的兜底通道） */
  async loginWithToken(tokenHash: string) {
    try {
      const data = await post<{ token: string; user: AppUser }>("/api/auth/verify-code", {
        token_hash: tokenHash,
      });
      if (!data?.token) return { success: false, error: "登录失败" };
      setAccessToken(data.token);
      setCurrentUserId(data.user.id);
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || "链接已失效，请重新获取验证码" };
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