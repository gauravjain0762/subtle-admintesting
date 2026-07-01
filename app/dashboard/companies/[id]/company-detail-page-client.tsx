"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin,
  Users, ShoppingBag, CreditCard, Calendar,
  Copy, CheckCircle2, Clock, Truck, AlertCircle,
  Edit2, Pause, Trash2, TrendingUp, Play,
} from "lucide-react";
import { toast } from "sonner";
import { getCompany, getCompanyIds, setCompanyStatus, deleteCompany, type Company, STATUS_DISPLAY } from "@/lib/companies-store";
import { C } from "@/lib/sk-theme";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompanyIds().map((id) => ({ id }));
}

const RECENT_ORDERS = [
  { id: "#ORD-4821", dish: "Chicken Katsu Curry",       employee: "Sarah M.",  amount: "£13.25", status: "delivered",  date: "Today, 12:15" },
  { id: "#ORD-4819", dish: "Chicken Teriyaki",          employee: "James T.",  amount: "£8.50",  status: "in-transit", date: "Today, 11:58" },
  { id: "#ORD-4816", dish: "Mediterranean Salmon",      employee: "Emma C.",   amount: "£13.25", status: "delivered",  date: "Today, 11:20" },
  { id: "#ORD-4812", dish: "Tuscan Bean Soup",          employee: "Marcus W.", amount: "£7.00",  status: "delivered",  date: "Today, 10:30" },
  { id: "#ORD-4808", dish: "Margherita Focaccia Pizza", employee: "Priya K.",  amount: "£8.50",  status: "delivered",  date: "Yesterday" },
];

const ORDER_STATUS_CFG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  delivered:    { label: "Delivered",  icon: CheckCircle2, color: C.green, bg: C.greenBg },
  "in-transit": { label: "In Transit", icon: Truck,        color: C.blue,  bg: C.blueBg  },
  preparing:    { label: "Preparing",  icon: Clock,        color: C.amber, bg: C.amberBg },
  cancelled:    { label: "Cancelled",  icon: AlertCircle,  color: C.red,   bg: C.redBg   },
};

function ConfirmDialog({
  title, body, confirmLabel, confirmColor, onConfirm, onCancel,
}: {
  title: string; body: React.ReactNode;
  confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[400px] rounded-2xl p-7"
        style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[17px] font-bold" style={{ color: C.text }}>{title}</h2>
        <div className="mt-2 text-[13px] leading-relaxed" style={{ color: C.textSub }}>{body}</div>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors hover:bg-[#f0e9d6]"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: confirmColor, color: C.white }}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
});

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();

  const [company, setCompanyData] = useState<Company | null>(null);
  const [dialog,  setDialog]      = useState<"pause" | "resume" | "delete" | null>(null);

  useEffect(() => {
    const found = getCompany(id);
    if (!found) { router.replace("/dashboard/companies"); return; }
    setCompanyData(found);
  }, [id, router]);

  if (!company) return null;

  const sd = STATUS_DISPLAY[company.status as keyof typeof STATUS_DISPLAY];

  const copyCode = () => {
    navigator.clipboard.writeText(company.code);
    toast.success(`Company code "${company.code}" copied!`);
  };

  const handlePause = () => {
    setCompanyStatus(id, "paused");
    setCompanyData((c) => c ? { ...c, status: "paused" } : c);
    toast.success(`${company.name} paused`);
    setDialog(null);
  };

  const handleResume = () => {
    setCompanyStatus(id, "active");
    setCompanyData((c) => c ? { ...c, status: "active" } : c);
    toast.success(`${company.name} resumed`);
    setDialog(null);
  };

  const handleDelete = () => {
    deleteCompany(id);
    toast.error(`${company.name} removed`);
    router.push("/dashboard/companies");
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <motion.div {...fade(0)} className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/companies"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.muted)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <p className="text-[12px]" style={{ color: C.textMuted }}>
              <Link href="/dashboard/companies" className="hover:underline">Companies</Link>
              {" / "}
              <span style={{ color: C.text }}>{company.name}</span>
            </p>
            <h1 className="mt-0.5 text-[24px] font-bold tracking-tight" style={{ color: C.text }}>{company.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[13px]" style={{ color: C.textSub }}>
                {company.industry} · {company.city} · Since {company.since}
              </p>
              <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                style={{ background: sd.bg, color: sd.color }}>
                {sd.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.text }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.muted)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            <Edit2 size={13} /> Edit
          </motion.button>

          {company.status === "active" ? (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setDialog("pause")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-colors"
              style={{ border: `1.5px solid ${C.cardBorder}`, color: C.amber }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.amberBg)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
            >
              <Pause size={13} /> Pause
            </motion.button>
          ) : company.status === "paused" ? (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setDialog("resume")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-colors"
              style={{ border: `1.5px solid ${C.cardBorder}`, color: C.green }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.greenBg)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
            >
              <Play size={13} /> Resume
            </motion.button>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setDialog("delete")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.red }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.redBg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            <Trash2 size={13} /> Remove
          </motion.button>
        </div>
      </motion.div>

      {/* Company Code banner */}
      <motion.div
        {...fade(0.06)}
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
        style={{ background: C.black }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[14px] font-bold"
            style={{ background: company.logoColor, color: company.logoText }}
          >
            {company.logo}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#3a3a30" }}>HR Company Code</p>
            <p className="mt-0.5 font-mono text-[22px] font-bold tracking-widest" style={{ color: C.yellow }}>{company.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[12px]" style={{ color: "#6b6b5a" }}>Share with HR to allow employees to order</p>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={copyCode}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold"
            style={{ background: C.yellow, color: C.black }}
          >
            <Copy size={13} /> Copy Code
          </motion.button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fade(0.1)} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Employees",     value: company.employees,    icon: Users,       color: C.blue,  bg: C.blueBg  },
          { label: "Active Orders", value: company.activeOrders, icon: ShoppingBag, color: C.green, bg: C.greenBg },
          { label: "Monthly Spend", value: company.monthlySpend, icon: TrendingUp,  color: C.amber, bg: C.amberBg },
          { label: "Plan",          value: company.plan,         icon: CreditCard,  color: C.text,  bg: C.muted   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            className="rounded-2xl p-5"
            style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.textMuted }}>{label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: C.text }}>{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Details + delivery schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div {...fade(0.14)} className="rounded-2xl p-6" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <h2 className="mb-5 text-[14px] font-bold" style={{ color: C.text }}>Company Details</h2>
          <div className="space-y-4">
            {[
              { icon: Building2, label: "Company",     value: company.name    },
              { icon: MapPin,    label: "City",         value: company.city    },
              { icon: Users,     label: "HR Contact",   value: company.contact },
              { icon: Mail,      label: "Email",        value: company.email   },
              { icon: Phone,     label: "Phone",        value: company.phone   },
              { icon: Calendar,  label: "Client Since", value: company.since   },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.muted }}>
                  <Icon size={14} style={{ color: C.textSub }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</p>
                  <p className="text-[13px] font-medium" style={{ color: C.text }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fade(0.18)} className="rounded-2xl p-6" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <h2 className="mb-5 text-[14px] font-bold" style={{ color: C.text }}>Delivery Schedule</h2>
          <div className="grid grid-cols-5 gap-2">
            {["Mon","Tue","Wed","Thu","Fri"].map((day) => {
              const active = company.deliveryDays.includes(day);
              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2 rounded-xl py-4"
                  style={{
                    background: active ? C.black : C.muted,
                    border: `1.5px solid ${active ? C.black : C.cardBorder}`,
                  }}
                >
                  <span className="text-[11px] font-bold" style={{ color: active ? C.yellow : C.textMuted }}>{day}</span>
                  <span className="flex h-2 w-2 rounded-full" style={{ background: active ? C.yellow : C.cardBorder }} />
                </div>
              );
            })}
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Delivery Window",  value: "12:00pm – 1:00pm" },
              { label: "Order Cut-off",    value: "9:00am same day" },
              { label: "Delivery Address", value: `${company.city} HQ` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.inputBg }}>
                <p className="text-[12px]" style={{ color: C.textSub }}>{label}</p>
                <p className="text-[12px] font-semibold" style={{ color: C.text }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent orders */}
      <motion.div
        {...fade(0.22)}
        className="overflow-hidden rounded-2xl"
        style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1.5px solid ${C.muted}` }}>
          <div>
            <h2 className="text-[14px] font-bold" style={{ color: C.text }}>Recent Orders</h2>
            <p className="text-[12px]" style={{ color: C.textMuted }}>From employees at {company.name}</p>
          </div>
          <Link href="/dashboard/orders"
            className="text-[12px] font-semibold hover:underline" style={{ color: C.text }}>
            View all orders
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: C.muted }}>
          {RECENT_ORDERS.map((order, i) => {
            const cfg   = ORDER_STATUS_CFG[order.status];
            const SIcon = cfg?.icon ?? CheckCircle2;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 + i * 0.05, duration: 0.35 }}
                className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.inputBg)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>{order.id}</span>
                    <span style={{ color: "#d0c8b0" }}>·</span>
                    <span className="text-[12px]" style={{ color: C.textSub }}>{order.employee}</span>
                  </div>
                  <p className="text-[12px]" style={{ color: C.textMuted }}>{order.dish}</p>
                </div>
                <span
                  className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
                  style={{ background: cfg?.bg ?? C.muted, color: cfg?.color ?? C.textSub }}
                >
                  <SIcon size={10} /> {cfg?.label}
                </span>
                <span className="text-[12.5px] font-bold" style={{ color: C.text }}>{order.amount}</span>
                <span className="hidden text-[11px] lg:block" style={{ color: C.textMuted }}>{order.date}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Confirmation dialogs */}
      <AnimatePresence>
        {dialog === "pause" && (
          <ConfirmDialog
            title="Pause this company?"
            body={<><span className="font-semibold" style={{ color: C.text }}>{company.name}</span> won't receive deliveries until you resume them.</>}
            confirmLabel="Pause Company"
            confirmColor={C.amber}
            onConfirm={handlePause}
            onCancel={() => setDialog(null)}
          />
        )}
        {dialog === "resume" && (
          <ConfirmDialog
            title="Resume this company?"
            body={<><span className="font-semibold" style={{ color: C.text }}>{company.name}</span> will be reactivated and can receive deliveries again.</>}
            confirmLabel="Resume Company"
            confirmColor={C.green}
            onConfirm={handleResume}
            onCancel={() => setDialog(null)}
          />
        )}
        {dialog === "delete" && (
          <ConfirmDialog
            title="Remove this company?"
            body={<>All data for <span className="font-semibold" style={{ color: C.text }}>{company.name}</span> will be permanently deleted. This cannot be undone.</>}
            confirmLabel="Remove Company"
            confirmColor={C.red}
            onConfirm={handleDelete}
            onCancel={() => setDialog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
