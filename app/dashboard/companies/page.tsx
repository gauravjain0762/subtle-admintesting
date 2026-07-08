"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, ShoppingBag, TrendingUp,
  Search, Eye, Sparkles, MoreVertical,
  BadgeCheck, XCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import { getCompanies, generateCompanyCode, setCompanyStatus, type Company } from "@/lib/companies-store";
import { employeeRangeLabel } from "@/lib/enquiries-store";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette ── */
const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  borderFaint: "#131313",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  red: "#ff6b6b",
};

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active:   { label: "Active",   color: M.green, icon: BadgeCheck },
  inactive: { label: "Inactive", color: M.red,   icon: XCircle },
};

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

/* ── Stat card (mentor style: left accent bar) ── */
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number;
  icon: React.ElementType; accent: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="rounded-lg p-5"
      style={{ background: M.panel, border: `1px solid ${M.border}`, borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: M.textFaint }}>{label}</p>
          <p className="mt-3 text-[28px] font-bold leading-none" style={{ color: M.white }}>{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: M.surface }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function CompaniesPage() {
  const router = useRouter();
  const [companies,    setCompanies]    = useState<Company[]>([]);
  const [search,       setSearch]       = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);

  useEffect(() => {
    setCompanies(getCompanies());
  }, []);

  const handleSetStatus = (company: Company, status: Company["status"]) => {
    setCompanyStatus(company.id, status);
    setCompanies(getCompanies());
    setOpenMenuId(null);
    toast.success(`"${company.name}" marked ${status}`);
  };

  const handleGenerateCode = async (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingId(company.id);
    try {
      const code = await generateCompanyCode(company.id);
      setCompanies(getCompanies());
      toast.success(`Code generated for "${company.name}": ${code}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const active     = companies.filter((c) => c.status === "active");
  const totalEmp   = companies.reduce((s, c) => s + c.employees, 0);
  const totalSpend = active.reduce((s, c) => {
    const n = parseFloat(c.monthlySpend.replace(/[£,]/g, ""));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return !search ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
  });

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Company List</h1>
        <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>Corporate lunch clients ordering via company HR code</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Total Companies"  value={companies.length} icon={Building2}  accent={M.textMuted} />
        <StatCard label="Active Companies" value={active.length}    icon={BadgeCheck} accent={M.green} />
        <StatCard label="Total Employees"  value={totalEmp.toLocaleString()} icon={Users}       accent={M.gold} />
        <StatCard label="Monthly Revenue"  value={`£${Math.round(totalSpend).toLocaleString()}`} icon={TrendingUp} accent={M.gold} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div
          className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5"
          style={{ border: `1px solid ${M.border}`, background: M.panel }}
        >
          <Search size={14} style={{ color: M.textFaint }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, code, contact…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: M.white }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="overflow-hidden rounded-xl"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${M.border}` }}>
          <p className="text-[13px] font-bold" style={{ color: M.white }}>Company Directory</p>
          <p className="text-[11.5px]" style={{ color: M.textMuted }}>
            {filtered.length} {filtered.length === 1 ? "company" : "companies"} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {["Company","Company Code","HR Contact","Employees","Active Orders","Monthly Spend","Status","Actions"].map((h) => (
                  <th key={h}
                    className="whitespace-nowrap px-5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((company, i) => {
                  const sd = STATUS_CFG[company.status] ?? STATUS_CFG.active;
                  const StatusIcon = sd.icon;
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
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}
                      onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
                            style={{ background: company.logoColor, color: company.logoText }}
                          >
                            {company.logo}
                          </motion.div>
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: M.white }}>{company.name}</p>
                            <p className="text-[10.5px]" style={{ color: M.textMuted }}>{company.industry} · {company.city}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {company.code ? (
                          <span
                            className="inline-flex items-center rounded-md px-3 py-1.5 font-mono text-[11.5px] font-bold tracking-wider"
                            style={{ background: M.surface, color: M.gold, border: `1px dashed ${M.border}` }}
                          >
                            {company.code}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleGenerateCode(company, e)}
                            disabled={generatingId === company.id}
                            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-60"
                            style={{ border: `1px solid ${M.gold}`, color: M.gold, background: "transparent" }}
                            onMouseEnter={(e) => { if (generatingId !== company.id) { (e.currentTarget as HTMLElement).style.background = M.gold; (e.currentTarget as HTMLElement).style.color = "#000000"; } }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                          >
                            {generatingId === company.id ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Generating…
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} /> Generate Code
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold" style={{ color: "#cccccc" }}>{company.contact}</p>
                        <p className="text-[10.5px]" style={{ color: M.textFaint }}>{company.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5" title={`${company.employees} employees`}>
                          <Users size={13} style={{ color: M.textFaint }} />
                          <span className="text-[13px] font-semibold" style={{ color: M.white }}>{employeeRangeLabel(company.employees)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={13} style={{ color: M.textFaint }} />
                          <span className="text-[13px] font-semibold" style={{ color: M.white }}>{company.activeOrders}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold" style={{ color: M.gold }}>{company.monthlySpend}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10.5px] font-bold"
                          style={{ border: `1px solid ${sd.color}`, color: sd.color }}
                        >
                          <StatusIcon size={10} />
                          {sd.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenMenuId((v) => (v === company.id ? null : company.id))}
                            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
                            aria-label="Actions"
                          >
                            <MoreVertical size={14} />
                          </button>

                          <AnimatePresence>
                            {openMenuId === company.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                transition={{ duration: 0.14 }}
                                className="absolute right-0 top-[calc(100%+6px)] z-[90] min-w-[170px] rounded-lg p-1.5"
                                style={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                              >
                                <button
                                  onClick={() => { setOpenMenuId(null); router.push(`/dashboard/companies/${company.id}`); }}
                                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                                  style={{ color: "#aaaaaa" }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#aaaaaa"; }}
                                >
                                  <Eye size={13} /> View
                                </button>

                                <div className="my-1 h-px" style={{ background: M.border }} />
                                {(["active", "inactive"] as const)
                                  .filter((s) => s !== company.status)
                                  .map((s) => {
                                    const cfg = STATUS_CFG[s];
                                    const SIcon = cfg.icon;
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => handleSetStatus(company, s)}
                                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                                        style={{ color: cfg.color }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                                      >
                                        <SIcon size={13} /> {cfg.label}
                                      </button>
                                    );
                                  })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <Building2 size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No companies found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>Try a different search or filter</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
