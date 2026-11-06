import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { findUserByEmail } from "@/lib/api/auth-shared";

/**
 * POST /api/auth/send-code
 * 发送 6 位邮箱验证码（Supabase 内置邮件）。
 *
 * purpose 区分两种场景：
 * - login（默认）：shouldCreateUser=false，只给已注册邮箱发码；
 * - register：给未注册邮箱发码（shouldCreateUser=true 由 Supabase 建立待确认账号）。
 *   发码前先查重：邮箱已注册 → 直接提示去登录；邮箱是上次注册中途放弃的未确认残留 → 清掉再发。
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
    const purpose = body?.purpose === "register" ? "register" : "login";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const sb = getSupabaseServer();
    // 邮件里的链接回跳到当前站点登录页（验证码方式的兜底：点链接也能登录）
    const origin = req.headers.get("origin") || new URL(req.url).origin;

    if (purpose === "register") {
      const existing = await findUserByEmail(sb, email);
      if (existing) {
        const confirmed = Boolean(existing.email_confirmed_at || existing.confirmed_at);
        if (confirmed) {
          return NextResponse.json(
            { error: "该邮箱已注册，请直接登录（忘记密码可用邮箱验证码登录）" },
            { status: 400 }
          );
        }
        // 未确认的残留账号：删掉，允许本次重新注册
        try {
          await sb.auth.admin.deleteUser(existing.id);
        } catch {
          /* 删除失败不阻塞，后续建号时会提示邮箱已存在 */
        }
      }
    }

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: purpose === "register",
        emailRedirectTo: `${origin}/login`,
      },
    });
    if (error) {
      const msg = error.message || "验证码发送失败";
      const hint = /rate|limit|too many|security purposes/i.test(msg)
        ? "发送过于频繁，请稍后再试（邮件服务有每小时次数限制）"
        : /sending.*email|confirmation email/i.test(msg)
          ? "验证码邮件发送失败，请确认邮箱地址真实有效后重试"
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
