"use client";

import { TrendingUp, TrendingDown, Users, ShoppingBag, Star, Repeat } from "lucide-react";
import { motion } from "framer-motion";

const WEEKLY_REVENUE = [
  { day: "Mon", amount: 2840, orders: 38 },
  { day: "Tue", amount: 3120, orders: 42 },
  { day: "Wed", amount: 4280, orders: 56 },
  { day: "Thu", amount: 3650, orders: 49 },
  { day: "Fri", amount: 5100, orders: 68 },
  { day: "Sat", amount: 1820, orders: 24 },
  { day: "Sun", amount: 920,  orders: 12 },
];

const TOP_DISHES = [
  { name: "Chicken Katsu Curry",  revenue: "£3,762", orders: 284, pct: 100, img: "🍛" },
  { name: "Mediterranean Salmon", revenue: "£2,888", orders: 218, pct: 77,  img: "🐟" },
  { name: "Margherita Focaccia",  revenue: "£1,640", orders: 193, pct: 64,  img: "🍕" },
  { name: "Chicken Teriyaki",     revenue: "£1,496", orders: 176, pct: 58,  img: "🍱" },
  { name: "Tuscan Bean Soup",     revenue: "£994",   orders: 142, pct: 42,  img: "🥣" },
];

const maxRevenue = Math.max(...WEEKLY_REVENUE.map((d) => d.amount));

const KPIS = [
  { label: "Revenue",     value: "£18,420", change: "+22%",  up: true,  icon: TrendingUp,  color: "#0a0a0a", bg: "#f0e9d6" },
  { label: "Orders",      value: "1,284",   change: "+12%",  up: true,  icon: ShoppingBag, color: "#0a3d8f", bg: "#e8f0fe" },
  { label: "Subscribers", value: "342",     change: "+8%",   up: true,  icon: Users,       color: "#2d6a2d", bg: "#edf7ed" },
  { label: "Avg. Rating", value: "4.8",     change: "-0.1",  up: false, icon: Star,        color: "#d4661a", bg: "#fdf0e4" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[22px] font-bold" style={{ color: "#0a0a0a" }}>Analytics</h1>
        <p className="text-[13px]" style={{ color: "#6b6b5a" }}>Performance overview · Last 30 days</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {KPIS.map((kpi, i) => {
          const KIcon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
                  {kpi.label}
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: kpi.bg }}>
                  <KIcon size={14} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="mt-2 text-[28px] font-bold leading-none" style={{ color: "#0a0a0a" }}>{kpi.value}</p>
              <div className="mt-1.5 flex items-center gap-1">
                {kpi.up
                  ? <TrendingUp size={12} style={{ color: "#2d6a2d" }} />
                  : <TrendingDown size={12} style={{ color: "#b83232" }} />}
                <span className="text-[12px] font-semibold" style={{ color: kpi.up ? "#2d6a2d" : "#b83232" }}>
                  {kpi.change}
                </span>
                <span className="text-[11px]" style={{ color: "#9b9b89" }}>vs last period</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="xl:col-span-2 rounded-2xl p-5"
          style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: "#0a0a0a" }}>Weekly Revenue</h2>
              <p className="text-[12px]" style={{ color: "#9b9b89" }}>30 Jun – 6 Jul 2025</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ background: "#f5d800", color: "#0a0a0a" }}
            >
              £21,730 total
            </span>
          </div>

          {/* Animated bar chart */}
          <div className="flex h-[180px] items-end gap-2">
            {WEEKLY_REVENUE.map((d, i) => {
              const hPct = (d.amount / maxRevenue) * 100;
              return (
                <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "100%" }}>
                    {/* Tooltip */}
                    <div
                      className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: "#0a0a0a", color: "#ffffff" }}
                    >
                      £{d.amount.toLocaleString()}
                    </div>
                    <motion.div
                      className="w-full rounded-t-lg"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: `${hPct}%`, background: "#f5d800", transformOrigin: "bottom" }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: "#9b9b89" }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2 border-t pt-3" style={{ borderColor: "#f0e9d6" }}>
            {WEEKLY_REVENUE.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center">
                <span className="text-[11px] font-semibold" style={{ color: "#0a0a0a" }}>{d.orders}</span>
                <span className="text-[9px]" style={{ color: "#9b9b89" }}>orders</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
        >
          <h2 className="mb-4 text-[14px] font-bold" style={{ color: "#0a0a0a" }}>Top Dishes</h2>
          <div className="space-y-4">
            {TOP_DISHES.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-xl">{dish.img}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[12px] font-semibold" style={{ color: "#0a0a0a" }}>
                        {dish.name}
                      </span>
                      <span className="ml-2 shrink-0 text-[12px] font-bold" style={{ color: "#0a0a0a" }}>
                        {dish.revenue}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: "#9b9b89" }}>{dish.orders} orders</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#f0e9d6" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dish.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: i === 0 ? "#f5d800" : "#0a0a0a" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{
            background: "#0a0a0a",
            backgroundImage:
              "radial-gradient(ellipse at 10% 30%, rgba(245,216,0,0.09) 0%, transparent 50%), radial-gradient(rgba(255,243,154,0.04) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 22px 22px",
          }}
        >
          <h2 className="mb-1 text-[14px] font-bold" style={{ color: "#ffffff" }}>Subscriber Retention</h2>
          <p className="mb-5 text-[12px]" style={{ color: "#3a3a30" }}>Monthly cohort</p>
          <div className="space-y-3">
            {[
              { month: "Jan 2025", retained: 88 },
              { month: "Feb 2025", retained: 84 },
              { month: "Mar 2025", retained: 91 },
              { month: "Apr 2025", retained: 86 },
              { month: "May 2025", retained: 93 },
              { month: "Jun 2025", retained: 89 },
            ].map((row, i) => (
              <motion.div
                key={row.month}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
              >
                <div className="mb-1 flex justify-between text-[12px]">
                  <span style={{ color: "#b0b098" }}>{row.month}</span>
                  <span className="font-bold" style={{ color: "#ffffff" }}>{row.retained}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full" style={{ background: "#1a1a14" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.retained}%` }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: "#f5d800" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Order Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5"
          style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
        >
          <h2 className="mb-1 text-[14px] font-bold" style={{ color: "#0a0a0a" }}>Order Frequency</h2>
          <p className="mb-5 text-[12px]" style={{ color: "#9b9b89" }}>How customers order</p>
          <div className="space-y-4">
            {[
              { label: "Weekly subscription", value: 58, icon: Repeat,      color: "#0a3d8f", bg: "#e8f0fe" },
              { label: "Bi-weekly",           value: 22, icon: TrendingUp,   color: "#2d6a2d", bg: "#edf7ed" },
              { label: "One-time",            value: 20, icon: ShoppingBag,  color: "#7a5a00", bg: "#fffce0" },
            ].map((f, i) => {
              const FIcon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: f.bg }}>
                    <FIcon size={15} style={{ color: f.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span style={{ color: "#6b6b5a" }}>{f.label}</span>
                      <span className="font-bold" style={{ color: "#0a0a0a" }}>{f.value}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full" style={{ background: "#f0e9d6" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${f.value}%` }}
                        transition={{ delay: 0.65 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ background: f.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
