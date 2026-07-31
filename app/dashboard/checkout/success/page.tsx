"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  white: "#ffffff",
  textMuted: "#888888",
  green: "#22c55e",
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0a0a" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(34, 197, 94, 0.2)", filter: "blur(8px)" }}
            />
            <CheckCircle size={64} style={{ color: M.green }} className="relative z-10" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-center text-[28px] font-bold mb-2" style={{ color: M.white }}>
            Payment Successful! 🎉
          </h1>
          <p className="text-center text-[14px] mb-6" style={{ color: M.textMuted }}>
            Your subscription has been activated and your first delivery is scheduled.
          </p>

          {/* Order Details */}
          <div className="bg-[#111111] rounded-lg p-4 mb-6 space-y-3" style={{ border: `1px solid ${M.border}` }}>
            <div className="flex justify-between items-center">
              <span style={{ color: M.textMuted }} className="text-[12px]">
                Status
              </span>
              <span style={{ color: M.green }} className="text-[12px] font-bold">
                ✓ Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: M.textMuted }} className="text-[12px]">
                Subscription ID
              </span>
              <span style={{ color: M.white }} className="text-[11px] font-mono">
                {searchParams.get("session_id")?.slice(0, 12)}...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: M.textMuted }} className="text-[12px]">
                Next Delivery
              </span>
              <span style={{ color: M.gold }} className="text-[12px] font-bold">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6" style={{ borderLeft: `3px solid ${M.gold}` }}>
            <p className="text-[12px]" style={{ color: M.textMuted }}>
              A confirmation email has been sent to your registered email address. You can manage your subscription anytime from your account.
            </p>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard/subscriptions")}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[14px] transition-all"
            style={{ background: M.gold, color: "#000000" }}
          >
            View Subscriptions <ArrowRight size={16} />
          </motion.button>

          {/* Secondary Link */}
          <button
            onClick={() => router.push("/dashboard/menu")}
            className="w-full mt-3 py-2 text-center text-[12px] font-semibold rounded-lg transition-colors"
            style={{ color: M.gold, border: `1px solid ${M.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,227,150,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
