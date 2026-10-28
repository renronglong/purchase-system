/**
 * 前端数据访问层 API 客户端
 *
 * 统一封装对 Route Handlers 的 GET/POST/PUT/DELETE 请求。
 * - 认证：从 localStorage（Supabase Auth 会话）读取 access_token，注入 Authorization: Bearer
 * - 所有 store 改造后经此层读写服务端数据
 */
const TOKEN_KEY = "sb-access-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return undefined as T;
  if (ct.includes("application/json")) return res.json();
  return undefined as T;
}

/** 按集合获取全部实体 */
export async function apiList<T>(resource: string): Promise<T[]> {
  return request<T[]>(`/api/${resource}`);
}

/** 新增实体（返回带 id 的完整实体） */
export async function apiCreate<T>(resource: string, data: Partial<T>): Promise<T> {
  return request<T>(`/api/${resource}`, { method: "POST", body: JSON.stringify(data) });
}

/** 更新实体（按 id 定位） */
export async function apiUpdate<T>(resource: string, data: Partial<T> & { id: string }): Promise<T> {
  return request<T>(`/api/${resource}`, { method: "PUT", body: JSON.stringify(data) });
}

/** 删除实体（按 id） */
export async function apiDelete(resource: string, id: string): Promise<void> {
  return request<void>(`/api/${resource}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}