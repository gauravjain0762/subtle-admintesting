"use client";

import { useState, useRef, useEffect } from "react";
import {
  CreditCard, RefreshCw, PauseCircle, XCircle, MoreHorizontal,
  TrendingUp, Eye, Edit2, CheckCircle2, X, Trash2, Mail,
  Phone, MapPin, Calendar, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { C, cardStyle, darkGlowBg, STATUS_CFG, EASE_SK } from "@/lib/sk-theme";
import { SKToggle } from "@/components/ui/sk-toggle";

/* ── Types ──────────────────────────────────────────────────────── */
type SubStatus = "active" | "paused" | "cancelled";

interface BillingRow { date: string; amount: string; status: "paid" | "failed" | "pending" }

interface Sub {
  id:         string;
  customer:   string;
  email:      string;
  phone:      string;
  city:       string;
  plan:       string;
  price:      string;
  status:     SubStatus;
  nextCharge: string;
  dishes:     string[];
  since:      string;
  days:       string[];
  billing:    BillingRow[];
}

/* ── Mock data ──────────────────────────────────────────────────── */
const INITIAL_SUBS: Sub[] = [
  {
    id: "SUB-001", customer: "Sarah Mitchell",
    email: "sarah.m@acmecorp.com", phone: "+44 20 7946 0100", city: "London",
    plan: "Weekly · Mon & Wed", price: "£26.50/wk", status: "active",
    nextCharge: "07 Jul 2025", dishes: ["Chicken Katsu Curry", "Mediterranean Salmon"],
    since: "Jan 2025", days: ["Mon", "Wed"],
    billing: [
      { date: "30 Jun 2025", amount: "£26.50", status: "paid" },
      { date: "23 Jun 2025", amount: "£26.50", status: "paid" },
      { date: "16 Jun 2025", amount: "£26.50", status: "paid" },
    ],
  },
  {
    id: "SUB-002", customer: "Emma Clarke",
    email: "emma.c@financehub.com", phone: "+44 20 7946 0300", city: "London",
    plan: "Weekly · Mon", price: "£8.50/wk", status: "active",
    nextCharge: "07 Jul 2025", dishes: ["Chicken Teriyaki"],
    since: "Nov 2024", days: ["Mon"],
    billing: [
      { date: "30 Jun 2025", amount: "£8.50", status: "paid" },
      { date: "23 Jun 2025", amount: "£8.50", status: "paid" },
    ],
  },
  {
    id: "SUB-003", customer: "Marcus Wilson",
    email: "marcus.w@email.com", phone: "+44 20 7946 0555", city: "Manchester",
    plan: "Weekly · Wed & Fri", price: "£21.00/wk", status: "paused",
    nextCharge: "Paused", dishes: ["Tuscan Bean Soup", "Margherita Focaccia"],
    since: "Feb 2025", days: ["Wed", "Fri"],
    billing: [
      { date: "09 Jun 2025", amount: "£21.00", status: "paid" },
      { date: "02 Jun 2025", amount: "£21.00", status: "failed" },
    ],
  },
  {
    id: "SUB-004", customer: "Priya Kapoor",
    email: "priya.k@techlondon.co.uk", phone: "+44 20 7946 0200", city: "London",
    plan: "Weekly · Mon–Fri", price: "£42.50/wk", status: "active",
    nextCharge: "07 Jul 2025", dishes: ["Daily Selection Box"],
    since: "Dec 2024", days: ["Mon","Tue","Wed","Thu","Fri"],
    billing: [
      { date: "30 Jun 2025", amount: "£42.50", status: "paid" },
      { date: "23 Jun 2025", amount: "£42.50", status: "paid" },
    ],
  },
  {
    id: "SUB-005", customer: "Daniel Park",
    email: "d.park@studio.io", phone: "+44 20 7946 0400", city: "Manchester",
    plan: "Weekly · Tue & Thu", price: "£17.00/wk", status: "active",
    nextCharge: "08 Jul 2025", dishes: ["Mediterranean Salmon", "Caesar Salad Bowl"],
    since: "Jan 2025", days: ["Tue","Thu"],
    billing: [
      { date: "01 Jul 2025", amount: "£17.00", status: "paid" },
      { date: "24 Jun 2025", amount: "£17.00", status: "paid" },
    ],
  },
  {
    id: "SUB-006", customer: "Raj Patel",
    email: "raj.p@consultants.co.uk", phone: "+44 20 7946 0500", city: "Birmingham",
    plan: "Weekly · Mon, Wed, Fri", price: "£31.50/wk", status: "active",
    nextCharge: "07 Jul 2025", dishes: ["Rotating Selection"],
    since: "Dec 2024", days: ["Mon","Wed","Fri"],
    billing: [
      { date: "30 Jun 2025", amount: "£31.50", status: "paid" },
    ],
  },
  {
    id: "SUB-007", customer: "Luke Roberts",
    email: "luke.r@email.com", phone: "+44 20 7946 0111", city: "London",
    plan: "Weekly · Mon", price: "£8.50/wk", status: "cancelled",
    nextCharge: "Cancelled", dishes: ["Chicken Katsu Curry"],
    since: "Mar 2025", days: ["Mon"],
    billing: [
      { date: "10 Mar 2025", amount: "£8.50", status: "paid" },
    ],
  },
  {
    id: "SUB-008", customer: "Olivia Brown",
    email: "olivia.b@email.com", phone: "+44 20 7946 0222", city: "London",
    plan: "Weekly · Wed", price: "£13.25/wk", status: "active",
    nextCharge: "09 Jul 2025", dishes: ["Mediterranean Salmon"],
    since: "Mar 2025", days: ["Wed"],
    billing: [
      { date: "02 Jul 2025", amount: "£13.25", status: "paid" },
    ],
  },
];

const DISHES_OPTIONS = [
  "Chicken Katsu Curry", "Mediterranean Salmon", "Chicken Teriyaki",
  "Tuscan Bean Soup", "Margherita Focaccia Pizza", "Chicken Pasta",
  "Caesar Salad Bowl", "Lemon Herb Chicken", "Daily Selection Box",
  "Rotating Selection",
];

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/* ── Shared drawer shell ─────────────────────────────────────────── */
function DrawerShell({
  title, subtitle, onClose, children, footer,
}: {
  title: string; subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[60]"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="fixed bottom-0 right-0 top-0 z-[70] flex flex-col"
        style={{
          width: "min(500px, 100vw)",
          background: C.white,
          borderLeft: `1.5px solid ${C.cardBorder}`,
          boxShadow: "-12px 0 48px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-5"
          style={{ borderBottom: `1.5px solid ${C.cardBorder}` }}
        >
          <div>
            <h2 className="text-[17px] font-bold" style={{ color: C.text }}>{title}</h2>
            {subtitle && <p className="text-[12px]" style={{ color: C.textMuted }}>{subtitle}</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, background: C.muted }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            style={{ color: C.textSub }}
          >
            <X size={17} />
          </motion.button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex shrink-0 gap-3 px-6 py-4"
            style={{ borderTop: `1.5px solid ${C.cardBorder}` }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ── Confirmation dialog ─────────────────────────────────────────── */
function ConfirmDialog({
  icon: Icon, iconBg, iconColor,
  title, body, confirmLabel, confirmColor,
  onConfirm, onCancel,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; body: React.ReactNode;
  confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(5px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="w-full max-w-[400px] rounded-2xl p-7"
        style={{ ...cardStyle, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: iconBg }}
        >
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        <h2 className="text-[17px] font-bold" style={{ color: C.text }}>{title}</h2>
        <div className="mt-2 text-[13px] leading-relaxed" style={{ color: C.textSub }}>
          {body}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors hover:bg-[#f0e9d6]"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: confirmColor, color: C.white }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Detail drawer ───────────────────────────────────────────────── */
function SubDetailDrawer({ sub, onClose, onEdit }: { sub: Sub; onClose: () => void; onEdit: () => void }) {
  const cfg = STATUS_CFG[sub.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.active;

  return (
    <DrawerShell
      title="Subscription Details"
      subtitle={`ID: ${sub.id}`}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-[13px] font-semibold transition-colors hover:bg-[#f0e9d6]"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-xl py-3 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: C.black, color: C.white }}
          >
            Edit Plan
          </button>
        </>
      }
    >
      {/* Customer card */}
      <div className="rounded-2xl p-4 mb-5" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold"
            style={{ background: C.muted, color: C.text }}
          >
            {sub.customer.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: C.text }}>{sub.customer}</p>
            <p className="text-[11px]" style={{ color: C.textMuted }}>Member since {sub.since}</p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { icon: Mail,    value: sub.email },
            { icon: Phone,   value: sub.phone },
            { icon: MapPin,  value: sub.city  },
            { icon: Calendar,value: `Since ${sub.since}` },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-1.5">
              <Icon size={11} style={{ color: C.textMuted }} />
              <span className="truncate text-[11.5px]" style={{ color: C.textSub }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan info */}
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Plan</p>
      <div className="rounded-2xl p-4 mb-5" style={{ background: C.inputBg, border: `1.5px solid ${C.cardBorder}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={13} style={{ color: C.textSub }} />
            <span className="text-[13px] font-semibold" style={{ color: C.text }}>{sub.plan}</span>
          </div>
          <span className="text-[15px] font-bold" style={{ color: C.text }}>{sub.price}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sub.dishes.map((d) => (
            <span key={d} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: C.muted, color: C.textSub }}>
              {d}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-1.5">
          {ALL_DAYS.map((day) => (
            <span
              key={day}
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: sub.days.includes(day) ? C.black : C.muted,
                color: sub.days.includes(day) ? C.white : C.textMuted,
              }}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Next charge */}
      <div className="flex items-center gap-2 rounded-2xl p-4 mb-5" style={cardStyle}>
        <Clock size={15} style={{ color: C.textMuted }} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Next charge</p>
          <p className="text-[13px] font-bold" style={{ color: sub.status === "active" ? C.text : C.textMuted }}>
            {sub.nextCharge}
          </p>
        </div>
        <CreditCard size={15} className="ml-auto" style={{ color: C.textMuted }} />
      </div>

      {/* Billing history */}
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Billing History</p>
      <div className="space-y-2">
        {sub.billing.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: C.inputBg, border: `1px solid ${C.cardBorder}` }}
          >
            <span className="text-[12.5px]" style={{ color: C.textSub }}>{row.date}</span>
            <span className="text-[12.5px] font-bold" style={{ color: C.text }}>{row.amount}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
              style={{
                background: row.status === "paid" ? C.greenBg : row.status === "failed" ? C.redBg : C.amberBg,
                color:      row.status === "paid" ? C.green   : row.status === "failed" ? C.red   : C.amber,
              }}
            >
              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            </span>
          </motion.div>
        ))}
      </div>
    </DrawerShell>
  );
}

/* ── Edit drawer ─────────────────────────────────────────────────── */
function SubEditDrawer({
  sub, onClose, onSave,
}: {
  sub: Sub;
  onClose: () => void;
  onSave: (patch: Partial<Sub>) => void;
}) {
  const [days,   setDays]   = useState<string[]>([...sub.days]);
  const [dishes, setDishes] = useState<string[]>([...sub.dishes]);
  const [price,  setPrice]  = useState(sub.price.replace(/[^0-9.]/g, ""));

  const toggleDay   = (d: string) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleDish  = (d: string) =>
    setDishes((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleSave = () => {
    const planText = days.length
      ? `Weekly · ${days.join(", ")}`
      : "No days selected";
    onSave({ plan: planText, days, dishes, price: `£${parseFloat(price || "0").toFixed(2)}/wk` });
  };

  return (
    <DrawerShell
      title="Edit Subscription"
      subtitle={sub.customer}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-[13px] font-semibold transition-colors hover:bg-[#f0e9d6]"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl py-3 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: C.black, color: C.white }}
          >
            Save Changes
          </button>
        </>
      }
    >
      {/* Weekly price */}
      <div className="mb-5">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>
          Weekly Price (£)
        </label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
          style={{ border: `1.5px solid ${C.cardBorder}`, background: C.inputBg, color: C.text }}
          onFocus={(e) => (e.target.style.borderColor = C.yellow)}
          onBlur={(e)  => (e.target.style.borderColor = C.cardBorder)}
        />
      </div>

      {/* Delivery days */}
      <div className="mb-5">
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>
          Delivery Days
        </label>
        <div className="flex gap-2">
          {ALL_DAYS.map((day) => {
            const active = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className="flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-all"
                style={{
                  background: active ? C.black    : C.muted,
                  color:      active ? C.white    : C.textMuted,
                  border:     `1.5px solid ${active ? C.black : C.cardBorder}`,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>
          Dishes ({dishes.length} selected)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DISHES_OPTIONS.map((dish) => {
            const active = dishes.includes(dish);
            return (
              <button
                key={dish}
                type="button"
                onClick={() => toggleDish(dish)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-all"
                style={{
                  background: active ? C.black    : C.muted,
                  color:      active ? C.white    : C.textMuted,
                  border:     `1.5px solid ${active ? C.black : C.cardBorder}`,
                }}
              >
                {active && <CheckCircle2 size={10} />}
                {dish}
              </button>
            );
          })}
        </div>
      </div>
    </DrawerShell>
  );
}

/* ── 3-dot dropdown ──────────────────────────────────────────────── */
type DropdownAction = "view" | "edit" | "pause" | "resume" | "cancel";

function SubMenu({
  sub,
  onAction,
}: {
  sub: Sub;
  onAction: (a: DropdownAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items: { label: string; icon: React.ElementType; action: DropdownAction; danger?: boolean }[] = [
    { label: "View Details", icon: Eye,         action: "view" },
    { label: "Edit Plan",    icon: Edit2,        action: "edit" },
    ...(sub.status === "active"
      ? [
          { label: "Pause",  icon: PauseCircle, action: "pause"  as const },
          { label: "Cancel", icon: XCircle,     action: "cancel" as const, danger: true },
        ]
      : []),
    ...(sub.status === "paused"
      ? [
          { label: "Resume", icon: CheckCircle2,action: "resume" as const },
          { label: "Cancel", icon: XCircle,     action: "cancel" as const, danger: true },
        ]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
        style={{
          color:      C.textMuted,
          background: open ? C.muted : "transparent",
        }}
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.13, ease: EASE_SK }}
            className="absolute right-0 top-full z-[80] mt-1.5 min-w-[180px] overflow-hidden rounded-2xl py-1.5"
            style={{
              ...cardStyle,
              boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.action}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setOpen(false); onAction(item.action); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-left"
                  style={{ color: item.danger ? C.red : C.text }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      item.danger ? C.redBg : C.inputBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Icon size={13} />
                  {item.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub card ────────────────────────────────────────────────────── */
function SubCard({
  sub, index, onAction,
}: {
  sub: Sub;
  index: number;
  onAction: (a: DropdownAction, s: Sub) => void;
}) {
  const cfg = STATUS_CFG[sub.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.active;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.38, ease: EASE_SK }}
      whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(0,0,0,0.08)" }}
      className="rounded-2xl p-5"
      style={{ ...cardStyle, opacity: sub.status === "cancelled" ? 0.65 : 1 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
            style={{ background: C.muted, color: C.text }}
          >
            {sub.customer.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-[13.5px] font-bold" style={{ color: C.text }}>{sub.customer}</p>
            <p className="text-[11px]" style={{ color: C.textMuted }}>Since {sub.since}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
          <SubMenu sub={sub} onAction={(a) => onAction(a, sub)} />
        </div>
      </div>

      {/* Plan */}
      <div
        className="mt-4 rounded-xl p-3.5"
        style={{ background: C.inputBg, border: `1px solid ${C.cardBorder}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={13} style={{ color: C.textSub }} />
            <span className="text-[12px] font-semibold" style={{ color: C.text }}>{sub.plan}</span>
          </div>
          <span className="text-[13px] font-bold" style={{ color: C.text }}>{sub.price}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {sub.dishes.map((d) => (
            <span
              key={d}
              className="rounded-full px-2.5 py-0.5 text-[10.5px] font-medium"
              style={{ background: C.muted, color: C.textSub }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CreditCard size={12} style={{ color: C.textMuted }} />
          <span className="text-[11.5px]" style={{ color: C.textMuted }}>
            Next charge:{" "}
            <strong style={{ color: sub.status === "active" ? C.text : C.textMuted }}>
              {sub.nextCharge}
            </strong>
          </span>
        </div>
        <div className="flex gap-1.5">
          {sub.status === "active" && (
            <>
              <button
                onClick={() => onAction("pause", sub)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#fffce0]"
                style={{ color: C.amber }}
              >
                <PauseCircle size={11} /> Pause
              </button>
              <button
                onClick={() => onAction("cancel", sub)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#fef2f2]"
                style={{ color: C.red }}
              >
                <XCircle size={11} /> Cancel
              </button>
            </>
          )}
          {sub.status === "paused" && (
            <button
              onClick={() => onAction("resume", sub)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#edf7ed]"
              style={{ color: C.green }}
            >
              <RefreshCw size={11} /> Resume
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
type Panel =
  | { type: "view";   sub: Sub }
  | { type: "edit";   sub: Sub }
  | { type: "delete"; sub: Sub }
  | { type: "pause";  sub: Sub }
  | null;

export default function SubscriptionsPage() {
  const [subs,   setSubs]   = useState<Sub[]>(INITIAL_SUBS);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "cancelled">("all");
  const [panel,  setPanel]  = useState<Panel>(null);

  const visible = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  const totalMRR = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const m = s.price.match(/£([\d.]+)/);
      return sum + (m ? parseFloat(m[1]) * 4 : 0);
    }, 0);

  const mutate = (id: string, patch: Partial<Sub>) =>
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));

  const handleAction = (action: DropdownAction, sub: Sub) => {
    if (action === "view")   { setPanel({ type: "view", sub }); return; }
    if (action === "edit")   { setPanel({ type: "edit", sub }); return; }
    if (action === "pause")  { setPanel({ type: "pause",  sub }); return; }
    if (action === "resume") {
      mutate(sub.id, { status: "active", nextCharge: "Next Mon" });
      toast.success(`${sub.customer}'s subscription resumed`);
      return;
    }
    if (action === "cancel") { setPanel({ type: "delete", sub }); return; }
  };

  const closePanel = () => setPanel(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: EASE_SK }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: C.text }}>Subscriptions</h1>
          <p className="text-[13px]" style={{ color: C.textSub }}>
            {subs.filter((s) => s.status === "active").length} active subscriptions
          </p>
        </div>
      </motion.div>

      {/* MRR Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4, ease: EASE_SK }}
        className="flex flex-wrap items-center justify-between gap-6 rounded-2xl p-5"
        style={darkGlowBg("15% 50%")}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3a3a30" }}>
            Monthly Recurring Revenue
          </p>
          <p className="mt-1 text-[32px] font-bold leading-none" style={{ color: C.yellow }}>
            £{totalMRR.toFixed(0)}
          </p>
        </div>
        <div className="flex items-center gap-2" style={{ color: "#22c55e" }}>
          <TrendingUp size={18} />
          <span className="text-[14px] font-semibold">+18% this month</span>
        </div>
        <div className="flex gap-6">
          {(["active", "paused", "cancelled"] as const).map((s) => (
            <div key={s}>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "#3a3a30" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </p>
              <p className="mt-0.5 text-[22px] font-bold" style={{ color: C.white }}>
                {subs.filter((x) => x.status === s).length}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.34 }}
        className="flex gap-2"
      >
        {(["all", "active", "paused", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-xl px-4 py-2.5 text-[12px] font-semibold capitalize transition-all"
            style={{
              background: filter === f ? C.black   : C.white,
              color:      filter === f ? C.white   : C.textSub,
              border:     `1.5px solid ${C.cardBorder}`,
            }}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </motion.div>

      {/* Cards grid */}
      <motion.div layout className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((sub, i) => (
            <SubCard key={sub.id} sub={sub} index={i} onAction={handleAction} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Drawers & dialogs ── */}
      <AnimatePresence>
        {panel?.type === "view" && (
          <SubDetailDrawer
            key="detail"
            sub={panel.sub}
            onClose={closePanel}
            onEdit={() => setPanel({ type: "edit", sub: panel.sub })}
          />
        )}

        {panel?.type === "edit" && (
          <SubEditDrawer
            key="edit"
            sub={panel.sub}
            onClose={closePanel}
            onSave={(patch) => {
              mutate(panel.sub.id, patch);
              toast.success(`${panel.sub.customer}'s plan updated`);
              closePanel();
            }}
          />
        )}

        {panel?.type === "delete" && (
          <ConfirmDialog
            key="delete"
            icon={Trash2}
            iconBg={C.redBg}
            iconColor={C.red}
            title="Cancel subscription?"
            body={
              <>
                <span className="font-semibold" style={{ color: C.text }}>
                  {panel.sub.customer}
                </span>{" "}
                will lose access immediately. This cannot be undone.
              </>
            }
            confirmLabel="Cancel subscription"
            confirmColor={C.red}
            onConfirm={() => {
              mutate(panel.sub.id, { status: "cancelled", nextCharge: "Cancelled" });
              toast.error(`${panel.sub.customer}'s subscription cancelled`);
              closePanel();
            }}
            onCancel={closePanel}
          />
        )}

        {panel?.type === "pause" && (
          <ConfirmDialog
            key="pause"
            icon={PauseCircle}
            iconBg={C.amberBg}
            iconColor={C.amber}
            title="Pause subscription?"
            body={
              <>
                <span className="font-semibold" style={{ color: C.text }}>
                  {panel.sub.customer}
                </span>{" "}
                won&apos;t be charged or receive deliveries until you resume.
              </>
            }
            confirmLabel="Pause"
            confirmColor={C.amber}
            onConfirm={() => {
              mutate(panel.sub.id, { status: "paused", nextCharge: "Paused" });
              toast.success(`${panel.sub.customer}'s subscription paused`);
              closePanel();
            }}
            onCancel={closePanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
