import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { mapServerUser } from "@/lib/api/auth-shared";

/**
 * POST /api/auth/verify-code
 * 校验邮箱验证码，成功直接签发会话（access_token），前端存 Bearer 即可登录。
 * 这样即使忘记密码，也能用邮箱验证码进入系统，不需要重置密码。
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
    const code = String(body?.code || "").trim();
    const tokenHash = String(body?.token_hash || "").trim();

    const sb = getSupabaseServer();
    let data: any = null;
    let error: any = null;
    if (tokenHash) {
      // 兜底通道：用户点邮件里的链接回来，用 token_hash 换会话
      ({ data, error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: "email" }));
    } else {
      if (!email) return NextResponse.json({ error: "请输入邮箱" }, { status: 400 });
      if (!/^\d{6,10}$/.test(code))
        return NextResponse.json({ error: "请输入邮件中的数字验证码" }, { status: 400 });
      ({ data, error } = await sb.auth.verifyOtp({ email, token: code, type: "email" }));
    }
    if (error || !data?.session) {
      // 统一转成中文提示，避免把 Supabase 的英文原文抛给用户
      const raw = String(error?.message || "");
      let friendly = "验证码不正确或已过期，请重新获取";
      if (/rate|too many/i.test(raw)) friendly = "尝试过于频繁，请稍后再试";
      else if (/expired/i.test(raw)) friendly = "验证码已过期，请重新获取";
      else if (/invalid|not found/i.test(raw)) friendly = "验证码不正确，请检查后重新输入";
      return NextResponse.json({ error: friendly }, { status: 401 });
    }
    return NextResponse.json({
      token: data.session.access_token,
      user: mapServerUser(data.user),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "验证失败" }, { status: 500 });
  }
}
