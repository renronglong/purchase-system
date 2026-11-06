"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // 拉一张新的图形验证码（点击图片也会重新拉）
  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      setCaptchaToken(data?.token || "");
      setCaptchaImage(data?.image || "");
      setCaptchaCode("");
    } catch {
      setCaptchaToken("");
      setCaptchaImage("");
      setError("验证码加载失败，请点击验证码区域重试");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!captchaCode.trim()) {
      setError("请输入图形验证码");
      return;
    }
    if (!captchaToken) {
      setError("验证码已失效，请点击图片刷新");
      loadCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        email,
        password,
        displayName || email.split("@")[0],
        "",
        captchaToken,
        captchaCode
      );
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "操作失败");
        // 验证码一次性使用，失败后换一张，避免重复提交同一 token
        loadCaptcha();
      }
    } catch {
      setError("网络错误，请重试");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-2xl font-bold text-slate-800">零配件生产销售管理系统</h1>
            <p className="text-sm text-slate-500">创建新账号，开始使用</p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-xl shadow-sky-200/60 ring-1 ring-sky-100">
            <h2 className="mb-6 text-center text-xl font-semibold text-slate-800">注册新账号</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入邮箱（作为登录账号）"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">显示名称</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="显示在侧边栏的名称"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入密码（至少6位）"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  验证码
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    autoComplete="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm tracking-[0.3em] uppercase focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入右侧字符"
                    required
                  />
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    title="看不清？点击刷新"
                    className="relative flex h-11 w-[128px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sky-200 bg-sky-50 transition-colors hover:border-sky-300"
                  >
                    {captchaImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={captchaImage}
                        alt="图形验证码"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">
                        {captchaLoading ? "加载中..." : "点击重试"}
                      </span>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  不区分大小写，看不清可点击图片换一张（5 分钟内有效）
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-blue-50 py-2 text-center text-sm text-blue-600">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "处理中..." : "注册"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                已有账号？点击登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
