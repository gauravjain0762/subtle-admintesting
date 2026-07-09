"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const M = {
  panel: "#0d0d0d",
  border: "#1e1e1e",
  goldFaint: "rgba(248,227,150,0.28)",
  gold: "#f8e396",
  white: "#ffffff",
  textMuted: "#888888",
  red: "#ff6b6b",
};

interface BulkDeleteDialogProps {
  count: number;
  /** Plural noun describing what's being deleted, e.g. "dishes", "companies", "requests". */
  noun: string;
  working: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkDeleteDialog({ count, noun, working, onConfirm, onCancel }: BulkDeleteDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[400px] rounded-xl p-7"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#2a0a0a" }}>
          <Trash2 size={20} style={{ color: M.red }} />
        </div>
        <h2 className="text-[16px] font-bold" style={{ color: M.white }}>Delete {count} {noun}?</h2>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: M.textMuted }}>
          This will permanently remove the selected {noun}. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={working}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={working}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-opacity disabled:opacity-60"
            style={{ background: M.red, color: "#000000" }}
          >
            {working ? "Deleting…" : `Delete ${count}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
