"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, CircleCheck,
  Search, Eye, Edit2, Trash2, MoreVertical,
  BadgeCheck, XCircle, X, Users, Check,
} from "lucide-react";
import { toast } from "sonner";
import { getDishes, toggleDishAvailable, deleteDish, type Dish } from "@/lib/menu-store";
import { getMenus, type Menu } from "@/lib/menus-store";
import { fetchCompanies, assignDishToCompanies, getAssignedCompanies, type Company } from "@/lib/api/companies";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { BulkDeleteDialog } from "@/components/ui/bulk-delete-dialog";
import { ApiError } from "@/lib/api/client";

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
  red: "#ff6b6b",
};

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  available:   { label: "Available",   color: M.green, icon: BadgeCheck },
  unavailable: { label: "Unavailable", color: M.red,   icon: XCircle },
};

/* ── Animation variants ─────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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

/* ── Assign Companies Dialog ────────────────────────────────────── */
function AssignDialog({
  dish,
  companies,
  selectedCompanies,
  onToggleCompany,
  onSave,
  onCancel,
  loading
}: {
  dish: Dish;
  companies: Company[];
  selectedCompanies: Set<string>;
  onToggleCompany: (companyId: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 ${montserrat.className}`}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[650px] rounded-xl p-7 max-h-[80vh] overflow-y-auto"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#1a2a4a" }}>
          <Users size={20} style={{ color: M.gold }} />
        </div>
        <h2 className="text-[16px] font-bold" style={{ color: M.white }}>Assign to Companies</h2>
        <p className="mt-2 text-[13px]" style={{ color: M.textMuted }}>
          Select companies that should have access to <span className="font-semibold" style={{ color: M.white }}>{dish.name}</span>
        </p>

        {/* Companies List */}
        <div className="mt-5 space-y-2">
          {companies.length === 0 ? (
            <p className="py-6 text-center text-[13px]" style={{ color: M.textMuted }}>No companies available</p>
          ) : (
            companies.map((company) => (
              <motion.div
                key={company._id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 rounded-lg p-3.5 cursor-pointer transition-colors"
                style={{ background: M.surface, border: `1px solid ${selectedCompanies.has(company._id) ? M.gold : M.border}` }}
                onClick={() => onToggleCompany(company._id)}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ border: `1.5px solid ${selectedCompanies.has(company._id) ? M.gold : M.border}`, background: selectedCompanies.has(company._id) ? M.gold : "transparent" }}>
                  {selectedCompanies.has(company._id) && <Check size={12} color="#000000" />}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: M.white }}>{company.name}</p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px]" style={{ color: M.textMuted }}>Code: <span style={{ color: M.gold }}>{company.code}</span></span>
                    <span className="text-[11px]" style={{ color: M.textFaint }}>•</span>
                    <span className="text-[11px]" style={{ color: M.textMuted }}>{company.town}, {company.city}</span>
                    <span className="text-[11px]" style={{ color: M.textFaint }}>•</span>
                    <span className="text-[11px]" style={{ color: M.textMuted }}>{company.postcode}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 border-t" style={{ borderColor: M.border, paddingTop: "1.5rem" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold disabled:opacity-60 transition-colors"
            style={{ background: M.gold, color: "#000000" }}
          >
            {loading ? "Saving..." : `Assign to ${selectedCompanies.size} Companies`}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Delete dialog ──────────────────────────────────────────────── */
function DeleteDialog({ dish, onConfirm, onCancel }: { dish: Dish; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 ${montserrat.className}`}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[400px] rounded-xl p-7"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#2a0a0a" }}>
          <Trash2 size={20} style={{ color: M.red }} />
        </div>
        <h2 className="text-[16px] font-bold" style={{ color: M.white }}>Delete dish?</h2>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: M.textMuted }}>
          <span className="font-semibold" style={{ color: M.white }}>{dish.name}</span>{" "}
          will be permanently removed from the menu. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: M.red, color: "#000000" }}
          >
            Delete dish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function MenuPage() {
  const router = useRouter();
  const [dishes,       setDishes]       = useState<Dish[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [menus,        setMenus]        = useState<Menu[]>([]);
  const [menuFilter,   setMenuFilter]   = useState<"all" | "standard" | "custom">("all");
  const [search,       setSearch]       = useState("");
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [workingId,    setWorkingId]    = useState<string | null>(null);
  const [selectMode,   setSelectMode]   = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [bulkConfirm,  setBulkConfirm]  = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Dish | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [assignLoading, setAssignLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    getDishes()
      .then(setDishes)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load dishes"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    refresh();
    setMenus(getMenus());
  }, []);

  const handleAssignClick = async (dish: Dish) => {
    setAssignTarget(dish);
    setSelectedCompanies(new Set());
    try {
      const companiesData = await fetchCompanies();
      setCompanies(companiesData);
      // Fetch already assigned companies for this dish
      const assigned = await getAssignedCompanies(dish.id);
      setSelectedCompanies(new Set(assigned.map((c) => c._id)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load companies");
      setAssignTarget(null);
    }
  };

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  };

  const handleAssignSave = async () => {
    if (!assignTarget || selectedCompanies.size === 0) {
      toast.error("Please select at least one company");
      return;
    }
    setAssignLoading(true);
    try {
      const companyIds = Array.from(selectedCompanies);
      await assignDishToCompanies(assignTarget.id, companyIds);
      toast.success(`"${assignTarget.name}" assigned to ${selectedCompanies.size} companies`);
      setAssignTarget(null);
      setSelectedCompanies(new Set());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign companies");
    } finally {
      setAssignLoading(false);
    }
  };

  const menuTypeOf = (menuId: string): "standard" | "custom" =>
    menus.find((m) => m.id === menuId)?.isDefault ? "standard" : "custom";

  const filtered = dishes.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !search || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchMenu = menuFilter === "all" || menuTypeOf(d.menuId ?? "standard") === menuFilter;
    return matchSearch && matchMenu;
  });

  const available   = dishes.filter((d) => d.available);
  const unavailable = dishes.filter((d) => !d.available);

  const handleToggle = async (dish: Dish) => {
    setOpenMenuId(null);
    setWorkingId(dish.id);
    try {
      const next = await toggleDishAvailable(dish.id);
      refresh();
      toast.success(`"${dish.name}" marked ${next ? "available" : "unavailable"}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update dish");
    } finally {
      setWorkingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setWorkingId(deleteTarget.id);
    try {
      await deleteDish(deleteTarget.id);
      refresh();
      toast.error(`"${deleteTarget.name}" removed from menu`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete dish");
    } finally {
      setWorkingId(null);
      setDeleteTarget(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteIconClick = () => {
    if (!selectMode) { setSelectMode(true); return; }
    if (selectedIds.size === 0) { exitSelectMode(); return; }
    setBulkConfirm(true);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const ids = [...selectedIds];
      await Promise.all(ids.map((id) => deleteDish(id)));
      toast.error(`${ids.length} dish${ids.length > 1 ? "es" : ""} removed from menu`);
      exitSelectMode();
      setBulkConfirm(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete some dishes");
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Standard Menu</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>Dishes available across standard and custom menus</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard/menu/new")}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors"
          style={{ border: `1.5px solid ${M.gold}`, color: M.gold, background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.gold; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.gold; }}
        >
          <UtensilsCrossed size={13} /> Add Menu
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard label="Total Dishes" value={dishes.length}       icon={UtensilsCrossed} accent={M.textMuted} />
        <StatCard label="Available"    value={available.length}   icon={CircleCheck}     accent={M.green} />
        <StatCard label="Unavailable"  value={unavailable.length} icon={XCircle}         accent={M.red} />
      </motion.div>

      {/* Menu type filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex overflow-hidden rounded-lg border w-fit"
        style={{ borderColor: M.goldFaint }}
      >
        {(["all", "standard", "custom"] as const).map((v, i) => (
          <button
            key={v}
            onClick={() => setMenuFilter(v)}
            className="px-4 py-2 text-[11.5px] font-bold whitespace-nowrap transition-colors"
            style={{
              background: menuFilter === v ? M.gold : "transparent",
              color:      menuFilter === v ? "#000000" : M.gold,
              borderRight: i < 2 ? `1px solid rgba(248,227,150,0.2)` : "none",
            }}
            onMouseEnter={(e) => { if (menuFilter !== v) (e.currentTarget as HTMLElement).style.background = "rgba(248,227,150,0.08)"; }}
            onMouseLeave={(e) => { if (menuFilter !== v) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {v === "all" ? "All" : v === "standard" ? "Standard Menu" : "Custom Menu"}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-wrap items-center gap-3"
      >
        <button
          title={selectMode ? `Delete ${selectedIds.size} selected` : "Select dishes to delete"}
          onClick={handleDeleteIconClick}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ border: `1px solid ${M.red}`, color: M.red, background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.red; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.red; }}
        >
          <Trash2 size={15} />
        </button>

        <div
          className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5"
          style={{ border: `1px solid ${M.border}`, background: M.panel }}
        >
          <Search size={14} style={{ color: M.textFaint }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes or category…"
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
          <p className="text-[13px] font-bold" style={{ color: M.white }}>Dish Directory</p>
          <p className="text-[11.5px]" style={{ color: M.textMuted }}>
            {filtered.length} {filtered.length === 1 ? "dish" : "dishes"} found
          </p>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {[...(selectMode ? [""] : []), "Dish", "Category", "Price", "Nutrition", "Menu Type", "Status", "Actions"].map((h, i) => (
                  <th key={i}
                    className="whitespace-nowrap px-5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((dish, i) => {
                  const sd = STATUS_CFG[dish.available ? "available" : "unavailable"];
                  const StatusIcon = sd.icon;
                  const type = menuTypeOf(dish.menuId ?? "standard");
                  return (
                    <motion.tr
                      key={dish.id}
                      layout
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, x: 12 }}
                      className="group cursor-pointer transition-colors"
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${M.borderFaint}` : "none" }}
                      onClick={() => router.push(`/dashboard/menu/edit?id=${dish.id}`)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                    >
                      {selectMode && (
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(dish.id)}
                            onChange={() => toggleSelected(dish.id)}
                            className="h-4 w-4 cursor-pointer accent-[#f8e396]"
                          />
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                            style={{ background: M.surface, border: `1px solid ${M.border}` }}
                          >
                            {dish.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={dish.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <UtensilsCrossed size={14} style={{ color: M.textFaint }} />
                            )}
                          </motion.div>
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: M.white }}>{dish.name}</p>
                            <p className="text-[10.5px]" style={{ color: M.textMuted }}>
                              {dish.orders} orders · ★ {dish.rating}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[12px] font-semibold" style={{ color: "#cccccc" }}>{dish.category}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold" style={{ color: M.gold }}>£{dish.price}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[12px]" style={{ color: "#cccccc" }}>{dish.kcal} kcal</span>
                        <span className="mx-1" style={{ color: M.textFaint }}>·</span>
                        <span className="text-[12px]" style={{ color: "#cccccc" }}>{dish.protein}g protein</span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center rounded-md px-2.5 py-1 text-[10.5px] font-bold"
                          style={{ border: `1px solid ${M.goldFaint}`, color: M.gold }}
                        >
                          {type === "standard" ? "Standard" : "Custom"}
                        </span>
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
                        <div className="flex items-center gap-2">
                          {menuTypeOf(dish.menuId ?? "standard") === "custom" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); handleAssignClick(dish); }}
                              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                              style={{ border: `1px solid ${M.gold}`, color: M.gold, background: "transparent" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.gold; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                            >
                              <Users size={12} /> Assign
                            </motion.button>
                          )}
                          <RowActionsMenu
                            open={openMenuId === dish.id}
                            onOpenChange={(v) => setOpenMenuId(v ? dish.id : null)}
                            menuStyle={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                            trigger={
                              <button
                                onClick={() => setOpenMenuId((v) => (v === dish.id ? null : dish.id))}
                                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                                style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
                                aria-label="Actions"
                              >
                                <MoreVertical size={14} />
                              </button>
                            }
                          >
                          <button
                            onClick={() => { setOpenMenuId(null); router.push(`/dashboard/menu/edit?id=${dish.id}`); }}
                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                            style={{ color: "#aaaaaa" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#aaaaaa"; }}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); router.push(`/dashboard/menu/edit?id=${dish.id}`); }}
                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                            style={{ color: "#aaaaaa" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#aaaaaa"; }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <div className="my-1 h-px" style={{ background: M.border }} />
                          <button
                            onClick={() => handleToggle(dish)}
                            disabled={workingId === dish.id}
                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                            style={{ color: dish.available ? M.red : M.green }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                          >
                            {dish.available
                              ? <><XCircle size={13} /> Unavailable</>
                              : <><BadgeCheck size={13} /> Available</>}
                          </button>

                          <div className="my-1 h-px" style={{ background: M.border }} />
                          <button
                            onClick={() => { setOpenMenuId(null); setDeleteTarget(dish); }}
                            disabled={workingId === dish.id}
                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                            style={{ color: M.red }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                          </RowActionsMenu>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {loading && dishes.length === 0 && (
          <p className="px-4 py-16 text-center text-[12px]" style={{ color: M.textMuted }}>
            Loading dishes…
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: M.surface }}>
              <UtensilsCrossed size={24} style={{ color: M.textMuted }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>No dishes found</p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>Try a different search or filter</p>
          </div>
        )}
      </motion.div>

      {/* Assign Companies dialog */}
      <AnimatePresence>
        {assignTarget && (
          <AssignDialog
            dish={assignTarget}
            companies={companies}
            selectedCompanies={selectedCompanies}
            onToggleCompany={handleToggleCompany}
            onSave={handleAssignSave}
            onCancel={() => setAssignTarget(null)}
            loading={assignLoading}
          />
        )}
      </AnimatePresence>

      {/* Delete dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            dish={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Bulk delete dialog */}
      <AnimatePresence>
        {bulkConfirm && (
          <BulkDeleteDialog
            count={selectedIds.size}
            noun="dishes"
            working={bulkDeleting}
            onConfirm={handleBulkDelete}
            onCancel={() => setBulkConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
