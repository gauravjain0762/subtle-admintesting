"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import { getOrders, parseAmount, type Order } from "@/lib/orders-store";
import { getMenus, type Menu } from "@/lib/menus-store";
import { getDishes, type Dish } from "@/lib/menu-store";
import { getNewEnquiriesCount } from "@/lib/enquiries-store";
import { getActiveWeeklySubscriptionsCount } from "@/lib/subscriptions-store";

/* ── Mentor project reference: Montserrat, scoped to this page only ── */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Dashboard palette (mentor project reference) ── */
const M = {
  bg: "#000000",
  surface: "#111111",
  border: "#1c1c1c",
  goldIdle: "rgba(248,227,150,0.5)",
  goldHover: "rgba(248,227,150,0.9)",
  goldFaint: "rgba(248,227,150,0.28)",
  hoverBg: "#161616",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.55)",
  white: "#ffffff",
  textMuted: "#8a8a8a",
  textFaint: "#5a5a5a",
};

/** Days between an ISO date and today (0 = today, 1 = yesterday, …). */
function daysSince(dateISO: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const then = new Date(dateISO); then.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

/* ── Mentor-style card shell: top accent bar that intensifies on hover ── */
function DashCard({
  delay = 0, children,
}: {
  delay?: number; children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg p-5 transition-colors"
      style={{
        background: hover ? M.hoverBg : M.surface,
        border: `1px solid ${M.border}`,
        borderTop: `2px solid ${hover ? M.goldHover : M.goldIdle}`,
        cursor: "default",
      }}
    >
      {children}
    </motion.div>
  );
}

function TogglePill({ options, active, onChange }: {
  options: string[]; active: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border shrink-0" style={{ borderColor: M.goldFaint }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={(e) => { e.stopPropagation(); onChange(opt); }}
          className="px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-colors"
          style={{
            background: active === opt ? M.gold : "transparent",
            color: active === opt ? "#000000" : M.gold,
            borderRight: i < options.length - 1 ? "1px solid rgba(248,227,150,0.2)" : "none",
          }}
          onMouseEnter={(e) => { if (active !== opt) (e.currentTarget as HTMLElement).style.background = "rgba(248,227,150,0.08)"; }}
          onMouseLeave={(e) => { if (active !== opt) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CardHeader({
  label, toggle,
}: {
  label: string;
  toggle?: { options: string[]; active: string; onChange: (v: string) => void };
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-2">
      <p className="text-[12px] font-medium leading-[1.4]" style={{ color: M.goldMuted }}>{label}</p>
      {toggle && <TogglePill {...toggle} />}
    </div>
  );
}

/* ── Simple number stat card ── */
function StatCell({
  label, value, toggle, delay = 0,
}: {
  label: string; value: React.ReactNode;
  toggle?: { options: string[]; active: string; onChange: (v: string) => void };
  delay?: number;
}) {
  return (
    <DashCard delay={delay}>
      <CardHeader label={label} toggle={toggle} />
      <p className="text-[42px] font-bold leading-none" style={{ color: M.gold, letterSpacing: "-1px" }}>{value}</p>
    </DashCard>
  );
}

export default function DashboardPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newEnquiries, setNewEnquiries] = useState(0);
  const [activeSubs, setActiveSubs] = useState(0);

  useEffect(() => {
    const orders = getOrders();
    setAllOrders(orders);
    setMenus(getMenus());
    setDishes(getDishes());
    getNewEnquiriesCount().then(setNewEnquiries).catch(() => setNewEnquiries(0));
    setActiveSubs(getActiveWeeklySubscriptionsCount());
  }, []);

  const totalOrdersToday = useMemo(() => allOrders.filter((o) => daysSince(o.dateISO) === 0).length, [allOrders]);
  const oneOffOrders     = useMemo(() => allOrders.filter((o) => o.type === "one-time").length, [allOrders]);
  const standardMenuCount = useMemo(() => menus.filter((m) => m.isDefault).length, [menus]);
  const customMenuCount   = useMemo(() => menus.filter((m) => !m.isDefault).length, [menus]);

  const revenueToday = useMemo(
    () => allOrders.filter((o) => daysSince(o.dateISO) === 0).reduce((sum, o) => sum + parseAmount(o.totalAmount), 0),
    [allOrders]
  );

  const topMealToday = useMemo(() => {
    const orders = allOrders.filter((o) => daysSince(o.dateISO) === 0);
    const qtyByDish = new Map<number, number>();
    for (const o of orders) {
      for (const item of o.items) {
        qtyByDish.set(item.dishId, (qtyByDish.get(item.dishId) ?? 0) + item.quantity);
      }
    }
    const top = [...qtyByDish.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const dish = dishes.find((d) => d.id === top[0]);
    return dish ? { dish, qty: top[1] } : null;
  }, [allOrders, dishes]);

  return (
    <div
      className={`space-y-6 ${montserrat.className}`}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[28px] font-extrabold leading-none" style={{ color: M.gold, letterSpacing: "0.08em" }}>Dashboard</h1>
        <p className="mt-2 text-[13px] font-normal" style={{ color: "rgba(248,227,150,0.5)" }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* ── 8-card stats grid — row 1 of 4, row 2 of 4 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCell
          label="Total Orders"
          value={totalOrdersToday}
          delay={0}
        />
        <StatCell
          label="Weekly Subscriptions"
          value={activeSubs}
          delay={0.04}
        />
        <StatCell
          label="One-Off Orders"
          value={oneOffOrders}
          delay={0.08}
        />

        <StatCell
          label="Revenue Overview"
          value={`£${revenueToday.toFixed(2)}`}
          delay={0.12}
        />

        <StatCell
          label="New Business Enquiries"
          value={newEnquiries}
          delay={0.16}
        />

        <StatCell
          label="Top Selling Meals"
          value={topMealToday ? `×${topMealToday.qty}` : "—"}
          delay={0.2}
        />

        <StatCell
          label="Total Standard Menu"
          value={standardMenuCount}
          delay={0.24}
        />
        <StatCell
          label="Total Custom Menu"
          value={customMenuCount}
          delay={0.28}
        />
      </div>

    </div>
  );
}
