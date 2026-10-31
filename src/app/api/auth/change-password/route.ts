import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getBearer } from "@/lib/api/auth-shared";

/**
 * POST /api/auth/change-password
 * 已登录状态下修改密码：校验原密码 → 写入新密码。
 * 需要请求头 Bearer access_token。
 */
export async function POST(req: NextRequest) {
  try {
    const token = getBearer(req);
    if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }

    const oldPassword = String(body?.oldPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!oldPassword) return NextResponse.json({ error: "请输入原密码" }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
    if (oldPassword === newPassword)
      return NextResponse.json({ error: "新密码不能与原密码相同" }, { status: 400 });

    const sb = getSupabaseServer();

    // 1) 用 token 确认当前用户
    const { data: userData, error: userError } = await sb.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "登录已过期，请重新登录" }, { status: 401 });
    }
    const email = userData.user.email;

    // 2) 校验原密码
    const { error: signInError } = await sb.auth.signInWithPassword({
      email,
      password: oldPassword,
    });
    if (signInError) {
      const raw = String(signInError.message || "");
      const friendly = /rate|too many/i.test(raw)
        ? "尝试过于频繁，请稍后再试"
        : "原密码不正确";
      return NextResponse.json({ error: friendly }, { status: 401 });
    }

    // 3) 写入新密码
    const { error: updateError } = await sb.auth.admin.updateUserById(
      userData.user.id,
      { password: newPassword }
    );
    if (updateError) {
      const raw = String(updateError.message || "");
      const friendly = /weak|least/i.test(raw)
        ? "新密码强度不足，请换一个更复杂的密码"
        : "密码修改失败，请稍后重试";
      return NextResponse.json({ error: friendly }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "密码修改失败" }, { status: 500 });
  }
}
