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
    if (error || !data.session) {
      // 网络类错误：用原生 fetch 探测 SUPABASE_URL，把 Vercel 侧真实连接原因（DNS/连接）带出来
      if (error?.message?.includes("fetch")) {
        const su = process.env.SUPABASE_URL ?? "";
        let probe = "no-url";
        try {
          const r = await fetch(su, { signal: AbortSignal.timeout(12000) });
          probe = `HTTP ${r.status}`;
        } catch (pe: any) {
          const c = pe?.cause;
          probe = `PROBE_FAIL: ${pe.message} [${c?.code || ""} ${c?.hostname || ""} ${c?.message || ""}]`;
        }
        return NextResponse.json({ error: error?.message, probe }, { status: 401 });
      }
      return NextResponse.json({ error: error?.message || "登录失败" }, { status: 401 });
    }

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