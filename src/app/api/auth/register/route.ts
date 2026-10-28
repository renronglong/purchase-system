import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/auth/register
 * 注册（邮箱+密码）。在服务端用 admin API 创建账号，
 * email_confirm=true 免邮箱验证，注册即生效。
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
    const displayName = (body?.displayName || "").trim();
    const company = (body?.company || "").trim();

    if (!email) return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    if (!displayName) return NextResponse.json({ error: "显示名称不能为空" }, { status: 400 });

    const sb = getSupabaseServer();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { displayName, company },
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: error.status || 400 });

    return NextResponse.json(
      { success: true, id: data.user.id, email: data.user.email },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "注册失败" }, { status: 500 });
  }
}