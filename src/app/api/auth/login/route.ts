import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { mapServerUser } from "@/lib/api/auth-shared";

/**
 * POST /api/auth/login
 * 邮箱+密码登录。服务端验证，成功返回 access_token（前端存 localStorage 作为 Bearer）。
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    const email = (body?.email || "").trim();
    const password = body?.password || "";
    if (!email || !password)
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });

    const sb = getSupabaseServer();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session)
      return NextResponse.json({ error: error?.message || "登录失败" }, { status: 401 });

    const token = data.session.access_token;
    const user = mapServerUser(data.user);
    return NextResponse.json({ token, user });
  } catch (e: any) {
    // 诊断：把底层网络错误的具体原因（DNS/ECONNREFUSED 等）带出来，便于定位连不上 supabase 的真实原因
    const cause = e?.cause;
    const detail = cause?.message
      ? `${e.message || ""} [${cause.code || ""} ${cause.hostname || ""} ${cause.message}]`
      : (e.message || "登录失败");
    return NextResponse.json({ error: `登录失败：${detail}` }, { status: 500 });
  }
}