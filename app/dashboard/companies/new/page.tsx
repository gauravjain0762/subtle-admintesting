"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Check, ChevronDown, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  addCompany, generateCode,
  LOGO_COLORS, INDUSTRIES, DELIVERY_DAYS, PLAN_OPTIONS, PLAN_COLOR,
} from "@/lib/companies-store";
import { getMenus, getDefaultMenu, type Menu } from "@/lib/menus-store";
import { C } from "@/lib/sk-theme";

const EMPTY = {
  name: "", industry: "Technology", contact: "",
  email: "", phone: "", address: "", town: "", city: "", postalCode: "", country: "United Kingdom",
  employees: "", plan: "Starter",
  deliveryDays: [] as string[],
  logoColorIdx: 0,
  menuId: "standard",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1" style={{ background: C.cardBorder }} />
      <span className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>{children}</span>
      <div className="h-px flex-1" style={{ background: C.cardBorder }} />
    </div>
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

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ ...EMPTY });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [industryOpen, setIndustryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menus, setMenus]       = useState<Menu[]>([]);

  useEffect(() => {
    setMenus(getMenus());
    setForm((f) => ({ ...f, menuId: getDefaultMenu().id }));
  }, []);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (day: string) =>
    setForm((f) => ({
      ...f,
      deliveryDays: f.deliveryDays.includes(day)
        ? f.deliveryDays.filter((d) => d !== day)
        : [...f.deliveryDays, day],
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = "Company name is required";
    if (!form.contact.trim()) e.contact = "HR contact is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.city.trim())    e.city    = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const lc       = LOGO_COLORS[form.logoColorIdx];
    const initials = form.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const code     = generateCode(form.name);
    const id       = form.name.toLowerCase().replace(/[^a-z0-9]/g, "") + Date.now();
    addCompany({
      id, name: form.name.trim(), code,
      industry: form.industry, contact: form.contact.trim(),
      email: form.email.trim(), phone: form.phone.trim() || "+44 20 0000 0000",
      employees: Number(form.employees) || 0, activeOrders: 0, monthlySpend: "£0",
      status: "active",
      since: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      plan: form.plan, logo: initials,
      logoColor: lc.color, logoText: lc.text,
      deliveryDays: form.deliveryDays, deliveryTimes: [],
      address: form.address.trim(), town: form.town.trim(), city: form.city.trim(),
      postalCode: form.postalCode.trim(), country: form.country.trim() || "United Kingdom",
      menuId: form.menuId,
    });
    toast.success(`"${form.name.trim()}" added! Code: ${code}`);
    router.push("/dashboard/companies");
  };

  const previewCode     = form.name.trim() ? generateCode(form.name) : "XXXX-YYMM";
  const previewInitials = form.name.trim()
    ? form.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "SK";
  const selectedLC = LOGO_COLORS[form.logoColorIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl"
    >
      {/* Top bar */}
      <div className="mb-6 flex items-center gap-4">
        <motion.button
          whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ border: `1.5px solid ${C.cardBorder}`, color: C.textSub, background: C.white }}
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: C.text }}>Add New Company</h1>
          <p className="text-[12px]" style={{ color: C.textMuted }}>Create a corporate lunch client account</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Live preview card */}
        <motion.div
          className="flex items-center gap-5 rounded-2xl p-5"
          style={{ background: C.muted, border: `1.5px solid ${C.cardBorder}` }}
        >
          <motion.div
            key={previewInitials + form.logoColorIdx}
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black"
            style={{ background: selectedLC.color, color: selectedLC.text }}
          >
            {previewInitials}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold" style={{ color: form.name ? C.text : C.textMuted }}>
              {form.name || "Company name…"}
            </p>
            <p className="text-[12px]" style={{ color: C.textMuted }}>
              {form.industry}{form.city ? ` · ${form.city}` : ""}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px]" style={{ color: C.textMuted }}>Company code:</span>
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider"
                style={{ background: C.white, color: C.text, border: `1px dashed ${C.cardBorder}` }}
              >
                {previewCode}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
              style={PLAN_COLOR[form.plan] ? { background: PLAN_COLOR[form.plan].bg, color: PLAN_COLOR[form.plan].color } : {}}
            >
              {form.plan}
            </span>
            {form.deliveryDays.length > 0 && (
              <span className="text-[10.5px]" style={{ color: C.textMuted }}>
                {form.deliveryDays.join(", ")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Company Details */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Company Details</SectionLabel>

          <Field label="Company Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(v) => { set("name", v); setErrors((e) => ({ ...e, name: "" })); }}
              placeholder="e.g. Acme Corp."
              error={!!errors.name}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {/* Industry — custom dropdown */}
            <Field label="Industry">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIndustryOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] transition-all"
                  style={{ border: `1.5px solid ${industryOpen ? C.yellow : C.cardBorder}`, background: C.inputBg, color: C.text }}
                >
                  <span>{form.industry}</span>
                  <motion.span animate={{ rotate: industryOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                    <ChevronDown size={13} style={{ color: C.textMuted }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {industryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.14 }}
                      className="absolute left-0 right-0 top-full z-[90] mt-1 max-h-48 overflow-y-auto rounded-xl py-1.5"
                      style={{ background: C.white, border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}
                    >
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => { set("industry", ind); setIndustryOpen(false); }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-[12.5px] transition-colors"
                          style={{ color: form.industry === ind ? C.text : C.textSub }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.inputBg)}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                        >
                          {ind}
                          {form.industry === ind && <Check size={11} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Field>

            <Field label="Address">
              <Input
                value={form.address}
                onChange={(v) => set("address", v)}
                placeholder="e.g. 1 Finsbury Ave"
              />
            </Field>

            <Field label="Town">
              <Input
                value={form.town}
                onChange={(v) => set("town", v)}
                placeholder="e.g. London"
              />
            </Field>

            <Field label="City" required error={errors.city}>
              <Input
                value={form.city}
                onChange={(v) => { set("city", v); setErrors((e) => ({ ...e, city: "" })); }}
                placeholder="e.g. London"
                error={!!errors.city}
              />
            </Field>

            <Field label="Postal Code">
              <Input
                value={form.postalCode}
                onChange={(v) => set("postalCode", v)}
                placeholder="e.g. EC2A 4BX"
              />
            </Field>

            <Field label="Country">
              <Input
                value={form.country}
                onChange={(v) => set("country", v)}
                placeholder="e.g. United Kingdom"
              />
            </Field>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Contact Info</SectionLabel>

          <Field label="HR Contact Name" required error={errors.contact}>
            <Input
              value={form.contact}
              onChange={(v) => { set("contact", v); setErrors((e) => ({ ...e, contact: "" })); }}
              placeholder="e.g. Sarah Mitchell"
              error={!!errors.contact}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required error={errors.email}>
              <Input
                value={form.email}
                onChange={(v) => { set("email", v); setErrors((e) => ({ ...e, email: "" })); }}
                placeholder="hr@company.com"
                type="email"
                error={!!errors.email}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(v) => set("phone", v)}
                placeholder="+44 20 7946 0000"
                type="tel"
              />
            </Field>
          </div>

          <Field label="Number of Employees">
            <Input
              value={form.employees}
              onChange={(v) => set("employees", v)}
              placeholder="e.g. 80"
              type="number"
            />
          </Field>
        </div>

        {/* Subscription Settings */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Subscription Settings</SectionLabel>

          {/* Plan picker */}
          <Field label="Plan">
            <div className="grid grid-cols-3 gap-2.5">
              {PLAN_OPTIONS.map((p) => {
                const pc     = PLAN_COLOR[p.name];
                const active = form.plan === p.name;
                return (
                  <motion.button
                    key={p.name}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => set("plan", p.name)}
                    className="flex flex-col items-start gap-1 rounded-2xl p-3.5 text-left"
                    style={{
                      background: active ? pc.bg     : C.inputBg,
                      border:     `2px solid ${active ? pc.color : C.cardBorder}`,
                      boxShadow:  active ? `0 4px 14px ${pc.bg}` : "none",
                    }}
                  >
                    {active && (
                      <div className="mb-0.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: pc.color }}>
                        <Check size={9} color="#fff" />
                      </div>
                    )}
                    <p className="text-[12.5px] font-bold" style={{ color: active ? pc.color : C.text }}>{p.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: active ? pc.color : C.textMuted, opacity: 0.85 }}>{p.price}</p>
                    <p className="text-[10px]" style={{ color: C.textMuted }}>{p.desc}</p>
                    <div className="mt-1 space-y-0.5">
                      {p.features.map((f) => (
                        <p key={f} className="flex items-center gap-1 text-[10px]" style={{ color: C.textSub }}>
                          <span style={{ color: active ? pc.color : C.textMuted }}>·</span> {f}
                        </p>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Field>

          {/* Delivery days */}
          <Field label="Delivery Days">
            <div className="flex gap-2">
              {DELIVERY_DAYS.map((day) => {
                const active = form.deliveryDays.includes(day);
                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleDay(day)}
                    className="flex-1 rounded-xl py-2.5 text-[12px] font-bold"
                    style={{
                      background: active ? C.black  : C.inputBg,
                      color:      active ? C.white  : C.textMuted,
                      border:     `1.5px solid ${active ? C.black : C.cardBorder}`,
                    }}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </Field>

          {/* Assigned menu */}
          <Field label="Assigned Menu">
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
        </div>

        {/* Appearance */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cardBorder}` }}>
          <SectionLabel>Appearance</SectionLabel>
          <div className="flex items-center gap-5 rounded-2xl p-4" style={{ background: C.inputBg, border: `1.5px solid ${C.cardBorder}` }}>
            <motion.div
              key={previewInitials + form.logoColorIdx}
              initial={{ scale: 0.85, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black"
              style={{ background: selectedLC.color, color: selectedLC.text }}
            >
              {previewInitials}
            </motion.div>
            <div className="flex-1">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Logo Colour</p>
              <div className="flex flex-wrap gap-2">
                {LOGO_COLORS.map((lc, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => set("logoColorIdx", idx)}
                    className="relative h-9 w-9 rounded-xl"
                    style={{
                      background: lc.color,
                      border:     `2px solid ${form.logoColorIdx === idx ? lc.text : C.cardBorder}`,
                      boxShadow:  form.logoColorIdx === idx ? `0 2px 8px ${lc.color}` : "none",
                    }}
                  >
                    {form.logoColorIdx === idx && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={11} style={{ color: lc.text }} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <p className="mt-2 text-[10.5px]" style={{ color: C.textMuted }}>Used as the company avatar colour across the admin.</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl py-3.5 text-[13px] font-semibold"
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
            Add Company
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
