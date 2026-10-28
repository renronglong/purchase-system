import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getBearer, mapServerUser } from "@/lib/api/auth-shared";

/**
 * GET /api/auth/me
 * 依据请求头 Bearer token 返回当前用户；无 token / token 失效返回 { user: null }。
 * 前端 getCurrentUser 用它判断登录态（不再直连 supabase）。
 */
export async function GET(req: NextRequest) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ user: null });

  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: mapServerUser(data.user) });
  } catch {
    return NextResponse.json({ user: null });
  }
}