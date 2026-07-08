"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Check, ChevronDown, Star, ShoppingBag, Plus, Trash2, ImagePlus, ImageOff } from "lucide-react";
import { toast } from "sonner";
import {
  getDish, getDishIds, updateDish, type Dish, type Ingredient, type Portion,
  AVAILABLE_TAGS, TAG_COLORS, CATEGORIES, ALLERGENS, MEAL_DAYS, MAX_IMAGES,
} from "@/lib/menu-store";
import { getMenus, type Menu } from "@/lib/menus-store";
import { SKToggle } from "@/components/ui/sk-toggle";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette (matches companies/page.tsx) ── */
const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  red: "#ff6b6b",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getDishIds().map((id) => ({ id: String(id) }));
}

export default function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [dish, setDishData] = useState<Dish | null>(null);
  const [form, setForm]     = useState<{
    name: string; price: string; kcal: string; protein: string; carbs: string; fat: string;
    images: string[]; category: string; allergens: string[];
    tags: string[]; description: string;
    available: boolean; popular: boolean; vegan: boolean;
    menuId: string; ingredients: Ingredient[]; portions: Portion[]; availableDays: string[];
  } | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saved,     setSaved]     = useState(false);
  const [menus,     setMenus]     = useState<Menu[]>([]);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    setMenus(getMenus());
    const found = getDish(Number(id));
    if (!found) { router.replace("/dashboard/menu"); return; }
    setDishData(found);
    setForm({
      name:        found.name,
      price:       found.price,
      kcal:        String(found.kcal),
      protein:     String(found.protein),
      carbs:       String(found.carbs ?? 0),
      fat:         String(found.fat ?? 0),
      images:      found.images ? [...found.images] : [],
      category:    found.category ?? CATEGORIES[0],
      allergens:   found.allergens ? [...found.allergens] : [],
      tags:        [...found.tags],
      description: found.description ?? "",
      available:   found.available,
      popular:     found.popular,
      vegan:       found.vegan,
      menuId:      found.menuId ?? "standard",
      ingredients: found.ingredients ? [...found.ingredients] : [],
      portions:    found.portions ? [...found.portions] : [],
      availableDays: found.availableDays ? [...found.availableDays] : [...MEAL_DAYS],
    });
  }, [id, router]);

  if (!form || !dish) return null;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => f ? { ...f, [k]: v } : f);

  const toggleTag = (tag: string) =>
    setForm((f) => f ? ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }) : f);

  const addIngredientRow = () =>
    setForm((f) => f ? { ...f, ingredients: [...f.ingredients, { name: "", gramsPerMeal: 0 }] } : f);

  const updateIngredientRow = (i: number, patch: Partial<Ingredient>) =>
    setForm((f) => f ? {
      ...f,
      ingredients: f.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)),
    } : f);

  const removeIngredientRow = (i: number) =>
    setForm((f) => f ? { ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) } : f);

  const toggleAllergen = (a: string) =>
    setForm((f) => f ? ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter((x) => x !== a) : [...f.allergens, a],
    }) : f);

  const toggleAvailableDay = (day: string) =>
    setForm((f) => f ? ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }) : f);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setForm((f) => f ? (f.images.length >= MAX_IMAGES ? f : { ...f, images: [...f.images, dataUrl] }) : f);
    };
    reader.readAsDataURL(file);
  };

  const removeImageRow = (i: number) =>
    setForm((f) => f ? { ...f, images: f.images.filter((_, idx) => idx !== i) } : f);

  const addPortionRow = () =>
    setForm((f) => f ? { ...f, portions: [...f.portions, { size: "", price: "" }] } : f);

  const updatePortionRow = (i: number, patch: Partial<Portion>) =>
    setForm((f) => f ? {
      ...f,
      portions: f.portions.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    } : f);

  const removePortionRow = (i: number) =>
    setForm((f) => f ? { ...f, portions: f.portions.filter((_, idx) => idx !== i) } : f);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                            e.name    = "Dish name is required";
    if (!form.price  || isNaN(Number(form.price)))    e.price   = "Valid price required";
    if (!form.kcal   || isNaN(Number(form.kcal)))     e.kcal    = "Valid calories required";
    if (!form.protein|| isNaN(Number(form.protein)))  e.protein = "Valid protein required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateDish(dish.id, {
      name:        form.name.trim(),
      price:       parseFloat(form.price).toFixed(2),
      kcal:        Number(form.kcal),
      protein:     Number(form.protein),
      carbs:       Number(form.carbs) || 0,
      fat:         Number(form.fat) || 0,
      images:      form.images.filter((url) => url.trim()),
      category:    form.category,
      allergens:   form.allergens,
      tags:        form.tags,
      description: form.description,
      available:   form.available,
      popular:     form.popular,
      vegan:       form.vegan,
      menuId:      form.menuId,
      ingredients: form.ingredients.filter((ing) => ing.name.trim()),
      portions:    form.portions.filter((p) => p.size.trim()),
      availableDays: form.availableDays,
    });
    setSaved(true);
    toast.success(`"${form.name}" updated!`);
    setTimeout(() => router.push("/dashboard/menu"), 800);
  };

  const cover = form.images.find((url) => url.trim());

  return (
    <div className={montserrat.className}>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
          >
            <ArrowLeft size={12} /> Back
          </button>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: M.gold }}>Edit Dish</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>Editing: {dish.name}</p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
            <Star size={12} fill={M.gold} style={{ color: M.gold }} />
            <span className="text-[12px] font-bold" style={{ color: M.white }}>{dish.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
            <ShoppingBag size={12} style={{ color: M.textMuted }} />
            <span className="text-[12px] font-bold" style={{ color: M.white }}>{dish.orders}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="space-y-5 lg:col-span-2">
          {/* ── Basic info ── */}
          <SectionCard label="Basic Info">
            <div className="space-y-4">
              <Field label="Dish Name" required error={errors.name}>
                <Input
                  value={form.name} placeholder="e.g. Chicken Katsu Curry"
                  onChange={(v) => { set("name", v); setErrors((e) => ({ ...e, name: "" })); }}
                  error={!!errors.name}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Menu">
                  <Dropdown
                    open={menuOpen} onToggle={() => setMenuOpen((v) => !v)}
                    label={menus.find((m) => m.id === form.menuId)?.name ?? "Standard Menu"}
                  >
                    {menus.map((m) => (
                      <DropdownItem key={m.id} active={form.menuId === m.id} onClick={() => { set("menuId", m.id); setMenuOpen(false); }}>
                        {m.name}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </Field>

                <Field label="Category">
                  <Dropdown open={categoryOpen} onToggle={() => setCategoryOpen((v) => !v)} label={form.category}>
                    {CATEGORIES.map((cat) => (
                      <DropdownItem key={cat} active={form.category === cat} onClick={() => { set("category", cat); setCategoryOpen(false); }}>
                        {cat}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </Field>
              </div>

              <Field label="Price (£)" required error={errors.price}>
                <Input
                  value={form.price}
                  placeholder="8.50"
                  type="number"
                  onChange={(v) => { set("price", v); setErrors((e) => ({ ...e, price: "" })); }}
                  error={!!errors.price}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of the dish…"
                  className="w-full resize-none rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                  style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                  onFocus={(e) => (e.target.style.borderColor = M.gold)}
                  onBlur={(e)  => (e.target.style.borderColor = M.border)}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── Images ── */}
          <SectionCard label={`Images (max ${MAX_IMAGES})`} hint="The first image is used as the dish's cover photo.">
            <div className="flex flex-wrap gap-3">
              {form.images.map((url, i) => (
                <div key={i} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg" style={{ border: `1px solid ${M.border}` }}>
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: M.surface }}>
                      <ImageOff size={16} style={{ color: M.textFaint }} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageRow(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                    style={{ background: "rgba(0,0,0,0.65)", color: M.white }}
                  >
                    <Trash2 size={11} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[9px] font-bold" style={{ background: "rgba(0,0,0,0.65)", color: M.gold }}>
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <label
                  className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg transition-colors"
                  style={{ border: `1.5px dashed ${M.border}`, color: M.textMuted }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
                >
                  <ImagePlus size={16} />
                  <span className="text-[10px] font-semibold">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </SectionCard>

          {/* ── Nutritional Information ── */}
          <SectionCard label="Nutritional Information">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["kcal","protein","carbs","fat"] as const).map((k) => (
                <Field key={k}
                  label={k === "kcal" ? "Calories" : k === "protein" ? "Protein (g)" : k === "carbs" ? "Carbs (g)" : "Fat (g)"}
                  required={k === "kcal" || k === "protein"} error={errors[k]}
                >
                  <Input
                    value={form[k]}
                    placeholder={k === "kcal" ? "480" : k === "protein" ? "32" : k === "carbs" ? "45" : "18"}
                    type="number"
                    onChange={(v) => { set(k, v); setErrors((e) => ({ ...e, [k]: "" })); }}
                    error={!!errors[k]}
                  />
                </Field>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>Allergens</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => {
                  const active = form.allergens.includes(a);
                  return (
                    <motion.button
                      key={a}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggleAllergen(a)}
                      className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
                      style={{
                        background: active ? "#2a2400" : M.surface,
                        color:      active ? M.gold : M.textMuted,
                        border:     `1px solid ${active ? M.gold : M.border}`,
                      }}
                    >
                      {active && <Check size={11} />}
                      {a}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* ── Ingredients ── */}
          <SectionCard label="Ingredients (grams per meal)" hint="Used to calculate how much to buy on the Kitchen Prep report.">
            <div className="space-y-2.5">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredientRow(i, { name: e.target.value })}
                    placeholder="e.g. Chicken"
                    className="flex-1 rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                    style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                    onFocus={(e) => (e.target.style.borderColor = M.gold)}
                    onBlur={(e)  => (e.target.style.borderColor = M.border)}
                  />
                  <div className="relative w-32">
                    <input
                      type="number"
                      value={ing.gramsPerMeal || ""}
                      onChange={(e) => updateIngredientRow(i, { gramsPerMeal: Number(e.target.value) })}
                      placeholder="150"
                      className="w-full rounded-lg py-2.5 pl-4 pr-9 text-[13px] outline-none transition-all"
                      style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                      onFocus={(e) => (e.target.style.borderColor = M.gold)}
                      onBlur={(e)  => (e.target.style.borderColor = M.border)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: M.textMuted }}>g</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ border: `1px solid ${M.border}`, color: M.red }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredientRow}
              className="mt-3 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-colors"
              style={{ border: `1px solid ${M.border}`, color: M.textMuted, background: M.surface }}
            >
              <Plus size={12} /> Add Ingredient
            </button>
          </SectionCard>

          {/* ── Portion Sizes ── */}
          <SectionCard label="Portion Sizes" hint="Optional — offer this dish in multiple sizes, each with its own price.">
            <div className="space-y-2.5">
              {form.portions.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={p.size}
                    onChange={(e) => updatePortionRow(i, { size: e.target.value })}
                    placeholder="e.g. Regular"
                    className="flex-1 rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                    style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                    onFocus={(e) => (e.target.style.borderColor = M.gold)}
                    onBlur={(e)  => (e.target.style.borderColor = M.border)}
                  />
                  <div className="relative w-32">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: M.textMuted }}>£</span>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => updatePortionRow(i, { price: e.target.value })}
                      placeholder="8.50"
                      className="w-full rounded-lg py-2.5 pl-6 pr-3 text-[13px] outline-none transition-all"
                      style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                      onFocus={(e) => (e.target.style.borderColor = M.gold)}
                      onBlur={(e)  => (e.target.style.borderColor = M.border)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePortionRow(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ border: `1px solid ${M.border}`, color: M.red }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPortionRow}
              className="mt-3 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-colors"
              style={{ border: `1px solid ${M.border}`, color: M.textMuted, background: M.surface }}
            >
              <Plus size={12} /> Add Portion Size
            </button>
          </SectionCard>

          {/* ── Tags ── */}
          <SectionCard label="Tags">
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
                      background: active ? (tc?.background ?? M.surface) : M.surface,
                      color:      active ? (tc?.color ?? M.white)     : M.textMuted,
                      border:     `1px solid ${active ? (tc?.background ?? M.border) : M.border}`,
                    }}
                  >
                    {active && <Check size={11} />}
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Availability ── */}
          <SectionCard label="Availability" hint="Days this dish is offered — defaults to Monday–Friday.">
            <div className="flex gap-2">
              {MEAL_DAYS.map((day) => {
                const active = form.availableDays.includes(day);
                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleAvailableDay(day)}
                    className="flex-1 rounded-lg py-2.5 text-[12px] font-bold"
                    style={{
                      background: active ? M.gold  : M.surface,
                      color:      active ? "#000000"  : M.textMuted,
                      border:     `1px solid ${active ? M.gold : M.border}`,
                    }}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* ── Side column ── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {/* ── Live preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl"
            style={{ background: M.panel, border: `1px solid ${M.border}` }}
          >
            <div className="flex h-40 items-center justify-center" style={{ background: M.surface, borderBottom: `1px solid ${M.border}` }}>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <ImageOff size={22} style={{ color: M.textFaint }} />
                  <span className="text-[11px]" style={{ color: M.textFaint }}>No image yet</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-[15px] font-bold" style={{ color: M.white }}>
                {form.name || dish.name}
              </p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {form.price   && <span className="text-[13px] font-semibold" style={{ color: M.gold }}>£{form.price}</span>}
                {form.kcal    && <span className="text-[12px]" style={{ color: M.textMuted }}>{form.kcal} kcal</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((t) => (
                  <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={TAG_COLORS[t] ?? { background: M.surface, color: M.textMuted }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.available && <span className="rounded-md px-2 py-1 text-[10px] font-bold" style={{ border: `1px solid ${M.green}`, color: M.green }}>Live</span>}
                {form.popular   && <span className="rounded-md px-2 py-1 text-[10px] font-bold" style={{ border: `1px solid ${M.gold}`, color: M.gold }}>Popular</span>}
                {form.vegan     && <span className="rounded-md px-2 py-1 text-[10px] font-bold" style={{ border: `1px solid ${M.green}`, color: M.green }}>Vegan</span>}
              </div>
            </div>
          </motion.div>

          {/* ── Settings ── */}
          <SectionCard label="Settings">
            <div className="space-y-3">
              {[
                { key: "available" as const, label: "Available",     desc: "Show on customer menu" },
                { key: "popular"   as const, label: "Popular badge",  desc: "Highlight as a popular dish" },
                { key: "vegan"     as const, label: "Vegan",          desc: "Mark as a vegan dish" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: M.surface, border: `1px solid ${M.border}` }}>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: M.white }}>{label}</p>
                    <p className="text-[11px]" style={{ color: M.textMuted }}>{desc}</p>
                  </div>
                  <SKToggle on={form[key]} onChange={() => set(key, !form[key])} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Footer ── */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg py-3.5 text-[13px] font-semibold transition-colors"
              style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
            >
              Cancel
            </button>
            <motion.button
              type="button"
              whileHover={{ scale: saved ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3.5 text-[13px] font-bold transition-colors"
              style={{
                background: saved ? M.green : M.gold,
                color: "#000000",
              }}
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check size={15} /> Saved!
                  </motion.span>
                ) : (
                  <motion.span key="save" className="flex items-center gap-2">
                    <Save size={15} /> Save Changes
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared dark-theme form primitives ──────────────────────────── */

function SectionCard({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: M.goldMuted }}>{label}</p>
      {hint && <p className="mb-3 text-[11.5px]" style={{ color: M.textMuted }}>{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>
        {label}{required && <span style={{ color: M.red }}> *</span>}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[11px]" style={{ color: M.red }}>
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
      className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
      style={{ border: `1px solid ${error ? M.red : M.border}`, background: M.surface, color: M.white }}
      onFocus={(e) => (e.target.style.borderColor = error ? M.red : M.gold)}
      onBlur={(e)  => (e.target.style.borderColor = error ? M.red : M.border)}
    />
  );
}

function Dropdown({ open, onToggle, label, children }: {
  open: boolean; onToggle: () => void; label: string; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-[13px] transition-all"
        style={{ border: `1px solid ${open ? M.gold : M.border}`, background: M.surface, color: M.white }}
      >
        <span>{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={13} style={{ color: M.textMuted }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 top-full z-[90] mt-1 max-h-48 overflow-y-auto rounded-lg py-1.5"
            style={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-2 text-left text-[12.5px] transition-colors"
      style={{ color: active ? M.gold : "#aaaaaa" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = M.surface)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {children}
      {active && <Check size={11} />}
    </button>
  );
}
