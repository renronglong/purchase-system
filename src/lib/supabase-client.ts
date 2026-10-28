// 前端 Supabase 客户端（浏览器端）
// 用于 Auth（注册/登录/会话）——业务数据的 CRUD 走 @/lib/api/client.ts 调用 Route Handlers
"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * 惰性初始化：真正使用时才 createClient。
 * 避免在模块顶层立即执行 createClient，防止环境变量缺失时直接白屏：
 * 若 NEXT_PUBLIC_* 未配置，只在调用处抛错（可被上层捕获/降级），不影响页面渲染。
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("supabase-client 仅用于客户端");
  }
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase 未初始化，请检查 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cachedClient;
}