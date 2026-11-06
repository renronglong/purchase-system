"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { register, sendRegisterCode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("请先输入邮箱");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setSending(true);
    try {
      const r = await sendRegisterCode(email.trim());
      if (r.success) {
        setSuccess("验证码已发送，请查收邮箱（含垃圾邮件箱）");
        startCountdown();
      } else {
        setError(r.error || "验证码发送失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6,10}$/.test(code.trim())) {
      setError("请输入邮件中的 6 位数字验证码");
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        email,
        password,
        displayName || email.split("@")[0],
        "",
        code.trim()
      );
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "操作失败");
      }
    } catch {
      setError("网络错误，请重试");
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
                <label className="mb-1 block text-sm font-medium text-slate-600">邮箱验证码</label>
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    autoComplete="one-time-code"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm tracking-[0.2em] focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="6 位数字验证码"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sending || countdown > 0}
                    className="h-11 w-[120px] shrink-0 rounded-lg border border-sky-200 bg-sky-50 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "发送中..." : countdown > 0 ? `${countdown} 秒后重发` : "获取验证码"}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  验证码发送到上方邮箱，10 分钟内有效；同一邮箱 60 秒内只能发一次
                </p>
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
