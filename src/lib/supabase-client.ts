// 前端 Supabase 客户端（浏览器端）
// 用于 Auth（注册/登录/会话）——业务数据的 CRUD 走 @/lib/api/client.ts 调用 Route Handlers
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function makeClient() {
  if (typeof window === "undefined") {
    // SSR 下不实际初始化（本文件仅用于客户端组件，防御性处理）
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = makeClient();

export function getSupabaseBrowser() {
  if (typeof window === "undefined") {
    throw new Error("supabase-client 仅用于客户端");
  }
  if (!supabase) {
    throw new Error(
      "Supabase 未初始化，请检查 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return supabase;
}