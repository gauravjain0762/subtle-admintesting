"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { getAllOrders, type Order } from "@/lib/orders-store";

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

export default function TotalOrdersReportPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<"Today" | "Week">("Today");

  useEffect(() => { getAllOrders().then(setOrders).catch(() => setOrders([])); }, []);

  const filtered = useMemo(
    () => orders.filter((o) => period === "Today" ? daysSince(o.dateISO) === 0 : daysSince(o.dateISO) < 7),
    [orders, period]
  );

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

      <h1 className="text-[26px] font-bold" style={{ color: M.gold }}>Total Orders</h1>
      <p className="mt-1 text-[12px]" style={{ color: "#D0C5AF" }}>Filter, then see order details below.</p>

      {/* Filters */}
      <div className="mt-5 flex overflow-hidden rounded-lg border w-fit" style={{ borderColor: M.goldFaint }}>
        {(["Today", "Week"] as const).map((p) => (
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

      <p className="mt-6 text-[48px] font-bold leading-none" style={{ color: M.gold, letterSpacing: "-1px" }}>
        {filtered.length}
      </p>
      <p className="mt-2 text-[12px]" style={{ color: M.textMuted }}>
        {period === "Today" ? "Orders placed today" : "Orders in the trailing 7 days"}
      </p>

      {/* Details placeholder */}
      <div
        className="mt-8 flex items-center justify-center rounded-xl p-10 text-center"
        style={{ background: M.panel, border: `1px dashed ${M.border}` }}
      >
        <p className="text-[12.5px]" style={{ color: M.textMuted }}>
          Order details for this filter are coming soon.
        </p>
      </div>
    </div>
  );
}
