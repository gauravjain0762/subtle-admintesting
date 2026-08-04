"use client";

import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPE_CFG, STATUS_CFG, type GroupedSubscriptionOrder, type Order } from "@/lib/orders-store";

const M = {
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  textMuted: "#888888",
  textFaint: "#444444",
  white: "#ffffff",
};

interface GroupedOrderRowProps {
  order: GroupedSubscriptionOrder | Order;
  onViewDetails: (orderId: string) => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export function GroupedOrderRow({
  order,
  onViewDetails,
  selectMode,
  isSelected,
  onToggleSelect,
}: GroupedOrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isGrouped = "deliveries" in order;
  const singleOrder = !isGrouped ? (order as Order) : null;

  if (!isGrouped) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: M.border }}
      >
        {selectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 cursor-pointer"
          />
        )}
        <div className="flex-1 grid grid-cols-6 gap-3 items-center">
          <span className="text-[12px] font-bold" style={{ color: M.gold }}>
            {singleOrder!.orderNumber}
          </span>
          <span className="text-[12px]" style={{ color: M.white }}>
            {singleOrder!.customerName}
          </span>
          <span className="text-[12px]" style={{ color: M.textMuted }}>
            {singleOrder!.companyName || "Individual"}
          </span>
          <span className="text-[11px] truncate" style={{ color: M.textMuted }}>
            {singleOrder!.items.map((i) => i.dishName).join(", ")}
          </span>
          <span
            className="text-[11px] font-semibold rounded px-2 py-1 text-center"
            style={{
              color: TYPE_CFG[singleOrder!.type]?.color || M.white,
              background: TYPE_CFG[singleOrder!.type]?.bg,
            }}
          >
            {singleOrder!.type}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: M.gold }}>
            {singleOrder!.totalAmount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(singleOrder!.id)}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            title="View details"
          >
            <Eye size={16} style={{ color: M.textMuted }} />
          </button>
        </div>
      </motion.div>
    );
  }

  const grouped = order as GroupedSubscriptionOrder;
  const cfg = STATUS_CFG[grouped.status];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-b overflow-hidden"
        style={{ borderColor: M.border }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {selectMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 cursor-pointer"
            />
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: M.gold }}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          <div className="flex-1 grid grid-cols-6 gap-3 items-center">
            <span className="text-[12px] font-bold" style={{ color: M.gold }}>
              {grouped.orderNumber}
            </span>
            <span className="text-[12px]" style={{ color: M.white }}>
              {grouped.customerName}
            </span>
            <span className="text-[12px]" style={{ color: M.textMuted }}>
              {grouped.companyName || "Individual"}
            </span>
            <span className="text-[11px] truncate" style={{ color: M.textMuted }}>
              {grouped.items.map((i) => i.dishName).join(", ")}
            </span>
            <span
              className="text-[11px] font-semibold rounded px-2 py-1 text-center"
              style={{
                color: TYPE_CFG[grouped.type]?.color || M.white,
                background: TYPE_CFG[grouped.type]?.bg,
              }}
            >
              {grouped.type}
            </span>
            <span className="text-[12px] font-semibold" style={{ color: M.gold }}>
              {grouped.totalAmount} × {grouped.deliveryCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-semibold"
              style={{
                color: grouped.status === "new" ? "#f5c451" : grouped.status === "delivered" ? "#22c55e" : "#ff6b6b",
                background: cfg?.bg || M.surface,
              }}
            >
              {cfg?.icon && <cfg.icon size={12} />}
              {cfg?.label || grouped.status}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-black/30 px-4 py-3 space-y-2 border-t"
              style={{ borderColor: M.border }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: M.textFaint }}>
                Delivery Dates ({grouped.deliveryCount})
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {grouped.deliveries.map((delivery, i) => (
                  <div key={i} className="flex items-center justify-between rounded px-3 py-2" style={{ background: M.surface }}>
                    <span className="text-[11px]" style={{ color: M.white }}>
                      {delivery.dateDisplay}
                    </span>
                    <button
                      onClick={() => onViewDetails(delivery.orderId)}
                      className="flex items-center gap-2 text-[10px] font-semibold rounded px-2 py-1 transition-opacity hover:opacity-70"
                      style={{ color: M.gold }}
                    >
                      {delivery.orderNumber}
                      <Eye size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
