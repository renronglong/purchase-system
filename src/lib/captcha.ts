import crypto from "crypto";

/**
 * 图形验证码（无状态实现）
 *
 * 思路：服务端随机生成 4 位字符，把「明文 + 过期时间」用 HMAC 签名后作为 token 下发，
 * 前端提交时带回 token + 用户输入，服务端验签 + 验过期 + 比对字符。
 * 不需要数据库，也不依赖第三方验证码服务，密钥复用现有服务端环境变量。
 */

export const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 分钟有效
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混的 I / O / 0 / 1
const LENGTH = 4;
const WIDTH = 128;
const HEIGHT = 44;

function secret(): string {
  return (
    process.env.CAPTCHA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "baojia-bond-captcha-fallback-secret"
  );
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function rand(min: number, max: number): number {
  return min + crypto.randomInt(Math.max(1, max - min + 1));
}

const TEXT_COLORS = ["#0369a1", "#0284c7", "#075985", "#0c4a6e"];

function renderSvg(code: string): string {
  const parts: string[] = [];

  // 背景
  parts.push(`<rect width="${WIDTH}" height="${HEIGHT}" fill="#f0f9ff"/>`);

  // 干扰线
  for (let i = 0; i < 5; i++) {
    parts.push(
      `<line x1="${rand(0, WIDTH)}" y1="${rand(0, HEIGHT)}" x2="${rand(0, WIDTH)}" y2="${rand(
        0,
        HEIGHT
      )}" stroke="rgba(56,189,248,0.55)" stroke-width="${rand(1, 2)}"/>`
    );
  }

  // 噪点
  for (let i = 0; i < 22; i++) {
    parts.push(
      `<circle cx="${rand(0, WIDTH)}" cy="${rand(0, HEIGHT)}" r="${rand(
        1,
        2
      )}" fill="rgba(14,165,233,0.32)"/>`
    );
  }

  // 字符（逐个随机倾斜、错位）
  const step = (WIDTH - 24) / LENGTH;
  code.split("").forEach((ch, i) => {
    const x = Math.round(14 + i * step + rand(-2, 2));
    const y = Math.round(HEIGHT / 2 + 8 + rand(-3, 3));
    const rotate = rand(-24, 24);
    const color = TEXT_COLORS[i % TEXT_COLORS.length];
    parts.push(
      `<text x="${x}" y="${y}" font-family="Georgia,'Times New Roman',serif" font-size="25" font-weight="700" fill="${color}" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`
    );
  });

  // 底部一条干扰弧线
  parts.push(
    `<path d="M0 ${rand(30, 40)} Q ${WIDTH / 2} ${rand(0, 14)} ${WIDTH} ${rand(
      28,
      42
    )}" stroke="rgba(2,132,199,0.45)" stroke-width="1.4" fill="none"/>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${parts.join(
    ""
  )}</svg>`;
}

export function issueCaptcha(): { token: string; image: string; length: number } {
  const code = Array.from({ length: LENGTH }, () => CHARS[crypto.randomInt(CHARS.length)]).join("");
  const exp = Date.now() + CAPTCHA_TTL_MS;
  const payload = `${code}.${exp}`;
  const token = `${Buffer.from(payload, "utf8").toString("base64url")}.${sign(payload)}`;
  const svg = renderSvg(code);
  return {
    token,
    image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    length: LENGTH,
  };
}

export function verifyCaptcha(token: string, input: string): { ok: boolean; error?: string } {
  const t = (token || "").trim();
  const v = (input || "").trim().toUpperCase();
  if (!v) return { ok: false, error: "请输入图形验证码" };
  if (!t) return { ok: false, error: "验证码已失效，请点击图片刷新后重试" };

  const dot = t.lastIndexOf(".");
  if (dot <= 0) return { ok: false, error: "验证码已失效，请点击图片刷新后重试" };

  const b64 = t.slice(0, dot);
  const sig = t.slice(dot + 1);

  let payload = "";
  try {
    payload = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return { ok: false, error: "验证码已失效，请点击图片刷新后重试" };
  }

  const expected = sign(payload);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: "验证码已失效，请点击图片刷新后重试" };
  }

  const [code, expStr] = payload.split(".");
  const exp = Number(expStr) || 0;
  if (!code || Date.now() > exp) {
    return { ok: false, error: "验证码已过期，请点击图片刷新后重试" };
  }
  if (code.toUpperCase() !== v) {
    return { ok: false, error: "验证码不正确" };
  }
  return { ok: true };
}
