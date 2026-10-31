import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/auth/reset-password
 * 用邮箱验证码重置密码（忘记密码场景）。
 * 流程：校验验证码 → 拿到该邮箱对应的用户 → 用 admin 接口写入新密码。
 * 不向前端返回 session，用户改完密码后走正常密码登录。
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }

    const email = String(body?.email || "").trim().toLowerCase();
    const code = String(body?.code || "").trim();
    const newPassword = String(body?.newPassword || "");

    if (!email) return NextResponse.json({ error: "请输入邮箱" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    if (!/^\d{6,10}$/.test(code))
      return NextResponse.json({ error: "请输入邮件中的数字验证码" }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });

    const sb = getSupabaseServer();

    // 1) 验证码校验（一次性，成功即失效）
    const { data: verifyData, error: verifyError } = await sb.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (verifyError || !verifyData?.user) {
      const raw = String(verifyError?.message || "");
      let friendly = "验证码不正确或已过期，请重新获取";
      if (/rate|too many/i.test(raw)) friendly = "尝试过于频繁，请稍后再试";
      else if (/expired/i.test(raw)) friendly = "验证码已过期，请重新获取";
      else if (/invalid|not found/i.test(raw)) friendly = "验证码不正确，请检查后重新输入";
      return NextResponse.json({ error: friendly }, { status: 401 });
    }

    // 2) 写入新密码
    const { error: updateError } = await sb.auth.admin.updateUserById(
      verifyData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      const raw = String(updateError.message || "");
      let friendly = "密码修改失败，请稍后重试";
      if (/weak|least/i.test(raw)) friendly = "新密码强度不足，请换一个更复杂的密码";
      return NextResponse.json({ error: friendly }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "密码修改失败" }, { status: 500 });
  }
}
