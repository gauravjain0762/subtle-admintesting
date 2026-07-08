"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { getOrders, type Order } from "@/lib/orders-store";
import { getDishes, type Dish } from "@/lib/menu-store";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
};

function daysSince(dateISO: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const then = new Date(dateISO); then.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

export default function TopMealsReportPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [period, setPeriod] = useState<"This Wk" | "Last Wk">("This Wk");

  useEffect(() => {
    setOrders(getOrders());
    setDishes(getDishes());
  }, []);

  const topMeals = useMemo(() => {
    const filtered = period === "This Wk"
      ? orders.filter((o) => daysSince(o.dateISO) < 7)
      : orders.filter((o) => daysSince(o.dateISO) >= 7 && daysSince(o.dateISO) < 14);
    const qtyByDish = new Map<number, number>();
    for (const o of filtered) {
      for (const item of o.items) {
        qtyByDish.set(item.dishId, (qtyByDish.get(item.dishId) ?? 0) + item.quantity);
      }
    }
    return [...qtyByDish.entries()]
      .map(([dishId, qty]) => ({ dish: dishes.find((d) => d.id === dishId), qty }))
      .filter((r): r is { dish: Dish; qty: number } => !!r.dish)
      .sort((a, b) => b.qty - a.qty);
  }, [orders, dishes, period]);

  return (
    <div className={montserrat.className}>
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
        style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
      >
        <ArrowLeft size={12} /> Back
      </button>

      <h1 className="text-[26px] font-bold" style={{ color: M.gold }}>Top Selling Meals</h1>
      <p className="mt-1 text-[12px]" style={{ color: "#D0C5AF" }}>Filter, then see meal details below.</p>

      {/* Filters */}
      <div className="mt-5 flex overflow-hidden rounded-lg border w-fit" style={{ borderColor: M.goldFaint }}>
        {(["This Wk", "Last Wk"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-2 text-[11px] font-bold"
            style={{ background: period === p ? M.gold : "transparent", color: period === p ? "#000000" : M.gold }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-6 overflow-hidden rounded-xl" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        {topMeals.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px]" style={{ color: M.textMuted }}>
            No orders in this period yet.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: M.border }}>
            {topMeals.map(({ dish, qty }, i) => (
              <div key={dish.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: i === 0 ? M.gold : M.surface, color: i === 0 ? "#000000" : M.gold }}
                >
                  {i + 1}
                </span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: M.surface, border: `1px solid ${M.border}` }}>
                  {dish.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dish.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed size={12} style={{ color: M.textMuted }} />
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: M.white }}>
                  {dish.name}
                </span>
                <span className="shrink-0 text-[13px] font-bold" style={{ color: M.gold }}>×{qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details placeholder */}
      <div
        className="mt-6 flex items-center justify-center rounded-xl p-10 text-center"
        style={{ background: M.panel, border: `1px dashed ${M.border}` }}
      >
        <p className="text-[12.5px]" style={{ color: M.textMuted }}>
          Detailed breakdown (revenue per dish, trend over time) is coming soon.
        </p>
      </div>
    </div>
  );
}
