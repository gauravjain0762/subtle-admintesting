"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Check, ChevronDown, Trash2, ImagePlus, ImageOff, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  addDish, AVAILABLE_TAGS, CATEGORIES, ALLERGENS, MEAL_DAYS, MAX_IMAGES,
  type Ingredient, type Portion,
} from "@/lib/menu-store";
import { getMenus, getDefaultMenu, type Menu } from "@/lib/menus-store";
import { SKToggle } from "@/components/ui/sk-toggle";
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
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  red: "#ff6b6b",
};

const DEFAULT_NUTRITION = [
  { name: "Calories", value: "" },
  { name: "Protein", value: "" },
  { name: "Carbs", value: "" },
  { name: "Fat", value: "" },
];

const EMPTY = {
  name: "",
  price: "",
  nutrition: DEFAULT_NUTRITION as { name: string; value: string }[],
  images: [] as (File | string)[],
  category: CATEGORIES[0],
  allergens: [] as string[],
  tags: [] as string[],
  description: "",
  available: true,
  popular: false,
  vegan: false,
  menuId: "standard",
  ingredients: [] as Ingredient[],
  portions: [] as Portion[],
  availableDays: [...MEAL_DAYS] as string[],
};

export default function NewDishPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [menus, setMenus]         = useState<Menu[]>([]);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [newAllergen, setNewAllergen] = useState("");
  const [newTag, setNewTag] = useState("");

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

  useEffect(() => {
    const urls = form.images.map((img) => (img instanceof File ? URL.createObjectURL(img) : img));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url, i) => { if (form.images[i] instanceof File) URL.revokeObjectURL(url); });
    };
  }, [form.images]);

  /** The "Regular" portion always mirrors the main Price field — auto-created once a price is entered, kept in sync, never deletable. */
  useEffect(() => {
    setForm((f) => {
      const idx = f.portions.findIndex((p) => p.size === "Regular");
      if (idx === -1) {
        if (!f.price) return f;
        return { ...f, portions: [{ size: "Regular", price: f.price }, ...f.portions] };
      }
      if (f.portions[idx].price === f.price) return f;
      const next = [...f.portions];
      next[idx] = { ...next[idx], price: f.price };
      return { ...f, portions: next };
    });
  }, [form.price]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (tag: string) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const addCustomTag = () => {
    const v = newTag.trim();
    if (!v) return;
    setForm((f) => f.tags.some((t) => t.toLowerCase() === v.toLowerCase()) ? f : { ...f, tags: [...f.tags, v] });
    setNewTag("");
  };

  const addNutritionRow = () =>
    setForm((f) => ({ ...f, nutrition: [...f.nutrition, { name: "", value: "" }] }));

  const updateNutritionRow = (i: number, patch: Partial<{ name: string; value: string }>) =>
    setForm((f) => ({
      ...f,
      nutrition: f.nutrition.map((n, idx) => (idx === i ? { ...n, ...patch } : n)),
    }));

  const removeNutritionRow = (i: number) =>
    setForm((f) => ({ ...f, nutrition: f.nutrition.filter((_, idx) => idx !== i) }));

  const addIngredientRow = () =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", gramsPerMeal: 0, price: "" }] }));

  const updateIngredientRow = (i: number, patch: Partial<Ingredient>) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)),
    }));

  const removeIngredientRow = (i: number) =>
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const toggleAllergen = (a: string) =>
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter((x) => x !== a) : [...f.allergens, a],
    }));

  const addCustomAllergen = () => {
    const v = newAllergen.trim();
    if (!v) return;
    setForm((f) => f.allergens.some((a) => a.toLowerCase() === v.toLowerCase()) ? f : { ...f, allergens: [...f.allergens, v] });
    setNewAllergen("");
  };

  const toggleAvailableDay = (day: string) =>
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setForm((f) => (f.images.length >= MAX_IMAGES ? f : { ...f, images: [...f.images, file] }));
  };

  const removeImageRow = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const addPortionRow = () =>
    setForm((f) => ({ ...f, portions: [...f.portions, { size: "", price: "" }] }));

  const updatePortionRow = (i: number, patch: Partial<Portion>) =>
    setForm((f) => ({
      ...f,
      portions: f.portions.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    }));

  const removePortionRow = (i: number) =>
    setForm((f) => ({ ...f, portions: f.portions.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                        e.name    = "Dish name is required";
    if (!form.price || isNaN(Number(form.price))) e.price   = "Valid price required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dish = await addDish({
        name:        form.name.trim(),
        price:       Math.round(parseFloat(form.price)),
        nutrition:   form.nutrition.filter((n) => n.name.trim()),
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
      }, form.images);
      toast.success(`"${dish.name}" added to menu!`);
      router.push("/dashboard/menu");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add dish");
      setSaving(false);
    }
  };

  return (
    <div className={montserrat.className}>
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
        style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
      >
        <ArrowLeft size={12} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: M.gold }}>Add Menu</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>Fill in the details to add a dish to the menu</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: M.surface, border: `1px solid ${M.border}` }}>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>Available</p>
            <p className="text-[11px]" style={{ color: M.textMuted }}>Show on customer menu</p>
          </div>
          <SKToggle on={form.available} onChange={() => set("available", !form.available)} />
        </div>
      </div>

      <div className="mt-6 space-y-5 pb-6">
          {/* ── Basic info ── */}
          <SectionCard label="Basic info">
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
                  placeholder="8"
                  type="number"
                  step="1"
                  min="0"
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
              {previewUrls.map((url, i) => (
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
          <SectionCard label="Nutritional information" hint="Add or remove nutrition properties freely — every property you add is saved, with or without units (e.g. 680 or 35g).">
            <div className="space-y-2.5">
              {form.nutrition.map((n, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={n.name}
                    onChange={(e) => updateNutritionRow(i, { name: e.target.value })}
                    placeholder="e.g. Calories"
                    className="flex-1 rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                    style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                    onFocus={(e) => (e.target.style.borderColor = M.gold)}
                    onBlur={(e)  => (e.target.style.borderColor = M.border)}
                  />
                  <div className="w-32">
                    <input
                      type="text"
                      value={n.value}
                      onChange={(e) => updateNutritionRow(i, { value: e.target.value })}
                      placeholder="e.g. 680"
                      className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                      style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                      onFocus={(e) => (e.target.style.borderColor = M.gold)}
                      onBlur={(e)  => (e.target.style.borderColor = M.border)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNutritionRow(i)}
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
              onClick={addNutritionRow}
              className="mt-3 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-colors"
              style={{ border: `1px solid ${M.border}`, color: M.textMuted, background: M.surface }}
            >
              <Plus size={12} /> Add Property
            </button>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11.5px] font-semibold" style={{ color: M.textMuted }}>Allergens</label>
              <div className="flex flex-wrap gap-2">
                {[...ALLERGENS, ...form.allergens.filter((a) => !ALLERGENS.includes(a))].map((a) => {
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
              <div className="mt-2.5 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAllergen(); } }}
                  placeholder="Add custom…"
                  className="w-36 rounded-full px-3.5 py-1.5 text-[12px] outline-none transition-all"
                  style={{ border: `1px dashed ${M.border}`, background: "transparent", color: M.white }}
                  onFocus={(e) => (e.target.style.borderColor = M.gold)}
                  onBlur={(e)  => (e.target.style.borderColor = M.border)}
                />
                <button
                  type="button"
                  onClick={addCustomAllergen}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.gold; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ── Addons ── */}
          <SectionCard label="Addons (grams per meal)" hint="Used to calculate how much to buy on the Kitchen Prep report. Price is optional.">
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
                  <div className="relative w-28">
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
                  <div className="relative w-28">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: M.textMuted }}>£</span>
                    <input
                      type="number"
                      value={ing.price ?? ""}
                      onChange={(e) => updateIngredientRow(i, { price: e.target.value })}
                      placeholder="1.50"
                      className="w-full rounded-lg py-2.5 pl-6 pr-3 text-[13px] outline-none transition-all"
                      style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                      onFocus={(e) => (e.target.style.borderColor = M.gold)}
                      onBlur={(e)  => (e.target.style.borderColor = M.border)}
                    />
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
              <Plus size={12} /> Add Addon
            </button>
          </SectionCard>

          {/* ── Portion Sizes ── */}
          <SectionCard label="Portion sizes" hint="Optional — offer this dish in multiple sizes, each with its own price.">
            <div className="space-y-2.5">
              {form.portions.map((p, i) => {
                const isRegular = p.size === "Regular";
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={p.size}
                      readOnly={isRegular}
                      onChange={(e) => updatePortionRow(i, { size: e.target.value })}
                      placeholder="e.g. Regular"
                      className="flex-1 rounded-lg px-4 py-2.5 text-[13px] outline-none transition-all"
                      style={{ border: `1px solid ${M.border}`, background: isRegular ? M.panel : M.surface, color: isRegular ? M.textMuted : M.white }}
                      onFocus={(e) => { if (!isRegular) e.target.style.borderColor = M.gold; }}
                      onBlur={(e)  => (e.target.style.borderColor = M.border)}
                    />
                    <div className="relative w-32">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: M.textMuted }}>£</span>
                      <input
                        type="number"
                        value={p.price}
                        readOnly={isRegular}
                        onChange={(e) => updatePortionRow(i, { price: e.target.value })}
                        placeholder="8.50"
                        className="w-full rounded-lg py-2.5 pl-6 pr-3 text-[13px] outline-none transition-all"
                        style={{ border: `1px solid ${M.border}`, background: isRegular ? M.panel : M.surface, color: isRegular ? M.textMuted : M.white }}
                        onFocus={(e) => { if (!isRegular) e.target.style.borderColor = M.gold; }}
                        onBlur={(e)  => (e.target.style.borderColor = M.border)}
                      />
                    </div>
                    {isRegular ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" title="Follows the main Price field — always kept">
                        <Lock size={12} style={{ color: M.textFaint }} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePortionRow(i)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                        style={{ border: `1px solid ${M.border}`, color: M.red }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
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
              {[...AVAILABLE_TAGS, ...form.tags.filter((t) => !AVAILABLE_TAGS.includes(t))].map((tag) => {
                const active = form.tags.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
                    style={{
                      background: active ? "#2a2400" : M.surface,
                      color:      active ? M.gold : M.textMuted,
                      border:     `1px solid ${active ? M.gold : M.border}`,
                    }}
                  >
                    {active && <Check size={11} />}
                    {tag}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                placeholder="Add custom…"
                className="w-36 rounded-full px-3.5 py-1.5 text-[12px] outline-none transition-all"
                style={{ border: `1px dashed ${M.border}`, background: "transparent", color: M.white }}
                onFocus={(e) => (e.target.style.borderColor = M.gold)}
                onBlur={(e)  => (e.target.style.borderColor = M.border)}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
                style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.gold; (e.currentTarget as HTMLElement).style.color = M.gold; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
              >
                <Plus size={13} />
              </button>
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
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-[12px] font-bold"
                    style={{
                      background: active ? M.gold  : M.surface,
                      color:      active ? "#000000"  : M.textMuted,
                      border:     `1px solid ${active ? M.gold : M.border}`,
                    }}
                  >
                    {active && <Check size={12} />}
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </SectionCard>
      </div>

      {/* ── Footer actions ── */}
      <div
        className="sticky bottom-0 z-10 -mx-5 flex gap-3 border-t px-5 py-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
        style={{ borderColor: M.border, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(10px)" }}
      >
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
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3.5 text-[13px] font-bold disabled:opacity-60"
          style={{ background: M.gold, color: "#000000" }}
        >
          {saving ? "Creating…" : "Create Dish"}
        </motion.button>
      </div>
    </div>
  );
}

/* ── Shared dark-theme form primitives ──────────────────────────── */

function SectionCard({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
      <p className="mb-1 text-[11px] font-bold tracking-wider" style={{ color: M.goldMuted }}>{label}</p>
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
