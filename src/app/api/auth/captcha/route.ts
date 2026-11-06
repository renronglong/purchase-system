import { NextResponse } from "next/server";
import { issueCaptcha } from "@/lib/captcha";

/**
 * GET /api/auth/captcha
 * 下发一张图形验证码：返回 SVG（data URI）+ 签名 token。
 * 注册提交时需把 token 和用户输入的字符一起带回 /api/auth/register 校验。
 */
export async function GET() {
  const { token, image, length } = issueCaptcha();
  return NextResponse.json(
    { token, image, length },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
