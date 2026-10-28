// Authentication store - 数据服务端化后改用 Supabase Auth
// 账号/会话不再存 localStorage，由 Supabase 托管，跨设备登录一致。
//
// 接口保持与旧版兼容（register/login/logout/getCurrentUser/AppUser），
// 但登录账号从「用户名」升级为「邮箱」（Supabase Auth 的强制要求）。

import { getSupabaseBrowser } from "./supabase-client";
import { setCurrentUserId, getCurrentUserId } from "./user-storage";

export interface AppUser {
  id: string; // Supabase auth.users.id
  username: string; // 兼容字段 = email
  email: string;
  displayName: string;
  company: string;
  createdAt: string;
}

function mapUser(u: any): AppUser {
  return {
    id: u.id,
    username: u.email || "",
    email: u.email || "",
    displayName: (u.user_metadata?.displayName as string) || u.email?.split("@")[0] || "",
    company: (u.user_metadata?.company as string) || "",
    createdAt: u.created_at || "",
  };
}

export const authStore = {
  async register(email: string, password: string, displayName: string, company: string) {
    const sb = getSupabaseBrowser();
    if (!email.trim()) return { success: false, error: "邮箱不能为空" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: "请输入有效的邮箱地址" };
    }
    if (password.length < 6) return { success: false, error: "密码至少6位" };
    if (!displayName.trim()) return { success: false, error: "显示名称不能为空" };

    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { displayName: displayName.trim(), company: company.trim() },
      },
    });

    if (error) return { success: false, error: error.message };

    const user = data.user;
    if (!user) return { success: false, error: "注册失败，请重试" };

    // 若 Supabase 未开启邮箱确认，signUp 后会自动建立会话
    const session = data.session;
    if (session?.user) {
      setCurrentUserId(session.user.id);
      syncToken(session.access_token);
      return { success: true, user: mapUser(session.user) };
    }
    // 开启了邮箱确认：返回提示，用户需先验证邮箱再登录
    return {
      success: false,
      emailConfirmRequired: true,
      error: "注册成功，请前往邮箱完成验证后登录",
    };
  },

  async login(email: string, password: string) {
    const sb = getSupabaseBrowser();
    if (!email.trim() || !password) return { success: false, error: "请输入邮箱和密码" };

    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { success: false, error: error.message };

    const user = data.user;
    if (!user) return { success: false, error: "登录失败，请重试" };

    setCurrentUserId(user.id);
    syncToken(data.session.access_token);
    return { success: true, user: mapUser(user) };
  },

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const sb = getSupabaseBrowser();
      const { data } = await sb.auth.getSession();
      const session = data.session;
      if (!session?.user) return null;
      setCurrentUserId(session.user.id);
      syncToken(session.access_token);
      return mapUser(session.user);
    } catch (e) {
      // 会话恢复偶发网络失败/本地 token 陈旧：一律按未登录处理，
      // 避免占用一个本可正常显示的表单页（尤其 /register、/login）整页白屏。
      console.warn("getCurrentUser 会话恢复失败，按未登录处理", e);
      return null;
    }
  },

  async logout(): Promise<void> {
    const sb = getSupabaseBrowser();
    setCurrentUserId(null);
    syncToken(null);
    await sb.auth.signOut();
  },
};

/** 把 Supabase 会话 token 同步到数据层 API 客户端使用的 key */
function syncToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("sb-access-token", token);
  else localStorage.removeItem("sb-access-token");
}

// 导出 getCurrentUserId 以便兼容（user-storage 内部依赖）
export const getSessionUserId = getCurrentUserId;