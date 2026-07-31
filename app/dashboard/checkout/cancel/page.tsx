"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";

const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  white: "#ffffff",
  textMuted: "#888888",
  red: "#ff6b6b",
};

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0a0a" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        {/* Error Icon */}
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
              style={{ background: "rgba(255, 107, 107, 0.2)", filter: "blur(8px)" }}
            />
            <XCircle size={64} style={{ color: M.red }} className="relative z-10" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-center text-[28px] font-bold mb-2" style={{ color: M.white }}>
            Payment Failed
          </h1>
          <p className="text-center text-[14px] mb-6" style={{ color: M.textMuted }}>
            Your payment could not be processed. Don't worry, your order has not been placed yet.
          </p>

          {/* Info Box */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 space-y-3" style={{ borderLeft: `3px solid ${M.red}` }}>
            <p className="text-[13px] font-bold" style={{ color: M.white }}>
              Why did this happen?
            </p>
            <ul className="text-[12px]" style={{ color: M.textMuted }}>
              <li className="mb-1.5">• Your card was declined by the bank</li>
              <li className="mb-1.5">• Insufficient funds in your account</li>
              <li>• Payment session expired</li>
            </ul>
          </div>

          {/* Help Box */}
          <div className="bg-[#111111] rounded-lg p-4 mb-6" style={{ border: `1px solid ${M.border}` }}>
            <p className="text-[12px]" style={{ color: M.textMuted }}>
              💡 <span className="font-semibold">Try again</span> with a different payment method or check your bank account for available funds.
            </p>
          </div>

          {/* CTA Buttons */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard/menu")}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[14px] transition-all mb-3"
            style={{ background: M.gold, color: "#000000" }}
          >
            Try Again <ArrowLeft size={16} />
          </motion.button>

          {/* Secondary Link */}
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2 text-center text-[12px] font-semibold rounded-lg transition-colors"
            style={{ color: M.gold, border: `1px solid ${M.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,227,150,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Return to Dashboard
          </button>
        </motion.div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: M.border }}>
          <p className="text-center text-[11px]" style={{ color: M.textMuted }}>
            Need help? Contact our support team at{" "}
            <span style={{ color: M.gold }}>support@subtlekitchen.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
