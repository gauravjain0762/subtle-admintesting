"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, Users, TrendingUp, Star,
  ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle2, Truck, AlertCircle,
  ChevronRight, UtensilsCrossed, Building2,
} from "lucide-react";

const STATS = [
  { label: "Total Orders",       value: "1,284", change: "+12%", up: true,  sub: "vs last week",  icon: ShoppingBag, color: "#0a0a0a", bg: "#f0e9d6" },
  { label: "Active Companies",   value: "6",     change: "+2",   up: true,  sub: "this month",    icon: Building2,   color: "#0a3d8f", bg: "#e8f0fe" },
  { label: "Revenue",            value: "£18,420",change: "+22%",up: true,  sub: "vs last week",  icon: TrendingUp,  color: "#2d6a2d", bg: "#edf7ed" },
  { label: "Avg. Rating",        value: "4.8",   change: "-0.1", up: false, sub: "from 4.9",      icon: Star,        color: "#d4661a", bg: "#fdf0e4" },
];

const RECENT_ORDERS = [
  { id: "#ORD-4821", customer: "Sarah M. · Acme Corp.",         dish: "Chicken Katsu Curry",      amount: "£13.25", status: "delivered" },
  { id: "#ORD-4820", customer: "James T. · TechLondon Ltd",     dish: "Mediterranean Salmon",     amount: "£13.25", status: "in-transit" },
  { id: "#ORD-4819", customer: "Priya K. · FinanceHub UK",      dish: "Chicken Teriyaki",         amount: "£8.50",  status: "preparing" },
  { id: "#ORD-4818", customer: "Acme Corp. (Bulk x8)",          dish: "Weekly Lunch Box",         amount: "£68.00", status: "delivered" },
  { id: "#ORD-4817", customer: "Luke R. · Creative Studio",     dish: "Tuscan Bean Soup",         amount: "£7.00",  status: "cancelled" },
  { id: "#ORD-4816", customer: "Emma C. · FinanceHub UK",       dish: "Margherita Focaccia Pizza",amount: "£8.50",  status: "delivered" },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  delivered:    { label: "Delivered",   color: "#2d6a2d", bg: "#edf7ed", icon: CheckCircle2 },
  "in-transit": { label: "In Transit",  color: "#0a3d8f", bg: "#e8f0fe", icon: Truck },
  preparing:    { label: "Preparing",   color: "#7a5a00", bg: "#fffce0", icon: Clock },
  cancelled:    { label: "Cancelled",   color: "#b83232", bg: "#fef2f2", icon: AlertCircle },
};

const TODAY_MENU = [
  { name: "Chicken Katsu Curry",      portion: "Large · High Protein", orders: 38, img: "🍛" },
  { name: "Mediterranean Salmon",     portion: "Regular · Gluten Free", orders: 31, img: "🐟" },
  { name: "Chicken Teriyaki",         portion: "Regular",              orders: 28, img: "🍱" },
  { name: "Margherita Focaccia Pizza",portion: "Regular · Vegetarian", orders: 24, img: "🍕" },
  { name: "Tuscan Bean Soup",         portion: "Regular · Vegan",      orders: 19, img: "🥣" },
];

/* ── variants ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const slideUp = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  },
};
const slideRight = {
  hidden: { opacity: 0, x: -14 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  }),
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  const SIcon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <SIcon size={10} />{cfg.label}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#0a0a0a" }}>Dashboard</h1>
          <p className="mt-0.5 text-[13px]" style={{ color: "#6b6b5a" }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden items-center gap-2 rounded-xl px-4 py-2 sm:flex"
          style={{ background: "#0a0a0a" }}
        >
          <UtensilsCrossed size={14} color="#f5d800" />
          <span className="text-[12px] font-semibold" style={{ color: "#ffffff" }}>Kitchen Open</span>
          <span className="flex h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
        </motion.div>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={slideUp}
              whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="rounded-2xl p-5"
              style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#9b9b89" }}>{s.label}</p>
                  <p className="mt-2 text-[28px] font-bold leading-none tracking-tight" style={{ color: "#0a0a0a" }}>{s.value}</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: s.bg }}
                >
                  <Icon size={18} style={{ color: s.color }} strokeWidth={1.8} />
                </motion.div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {s.up
                  ? <ArrowUpRight size={13} style={{ color: "#2d6a2d" }} />
                  : <ArrowDownRight size={13} style={{ color: "#b83232" }} />}
                <span className="text-[12px] font-semibold" style={{ color: s.up ? "#2d6a2d" : "#b83232" }}>{s.change}</span>
                <span className="text-[12px]" style={{ color: "#9b9b89" }}>{s.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Orders table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="xl:col-span-2 overflow-hidden rounded-2xl"
          style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#f0e9d6" }}>
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: "#0a0a0a" }}>Recent Orders</h2>
              <p className="text-[12px]" style={{ color: "#9b9b89" }}>Live company lunch feed</p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              className="flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: "#0a0a0a" }}
            >
              View all <ChevronRight size={13} />
            </motion.button>
          </div>

          <div className="divide-y" style={{ borderColor: "#f0e9d6" }}>
            {RECENT_ORDERS.map((order, i) => (
              <motion.div
                key={order.id}
                custom={i}
                variants={slideRight}
                initial="hidden"
                animate="show"
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#fdf8ec]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{order.id}</span>
                    <span style={{ color: "#d0c8b0" }}>·</span>
                    <span className="truncate text-[12px]" style={{ color: "#6b6b5a" }}>{order.customer}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px]" style={{ color: "#9b9b89" }}>{order.dish}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <StatusBadge status={order.status} />
                  <span className="text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{order.amount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's menu */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl"
          style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#f0e9d6" }}>
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: "#0a0a0a" }}>Today&apos;s Menu</h2>
              <p className="text-[12px]" style={{ color: "#9b9b89" }}>Orders per dish</p>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: "#fffce0", color: "#7a5a00" }}>
              WED 2 Jul
            </span>
          </div>

          <div className="divide-y p-2" style={{ borderColor: "#f0e9d6" }}>
            {TODAY_MENU.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.06, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: "#f0e9d6" }}>{dish.img}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold" style={{ color: "#0a0a0a" }}>{dish.name}</p>
                  <p className="text-[11px]" style={{ color: "#9b9b89" }}>{dish.portion}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{dish.orders}</p>
                  <p className="text-[10px]" style={{ color: "#9b9b89" }}>orders</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini bar chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="m-2 mt-0 rounded-xl p-4"
            style={{
              background: "#0a0a0a",
              backgroundImage: "radial-gradient(rgba(255,243,154,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3a3a30" }}>
              Weekly Company Orders
            </p>
            <div className="flex items-end gap-1.5">
              {[65, 80, 55, 90, 72, 88, 60].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.55 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "bottom" }}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-sm"
                    style={{ height: h * 0.4, background: i === 3 ? "#f5d800" : "rgba(255,255,255,0.12)" }}
                  />
                  <span className="text-[8px]" style={{ color: "#3a3a30" }}>
                    {["M","T","W","T","F","S","S"][i]}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Order frequency */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{
            background: "#0a0a0a",
            border: "1.5px solid #1a1a1a",
            backgroundImage:
              "radial-gradient(ellipse at 80% 20%, rgba(245,216,0,0.09) 0%, transparent 55%), radial-gradient(rgba(255,243,154,0.04) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 22px 22px",
          }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#3a3a30" }}>Order Frequency</p>
          <div className="space-y-3">
            {[
              { label: "Weekly subscription", pct: 58 },
              { label: "One day off",          pct: 22 },
              { label: "One time",             pct: 20 },
            ].map((f, i) => (
              <div key={f.label}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span style={{ color: "#b0b098" }}>{f.label}</span>
                  <span className="font-semibold" style={{ color: "#fff" }}>{f.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full" style={{ background: "#1a1a14" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.pct}%` }}
                    transition={{ delay: 0.38 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "#f5d800" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top companies */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#9b9b89" }}>Top Companies</p>
          <div className="space-y-3">
            {[
              { name: "FinanceHub UK",  orders: 72, spend: "£3,720", rank: 1 },
              { name: "Acme Corp.",     orders: 48, spend: "£2,480", rank: 2 },
              { name: "Greenleaf Health",orders:60, spend: "£3,120", rank: 3 },
              { name: "TechLondon Ltd", orders: 34, spend: "£1,760", rank: 4 },
            ].map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: i === 0 ? "#f5d800" : "#f0e9d6", color: "#0a0a0a" }}
                >{b.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold" style={{ color: "#0a0a0a" }}>{b.name}</p>
                  <p className="text-[11px]" style={{ color: "#9b9b89" }}>{b.orders} orders</p>
                </div>
                <span className="text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{b.spend}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{ background: "#fff", border: "1.5px solid #e8e0cc" }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#9b9b89" }}>Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Add Dish",       emoji: "🍽️" },
              { label: "Add Company",    emoji: "🏢" },
              { label: "Print Labels",   emoji: "🖨️" },
              { label: "Export Orders",  emoji: "📊" },
              { label: "Pause Delivery", emoji: "⏸️" },
              { label: "Send Update",    emoji: "📢" },
            ].map((a, i) => (
              <motion.button
                key={a.label}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex flex-col items-start gap-1.5 rounded-xl p-3 text-left transition-colors hover:bg-[#f0e9d6]"
                style={{ border: "1.5px solid #e8e0cc" }}
              >
                <span className="text-lg">{a.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight" style={{ color: "#0a0a0a" }}>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
