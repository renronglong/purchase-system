"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { login, sendCode, loginWithCode, loginWithToken } = useAuth();
  const router = useRouter();

  // 兜底通道：用户点邮件里的链接回来（?token_hash=...&type=email），直接换会话登录
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    if (!tokenHash) return;
    setLoading(true);
    loginWithToken(tokenHash).then((r) => {
      setLoading(false);
      if (r.success) {
        window.history.replaceState({}, "", "/login");
        router.push("/");
      } else {
        setError(r.error || "链接已失效，请重新获取验证码");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError("");
    setTip("");
    setSending(true);
    try {
      const result = await sendCode(email);
      if (result.success) {
        setTip("验证码已发送，请查收邮箱（含垃圾邮件），5 分钟内有效");
        startCountdown();
      } else {
        setError(result.error || "验证码发送失败");
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
    setLoading(true);

    try {
      const result =
        mode === "password"
          ? await login(email, password)
          : await loginWithCode(email, code);
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

  const switchMode = (m: "password" | "code") => {
    setMode(m);
    setError("");
    setTip("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">零配件生产销售管理系统</h1>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-5 text-center">
            登录账号
          </h2>

          {/* 登录方式切换 */}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-5">
            <button
              type="button"
              onClick={() => switchMode("password")}
              className={
                "flex-1 py-1.5 text-sm rounded-md transition-colors " +
                (mode === "password" ? "bg-white text-blue-700 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700")
              }
            >
              密码登录
            </button>
            <button
              type="button"
              onClick={() => switchMode("code")}
              className={
                "flex-1 py-1.5 text-sm rounded-md transition-colors " +
                (mode === "code" ? "bg-white text-blue-700 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700")
              }
            >
              邮箱验证码
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="请输入邮箱"
                required
              />
            </div>

            {mode === "password" ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="请输入密码"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-widest"
                    placeholder="6 位数字"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sending || countdown > 0 || !email.trim()}
                    className="px-3 py-2.5 text-sm rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sending ? "发送中..." : countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  忘记密码也能用这个方式直接登录，无需重置密码
                </p>
              </div>
            )}

            {tip && (
              <div className="text-emerald-600 text-sm text-center bg-emerald-50 rounded-lg py-2 px-3">
                {tip}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "处理中..." : mode === "password" ? "登录" : "验证码登录"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/register")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              没有账号？点击注册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
