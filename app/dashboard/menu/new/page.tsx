"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Check, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addDish, AVAILABLE_TAGS, EMOJI_OPTIONS, TAG_COLORS, type Ingredient } from "@/lib/menu-store";
import { getMenus, getDefaultMenu, type Menu } from "@/lib/menus-store";
import { SKToggle } from "@/components/ui/sk-toggle";
import { C } from "@/lib/sk-theme";

const EMPTY = {
  name: "",
  price: "",
  kcal: "",
  protein: "",
  img: "🍛",
  tags: [] as string[],
  description: "",
  available: true,
  popular: false,
  vegan: false,
  menuId: "standard",
  ingredients: [] as Ingredient[],
};

export default function NewDishPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [menus, setMenus]         = useState<Menu[]>([]);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const allMenus = getMenus();
    setMenus(allMenus);
    const params = new URLSearchParams(window.location.search);
    const requestedMenuId = params.get("menuId");
    const initialMenuId = (requestedMenuId && allMenus.some((m) => m.id === requestedMenuId))
      ? requestedMenuId
      : getDefaultMenu().id;
    setForm((f) => ({ ...f, menuId: initialMenuId }));
  }, []);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (tag: string) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const addIngredientRow = () =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", gramsPerMeal: 0 }] }));

  const updateIngredientRow = (i: number, patch: Partial<Ingredient>) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)),
    }));

  const removeIngredientRow = (i: number) =>
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                          e.name    = "Dish name is required";
    if (!form.price || isNaN(Number(form.price)))   e.price   = "Valid price required";
    if (!form.kcal  || isNaN(Number(form.kcal)))    e.kcal    = "Valid calories required";
    if (!form.protein || isNaN(Number(form.protein)))e.protein = "Valid protein required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const dish = addDish({
      name:        form.name.trim(),
      price:       parseFloat(form.price).toFixed(2),
      kcal:        Number(form.kcal),
      protein:     Number(form.protein),
      img:         form.img,
      tags:        form.tags,
      description: form.description,
      available:   form.available,
      popular:     form.popular,
      vegan:       form.vegan,
      menuId:      form.menuId,
      ingredients: form.ingredients.filter((ing) => ing.name.trim()),
    });
    toast.success(`"${dish.name}" added to menu!`);
    router.push("/dashboard/menu");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl"
    >
      {/* ── Top bar ── */}
      <div className="mb-6 flex items-center gap-4">
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub, background: C.white }}
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: C.text }}>Add New Dish</h1>
          <p className="text-[12px]" style={{ color: C.textMuted }}>Fill in the details to add a dish to the menu</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Preview card ── */}
        <motion.div
          className="flex items-center gap-4 rounded-2xl p-5"
          style={{ background: C.muted, border: `1.5px solid ${C.cardBorder}` }}
        >
          <motion.div
            key={form.img}
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl"
            style={{ background: C.white }}
          >
            {form.img}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold" style={{ color: form.name ? C.text : C.textMuted }}>
              {form.name || "Dish name…"}
            </p>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {form.price && (
                <span className="text-[13px] font-semibold" style={{ color: C.text }}>£{form.price}</span>
              )}
              {form.kcal && (
                <span className="text-[12px]" style={{ color: C.textMuted }}>{form.kcal} kcal</span>
              )}
              {form.protein && (
                <span className="text-[12px]" style={{ color: C.textMuted }}>{form.protein}g protein</span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {form.tags.map((t) => (
                <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={TAG_COLORS[t] ?? { background: C.muted, color: C.textSub }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {form.available && (
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#edf7ed", color: "#2d6a2d" }}>Live</span>
            )}
            {form.popular && (
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#fff39a", color: C.text }}>Popular</span>
            )}
            {form.vegan && (
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#edf7ed", color: "#2d6a2d" }}>Vegan</span>
            )}
          </div>
        </motion.div>

        {/* ── Dish icon ── */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Dish Icon</SectionLabel>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all"
              style={{ border: `1.5px solid ${showEmoji ? C.yellow : C.cardBorder}`, background: C.inputBg, width: "fit-content" }}
            >
              <span className="text-2xl">{form.img}</span>
              <span className="text-[13px]" style={{ color: C.textSub }}>Choose emoji</span>
              <motion.span animate={{ rotate: showEmoji ? 180 : 0 }} transition={{ duration: 0.18 }}>
                <ChevronDown size={13} style={{ color: C.textMuted }} />
              </motion.span>
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-full z-10 mt-1.5 grid grid-cols-8 gap-1.5 rounded-2xl p-3"
                  style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", minWidth: 280 }}
                >
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { set("img", e); setShowEmoji(false); }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all hover:scale-110"
                      style={{ background: form.img === e ? C.muted : "transparent" }}
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Basic info ── */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Basic Info</SectionLabel>

          <Field label="Dish Name" required error={errors.name}>
            <Input
              value={form.name} placeholder="e.g. Chicken Katsu Curry"
              onChange={(v) => { set("name", v); setErrors((e) => ({ ...e, name: "" })); }}
              error={!!errors.name}
            />
          </Field>

          <Field label="Menu">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] transition-all"
                style={{ border: `1.5px solid ${menuOpen ? C.yellow : C.cardBorder}`, background: C.inputBg, color: C.text }}
              >
                <span>{menus.find((m) => m.id === form.menuId)?.name ?? "Standard Menu"}</span>
                <motion.span animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={13} style={{ color: C.textMuted }} />
                </motion.span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 right-0 top-full z-[90] mt-1 max-h-48 overflow-y-auto rounded-xl py-1.5"
                    style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}
                  >
                    {menus.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { set("menuId", m.id); setMenuOpen(false); }}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-[12.5px] transition-colors"
                        style={{ color: form.menuId === m.id ? C.text : C.textSub }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.inputBg)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                      >
                        {m.name}
                        {form.menuId === m.id && <Check size={11} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            {(["price","kcal","protein"] as const).map((k) => (
              <Field key={k}
                label={k === "price" ? "Price (£)" : k === "kcal" ? "Calories" : "Protein (g)"}
                required error={errors[k]}
              >
                <Input
                  value={form[k]}
                  placeholder={k === "price" ? "8.50" : k === "kcal" ? "480" : "32"}
                  type="number"
                  onChange={(v) => { set(k, v); setErrors((e) => ({ ...e, [k]: "" })); }}
                  error={!!errors[k]}
                />
              </Field>
            ))}
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the dish…"
              className="w-full resize-none rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
              style={{ border: `1.5px solid ${C.cardBorder}`, background: C.inputBg, color: C.text }}
              onFocus={(e) => (e.target.style.borderColor = C.yellow)}
              onBlur={(e)  => (e.target.style.borderColor = C.cardBorder)}
            />
          </Field>
        </div>

        {/* ── Ingredients ── */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Ingredients (grams per meal)</SectionLabel>
          <p className="mb-3 text-[11.5px]" style={{ color: C.textMuted }}>
            Used to calculate how much to buy on the Kitchen Prep report.
          </p>
          <div className="space-y-2.5">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredientRow(i, { name: e.target.value })}
                  placeholder="e.g. Chicken"
                  className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
                  style={{ border: `1.5px solid ${C.cardBorder}`, background: C.inputBg, color: C.text }}
                  onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                  onBlur={(e)  => (e.target.style.borderColor = C.cardBorder)}
                />
                <div className="relative w-32">
                  <input
                    type="number"
                    value={ing.gramsPerMeal || ""}
                    onChange={(e) => updateIngredientRow(i, { gramsPerMeal: Number(e.target.value) })}
                    placeholder="150"
                    className="w-full rounded-xl py-2.5 pl-4 pr-9 text-[13px] outline-none transition-all"
                    style={{ border: `1.5px solid ${C.cardBorder}`, background: C.inputBg, color: C.text }}
                    onFocus={(e) => (e.target.style.borderColor = C.yellow)}
                    onBlur={(e)  => (e.target.style.borderColor = C.cardBorder)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: C.textMuted }}>g</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredientRow(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ border: `1.5px solid ${C.cardBorder}`, color: C.red }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredientRow}
            className="mt-3 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub, background: C.inputBg }}
          >
            <Plus size={12} /> Add Ingredient
          </button>
        </div>

        {/* ── Tags ── */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Tags</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const active = form.tags.includes(tag);
              const tc     = TAG_COLORS[tag];
              return (
                <motion.button
                  key={tag}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
                  style={{
                    background: active ? (tc?.background ?? C.muted) : C.inputBg,
                    color:      active ? (tc?.color ?? C.textSub)     : C.textMuted,
                    border:     `1.5px solid ${active ? (tc?.background ?? C.cardBorder) : C.cardBorder}`,
                  }}
                >
                  {active && <Check size={11} />}
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Toggles ── */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Settings</SectionLabel>
          {[
            { key: "available" as const, label: "Available",    desc: "Show on customer menu" },
            { key: "popular"   as const, label: "Popular badge", desc: "Highlight as a popular dish" },
            { key: "vegan"     as const, label: "Vegan",         desc: "Mark as a vegan dish" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.inputBg, border: `1px solid ${C.cardBorder}` }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: C.text }}>{label}</p>
                <p className="text-[11px]" style={{ color: C.textMuted }}>{desc}</p>
              </div>
              <SKToggle on={form[key]} onChange={() => set(key, !form[key])} />
            </div>
          ))}
        </div>

        {/* ── Footer actions ── */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl py-3.5 text-[13px] font-semibold transition-colors"
            style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub, background: C.white }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.muted)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = C.white)}
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-bold"
            style={{ background: C.black, color: C.white }}
          >
            <Plus size={15} />
            Add Dish
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>
      {children}
    </p>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: C.textSub }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[11px]" style={{ color: C.red }}>
          {error}
        </motion.p>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", error }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
      style={{ border: `1.5px solid ${error ? C.red : C.cardBorder}`, background: C.inputBg, color: C.text }}
      onFocus={(e) => (e.target.style.borderColor = error ? C.red : C.yellow)}
      onBlur={(e)  => (e.target.style.borderColor = error ? C.red : C.cardBorder)}
    />
  );
}
