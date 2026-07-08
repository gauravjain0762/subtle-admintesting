"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, UtensilsCrossed, Building2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { getMenus, addMenu, updateMenu, deleteMenu, canDeleteMenu, type Menu } from "@/lib/menus-store";
import { getDishesByMenu } from "@/lib/menu-store";
import { getCompanies } from "@/lib/companies-store";
import { C } from "@/lib/sk-theme";

function MenuFormModal({
  initial, onSave, onClose,
}: { initial?: Menu; onSave: (name: string, description: string) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[420px] rounded-2xl p-7"
        style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold" style={{ color: C.text }}>{initial ? "Edit Menu" : "New Menu"}</h2>
          <button onClick={onClose} style={{ color: C.textMuted }}><X size={16} /></button>
        </div>

        <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: C.textSub }}>
          Menu Name <span style={{ color: C.red }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="e.g. Summer Kids Contract"
          className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
          style={{ border: `1.5px solid ${error ? C.red : C.cardBorder}`, background: C.inputBg, color: C.text }}
          onFocus={(e) => (e.target.style.borderColor = error ? C.red : C.yellow)}
          onBlur={(e)  => (e.target.style.borderColor = error ? C.red : C.cardBorder)}
        />
        {error && <p className="mt-1 text-[11px]" style={{ color: C.red }}>{error}</p>}

        <label className="mb-1.5 mt-4 block text-[11.5px] font-semibold" style={{ color: C.textSub }}>
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this menu for?"
          className="w-full resize-none rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
          style={{ border: `1.5px solid ${C.cardBorder}`, background: C.inputBg, color: C.text }}
          onFocus={(e) => (e.target.style.borderColor = C.yellow)}
          onBlur={(e)  => (e.target.style.borderColor = C.cardBorder)}
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) { setError("Menu name is required"); return; }
              onSave(name.trim(), description.trim());
            }}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: C.black, color: C.white }}
          >
            {initial ? "Save Changes" : "Create Menu"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dishCounts, setDishCounts] = useState<Record<string, number>>({});
  const [companyCounts, setCompanyCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);

  const refresh = () => {
    const allMenus = getMenus();
    const companies = getCompanies();
    setMenus(allMenus);
    setDishCounts(Object.fromEntries(allMenus.map((m) => [m.id, getDishesByMenu(m.id).length])));
    setCompanyCounts(Object.fromEntries(allMenus.map((m) => [m.id, companies.filter((c) => c.menuId === m.id).length])));
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = (name: string, description: string) => {
    addMenu({ name, description });
    refresh();
    toast.success(`"${name}" menu created!`);
    setShowForm(false);
  };

  const handleEdit = (name: string, description: string) => {
    if (!editTarget) return;
    updateMenu(editTarget.id, { name, description });
    refresh();
    toast.success(`"${name}" updated!`);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteMenu(deleteTarget.id)) {
      refresh();
      toast.error(`"${deleteTarget.name}" deleted`);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: C.text }}>Menus</h1>
          <p className="text-[13px]" style={{ color: C.textSub }}>
            Manage the standard menu and custom menus linked to company codes
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-shadow hover:shadow-md"
          style={{ background: C.black, color: C.white }}
        >
          <Plus size={15} /> New Menu
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {menus.map((m, i) => {
          const dishCount = dishCounts[m.id] ?? 0;
          const companyCount = companyCounts[m.id] ?? 0;
          const deletable = canDeleteMenu(m.id, dishCount, companyCount);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              className="cursor-pointer rounded-2xl p-5"
              style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}
              onClick={() => router.push(`/dashboard/menu?menuId=${m.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[14.5px] font-bold" style={{ color: C.text }}>{m.name}</h3>
                    {m.isDefault && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.yellow, color: C.black }}>
                        <Star size={9} /> Default
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="mt-1 text-[11.5px] leading-snug" style={{ color: C.textMuted }}>{m.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 border-t pt-3" style={{ borderColor: C.muted }}>
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed size={12} style={{ color: C.textMuted }} />
                  <span className="text-[11.5px] font-medium" style={{ color: C.textSub }}>{dishCount} dishes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 size={12} style={{ color: C.textMuted }} />
                  <span className="text-[11.5px] font-medium" style={{ color: C.textSub }}>{companyCount} companies</span>
                </div>
              </div>

              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setEditTarget(m)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11.5px] font-semibold"
                  style={{ border: `1.5px solid ${C.cardBorder}`, color: C.text, background: C.inputBg }}
                >
                  <Edit2 size={11} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (!deletable) {
                      toast.error(m.isDefault
                        ? "The default menu can't be deleted"
                        : "Reassign dishes and companies before deleting this menu");
                      return;
                    }
                    setDeleteTarget(m);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ border: `1.5px solid ${C.cardBorder}`, color: deletable ? C.red : C.textMuted, opacity: deletable ? 1 : 0.5 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <MenuFormModal onSave={handleCreate} onClose={() => setShowForm(false)} />
        )}
        {editTarget && (
          <MenuFormModal initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />
        )}
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="w-full max-w-[400px] rounded-2xl p-7"
              style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: C.redBg }}>
                <Trash2 size={22} style={{ color: C.red }} />
              </div>
              <h2 className="text-[17px] font-bold" style={{ color: C.text }}>Delete menu?</h2>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.textSub }}>
                <span className="font-semibold" style={{ color: C.text }}>{deleteTarget.name}</span>{" "}
                will be permanently removed. This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
                  style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
                  style={{ background: C.red, color: C.white }}
                >
                  Delete menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
