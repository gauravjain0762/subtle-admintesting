"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Search, ChevronLeft, ChevronRight, Eye, Ban, CheckCircle2, MoreHorizontal, X, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { DARK as M } from "@/lib/sk-theme-dark";
import { useCustomerList } from "@/lib/hooks/use-customer-list";
import type { Customer, CustomerType } from "@/lib/customers-store";
import { StatCard } from "@/components/ui/stat-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { SKToggle } from "@/components/ui/sk-toggle";
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const STATUS_FILTERS = ["All", "Active", "Blocked"];
const TYPE_FILTERS = ["All Types", "Weekly", "One-off"];

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.32, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function TypeBadge({ type }: { type: CustomerType }) {
  return (
    <span
      className="rounded-md px-2.5 py-1 text-[10.5px] font-semibold capitalize"
      style={{ background: M.surface, color: M.goldMuted, border: `1px solid ${M.border}` }}
    >
      {type}
    </span>
  );
}

function CustomerActionsMenu({ customer, onView, onToggleActive }: {
  customer: Customer; onView: () => void; onToggleActive: () => void;
}) {
  const [open, setOpen] = useState(false);
  const blockColor = customer.status === "active" ? M.red : M.green;
  return (
    <RowActionsMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          style={{ border: `1px solid ${open ? M.gold : M.border}`, color: open ? M.gold : M.textMuted }}
        >
          <MoreHorizontal size={14} />
        </button>
      }
      menuStyle={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: 170 }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onView(); setOpen(false); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
        style={{ color: "#aaaaaa" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <Eye size={13} /> View Profile
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleActive(); setOpen(false); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
        style={{ color: blockColor }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {customer.status === "active" ? (<><Ban size={13} /> Block</>) : (<><CheckCircle2 size={13} /> Activate</>)}
      </button>
    </RowActionsMenu>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const {
    customers, total, totalPages, loading, currentPage, setCurrentPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    companyFilter, setCompanyFilter, companyOptions, totalCompanies,
    toggleActive, pageSize,
  } = useCustomerList();

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Customer Management</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>{total} total customers across all companies and workspaces</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <StatCard label="Total Customers" value={total} icon={Users} accent={M.gold} />
        <StatCard label="Total Companies" value={totalCompanies} icon={Building2} accent={M.green} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1"
      >
        <div className="flex flex-none flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-all"
              style={{
                background: statusFilter === f ? M.gold : M.panel,
                color: statusFilter === f ? "#000000" : M.textMuted,
                border: `1px solid ${statusFilter === f ? M.gold : M.border}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <FilterSelect value={typeFilter} options={TYPE_FILTERS} onChange={setTypeFilter} minWidth={110} />

        <FilterSelect value={companyFilter} options={companyOptions} onChange={setCompanyFilter} minWidth={150} />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="overflow-hidden rounded-xl"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2.5 px-6 py-4" style={{ borderBottom: `1px solid ${M.border}` }}>
          <div
            className="flex min-w-[280px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2 sm:max-w-[480px] sm:flex-none"
            style={{ border: `1px solid ${M.border}`, background: M.surface }}
          >
            <Search size={14} style={{ color: M.textFaint }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or email"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: M.white }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{ color: M.textMuted }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                style={{
                  background: p === currentPage ? M.gold : "transparent",
                  color: p === currentPage ? "#000000" : M.textMuted,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{ color: M.textMuted }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {["Customer", "Company", "Type", "Orders", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeletonRows rows={pageSize} columns={6} /> : customers.map((c, i) => (
                <motion.tr
                  key={c.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: i < customers.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  onClick={() => router.push(`/dashboard/customers/detail?id=${c.id}`)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
                        style={{ background: c.logoColor, color: c.logoText }}
                      >
                        {c.initials}
                      </motion.div>
                      <span className="text-[12.5px] font-semibold" style={{ color: M.white }}>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {c.companyName ? (
                      <>
                        <span className="text-[12.5px] font-medium" style={{ color: "#cccccc" }}>{c.companyName}</span>
                        {c.companyCode && (
                          <div className="mt-1 text-[10.5px]" style={{ color: M.textMuted }}>{c.companyCode}</div>
                        )}
                      </>
                    ) : (
                      <span className="text-[12px] italic" style={{ color: M.textFaint }}>Individual</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <TypeBadge type={c.type} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-bold" style={{ color: M.gold }}>{c.orderCount}</span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <SKToggle on={c.status === "active"} onChange={() => toggleActive(c)} size="sm" stopPropagation color={M.gold} borderColor={M.gold} />
                      <span className="text-[11.5px] font-semibold" style={{ color: c.status === "active" ? M.gold : M.textMuted }}>
                        {c.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <CustomerActionsMenu
                      customer={c}
                      onView={() => router.push(`/dashboard/customers/detail?id=${c.id}`)}
                      onToggleActive={() => toggleActive(c)}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && customers.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <Users size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No customers found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>Try a different search or filter</p>
          </div>
        )}

        {/* Pagination summary */}
        <div
          className="flex items-center px-5 py-3.5"
          style={{ borderTop: `1px solid ${M.border}` }}
        >
          <span className="text-[12px]" style={{ color: M.textMuted }}>
            Showing {rangeStart}–{rangeEnd} of {total} customers
          </span>
        </div>
      </motion.div>
    </div>
  );
}
