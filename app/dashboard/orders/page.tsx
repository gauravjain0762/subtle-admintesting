"use client";

import { useState, useEffect } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getOrders, STATUS_CFG, TYPE_CFG, type Order, type OrderStatus, type OrderType } from "@/lib/orders-store";

const STATUS_FILTERS = ["All", "Delivered", "In Transit", "Preparing", "Cancelled"];
const TYPE_FILTERS   = ["All Types", "Weekly", "One-Time", "Business"];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  const SIcon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <SIcon size={10} />
      {cfg.label}
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

  useEffect(() => {
    setOrders(getOrders());
  }, []);

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
    return matchSearch && matchStatus && matchType;
  });

  const stats = [
    { label: "Today's Orders", value: todaysOrders.length, color: "#0a0a0a", bg: "#f0e9d6" },
    { label: "Delivered",      value: todaysOrders.filter((o) => o.status === "delivered").length,   color: "#2d6a2d", bg: "#edf7ed" },
    { label: "In Transit",     value: todaysOrders.filter((o) => o.status === "in-transit").length,  color: "#0a3d8f", bg: "#e8f0fe" },
    { label: "Preparing",      value: todaysOrders.filter((o) => o.status === "preparing").length,   color: "#7a5a00", bg: "#fffce0" },
  ];
  const maxStat = Math.max(1, ...stats.map((s) => s.value));

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "#0a0a0a" }}>Orders</h1>
          <p className="text-[13px]" style={{ color: "#6b6b5a" }}>{orders.length} total orders</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Exporting orders as CSV…")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: "#0a0a0a", color: "#ffffff" }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
            className="rounded-2xl p-4"
            style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
              {s.label}
            </p>
            <p className="mt-1.5 text-[28px] font-bold leading-none" style={{ color: s.color }}>
              {s.value}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: "#f0e9d6" }}>
              <div className="h-full rounded-full" style={{ width: `${(s.value / maxStat) * 100}%`, background: s.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.34 }}
        className="rounded-2xl p-4"
        style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
      >
        <div className="flex flex-wrap gap-3">
          <div
            className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ border: "1.5px solid #e8e0cc", background: "#fdf8ec" }}
          >
            <Search size={13} style={{ color: "#9b9b89" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, customers, codes…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "#0a0a0a" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "#9b9b89" }}>
                <X size={12} />
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
                  background: statusFilter === f ? "#0a0a0a" : "#f0e9d6",
                  color: statusFilter === f ? "#ffffff" : "#6b6b5a",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl px-3.5 py-2 text-[12px] font-medium outline-none"
            style={{ border: "1.5px solid #e8e0cc", background: "#fdf8ec", color: "#0a0a0a" }}
          >
            {TYPE_FILTERS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl"
        style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0e9d6" }}>
                {["Order ID", "Customer", "Dish(es)", "Type", "Amount", "Status", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-wider"
                    style={{ color: "#9b9b89" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const tc = TYPE_CFG[order.type] ?? TYPE_CFG["one-time"];
                const label = order.companyCode
                  ? `${order.customerInitials} | ${order.companyCode}`
                  : order.customerInitials;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0e9d6" : "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fdf8ec"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12.5px] font-medium" style={{ color: "#0a0a0a" }}>{order.customerName}</span>
                      <div className="mt-0.5">
                        <span
                          className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider"
                          style={{ background: "#f0e9d6", color: "#6b6b5a" }}
                        >
                          {label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <span className="text-[12.5px] line-clamp-1" style={{ color: "#6b6b5a" }}>{itemsLabel(order)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold capitalize"
                        style={{ background: tc.bg, color: tc.color }}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12.5px] font-bold" style={{ color: "#0a0a0a" }}>{order.totalAmount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px]" style={{ color: "#9b9b89" }}>{order.dateDisplay}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <motion.button
                        whileHover={{ scale: 1.15, background: "#f0e9d6" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toast.success(`Order ${order.id} — ${order.customerName}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                        style={{ color: "#9b9b89" }}
                      >
                        <Eye size={13} />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: "1px solid #f0e9d6" }}
        >
          <span className="text-[12px]" style={{ color: "#9b9b89" }}>
            Showing {filtered.length} of {orders.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f0e9d6]" style={{ color: "#9b9b89" }}>
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: p === 1 ? "#0a0a0a" : "transparent",
                  color: p === 1 ? "#ffffff" : "#6b6b5a",
                }}
              >
                {p}
              </button>
            ))}
            <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f0e9d6]" style={{ color: "#9b9b89" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
