"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Building2, Package, Hash, Calendar, Clock,
  Repeat, CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  getOrder, updateOrderStatus, STATUS_CFG, TYPE_CFG,
  type Order, type OrderStatus,
} from "@/lib/orders-store";
import { getCompanies, type Company } from "@/lib/companies-store";
import { getDishes } from "@/lib/menu-store";
import { ApiError } from "@/lib/api/client";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const M = {
  panel: "#0d0d0d", surface: "#111111", border: "#1e1e1e",
  gold: "#f8e396", goldMuted: "rgba(248,227,150,0.6)", goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff", textMuted: "#888888", textFaint: "#444444",
  green: "#22c55e", amber: "#f5c451", red: "#ff6b6b",
};

const STATUS_COLOR: Record<OrderStatus, string> = { new: M.amber, delivered: M.green, cancelled: M.red };
const TYPE_LABEL: Record<string, string> = { weekly: "Weekly Subscription", "one-off": "One-Day Off Subscription", "one-time": "One-time Order" };

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

export default function OrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailContent />
    </Suspense>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [dishImages, setDishImages] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) { router.replace("/dashboard/orders"); return; }
    let cancelled = false;
    getOrder(id)
      .then((found) => {
        if (cancelled) return;
        setOrder(found);
        if (found.companyId) {
          getCompanies().then((list) => setCompany(list.find((c) => c.id === found.companyId) ?? null)).catch(() => {});
        }
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "Failed to load order");
        router.replace("/dashboard/orders");
      });
    getDishes().then((dishes) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      dishes.forEach((d) => { if (d.images?.[0]) map[d.id] = d.images[0]; });
      setDishImages(map);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [id, router]);

  if (!order) return null;

  const sCfg = STATUS_CFG[order.status] ?? STATUS_CFG.new;
  const sColor = STATUS_COLOR[order.status] ?? STATUS_COLOR.new;
  const tCfg = TYPE_CFG[order.type];

  const setStatus = (status: OrderStatus) => {
    setUpdating(true);
    updateOrderStatus(order.id, status)
      .then((updated) => {
        setOrder(updated);
        toast.success(`${order.orderNumber} marked as ${STATUS_CFG[status].label}`);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to update order"))
      .finally(() => setUpdating(false));
  };

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      <motion.div {...fade(0)}>
        <Link
          href="/dashboard/orders"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
          style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
        >
          <ArrowLeft size={12} /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: M.gold }}>{order.orderNumber}</h1>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-bold"
            style={{ border: `1px solid ${sColor}`, color: sColor }}
          >
            <sCfg.icon size={13} /> {sCfg.label}
          </span>
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div {...fade(0.06)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Order Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row icon={User} label="Customer" value={
            <>
              {order.customerName}
              <span className="ml-2 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: M.surface, color: M.textMuted }}>
                {order.customerInitials}
              </span>
            </>
          } />
          <Row icon={Building2} label="Company" value={order.companyName ? `${order.companyName}${order.companyCode ? ` (${order.companyCode})` : ""}` : "Individual (no company)"} />
          <Row icon={Hash} label="Order ID" value={order.orderNumber} />
          <Row icon={CreditCard} label="Payment Method" value={order.paymentMethod.replace("_", " ")} />
        </div>
      </motion.div>

      {/* Items */}
      <motion.div {...fade(0.1)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Items &amp; Quantity</h2>
        <div className="space-y-2">
          {order.items.map((it, i) => {
            const img = dishImages[it.dishId];
            return (
              <div key={i} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: M.surface }}>
                <div className="flex items-center gap-3">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={it.dishName} className="h-11 w-11 shrink-0 rounded-lg object-cover" style={{ border: `1px solid ${M.border}` }} />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
                      <Package size={16} style={{ color: M.goldMuted }} />
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: M.white }}>{it.dishName}</p>
                    <p className="text-[11px]" style={{ color: M.textMuted }}>
                      Portion: {it.portion ?? "Standard"} · Add-ons: {it.addOns?.length ? it.addOns.join(", ") : "None"} · Qty: {it.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] font-bold" style={{ color: M.gold }}>£{it.unitPrice} × {it.quantity}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: M.border }}>
          <span className="text-[12px] font-semibold" style={{ color: M.textMuted }}>Total Amount</span>
          <span className="text-[18px] font-bold" style={{ color: M.gold }}>{order.totalAmount}</span>
        </div>
      </motion.div>

      {/* Delivery & Subscription */}
      <motion.div {...fade(0.14)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Delivery &amp; Subscription</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row icon={Calendar} label="Delivery Date" value={order.deliveryDateDisplay} />
          <Row icon={Clock} label="Preferred Time" value={order.preferredTime || (company?.deliveryTimes?.length ? company.deliveryTimes.join(", ") : "Not specified")} />
          <Row icon={Repeat} label="Subscription Type" value={TYPE_LABEL[order.type] ?? order.type} />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: M.surface }}>
              <Package size={14} style={{ color: M.goldMuted }} />
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: M.textFaint }}>Order Type</p>
              <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize" style={{ background: M.surface, color: tCfg?.color ?? M.white }}>
                {order.type}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status actions */}
      <motion.div {...fade(0.18)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-1 text-[13px] font-bold" style={{ color: M.white }}>Order Status</h2>
        <p className="mb-4 text-[12px]" style={{ color: M.textMuted }}>Update the fulfilment status of this order.</p>
        <div className="flex flex-wrap gap-2.5">
          {(["new", "delivered", "cancelled"] as OrderStatus[]).map((s) => {
            const cfg = STATUS_CFG[s];
            const color = STATUS_COLOR[s];
            const active = order.status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                disabled={active || updating}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-colors disabled:cursor-default disabled:opacity-60"
                style={{ border: `1px solid ${color}`, color: active ? "#000000" : color, background: active ? color : "transparent" }}
              >
                <cfg.icon size={13} /> {cfg.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
