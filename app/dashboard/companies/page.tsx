"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, ShoppingBag, TrendingUp,
  Search, Plus, ChevronRight, Filter,
  BadgeCheck, Clock, XCircle, X,
} from "lucide-react";
import { getCompanies, type Company, STATUS_DISPLAY, PLAN_COLOR } from "@/lib/companies-store";
import { C } from "@/lib/sk-theme";

/* ── Animation variants ─────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  }),
};

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, color, bg, trend }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string; trend?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      className="rounded-2xl p-5"
      style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.textMuted }}>{label}</p>
          <p className="mt-2 text-[30px] font-bold leading-none tracking-tight" style={{ color: C.text }}>{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: bg }}>
          <Icon size={20} style={{ color }} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {trend && <span className="text-[12px] font-semibold" style={{ color: C.green }}>{trend}</span>}
        <span className="text-[12px]" style={{ color: C.textMuted }}>{sub}</span>
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function CompaniesPage() {
  const router = useRouter();
  const [companies,    setCompanies]    = useState<Company[]>([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "cancelled">("all");
  const [planFilter,   setPlanFilter]   = useState("All Plans");

  useEffect(() => {
    setCompanies(getCompanies());
  }, []);

  const active     = companies.filter((c) => c.status === "active");
  const totalEmp   = companies.reduce((s, c) => s + c.employees, 0);
  const totalSpend = active.reduce((s, c) => {
    const n = parseFloat(c.monthlySpend.replace(/[£,]/g, ""));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPlan   = planFilter === "All Plans" || c.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: C.text }}>Companies</h1>
          <p className="mt-0.5 text-[13px]" style={{ color: C.textSub }}>Corporate lunch clients ordering via company HR code</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard/companies/new")}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12.5px] font-semibold shadow-sm hover:shadow-md"
          style={{ background: C.black, color: C.white }}
        >
          <Plus size={14} /> Add Company
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Total Companies"  value={companies.length} sub="registered clients"           icon={Building2}  color={C.text}  bg={C.muted}    trend="+2" />
        <StatCard label="Active Companies" value={active.length}    sub={`${companies.length - active.length} paused/cancelled`} icon={BadgeCheck} color={C.green} bg={C.greenBg} />
        <StatCard label="Total Employees"  value={totalEmp.toLocaleString()} sub="across all companies" icon={Users}       color={C.blue}  bg={C.blueBg}   trend="+45" />
        <StatCard label="Monthly Revenue"  value={`£${Math.round(totalSpend).toLocaleString()}`} sub="from active clients" icon={TrendingUp} color={C.amber} bg={C.amberBg} trend="+18%" />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div
          className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl px-4 py-2.5"
          style={{ border: `1.5px solid ${C.cardBorder}`, background: C.white }}
        >
          <Search size={14} style={{ color: C.textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, code, contact…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: C.text }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: C.textMuted }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {(["all", "active", "paused", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="rounded-xl px-3.5 py-2.5 text-[12px] font-semibold capitalize transition-all"
              style={{
                background: statusFilter === f ? C.black : C.white,
                color:      statusFilter === f ? C.white : C.textSub,
                border:     `1.5px solid ${C.cardBorder}`,
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${C.cardBorder}`, background: C.white }}>
          <Filter size={13} style={{ color: C.textMuted }} />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-transparent text-[12.5px] font-medium outline-none"
            style={{ color: C.text }}
          >
            {["All Plans","Enterprise","Business","Starter"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="overflow-hidden rounded-2xl"
        style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1.5px solid ${C.muted}` }}>
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.text }}>Company Directory</p>
            <p className="text-[12px]" style={{ color: C.textMuted }}>
              {filtered.length} {filtered.length === 1 ? "company" : "companies"} found
            </p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { color: C.green, label: "Active" },
              { color: C.yellow, label: "Paused" },
              { color: C.cardBorder, label: "Cancelled" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[11px]" style={{ color: C.textMuted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.muted}` }}>
                {["Company","Company Code","HR Contact","Employees","Active Orders","Monthly Spend","Plan","Status",""].map((h) => (
                  <th key={h}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((company, i) => {
                  const sd      = STATUS_DISPLAY[company.status as keyof typeof STATUS_DISPLAY];
                  const planCfg = PLAN_COLOR[company.plan] ?? PLAN_COLOR.Starter;
                  const StatusIcon = company.status === "active" ? BadgeCheck : company.status === "paused" ? Clock : XCircle;
                  return (
                    <motion.tr
                      key={company.id}
                      layout
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, x: 12 }}
                      className="group cursor-pointer transition-colors"
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.muted}` : "none" }}
                      onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.inputBg)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
                            style={{ background: company.logoColor, color: company.logoText }}
                          >
                            {company.logo}
                          </motion.div>
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: C.text }}>{company.name}</p>
                            <p className="text-[11px]" style={{ color: C.textMuted }}>{company.industry} · {company.city}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center rounded-lg px-3 py-1.5 font-mono text-[12px] font-bold tracking-wider"
                          style={{ background: C.muted, color: C.text, border: `1px dashed ${C.cardBorder}` }}
                        >
                          {company.code}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-[12.5px] font-medium" style={{ color: C.text }}>{company.contact}</p>
                        <p className="text-[11px]" style={{ color: C.textMuted }}>{company.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} style={{ color: C.textMuted }} />
                          <span className="text-[13px] font-semibold" style={{ color: C.text }}>{company.employees}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={13} style={{ color: C.textMuted }} />
                          <span className="text-[13px] font-semibold" style={{ color: C.text }}>{company.activeOrders}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold" style={{ color: C.text }}>{company.monthlySpend}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{ background: planCfg.bg, color: planCfg.color }}>
                          {company.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: sd.bg, color: sd.color }}
                        >
                          <StatusIcon size={10} />
                          {sd.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <motion.div
                          initial={{ x: 0, opacity: 0.3 }}
                          whileHover={{ x: 4, opacity: 1 }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ color: C.textMuted }}
                        >
                          <ChevronRight size={15} />
                        </motion.div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.muted }}>
              <Building2 size={24} style={{ color: C.textMuted }} />
            </div>
            <p className="text-[14px] font-semibold" style={{ color: C.text }}>No companies found</p>
            <p className="text-[12.5px]" style={{ color: C.textMuted }}>Try a different search or filter</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
