"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { SkLogoFull } from "@/components/ui/sk-logo";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

/* ── Login-page palette (mentor project reference) ── */
const M = {
  bg: "#0d0d0d",
  surface: "#111111",
  border: "#222222",
  gold: "#f8e396",
  goldHover: "#faf0b0",
  goldBorder: "rgba(248,227,150,0.4)",
  white: "#ffffff",
  textMuted: "#666666",
  textFaint: "#444444",
  labelGray: "#888888",
  red: "#ff8a8a",
  redBg: "rgba(184,50,50,0.12)",
  redBorder: "rgba(184,50,50,0.35)",
};

/* ── Sliding food-photo coverflow background (ported from the fitness-admin
   login reference — same 3D coverflow mechanic, food photography instead of
   gym photos). Images are hotlinked stock photos for now, per instruction. ── */
const IMAGES = [
  "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=1600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1569420077790-afb136b3bb8c?w=1600&q=75&auto=format&fit=crop",
];
const N = IMAGES.length;

const getDelta = (i: number, center: number) => {
  const raw = ((i - center) % N + N) % N;
  return raw > Math.floor(N / 2) ? raw - N : raw;
};

const slotStyle = (delta: number, isPreRight: boolean): CSSProperties => {
  const TRANSITION = "left 0.7s ease-in-out, width 0.7s ease-in-out, transform 0.7s ease-in-out, filter 0.7s ease-in-out, opacity 0.7s ease-in-out";
  const base: CSSProperties = {
    position: "absolute",
    top: 0,
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    willChange: "transform, left, width, filter",
  };

  if (isPreRight) {
    return { ...base, left: "115%", width: "22%", opacity: 0, transform: "perspective(800px) rotateY(-25deg) scale(0.7)", filter: "brightness(0.3)", zIndex: 0, transition: "none" };
  }
  if (delta === 0) {
    return { ...base, left: "22%", width: "56%", transform: "perspective(800px) rotateY(0deg) scale(1)", filter: "brightness(1)", zIndex: 2, transition: TRANSITION };
  }
  if (delta === 1) {
    return { ...base, left: "78%", width: "22%", transform: "perspective(800px) rotateY(-25deg) scale(0.85)", filter: "brightness(0.5)", zIndex: 1, transition: TRANSITION };
  }
  if (delta === -1) {
    return { ...base, left: "0%", width: "22%", transform: "perspective(800px) rotateY(25deg) scale(0.85)", filter: "brightness(0.5)", zIndex: 1, transition: TRANSITION };
  }
  return { ...base, left: "-30%", width: "22%", opacity: 0, transform: "perspective(800px) rotateY(25deg) scale(0.7)", filter: "brightness(0.2)", zIndex: 0, transition: TRANSITION };
};

function FoodCoverflow() {
  const [center, setCenter] = useState(0);
  const [preRightIdx, setPreRightIdx] = useState<number | null>(null);
  const centerRef = useRef(0);
  const busyRef = useRef(false);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const c = centerRef.current;
    const leftIdx = ((c - 1) % N + N) % N;
    setPreRightIdx(leftIdx);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const next = (c + 1) % N;
        centerRef.current = next;
        setCenter(next);
        setPreRightIdx(null);
        setTimeout(() => { busyRef.current = false; }, 750);
      });
    });
  }, []);

  useEffect(() => {
    const t = setInterval(advance, 3500);
    return () => clearInterval(t);
  }, [advance]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {IMAGES.map((src, i) => {
        const delta = getDelta(i, center);
        const isPreRight = i === preRightIdx;
        return (
          <div
            key={i}
            style={{ ...slotStyle(delta, isPreRight), backgroundImage: `url(${src})` }}
          />
        );
      })}
    </div>
  );
}

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
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: M.bg }}>
      <FoodCoverflow />

      {/* Floating login card, fixed center */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px] rounded-xl p-7"
          style={{
            background: "rgba(13,13,13,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6 flex justify-center">
            <SkLogoFull />
          </motion.div>

          <motion.span
            custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="mb-4 inline-block w-fit rounded px-3 py-1.5 text-[10px] font-extrabold tracking-[0.2em]"
            style={{ color: M.gold, border: `1px solid ${M.goldBorder}` }}
          >
            ADMIN ACCESS
          </motion.span>

          <motion.h2
            custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="text-[26px] font-extrabold tracking-tight" style={{ color: M.white }}
          >
            Welcome back
          </motion.h2>
          <motion.p
            custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="mb-6 mt-1.5 text-[13px]" style={{ color: M.textMuted }}
          >
            Please enter your admin credentials to continue.
          </motion.p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div
                className="rounded-lg px-3.5 py-2.5 text-[12px] font-medium"
                style={{ background: M.redBg, border: `1px solid ${M.redBorder}`, color: M.red }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: M.labelGray }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: M.textFaint }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@subtlekitchen.com"
                  autoComplete="email"
                  className="w-full rounded-lg py-2.5 pl-10 pr-4 text-[13px] outline-none transition-all placeholder:text-[#333333]"
                  style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                  onFocus={(e) => (e.target.style.borderColor = M.goldBorder)}
                  onBlur={(e) => (e.target.style.borderColor = M.border)}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: M.labelGray }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: M.textFaint }} />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg py-2.5 pl-10 pr-11 text-[13px] outline-none transition-all placeholder:text-[#333333]"
                  style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                  onFocus={(e) => (e.target.style.borderColor = M.goldBorder)}
                  onBlur={(e) => (e.target.style.borderColor = M.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: M.textFaint }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = M.gold)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = M.textFaint)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-semibold tracking-[0.15em] transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: M.gold, color: "#000000" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = M.goldHover; }}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = M.gold)}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
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
          </form>

          <motion.p
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="mt-5 text-center text-[12px]" style={{ color: M.textMuted }}
          >
            Don&apos;t have an account?{" "}
            <span className="cursor-pointer font-semibold underline" style={{ color: M.gold }}>
              Contact us
            </span>{" "}
            to get a company code.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
