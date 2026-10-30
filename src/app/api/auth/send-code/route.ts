import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/auth/send-code
 * 给已注册邮箱发送 6 位登录验证码（Supabase 内置邮件）。
 * shouldCreateUser=false：只对已有账号发码，不把这里当成注册入口。
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    const email = (body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const sb = getSupabaseServer();
    // 邮件里的链接回跳到当前站点登录页（验证码方式的兜底：点链接也能登录）
    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/login` },
    });
    if (error) {
      // 常见原因：邮箱未注册 / Supabase 邮件发送频率超限
      const msg = error.message || "验证码发送失败";
      const hint = /rate|limit|too many/i.test(msg)
        ? "发送过于频繁，请稍后再试（Supabase 内置邮件有每小时次数限制）"
        : /signup|not allowed|user not found/i.test(msg)
          ? "该邮箱尚未注册，请先注册账号"
          : msg;
      return NextResponse.json({ error: hint }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "验证码发送失败" }, { status: 500 });
  }
}
