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