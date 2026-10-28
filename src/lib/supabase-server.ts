import { createClient } from "@supabase/supabase-js";

/**
 * 服务端 Supabase 客户端（仅限 Route Handlers 使用）
 *
 * 用 service_role key 直连 Postgres（绕过 RLS，供后台操作）。
 * 关键安全约束：写入业务数据时，user_id 一律取自请求方 JWT 的 auth.uid()，
 * 绝不可信任前端传来的 user_id（见 crud.ts 中的强制覆盖逻辑）。
 */
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("缺少 Supabase 服务端凭证（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}