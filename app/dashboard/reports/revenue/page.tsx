"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { getAllOrders, parseAmount, type Order } from "@/lib/orders-store";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const M = {
  panel: "#0d0d0d",
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

type Period = "Today" | "Last Week" | "Last Month" | "Custom";

export default function RevenueReportPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>("Today");
  const todayISO = new Date().toISOString().slice(0, 10);
  const [customFrom, setCustomFrom] = useState(todayISO);
  const [customTo, setCustomTo] = useState(todayISO);

  useEffect(() => { getAllOrders().then(setOrders).catch(() => setOrders([])); }, []);

  const filtered = useMemo(() => {
    if (period === "Today") return orders.filter((o) => daysSince(o.dateISO) === 0);
    if (period === "Last Week") return orders.filter((o) => daysSince(o.dateISO) < 7);
    if (period === "Last Month") return orders.filter((o) => daysSince(o.dateISO) < 30);
    return orders.filter((o) => o.dateISO >= customFrom && o.dateISO <= customTo);
  }, [orders, period, customFrom, customTo]);

  const total = useMemo(() => filtered.reduce((sum, o) => sum + parseAmount(o.totalAmount), 0), [filtered]);

  const handleCustomDateChange = (which: "from" | "to", value: string) => {
    const clamped = value > todayISO ? todayISO : value;
    if (which === "from") {
      setCustomFrom(clamped);
      if (customTo < clamped) setCustomTo(clamped);
    } else {
      setCustomTo(clamped);
      if (clamped < customFrom) setCustomFrom(clamped);
    }
  };

  return (
    <div className={montserrat.className}>
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
        style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.textMuted }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
      >
        <ArrowLeft size={12} /> Back
      </button>

      <h1 className="text-[26px] font-bold" style={{ color: M.gold }}>Revenue Overview</h1>
      <p className="mt-1 text-[12px]" style={{ color: "#D0C5AF" }}>Filter, then see revenue details below.</p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border w-fit" style={{ borderColor: M.goldFaint }}>
          {(["Today", "Last Week", "Last Month", "Custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 text-[11px] font-bold whitespace-nowrap"
              style={{ background: period === p ? M.gold : "transparent", color: period === p ? "#000000" : M.gold }}
            >
              {p}
            </button>
          ))}
        </div>

        {period === "Custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              max={todayISO}
              onChange={(e) => handleCustomDateChange("from", e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.white, colorScheme: "dark" }}
            />
            <span className="text-[11px]" style={{ color: M.textMuted }}>to</span>
            <input
              type="date"
              value={customTo}
              max={todayISO}
              onChange={(e) => handleCustomDateChange("to", e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.white, colorScheme: "dark" }}
            />
          </div>
        )}
      </div>
      {period === "Custom" && (
        <p className="mt-2 text-[11px]" style={{ color: M.textMuted }}>Future dates aren&apos;t selectable.</p>
      )}

      <p className="mt-6 text-[48px] font-bold leading-none" style={{ color: M.gold, letterSpacing: "-1px" }}>
        £{total.toFixed(2)}
      </p>
      <p className="mt-2 text-[12px]" style={{ color: M.textMuted }}>{filtered.length} orders in this period</p>

      {/* Details placeholder */}
      <div
        className="mt-8 flex items-center justify-center rounded-xl p-10 text-center"
        style={{ background: M.panel, border: `1px dashed ${M.border}` }}
      >
        <p className="text-[12.5px]" style={{ color: M.textMuted }}>
          Revenue breakdown details for this filter are coming soon.
        </p>
      </div>
    </div>
  );
}
