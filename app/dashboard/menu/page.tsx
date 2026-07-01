"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Trash2, Star, Flame, X, Leaf as LeafIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getDishes, toggleDishAvailable, deleteDish, TAG_COLORS, type Dish } from "@/lib/menu-store";
import { SKToggle } from "@/components/ui/sk-toggle";
import { C } from "@/lib/sk-theme";

/* ── Delete dialog ──────────────────────────────────────────────── */
function DeleteDialog({
  dish, onConfirm, onCancel,
}: { dish: Dish; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
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
        <h2 className="text-[17px] font-bold" style={{ color: C.text }}>Delete dish?</h2>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.textSub }}>
          <span className="font-semibold" style={{ color: C.text }}>{dish.img} {dish.name}</span>{" "}
          will be permanently removed from the menu. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.muted)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: C.red, color: C.white }}
          >
            Delete dish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Dish card ──────────────────────────────────────────────────── */
function DishCard({
  dish, onToggle, onEdit, onDelete,
}: {
  dish: Dish; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      whileHover={{ y: -5, boxShadow: "0 16px 48px rgba(0,0,0,0.10)", scale: 1.012 }}
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: C.white,
        border: `1.5px solid ${C.cardBorder}`,
        opacity: dish.available ? 1 : 0.62,
      }}
    >
      {/* Emoji area */}
      <motion.div
        className="relative flex h-[108px] items-center justify-center text-6xl select-none"
        style={{ background: C.muted }}
        whileHover={{ background: "#ede3c8" }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          whileHover={{ scale: 1.18, rotate: [-2, 2, -1, 0] }}
          transition={{ type: "spring", stiffness: 380, damping: 18, rotate: { duration: 0.4 } }}
          className="inline-block"
        >
          {dish.img}
        </motion.span>

        {dish.popular && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: C.yellow, color: C.black }}
          >
            <Flame size={9} /> Popular
          </motion.span>
        )}
        {dish.vegan && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: C.greenBg, color: C.green }}
          >
            <LeafIcon size={9} /> Vegan
          </motion.span>
        )}

        {!dish.available && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-t-2xl"
            style={{ background: "rgba(255,255,255,0.6)" }}
          >
            <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: C.cardBorder, color: C.textSub }}>
              Unavailable
            </span>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13.5px] font-bold leading-tight" style={{ color: C.text }}>{dish.name}</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: C.textMuted }}>{dish.kcal} kcal</span>
              <span style={{ color: "#d0c8b0" }}>·</span>
              <span className="text-[11px]" style={{ color: C.textMuted }}>{dish.protein}g protein</span>
            </div>
          </div>
          <span className="shrink-0 text-[15px] font-bold" style={{ color: C.text }}>£{dish.price}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {dish.tags.map((t) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={TAG_COLORS[t] ?? { background: C.muted, color: C.textSub }}>
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t pt-3" style={{ borderColor: C.muted }}>
          <div className="flex items-center gap-1">
            <Star size={11} fill={C.yellow} style={{ color: C.yellow }} />
            <span className="text-[12px] font-bold" style={{ color: C.text }}>{dish.rating}</span>
          </div>
          <span className="text-[11px]" style={{ color: C.textMuted }}>{dish.orders} orders</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10.5px] font-medium" style={{ color: dish.available ? C.green : C.textMuted }}>
              {dish.available ? "Live" : "Off"}
            </span>
            <SKToggle on={dish.available} onChange={onToggle} stopPropagation />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11.5px] font-semibold"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.text, background: C.inputBg }}
          >
            <Edit2 size={11} /> Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08, background: C.redBg }}
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.red }}
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function MenuPage() {
  const router = useRouter();
  const [dishes,       setDishes]       = useState<Dish[]>([]);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState<"all" | "available" | "unavailable">("all");
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  useEffect(() => {
    setDishes(getDishes());
  }, []);

  const filtered = dishes.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !search || d.name.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q));
    const matchFilter = filter === "all" || (filter === "available" ? d.available : !d.available);
    return matchSearch && matchFilter;
  });

  const handleToggle = (id: number) => {
    const next = toggleDishAvailable(id);
    setDishes(getDishes());
    const dish = dishes.find((d) => d.id === id);
    if (dish) toast.success(`"${dish.name}" marked ${next ? "available" : "unavailable"}`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDish(deleteTarget.id);
    setDishes(getDishes());
    toast.error(`"${deleteTarget.name}" removed from menu`);
    setDeleteTarget(null);
  };

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
          <h1 className="text-[22px] font-bold" style={{ color: C.text }}>Menu</h1>
          <p className="text-[13px]" style={{ color: C.textSub }}>
            {dishes.filter((d) => d.available).length} of {dishes.length} dishes live
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/dashboard/menu/new")}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-shadow hover:shadow-md"
          style={{ background: C.black, color: C.white }}
        >
          <Plus size={15} /> Add Dish
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.34 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div
          className="flex min-w-[180px] flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ border: `1.5px solid ${C.cardBorder}`, background: C.white }}
        >
          <Search size={14} style={{ color: C.textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes or tags…"
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
          {(["all", "available", "unavailable"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className="rounded-xl px-4 py-2.5 text-[12px] font-semibold capitalize transition-all"
              style={{
                background: filter === v ? C.black : C.white,
                color:      filter === v ? C.white : C.textSub,
                border:     `1.5px solid ${C.cardBorder}`,
              }}
            >
              {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards grid */}
      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onToggle={() => handleToggle(dish.id)}
              onEdit={() => router.push(`/dashboard/menu/${dish.id}`)}
              onDelete={() => setDeleteTarget(dish)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-20"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: C.muted }}>
            🍽️
          </div>
          <p className="text-[14px] font-bold" style={{ color: C.text }}>No dishes found</p>
          <p className="text-[12.5px]" style={{ color: C.textMuted }}>Try a different search or filter</p>
        </motion.div>
      )}

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
    </div>
  );
}
