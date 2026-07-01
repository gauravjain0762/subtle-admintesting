"use client";

import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const DELIVERIES = [
  { id: "DEL-0182", order: "#ORD-4820", customer: "James Thompson",  address: "12 Baker St, London W1U 3BW",      eta: "12:30pm", driver: "Ali Hassan",  status: "in-transit", progress: 65 },
  { id: "DEL-0183", order: "#ORD-4819", customer: "Priya Kapoor",    address: "47 Canary Wharf, London E14 5AB",  eta: "12:45pm", driver: "Tom Wright",  status: "preparing",  progress: 20 },
  { id: "DEL-0184", order: "#ORD-4818", customer: "Acme Corp.",       address: "1 Financial St, London EC2V 8RT",  eta: "11:45am", driver: "Sara Ali",    status: "delivered",  progress: 100 },
  { id: "DEL-0185", order: "#ORD-4821", customer: "Sarah Mitchell",  address: "33 Notting Hill Gate, London W11", eta: "12:00pm", driver: "Mark Davis",  status: "delivered",  progress: 100 },
  { id: "DEL-0186", order: "#ORD-4816", customer: "Emma Clarke",     address: "78 Kings Road, London SW3 4NX",    eta: "13:00pm", driver: "James Park",  status: "in-transit", progress: 40 },
  { id: "DEL-0187", order: "#ORD-4814", customer: "TechLondon Ltd",  address: "150 Aldersgate St, London EC1A",   eta: "13:15pm", driver: "Li Wei",      status: "preparing",  progress: 10 },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; bar: string }> = {
  delivered:    { label: "Delivered",  color: "#2d6a2d", bg: "#edf7ed", icon: CheckCircle2, bar: "#2d6a2d" },
  "in-transit": { label: "In Transit", color: "#0a3d8f", bg: "#e8f0fe", icon: Truck,        bar: "#f5d800" },
  preparing:    { label: "Preparing",  color: "#7a5a00", bg: "#fffce0", icon: Package,       bar: "#e8e0cc" },
  failed:       { label: "Failed",     color: "#b83232", bg: "#fef2f2", icon: AlertCircle,   bar: "#b83232" },
};

const SUMMARY = [
  { label: "Total Today",  key: "all",         icon: Truck,        color: "#0a0a0a", bg: "#f0e9d6" },
  { label: "Delivered",    key: "delivered",   icon: CheckCircle2, color: "#2d6a2d", bg: "#edf7ed" },
  { label: "In Transit",   key: "in-transit",  icon: MapPin,       color: "#0a3d8f", bg: "#e8f0fe" },
  { label: "Preparing",    key: "preparing",   icon: Clock,        color: "#7a5a00", bg: "#fffce0" },
];

export default function DeliveriesPage() {
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
          <h1 className="text-[22px] font-bold" style={{ color: "#0a0a0a" }}>Deliveries</h1>
          <p className="text-[13px]" style={{ color: "#6b6b5a" }}>Live delivery tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-2 w-2 rounded-full"
            style={{ background: "#22c55e" }}
          />
          <span className="text-[12px] font-medium" style={{ color: "#6b6b5a" }}>
            {DELIVERIES.filter((d) => d.status === "in-transit").length} active deliveries
          </span>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SUMMARY.map((s, i) => {
          const SIcon = s.icon;
          const count = s.key === "all"
            ? DELIVERIES.length
            : DELIVERIES.filter((d) => d.status === s.key).length;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
                  {s.label}
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: s.bg }}>
                  <SIcon size={15} style={{ color: s.color }} />
                </div>
              </div>
              <p className="mt-2 text-[28px] font-bold leading-none" style={{ color: s.color }}>{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Delivery cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DELIVERIES.map((del, i) => {
          const cfg = STATUS_CFG[del.status];
          const SIcon = cfg.icon;
          return (
            <motion.div
              key={del.id}
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: "0 14px 40px rgba(0,0,0,0.09)" }}
              className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-semibold" style={{ color: "#9b9b89" }}>
                    {del.id} · {del.order}
                  </p>
                  <p className="text-[14.5px] font-bold" style={{ color: "#0a0a0a" }}>{del.customer}</p>
                </div>
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <SIcon size={10} /> {cfg.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#f0e9d6" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${del.progress}%` }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: cfg.bar }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10.5px]" style={{ color: "#9b9b89" }}>
                  <span>Kitchen</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Details grid */}
              <div
                className="mt-4 grid grid-cols-2 gap-3 rounded-xl p-3"
                style={{ background: "#fdf8ec" }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>Address</p>
                  <p className="mt-0.5 text-[11.5px] font-medium leading-snug" style={{ color: "#0a0a0a" }}>{del.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>ETA</p>
                  <p className="mt-0.5 text-[12px] font-bold" style={{ color: "#0a0a0a" }}>{del.eta}</p>
                  <p className="text-[10.5px]" style={{ color: "#9b9b89" }}>Driver: {del.driver}</p>
                </div>
              </div>

              {del.status !== "delivered" && (
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toast.success(`Contacting driver ${del.driver}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11.5px] font-semibold transition-colors hover:bg-[#f0e9d6]"
                    style={{ border: "1.5px solid #e8e0cc", color: "#6b6b5a" }}
                  >
                    Contact Driver
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toast.success(`Tracking ${del.id} live`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11.5px] font-semibold"
                    style={{ background: "#0a0a0a", color: "#f5d800" }}
                  >
                    <MapPin size={11} /> Track Live
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
