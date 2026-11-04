"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

// 演示账号：用于参赛/演示时快速登录
const DEMO_EMAIL = "longge2623@agent.qq.com";
const DEMO_PASSWORD = "123456";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "code" | "reset">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { login, sendCode, loginWithCode, loginWithToken, loginWithAccessToken, resetPassword } = useAuth();
  const router = useRouter();

  // 兜底通道 1：邮件链接回来带 #access_token（Supabase implicit flow）
  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const hp = new URLSearchParams(hash);
    const accessToken = hp.get("access_token");
    if (!accessToken) return;
    setLoading(true);
    loginWithAccessToken(accessToken).then((r) => {
      setLoading(false);
      if (r.success) {
        window.history.replaceState({}, "", "/login");
        router.push("/");
      } else {
        setError(r.error || "登录链接已过期，请重新获取验证码");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 兜底通道 2：邮件链接回来带 ?token_hash=（Supabase token_hash flow）
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
      if (mode === "reset") {
        if (!code.trim()) { setError("请输入验证码"); setLoading(false); return; }
        if (newPassword.length < 6) { setError("新密码至少 6 位"); setLoading(false); return; }
        if (newPassword !== confirmPassword) { setError("两次输入的新密码不一致"); setLoading(false); return; }
        const r = await resetPassword(email, code, newPassword);
        if (r.success) {
          setMode("password");
          setPassword("");
          setCode("");
          setNewPassword("");
          setConfirmPassword("");
          setTip("密码已重置，请用新密码登录");
        } else {
          setError(r.error || "密码修改失败");
        }
        setLoading(false);
        return;
      }
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

  const fillDemo = () => {
    setMode("password");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
    setTip("已填入演示账号，点击登录即可");
  };

  const switchMode = (m: "password" | "code" | "reset") => {
    setMode(m);
    setError("");
    setTip("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-5 py-10">
        {/* 登录卡片 */}
        <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">零配件生产销售管理系统</h1>
          <p className="text-sm text-slate-500">登录后开始使用</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-xl shadow-sky-200/60 ring-1 ring-sky-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
            {mode === "reset" ? "重置密码" : "登录账号"}
          </h2>

          {mode !== "reset" && (
            <button
              type="button"
              onClick={fillDemo}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-sky-600 hover:shadow-blue-500/40 active:scale-[0.99]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
              </svg>
              一键填入演示账号，体验完整功能
            </button>
          )}

          {/* 登录方式切换（重置密码时不显示） */}
          <div className={"flex p-1 bg-slate-100 rounded-lg mb-5 " + (mode === "reset" ? "hidden" : "")}>
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

            {mode === "password" && (
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
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => { switchMode("reset"); setPassword(""); }}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    忘记密码？
                  </button>
                </div>
              </div>
            )}

            {(mode === "code" || mode === "reset") && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-widest"
                    placeholder="邮件中的数字验证码"
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
                {mode === "code" && (
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    忘记密码也能用这个方式直接登录，无需重置密码
                  </p>
                )}
              </div>
            )}

            {mode === "reset" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    新密码
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="至少 6 位"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="再输入一次新密码"
                    required
                  />
                </div>
              </>
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
              {loading ? "处理中..." : mode === "password" ? "登录" : mode === "code" ? "验证码登录" : "确认修改密码"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === "reset" ? (
              <button
                onClick={() => { switchMode("password"); setCode(""); setNewPassword(""); setConfirmPassword(""); }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                想起密码了，返回登录
              </button>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                没有账号？点击注册
              </button>
            )}
          </div>

          <div className="mt-5 border-t border-dashed border-sky-200 pt-5">
            <a
              href="/intro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50/80 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
                <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5A1.5 1.5 0 0 0 20 18.5v-13Z" />
              </svg>
              查看完整功能介绍
            </a>
            <p className="mt-2 text-center text-[11px] text-slate-400">13 个业务模块、业务流转与使用说明，新窗口打开</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
