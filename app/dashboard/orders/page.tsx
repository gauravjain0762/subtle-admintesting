"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, Eye, X, ClipboardList, CheckCircle2, Sparkles, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getOrders, getAllOrders, bulkUpdateStatus, groupSubscriptionOrders, STATUS_CFG,
  type Order, type OrderStatus, type OrderType,
} from "@/lib/orders-store";
import { getCompanies, type Company } from "@/lib/companies-store";
import { ApiError } from "@/lib/api/client";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { GroupedOrderRow } from "@/components/orders/grouped-order-row";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette (matches companies/page.tsx) ── */
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
  amber: "#f5c451",
  red: "#ff6b6b",
};

const STATUS_FILTERS = ["All", "New", "Delivered", "Cancelled"];
const TYPE_FILTERS   = ["All Types", "Weekly", "One-time", "One-Day Off"];
const DAY_FILTERS    = ["All Time", "Today", "Yesterday", "Last 7 Days", "Custom Date"];
const ALL_COMPANIES  = "All Companies";
const PAGE_SIZE      = 10;

const DAY_FILTER_PARAM: Record<string, "today" | "yesterday" | "last7days" | "custom" | undefined> = {
  "All Time": undefined,
  "Today": "today",
  "Yesterday": "yesterday",
  "Last 7 Days": "last7days",
  "Custom Date": "custom",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: M.amber,
  delivered: M.green,
  cancelled: M.red,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.32, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

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

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  const SIcon = cfg.icon;
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10.5px] font-bold"
      style={{ border: `1px solid ${color}`, color }}
    >
      <SIcon size={10} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: OrderType }) {
  const displayType = type === "one-off" ? "One-Day Off" : type === "one-time" ? "One-time" : type === "weekly" ? "Weekly" : type;
  return (
    <span
      className="rounded-md px-2.5 py-1 text-[10.5px] font-semibold capitalize"
      style={{ background: M.surface, color: M.goldMuted, border: `1px solid ${M.border}` }}
    >
      {displayType}
    </span>
  );
}

function FilterSelect({ value, options, onChange, minWidth }: {
  value: string; options: string[]; onChange: (v: string) => void; minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <RowActionsMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-none items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-medium transition-colors"
          style={{ border: `1px solid ${open ? M.gold : M.border}`, background: M.panel, color: M.white, minWidth }}
        >
          {value}
          <ChevronDown size={13} style={{ color: M.textFaint, flexShrink: 0 }} />
        </button>
      }
      menuStyle={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: minWidth ?? 160 }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => { onChange(opt); setOpen(false); }}
          className="flex w-full items-center whitespace-nowrap rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
          style={{ color: opt === value ? M.gold : "#aaaaaa", background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          {opt}
        </button>
      ))}
    </RowActionsMenu>
  );
}

/** Native <input type="date"> renders its placeholder/value in the browser's own locale format (often dd-mm-yyyy),
 *  which HTML's `lang` attribute cannot override. This shows our own MM/DD/YYYY text while a fully-transparent
 *  native date input spans the whole box, so clicking anywhere (not just the calendar icon) opens the real picker. */
function DateField({ value, onChange, min }: { value: string; onChange: (v: string) => void; min?: string }) {
  const display = value ? (() => { const [y, m, d] = value.split("-"); return `${m}/${d}/${y}`; })() : null;
  return (
    <div
      className="relative flex-none rounded-lg"
      style={{ border: `1px solid ${M.border}`, background: M.panel }}
    >
      <div className="px-3.5 py-2 text-[12px] font-medium" style={{ color: display ? M.white : M.textFaint }}>
        {display ?? "MM/DD/YYYY"}
      </div>
      <input
        type="date"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

function itemsLabel(order: Order): string {
  if (order.items.length === 0) return "—";
  if (order.items.length === 1) {
    const it = order.items[0];
    return it.quantity > 1 ? `${it.dishName} ×${it.quantity}` : it.dishName;
  }
  return order.items.map((it) => `${it.dishName}${it.quantity > 1 ? ` ×${it.quantity}` : ""}`).join(", ");
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter]     = useState("All Types");
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const [dayFilter, setDayFilter]     = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate]     = useState("");
  const [companies, setCompanies]     = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectMode, setSelectMode]   = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [todayStats, setTodayStats]   = useState({ total: 0, new: 0, delivered: 0 });
  const [refreshKey, setRefreshKey]   = useState(0);
  const [exporting, setExporting]     = useState(false);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load companies"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, companyFilter, dayFilter, customStartDate, customEndDate]);

  const refreshTodayStats = () => {
    getAllOrders({ dayFilter: "today" })
      .then((list) => setTodayStats({
        total: list.length,
        new: list.filter((o) => o.status === "new").length,
        delivered: list.filter((o) => o.status === "delivered").length,
      }))
      .catch(() => {});
  };

  useEffect(() => { refreshTodayStats(); }, [refreshKey]);

  useEffect(() => {
    setLoading(true);
    const companyId = companyFilter === ALL_COMPANIES ? undefined : companies.find((c) => c.name === companyFilter)?.id;
    getOrders({
      page: currentPage,
      limit: PAGE_SIZE,
      status: statusFilter === "All" ? undefined : (statusFilter.toLowerCase() as OrderStatus),
      type: typeFilter === "All Types" ? undefined : (typeFilter === "One-time" ? "one-time" : typeFilter === "One-Day Off" ? "one-off" : typeFilter.toLowerCase() as OrderType),
      workspaceId: companyId,
      dayFilter: DAY_FILTER_PARAM[dayFilter],
      startDate: dayFilter === "Custom Date" ? customStartDate : undefined,
      endDate: dayFilter === "Custom Date" ? (customEndDate || customStartDate) : undefined,
      search: debouncedSearch || undefined,
    })
      .then((res) => { setOrders(res.orders); setTotal(res.total); setTotalPages(res.totalPages); })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [currentPage, statusFilter, typeFilter, companyFilter, dayFilter, customStartDate, customEndDate, debouncedSearch, companies, refreshKey]);

  const companyOptions = [ALL_COMPANIES, ...companies.map((c) => c.name)];

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMarkClick = (status: "delivered" | "cancelled") => {
    if (!selectMode) { setSelectMode(true); return; }
    if (selectedIds.size === 0) { exitSelectMode(); return; }
    const ids = [...selectedIds];
    bulkUpdateStatus(ids, status)
      .then((updatedCount) => {
        setSelectedIds(new Set());
        setSelectMode(false);
        setRefreshKey((k) => k + 1);
        toast.success(`${updatedCount} order${updatedCount > 1 ? "s" : ""} marked as ${STATUS_CFG[status].label}`);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to update orders"));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const escapeCsv = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const companyId = companyFilter === ALL_COMPANIES ? undefined : companies.find((c) => c.name === companyFilter)?.id;
      const list = await getAllOrders({
        status: statusFilter === "All" ? undefined : (statusFilter.toLowerCase() as OrderStatus),
        type: typeFilter === "All Types" ? undefined : (typeFilter === "One-time" ? "one-time" : typeFilter === "One-Day Off" ? "one-off" : typeFilter.toLowerCase() as OrderType),
        workspaceId: companyId,
        dayFilter: DAY_FILTER_PARAM[dayFilter],
        startDate: dayFilter === "Custom Date" ? customStartDate : undefined,
        endDate: dayFilter === "Custom Date" ? (customEndDate || customStartDate) : undefined,
        search: debouncedSearch || undefined,
      });
      const header = ["Order ID", "Customer", "Company", "Dish(es)", "Type", "Amount", "Status", "Date"];
      const rows = list.map((o) => [
        o.orderNumber,
        o.customerName,
        o.companyName ?? "Individual",
        itemsLabel(o),
        o.type,
        o.totalAmount,
        STATUS_CFG[o.status]?.label ?? o.status,
        o.deliveryDateDisplay,
      ]);
      const csv = [header, ...rows].map((r) => r.map((v) => escapeCsv(String(v))).join(",")).join("\r\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${list.length} order${list.length !== 1 ? "s" : ""} as CSV`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const stats = [
    { label: "Today's Orders", value: todayStats.total,     icon: ClipboardList, accent: M.gold },
    { label: "New",            value: todayStats.new,       icon: Sparkles,     accent: M.amber },
    { label: "Delivered",      value: todayStats.delivered, icon: CheckCircle2, accent: M.green },
  ];

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

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
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Orders</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>{total} total orders across all companies and customers</p>
        </div>
        <motion.button
          whileHover={{ scale: exporting ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold disabled:opacity-60"
          style={{ background: M.gold, color: "#000000" }}
        >
          <Download size={13} /> {exporting ? "Exporting…" : "Export CSV"}
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
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

        <FilterSelect value={dayFilter} options={DAY_FILTERS} onChange={setDayFilter} minWidth={130} />

        {dayFilter === "Custom Date" && (
          <>
            <DateField value={customStartDate} onChange={setCustomStartDate} />
            <span className="text-[12px]" style={{ color: M.textFaint }}>to</span>
            <DateField value={customEndDate} onChange={setCustomEndDate} min={customStartDate || undefined} />
          </>
        )}
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
          <button
            title={selectMode ? `Mark ${selectedIds.size} selected as Delivered` : "Select orders to mark as Delivered"}
            onClick={() => handleMarkClick("delivered")}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.green}`, color: M.green, background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.green; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.green; }}
          >
            <CheckCircle2 size={14} /> Mark as Delivered
          </button>
          <button
            title={selectMode ? `Mark ${selectedIds.size} selected as Cancelled` : "Select orders to mark as Cancelled"}
            onClick={() => handleMarkClick("cancelled")}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.red}`, color: M.red, background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.red; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.red; }}
          >
            <Ban size={14} /> Mark as Cancel
          </button>

          <div
            className="flex min-w-[280px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2 sm:max-w-[480px] sm:flex-none"
            style={{ border: `1px solid ${M.border}`, background: M.surface }}
          >
            <Search size={14} style={{ color: M.textFaint }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order by company code and customer name"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: M.white }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
                <X size={13} />
              </button>
            )}
          </div>

          {selectMode && (
            <>
              <span className="text-[11.5px] font-semibold whitespace-nowrap" style={{ color: M.textMuted }}>
                {selectedIds.size} selected
              </span>
              <button
                title="Cancel selection"
                onClick={exitSelectMode}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
              >
                <X size={14} />
              </button>
            </>
          )}

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

        <div>
          {/* Group subscription orders */}
          {orders.length > 0 && (
            <div className="space-y-1">
              {groupSubscriptionOrders(orders).map((order, i) => (
                <GroupedOrderRow
                  key={"deliveries" in order ? order.subscriptionId : order.id}
                  order={order}
                  onViewDetails={(orderId) => router.push(`/dashboard/orders/detail?id=${orderId}`)}
                  selectMode={selectMode}
                  isSelected={"deliveries" in order ? selectedIds.has(order.subscriptionId) : selectedIds.has(order.id)}
                  onToggleSelect={() => toggleSelected("deliveries" in order ? order.subscriptionId : order.id)}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <ClipboardList size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No orders found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>Try a different search or filter</p>
          </div>
        )}

        {/* Pagination summary */}
        <div
          className="flex items-center px-5 py-3.5"
          style={{ borderTop: `1px solid ${M.border}` }}
        >
          <span className="text-[12px]" style={{ color: M.textMuted }}>
            Showing {rangeStart}–{rangeEnd} of {total} orders
          </span>
        </div>
      </motion.div>
    </div>
  );
}