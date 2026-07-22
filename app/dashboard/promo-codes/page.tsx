"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal, flushSync } from "react-dom";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Tag, Edit2, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  getPromoCodes, addPromoCode, editPromoCode, setPromoCodeActive, removePromoCode,
  type PromoCode, type PromoCodeFormValues,
} from "@/lib/promo-codes-store";
import { ApiError } from "@/lib/api/client";
import { SKToggle } from "@/components/ui/sk-toggle";
import { ThemeDatePicker } from "@/components/ui/theme-date-picker";
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette (matches orders/page.tsx) ── */
const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  borderFaint: "#131313",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  amber: "#f5c451",
  red: "#ff6b6b",
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.32, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function validate(form: { code: string; label: string; description: string; value: string; expiresAt: string }) {
  const e: Record<string, string> = {};
  if (!form.code.trim()) e.code = "Promo code is required";

  if (!form.label.trim()) e.label = "Promo name is required";

  const val = Number(form.value);
  if (!form.value || Number.isNaN(val) || val <= 0 || val > 100) e.value = "Enter a value between 1 and 100";

  if (form.expiresAt && form.expiresAt <= todayISO()) e.expiresAt = "Expiry must be a future date";

  return e;
}

function PromoFormModal({
  initial, onSave, onClose, saving,
}: { initial?: PromoCode; onSave: (values: PromoCodeFormValues) => void; onClose: () => void; saving: boolean }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [value, setValue] = useState(initial ? String(initial.value) : "");
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAtISO ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fieldStyle = (hasError: boolean) => ({
    border: `1.5px solid ${hasError ? M.red : M.border}`,
    background: M.surface,
    color: M.white,
  });

  const BULLET = "• ";

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);
    const bulletMatch = currentLine.match(/^(\s*)• ?(.*)$/);

    let next: string;
    let cursor: number;

    if (bulletMatch && bulletMatch[2].trim() === "") {
      // Enter on an empty bullet line ends the list instead of adding another one.
      next = value.slice(0, lineStart) + value.slice(selectionEnd);
      cursor = lineStart;
    } else {
      const insert = `\n${BULLET}`;
      next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      cursor = selectionStart + insert.length;
    }

    // flushSync forces the value into the DOM before we touch selection — without it,
    // fast/programmatic typing can land the next keystroke before the cursor is restored.
    flushSync(() => {
      setDescription(next);
      setErrors((p) => ({ ...p, description: "" }));
    });
    textarea.setSelectionRange(cursor, cursor);
  };

  const handleSubmit = () => {
    const e = validate({ code, label, description, value, expiresAt });
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSave({
      code: code.trim().toUpperCase(),
      label: label.trim(),
      description: description.trim(),
      value: Number(value),
      active,
      expiresAt: expiresAt || undefined,
    });
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="flex h-[85vh] w-full max-w-[640px] flex-col rounded-2xl"
        style={{ background: M.panel, border: `1.5px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-7 py-5" style={{ borderBottom: `1px solid ${M.border}` }}>
          <h2 className="text-[17px] font-bold" style={{ color: M.gold }}>{initial ? "Edit Promo Code" : "New Promo Code"}</h2>
          <button onClick={onClose} style={{ color: M.textMuted }}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
              Promo Code <span style={{ color: M.red }}>*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, code: "" })); }}
              placeholder="e.g. SAVE15"
              className="w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold uppercase outline-none transition-all"
              style={fieldStyle(!!errors.code)}
            />
            {errors.code && <p className="mt-1 text-[11px]" style={{ color: M.red }}>{errors.code}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
              Discount % <span style={{ color: M.red }}>*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={value}
              onChange={(e) => { setValue(e.target.value); setErrors((p) => ({ ...p, value: "" })); }}
              placeholder="e.g. 15"
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
              style={fieldStyle(!!errors.value)}
            />
            {errors.value && <p className="mt-1 text-[11px]" style={{ color: M.red }}>{errors.value}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
            Promo Name <span style={{ color: M.red }}>*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setErrors((p) => ({ ...p, label: "" })); }}
            placeholder="e.g. 15% off"
            className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
            style={fieldStyle(!!errors.label)}
          />
          {errors.label && <p className="mt-1 text-[11px]" style={{ color: M.red }}>{errors.label}</p>}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Valid on all main courses, one use per customer."
            className="w-full resize-none rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
            style={fieldStyle(!!errors.description)}
          />
          {errors.description && <p className="mt-1 text-[11px]" style={{ color: M.red }}>{errors.description}</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
              Validity (optional)
            </label>
            <ThemeDatePicker
              value={expiresAt}
              onChange={(iso) => { setExpiresAt(iso); setErrors((p) => ({ ...p, expiresAt: "" })); }}
              min={todayISO()}
              hasError={!!errors.expiresAt}
            />
            {errors.expiresAt && <p className="mt-1 text-[11px]" style={{ color: M.red }}>{errors.expiresAt}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
              Status
            </label>
            <div className="flex h-[42px] items-center gap-2.5 rounded-xl px-4" style={{ border: `1.5px solid ${M.border}`, background: M.surface }}>
              <SKToggle on={active} onChange={() => setActive((v) => !v)} size="sm" color={M.gold} borderColor={M.gold} />
              <span className="text-[12.5px] font-semibold" style={{ color: active ? M.gold : M.textMuted }}>
                {active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        </div>

        <div className="flex shrink-0 gap-3 px-7 py-5" style={{ borderTop: `1px solid ${M.border}` }}>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${M.border}`, color: M.textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: M.gold, color: "#000000" }}
          >
            {saving ? "Saving…" : initial ? "Save Changes" : "Create Promo Code"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function DeleteConfirmModal({ target, onConfirm, onClose, deleting }: {
  target: PromoCode; onConfirm: () => void; onClose: () => void; deleting: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[400px] rounded-2xl p-7"
        style={{ background: M.panel, border: `1.5px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,107,107,0.12)" }}>
          <Trash2 size={22} style={{ color: M.red }} />
        </div>
        <h2 className="text-[17px] font-bold" style={{ color: M.white }}>Delete promo code?</h2>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: M.textMuted }}>
          <span className="font-semibold" style={{ color: M.gold }}>{target.code}</span>{" "}
          will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${M.border}`, color: M.textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: M.red, color: M.white }}
          >
            {deleting ? "Deleting…" : "Delete promo code"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    setLoading(true);
    getPromoCodes()
      .then(setPromoCodes)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load promo codes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return promoCodes;
    return promoCodes.filter((p) =>
      p.code.toLowerCase().includes(q) || p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [promoCodes, search]);

  const handleCreate = (values: PromoCodeFormValues) => {
    setSaving(true);
    addPromoCode(values)
      .then((created) => {
        setPromoCodes((prev) => [created, ...prev]);
        toast.success(`"${created.code}" promo code created!`);
        setShowForm(false);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to create promo code"))
      .finally(() => setSaving(false));
  };

  const handleEdit = (values: PromoCodeFormValues) => {
    if (!editTarget) return;
    setSaving(true);
    editPromoCode(editTarget.id, values)
      .then((updated) => {
        setPromoCodes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(`"${updated.code}" updated!`);
        setEditTarget(null);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to update promo code"))
      .finally(() => setSaving(false));
  };

  const handleToggleActive = (target: PromoCode) => {
    const nextActive = !target.active;
    setPromoCodes((prev) => prev.map((p) => (p.id === target.id ? { ...p, active: nextActive } : p)));
    setPromoCodeActive(target.id, nextActive)
      .catch((err) => {
        setPromoCodes((prev) => prev.map((p) => (p.id === target.id ? { ...p, active: target.active } : p)));
        toast.error(err instanceof ApiError ? err.message : "Failed to update status");
      });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    removePromoCode(deleteTarget.id)
      .then(() => {
        setPromoCodes((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success(`"${deleteTarget.code}" deleted`);
        setDeleteTarget(null);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete promo code"))
      .finally(() => setDeleting(false));
  };

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Promo Codes</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>{promoCodes.length} promo code{promoCodes.length === 1 ? "" : "s"} configured</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: M.gold, color: "#000000" }}
        >
          Add Promo Code
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="overflow-hidden rounded-xl"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2.5 px-6 py-4" style={{ borderBottom: `1px solid ${M.border}` }}>
          <div
            className="flex min-w-[280px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2 sm:max-w-[400px] sm:flex-none"
            style={{ border: `1px solid ${M.border}`, background: M.surface }}
          >
            <Search size={14} style={{ color: M.textFaint }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or promo name"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: M.white }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {["Code", "Name", "Description", "Discount", "Validity", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeletonRows rows={6} columns={7} /> : filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <td className="px-5 py-4">
                    <span
                      className="rounded-md px-2 py-1 font-mono text-[12px] font-bold tracking-wider"
                      style={{ background: M.surface, color: M.gold, border: `1px solid ${M.border}` }}
                    >
                      {p.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12.5px] font-semibold" style={{ color: M.white }}>{p.label}</span>
                  </td>
                  <td className="px-5 py-4 max-w-[280px]">
                    <span className="line-clamp-3 whitespace-pre-line text-[11px]" style={{ color: M.textMuted }}>{p.description || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="rounded-md px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: "rgba(34,197,94,0.1)", color: M.green, border: "1px solid rgba(34,197,94,0.3)" }}
                    >
                      {p.value}% off
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={12} style={{ color: M.textFaint }} />
                      <span className="text-[12px]" style={{ color: M.textMuted }}>{p.expiresAtDisplay}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <SKToggle on={p.active} onChange={() => handleToggleActive(p)} size="sm" stopPropagation color={M.gold} borderColor={M.gold} />
                      <span className="text-[11.5px] font-semibold" style={{ color: p.active ? M.gold : M.textMuted }}>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditTarget(p)}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                        style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                        style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.red; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,107,107,0.3)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <Tag size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No promo codes found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>
              {search ? "Try a different search" : "Create your first promo code to get started"}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <PromoFormModal onSave={handleCreate} onClose={() => setShowForm(false)} saving={saving} />
        )}
        {editTarget && (
          <PromoFormModal initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} saving={saving} />
        )}
        {deleteTarget && (
          <DeleteConfirmModal target={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} deleting={deleting} />
        )}
      </AnimatePresence>
    </div>
  );
}
