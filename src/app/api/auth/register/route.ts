import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { findUserByEmail, friendlyOtpError } from "@/lib/api/auth-shared";

/**
 * POST /api/auth/register
 * 注册（邮箱 + 邮箱验证码 + 密码）。
 *
 * 流程：
 * 1) 字段校验 + 邮箱查重（已注册直接拒绝，避免把别人的账号密码改掉）；
 * 2) verifyOtp 校验邮件验证码（发码时 shouldCreateUser=true，Supabase 已建立待确认账号）；
 * 3) admin.updateUserById 写入密码、确认邮箱、写 displayName/company；
 * 4) 第 3 步失败则回滚删除该账号，避免留下半成品。
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
    const password = body?.password || "";
    const displayName = (body?.displayName || "").trim();
    const company = (body?.company || "").trim();
    const code = String(body?.code || "").trim();

    if (!email) return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    if (!displayName) return NextResponse.json({ error: "显示名称不能为空" }, { status: 400 });
    if (!/^\d{6,10}$/.test(code))
      return NextResponse.json({ error: "请输入邮件中的数字验证码" }, { status: 400 });

    const sb = getSupabaseServer();

    // 1) 邮箱查重：已确认的账号不允许再走注册
    const existing = await findUserByEmail(sb, email);
    if (existing && (existing.email_confirmed_at || existing.confirmed_at)) {
      return NextResponse.json(
        { error: "该邮箱已注册，请直接登录" },
        { status: 400 }
      );
    }

    // 2) 校验邮箱验证码（一次性，成功即失效）
    // 注意：新注册用户的验证码来自 Supabase 的「Confirm signup」邮件，类型是 signup；
    // 少数情况下（账号已确认过）才走 email/magiclink 类型，这里两种都兼容。
    let verifyData: any = null;
    let verifyError: any = null;
    ({ data: verifyData, error: verifyError } = await sb.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    }));
    if (verifyError || !verifyData?.user) {
      ({ data: verifyData, error: verifyError } = await sb.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      }));
    }
    if (verifyError || !verifyData?.user) {
      return NextResponse.json(
        { error: friendlyOtpError(verifyError?.message || "") },
        { status: 401 }
      );
    }
    const userId = verifyData.user.id;

    // 3) 写入密码 + 用户资料，并确认邮箱
    const { error: updateError } = await sb.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { displayName, company },
    });
    if (updateError) {
      // 4) 回滚，避免留下没有密码的半成品账号
      try {
        await sb.auth.admin.deleteUser(userId);
      } catch {
        /* ignore */
      }
      const raw = String(updateError.message || "");
      const friendly = /weak|least|password/i.test(raw)
        ? "密码强度不足，请换一个更复杂的密码（至少6位）"
        : "注册失败，请稍后重试";
      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, id: userId, email },
      { status: 201 }
    );
  } catch (e: any) {
    const cause = e?.cause;
    const detail = cause?.message
      ? `${e.message || ""} [${cause.code || ""} ${cause.hostname || ""} ${cause.message}]`
      : (e.message || "注册失败");
    return NextResponse.json({ error: `注册失败：${detail}` }, { status: 500 });
  }
}
