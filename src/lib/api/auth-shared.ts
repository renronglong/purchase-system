import { NextRequest, NextResponse } from "next/server";
import type { AppUser } from "@/lib/auth-store";

export function getBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/** 把 Supabase 用户映射成前端 AppUser 结构（含 user_metadata 里的 displayName/company） */
export function mapServerUser(u: any): AppUser {
  const md = u?.user_metadata || {};
  return {
    id: u.id,
    username: u.email || "",
    email: u.email || "",
    displayName: (md.displayName as string) || u.email?.split("@")[0] || "",
    company: (md.company as string) || "",
    createdAt: u.created_at || "",
  };
}
/** 按邮箱查找 Supabase 用户（不存在返回 null） */
export async function findUserByEmail(sb: any, email: string): Promise<any | null> {
  const target = email.trim().toLowerCase();
  // 优先用 admin.getUserByEmail（新版 SDK）
  try {
    const { data, error } = await sb.auth.admin.getUserByEmail(target);
    if (!error) return data?.user || null;
    // 该邮箱不存在时 SDK 会返回 error，直接按未找到处理
    if (/not\s*found|no\s*user/i.test(String(error?.message || ""))) return null;
  } catch {
    /* 继续走兜底 */
  }
  // 兜底：分页扫描（最多 1000 个用户）
  try {
    for (let page = 1; page <= 5; page++) {
      const { data } = await sb.auth.admin.listUsers({ page, perPage: 200 });
      const users: any[] = data?.users || [];
      const hit = users.find((u) => (u.email || "").toLowerCase() === target);
      if (hit) return hit;
      if (users.length < 200) break;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 把 Supabase OTP 错误翻译成中文提示 */
export function friendlyOtpError(raw: string): string {
  const msg = String(raw || "");
  if (/rate|too many|security purposes/i.test(msg)) return "操作过于频繁，请稍后再试";
  if (/expired/i.test(msg)) return "验证码已过期，请重新获取";
  if (/invalid|not found|incorrect/i.test(msg)) return "验证码不正确，请检查后重新输入";
  return "验证码不正确或已过期，请重新获取";
}
