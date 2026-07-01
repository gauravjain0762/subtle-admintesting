"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { SkLogoFull } from "@/components/ui/sk-logo";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.32, ease: "easeOut" },
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center"
      style={{ background: "#fdf8ec" }}
    >
      {/* Background decorative dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: "radial-gradient(#d4c89a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Yellow blob */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[460px] w-[460px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,216,0,0.18) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,216,0,0.12) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center px-6">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8 flex flex-col items-center gap-4"
        >
          {/* Real SK logo on dark pill */}
          <div
            className="flex items-center justify-center rounded-2xl px-6 py-4"
            style={{
              background: "#0a0a0a",
              backgroundImage:
                "radial-gradient(ellipse at 80% 20%, rgba(245,216,0,0.1) 0%, transparent 60%), radial-gradient(rgba(255,243,154,0.04) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 22px 22px",
            }}
          >
            <SkLogoFull />
          </div>
          <div className="text-center">
            <h1 className="mt-1 text-[22px] font-bold tracking-tight" style={{ color: "#0a0a0a" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: "#6b6b5a" }}>
              Please enter your admin credentials to continue.
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-2xl p-8"
          style={{
            background: "#ffffff",
            border: "1.5px solid #e8e0cc",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div
                className="rounded-lg px-3.5 py-2.5 text-[12px] font-medium"
                style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b83232" }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#6b6b5a" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "#9b9b89" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@subtlekitchen.com"
                  autoComplete="email"
                  className="w-full rounded-lg py-2.5 pl-10 pr-4 text-[13px] outline-none transition-all"
                  style={{
                    border: "1.5px solid #e8e0cc",
                    background: "#fdf8ec",
                    color: "#0a0a0a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f5d800")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8e0cc")}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "#6b6b5a" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-medium underline"
                  style={{ color: "#6b6b5a" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "#9b9b89" }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg py-2.5 pl-10 pr-11 text-[13px] outline-none transition-all"
                  style={{
                    border: "1.5px solid #e8e0cc",
                    background: "#fdf8ec",
                    color: "#0a0a0a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f5d800")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8e0cc")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: "#9b9b89" }}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "#0a0a0a",
                  color: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                }}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "#e8e0cc" }} />
              <span className="text-[11px]" style={{ color: "#9b9b89" }}>or</span>
              <div className="h-px flex-1" style={{ background: "#e8e0cc" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border py-2.5 text-[13px] font-medium transition-colors hover:bg-[#fdf8ec]"
              style={{ border: "1.5px solid #e8e0cc", color: "#0a0a0a" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </motion.div>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 text-center text-[12px]"
          style={{ color: "#9b9b89" }}
        >
          Don&apos;t have an account?{" "}
          <span
            className="font-semibold underline cursor-pointer"
            style={{ color: "#6b6b5a" }}
          >
            Contact us
          </span>{" "}
          to get a company code.
        </motion.p>
      </div>
    </div>
  );
}
