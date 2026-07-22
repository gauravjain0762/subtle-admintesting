"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, User, Building2, Mail, Phone, Repeat, CalendarDays, ClipboardList, ShieldCheck, Ban } from "lucide-react";
import { STATUS_CFG } from "@/lib/orders-store";
import { useCustomerDetail } from "@/lib/hooks/use-customer-detail";
import { DARK as M } from "@/lib/sk-theme-dark";
import { SKToggle } from "@/components/ui/sk-toggle";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const ORDER_STATUS_COLOR: Record<string, string> = { new: M.amber, delivered: M.green, cancelled: M.red };

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: M.surface }}>
        <Icon size={14} style={{ color: M.goldMuted }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: M.textFaint }}>{label}</p>
        <p className="text-[13px] font-medium" style={{ color: M.white }}>{value}</p>
      </div>
    </div>
  );
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ background: M.surface }} />;
}

/** Mirrors the loaded layout's shape so there's no jump/reflow once data arrives. */
function CustomerDetailSkeleton() {
  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      <div>
        <Pulse className="mb-6 h-7 w-36" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Pulse className="h-11 w-11 rounded-lg" />
            <div className="space-y-2">
              <Pulse className="h-5 w-40" />
              <Pulse className="h-3 w-24" />
            </div>
          </div>
          <Pulse className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <Pulse className="mb-5 h-4 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-2.5 w-20" />
                <Pulse className="h-3.5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <Pulse className="mb-5 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Pulse key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={null}>
      <CustomerDetailContent />
    </Suspense>
  );
}

function CustomerDetailContent() {
  const id = useSearchParams().get("id") ?? "";
  const { customer, customerLoading, orders, ordersLoading, updating, toggleActive } = useCustomerDetail(id);

  if (customerLoading) return <CustomerDetailSkeleton />;
  if (!customer) return null;

  const isActive = customer.status === "active";
  const statusColor = isActive ? M.green : M.red;
  const statusLabel = isActive ? "Active" : "Blocked";
  const StatusIcon = isActive ? ShieldCheck : Ban;

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      <motion.div {...fade(0)}>
        <Link
          href="/dashboard/customers"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
          style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
        >
          <ArrowLeft size={12} /> Back to Customers
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[14px] font-bold"
              style={{ background: customer.logoColor, color: customer.logoText }}
            >
              {customer.initials}
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight" style={{ color: M.gold }}>{customer.name}</h1>
              <p className="text-[12px]" style={{ color: M.textMuted }}>{customer.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ border: `1.5px solid ${M.border}`, background: M.surface }}>
            <SKToggle on={isActive} onChange={toggleActive} size="sm" color={M.gold} borderColor={M.gold} />
            <span className="text-[12px] font-bold" style={{ color: statusColor }}>
              {updating ? "Updating…" : statusLabel}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div {...fade(0.06)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Profile Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row icon={User} label="Full Name" value={customer.name} />
          <Row icon={Mail} label="Email" value={customer.email || "—"} />
          <Row icon={Phone} label="Phone" value={customer.phone || "—"} />
          <Row
            icon={Building2}
            label="Company"
            value={customer.companyName ? `${customer.companyName}${customer.companyCode ? ` (${customer.companyCode})` : ""}` : "Individual (no company)"}
          />
          <Row icon={Repeat} label="Customer Type" value={<span className="capitalize">{customer.type}</span>} />
          <Row icon={CalendarDays} label="Joined" value={customer.joinedDisplay} />
          <Row icon={StatusIcon} label="Status" value={<span style={{ color: statusColor }}>{statusLabel}</span>} />
        </div>
      </motion.div>

      {/* Order History */}
      <motion.div {...fade(0.1)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Order History</h2>
        {orders.length === 0 ? (
          !ordersLoading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: M.surface }}>
                <ClipboardList size={20} style={{ color: M.textMuted }} />
              </div>
              <p className="text-[12.5px]" style={{ color: M.textMuted }}>No orders yet</p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Order ID", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]" style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const cfg = STATUS_CFG[o.status];
                  const color = ORDER_STATUS_COLOR[o.status] ?? M.textMuted;
                  return (
                    <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}>
                      <td className="px-3 py-3 text-[12px] font-bold" style={{ color: M.gold }}>{o.orderNumber}</td>
                      <td className="px-3 py-3 text-[12.5px] font-semibold" style={{ color: M.white }}>{o.totalAmount}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-bold" style={{ border: `1px solid ${color}`, color }}>
                          {cfg?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px]" style={{ color: M.textMuted }}>{o.deliveryDateDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
