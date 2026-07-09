"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChefHat, ShoppingBag, Scale, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { getTodaysOrders, type Order } from "@/lib/orders-store";
import { getDishes, type Dish } from "@/lib/menu-store";
import { C } from "@/lib/sk-theme";

function formatGrams(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`;
  return `${Math.round(g)} g`;
}

interface DishBreakdown {
  dish: Dish;
  qty: number;
  ingredients: { name: string; totalGrams: number }[];
}

interface GrandTotal {
  name: string;
  totalGrams: number;
}

export default function KitchenPrepPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    getTodaysOrders().then(setOrders).catch(() => setOrders([]));
    getDishes().then(setDishes).catch(() => setDishes([]));
  }, []);

  const { perDish, grandTotals } = useMemo(() => {
    const qtyByDish = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        qtyByDish.set(item.dishId, (qtyByDish.get(item.dishId) ?? 0) + item.quantity);
      }
    }

    const perDish: DishBreakdown[] = [];
    const grandTotalsMap = new Map<string, { displayName: string; totalGrams: number }>();

    for (const [dishId, qty] of qtyByDish.entries()) {
      const dish = dishes.find((d) => d.id === dishId);
      if (!dish) continue;
      const ingredients = (dish.ingredients ?? []).map((ing) => ({
        name: ing.name,
        totalGrams: ing.gramsPerMeal * qty,
      }));
      perDish.push({ dish, qty, ingredients });

      for (const ing of ingredients) {
        const key = ing.name.trim().toLowerCase();
        const existing = grandTotalsMap.get(key);
        if (existing) {
          existing.totalGrams += ing.totalGrams;
        } else {
          grandTotalsMap.set(key, { displayName: ing.name.trim(), totalGrams: ing.totalGrams });
        }
      }
    }

    perDish.sort((a, b) => b.qty - a.qty);
    const grandTotals: GrandTotal[] = [...grandTotalsMap.values()]
      .map((v) => ({ name: v.displayName, totalGrams: v.totalGrams }))
      .sort((a, b) => b.totalGrams - a.totalGrams);

    return { perDish, grandTotals };
  }, [orders, dishes]);

  const hasIngredientData = perDish.some((d) => d.ingredients.length > 0);

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
          <h1 className="text-[22px] font-bold" style={{ color: C.text }}>Kitchen Prep Report</h1>
          <p className="text-[13px]" style={{ color: C.textSub }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" · "}{orders.length} orders today
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Exporting prep list…")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: C.black, color: C.white }}
        >
          <ChefHat size={13} /> Print / Export
        </motion.button>
      </motion.div>

      {orders.length === 0 || !hasIngredientData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-20"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: C.muted }}>
            🥘
          </div>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>
            {orders.length === 0 ? "No orders today yet" : "No ingredient data yet"}
          </p>
          <p className="max-w-xs text-center text-[12.5px]" style={{ color: C.textMuted }}>
            {orders.length === 0
              ? "Once today's orders come in, prep totals will show here."
              : "Add ingredients (grams per meal) to dishes in the Menu page to see prep totals."}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Grand totals */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-5"
            style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Scale size={15} style={{ color: C.text }} />
              <h2 className="text-[14px] font-bold" style={{ color: C.text }}>Buy List — Grand Totals</h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {grandTotals.map((g, i) => (
                <motion.div
                  key={g.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.03, duration: 0.3 }}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: C.inputBg, border: `1px solid ${C.cardBorder}` }}
                >
                  <span className="text-[13px] font-semibold" style={{ color: C.text }}>{g.name}</span>
                  <span className="text-[14px] font-bold" style={{ color: C.text }}>{formatGrams(g.totalGrams)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Per-dish breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-5"
            style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
          >
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag size={15} style={{ color: C.text }} />
              <h2 className="text-[14px] font-bold" style={{ color: C.text }}>Per-Dish Breakdown</h2>
            </div>
            <div className="space-y-3">
              {perDish.map((row, i) => (
                <motion.div
                  key={row.dish.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.05, duration: 0.32 }}
                  className="rounded-xl p-4"
                  style={{ background: C.inputBg, border: `1px solid ${C.cardBorder}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: C.muted }}>
                        {row.dish.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.dish.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UtensilsCrossed size={12} style={{ color: C.textMuted }} />
                        )}
                      </div>
                      <span className="truncate text-[13px] font-bold" style={{ color: C.text }}>{row.dish.name}</span>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: C.yellow, color: C.black }}>
                      ×{row.qty}
                    </span>
                  </div>
                  {row.ingredients.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {row.ingredients.map((ing) => (
                        <span
                          key={ing.name}
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: C.muted, color: C.textSub }}
                        >
                          {ing.name}: {formatGrams(ing.totalGrams)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[11.5px]" style={{ color: C.textMuted }}>No ingredients configured for this dish.</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
