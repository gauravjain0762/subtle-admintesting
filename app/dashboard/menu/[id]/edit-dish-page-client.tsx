"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Check, ChevronDown, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { getDish, getDishIds, updateDish, type Dish, AVAILABLE_TAGS, EMOJI_OPTIONS, TAG_COLORS } from "@/lib/menu-store";
import { SKToggle } from "@/components/ui/sk-toggle";
import { C } from "@/lib/sk-theme";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDishIds().map((id) => ({ id: String(id) }));
}

export default function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [dish, setDishData] = useState<Dish | null>(null);
  const [form, setForm]     = useState<{
    name: string; price: string; kcal: string; protein: string;
    img: string; tags: string[]; description: string;
    available: boolean; popular: boolean; vegan: boolean;
  } | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    const found = getDish(Number(id));
    if (!found) { router.replace("/dashboard/menu"); return; }
    setDishData(found);
    setForm({
      name:        found.name,
      price:       found.price,
      kcal:        String(found.kcal),
      protein:     String(found.protein),
      img:         found.img,
      tags:        [...found.tags],
      description: found.description ?? "",
      available:   found.available,
      popular:     found.popular,
      vegan:       found.vegan,
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
      img:         form.img,
      tags:        form.tags,
      description: form.description,
      available:   form.available,
      popular:     form.popular,
      vegan:       form.vegan,
    });
    setSaved(true);
    toast.success(`"${form.name}" updated!`);
    setTimeout(() => router.push("/dashboard/menu"), 800);
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
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold" style={{ color: C.text }}>Edit Dish</h1>
          <p className="text-[12px]" style={{ color: C.textMuted }}>Editing: {dish.name}</p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ background: C.muted }}>
            <Star size={12} fill={C.yellow} style={{ color: C.yellow }} />
            <span className="text-[12px] font-bold" style={{ color: C.text }}>{dish.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ background: C.muted }}>
            <ShoppingBag size={12} style={{ color: C.textSub }} />
            <span className="text-[12px] font-bold" style={{ color: C.text }}>{dish.orders}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Live preview ── */}
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
            <p className="text-[16px] font-bold" style={{ color: C.text }}>
              {form.name || dish.name}
            </p>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {form.price   && <span className="text-[13px] font-semibold" style={{ color: C.text }}>£{form.price}</span>}
              {form.kcal    && <span className="text-[12px]" style={{ color: C.textMuted }}>{form.kcal} kcal</span>}
              {form.protein && <span className="text-[12px]" style={{ color: C.textMuted }}>{form.protein}g protein</span>}
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
            {form.available && <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#edf7ed", color: "#2d6a2d" }}>Live</span>}
            {form.popular   && <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#fff39a", color: C.text }}>Popular</span>}
            {form.vegan     && <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "#edf7ed", color: "#2d6a2d" }}>Vegan</span>}
          </div>
        </motion.div>

        {/* ── Icon picker ── */}
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
              <span className="text-[13px]" style={{ color: C.textSub }}>Change emoji</span>
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

          <div className="grid grid-cols-3 gap-3">
            {(["price","kcal","protein"] as const).map((k) => (
              <Field key={k}
                label={k === "price" ? "Price (£)" : k === "kcal" ? "Calories" : "Protein (g)"}
                required error={errors[k]}
              >
                <Input
                  value={form[k] as string}
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

        {/* ── Settings ── */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Settings</SectionLabel>
          {[
            { key: "available" as const, label: "Available",     desc: "Show on customer menu" },
            { key: "popular"   as const, label: "Popular badge",  desc: "Highlight as a popular dish" },
            { key: "vegan"     as const, label: "Vegan",          desc: "Mark as a vegan dish" },
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

        {/* ── Footer ── */}
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
            whileHover={{ scale: saved ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-bold transition-colors"
            style={{
              background: saved ? "#2d6a2d" : C.black,
              color: C.white,
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
