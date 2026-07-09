"use client";

import { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { Search, Download, ChevronLeft, ChevronRight, Eye, X, ClipboardList, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getOrders, STATUS_CFG, type Order, type OrderStatus, type OrderType } from "@/lib/orders-store";
import { getCompanies, type Company } from "@/lib/companies-store";
import { ApiError } from "@/lib/api/client";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette (matches companies/page.tsx) ── */
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

const STATUS_FILTERS = ["All", "New", "Delivered"];
const TYPE_FILTERS   = ["All Types", "Weekly", "One-Time", "Business"];
const ALL_COMPANIES  = "All Companies";
const INDIVIDUAL     = "Individual (No Company)";

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: M.amber,
  delivered: M.green,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.32, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number;
  icon: React.ElementType; accent: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="rounded-lg p-5"
      style={{ background: M.panel, border: `1px solid ${M.border}`, borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: M.textFaint }}>{label}</p>
          <p className="mt-3 text-[28px] font-bold leading-none" style={{ color: M.white }}>{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: M.surface }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  const SIcon = cfg.icon;
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10.5px] font-bold"
      style={{ border: `1px solid ${color}`, color }}
    >
      <SIcon size={10} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: OrderType }) {
  return (
    <span
      className="rounded-md px-2.5 py-1 text-[10.5px] font-semibold capitalize"
      style={{ background: M.surface, color: M.goldMuted, border: `1px solid ${M.border}` }}
    >
      {type}
    </span>
  );
}

function itemsLabel(order: Order): string {
  if (order.items.length === 0) return "—";
  if (order.items.length === 1) {
    const it = order.items[0];
    return it.quantity > 1 ? `${it.dishName} ×${it.quantity}` : it.dishName;
  }
  return order.items.map((it) => `${it.dishName}${it.quantity > 1 ? ` ×${it.quantity}` : ""}`).join(", ");
}

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter]     = useState("All Types");
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const [companies, setCompanies]     = useState<Company[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    getCompanies()
      .then(setCompanies)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load companies"));
  }, []);

  const companyOptions = [ALL_COMPANIES, INDIVIDUAL, ...companies.map((c) => c.name)];

  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysOrders = orders.filter((o) => o.dateISO === todayISO);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.companyCode ?? "").toLowerCase().includes(q) ||
      o.items.some((it) => it.dishName.toLowerCase().includes(q));
    const matchStatus =
      statusFilter === "All" ||
      STATUS_CFG[o.status]?.label === statusFilter;
    const matchType =
      typeFilter === "All Types" ||
      o.type === (typeFilter.toLowerCase().replace(" ", "-") as OrderType);
    const matchCompany =
      companyFilter === ALL_COMPANIES ||
      (companyFilter === INDIVIDUAL && !o.companyId) ||
      o.companyName === companyFilter;
    return matchSearch && matchStatus && matchType && matchCompany;
  });

  const stats = [
    { label: "Today's Orders", value: todaysOrders.length, icon: ClipboardList, accent: M.gold },
    { label: "New",            value: todaysOrders.filter((o) => o.status === "new").length,       icon: Sparkles,     accent: M.amber },
    { label: "Delivered",      value: todaysOrders.filter((o) => o.status === "delivered").length,  icon: CheckCircle2, accent: M.green },
  ];

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
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Orders</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>{orders.length} total orders across all companies and customers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Exporting orders as CSV…")}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: M.gold, color: "#000000" }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div
          className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5"
          style={{ border: `1px solid ${M.border}`, background: M.panel }}
        >
          <Search size={14} style={{ color: M.textFaint }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, customers, codes…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: M.white }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-all"
              style={{
                background: statusFilter === f ? M.gold : M.panel,
                color: statusFilter === f ? "#000000" : M.textMuted,
                border: `1px solid ${statusFilter === f ? M.gold : M.border}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg px-3.5 py-2 text-[12px] font-medium outline-none"
          style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.white }}
        >
          {TYPE_FILTERS.map((t) => <option key={t}>{t}</option>)}
        </select>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="rounded-lg px-3.5 py-2 text-[12px] font-medium outline-none"
          style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.white }}
        >
          {companyOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="overflow-hidden rounded-xl"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${M.border}` }}>
          <p className="text-[13px] font-bold" style={{ color: M.white }}>Order List</p>
          <p className="text-[11.5px]" style={{ color: M.textMuted }}>
            {filtered.length} {filtered.length === 1 ? "order" : "orders"} found
          </p>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {["Order ID", "Customer", "Company", "Dish(es)", "Type", "Amount", "Status", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const label = order.companyCode
                  ? `${order.customerInitials} | ${order.companyCode}`
                  : order.customerInitials;
                return (
                  <motion.tr
                    key={order.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td className="px-5 py-4">
                      <span className="text-[12px] font-bold" style={{ color: M.gold }}>{order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12.5px] font-semibold" style={{ color: M.white }}>{order.customerName}</span>
                      <div className="mt-1">
                        <span
                          className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider"
                          style={{ background: M.surface, color: M.textMuted, border: `1px solid ${M.border}` }}
                        >
                          {label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.companyName ? (
                        <span className="text-[12.5px] font-medium" style={{ color: "#cccccc" }}>{order.companyName}</span>
                      ) : (
                        <span className="text-[12px] italic" style={{ color: M.textFaint }}>Individual</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      <span className="text-[12.5px] line-clamp-1" style={{ color: M.textMuted }}>{itemsLabel(order)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <TypeBadge type={order.type} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-bold" style={{ color: M.gold }}>{order.totalAmount}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px]" style={{ color: M.textMuted }}>{order.dateDisplay}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toast.success(`Order ${order.id} — ${order.customerName}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                        style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <ClipboardList size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No orders found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>Try a different search or filter</p>
          </div>
        )}

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: `1px solid ${M.border}` }}
        >
          <span className="text-[12px]" style={{ color: M.textMuted }}>
            Showing {filtered.length} of {orders.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ color: M.textMuted }}>
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: p === 1 ? M.gold : "transparent",
                  color: p === 1 ? "#000000" : M.textMuted,
                }}
              >
                {p}
              </button>
            ))}
            <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ color: M.textMuted }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
