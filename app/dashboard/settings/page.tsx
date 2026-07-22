"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Bell, Globe, Lock, UtensilsCrossed, ChevronRight, Percent, X, Plus } from "lucide-react";
import { SKToggle } from "@/components/ui/sk-toggle";
import { getSettings, updateSettings, type Settings } from "@/lib/settings-store";

/* ── Labelled field ─────────────────────────────────────────────────── */
function Field({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
        style={{ border: "1.5px solid #e8e0cc", background: "#fdf8ec", color: "#0a0a0a" }}
        onFocus={(e) => (e.target.style.borderColor = "#f5d800")}
        onBlur={(e) => (e.target.style.borderColor = "#e8e0cc")}
      />
    </div>
  );
}


/* ── Section card ────────────────────────────────────────────────────── */
function Section({
  title, icon: Icon, iconColor, iconBg, children, delay = 0,
}: {
  title: string; icon: React.ElementType; iconColor: string; iconBg: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6"
      style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: iconBg }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <h2 className="text-[15px] font-bold" style={{ color: "#0a0a0a" }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Chip list input ─────────────────────────────────────────────────── */
function ChipListInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const addChip = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) { setDraft(""); return; }
    onChange([...values, v]);
    setDraft("");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold"
            style={{ background: "#f0e9d6", color: "#6b6b5a" }}
          >
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} style={{ color: "#9b9b89" }}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(); } }}
          placeholder="e.g. Poole"
          className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
          style={{ border: "1.5px solid #e8e0cc", background: "#fdf8ec", color: "#0a0a0a" }}
          onFocus={(e) => (e.target.style.borderColor = "#f5d800")}
          onBlur={(e) => (e.target.style.borderColor = "#e8e0cc")}
        />
        <button
          type="button"
          onClick={addChip}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold"
          style={{ border: "1.5px solid #e8e0cc", color: "#6b6b5a", background: "#fdf8ec" }}
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) return null;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings((s) => (s ? { ...s, [k]: v } : s));

  const toggleImmediate = <K extends keyof Settings>(k: K, next: Settings[K]) => {
    set(k, next);
    updateSettings({ [k]: next } as Partial<Settings>);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[22px] font-bold" style={{ color: "#0a0a0a" }}>Settings</h1>
        <p className="text-[13px]" style={{ color: "#6b6b5a" }}>Manage your kitchen configuration</p>
      </motion.div>

      {/* Kitchen info */}
      <Section title="Kitchen Details" icon={UtensilsCrossed} iconColor="#f5d800" iconBg="#0a0a0a" delay={0.06}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Kitchen Name"  value={settings.kitchenName}  onChange={(v) => set("kitchenName", v)} />
          <Field label="Contact Email" type="email" value={settings.kitchenEmail} onChange={(v) => set("kitchenEmail", v)} />
          <Field label="Phone"         type="tel"   value={settings.kitchenPhone} onChange={(v) => set("kitchenPhone", v)} />
        </div>
      </Section>

      {/* Delivery schedule */}
      <Section title="Delivery Schedule" icon={Globe} iconColor="#7a5a00" iconBg="#fffce0" delay={0.12}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Order Cut-off Time (day before)" type="time" value={settings.orderCutoff} onChange={(v) => set("orderCutoff", v)} />
          <Field label="Delivery Window" value={settings.deliveryTime} onChange={(v) => set("deliveryTime", v)} placeholder="12:00-13:00" />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
            Service Areas
          </label>
          <ChipListInput values={settings.serviceAreas} onChange={(v) => set("serviceAreas", v)} />
        </div>

        <div
          className="mt-4 flex items-center justify-between rounded-xl p-4"
          style={{ background: settings.pauseOrders ? "#fef2f2" : "#fdf8ec", border: "1px solid #e8e0cc" }}
        >
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#b83232" }}>Pause All Orders</p>
            <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>Temporarily stop accepting new orders</p>
          </div>
          <SKToggle
            on={settings.pauseOrders}
            onChange={() => {
              const next = !settings.pauseOrders;
              toggleImmediate("pauseOrders", next);
              toast[next ? "error" : "success"](next ? "All orders paused" : "Orders resumed");
            }}
          />
        </div>
      </Section>

      {/* Pricing & discounts */}
      <Section title="Pricing & Discounts" icon={Percent} iconColor="#2d6a2d" iconBg="#edf7ed" delay={0.16}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Max Per-Order Discount (%)" type="number"
            value={String(settings.maxOrderDiscountPct)}
            onChange={(v) => set("maxOrderDiscountPct", Math.min(10, Math.max(0, Number(v) || 0)))}
          />
          <Field
            label="Business/Bulk Discount (%)" type="number"
            value={String(settings.businessDiscountPct)}
            onChange={(v) => set("businessDiscountPct", Math.max(0, Number(v) || 0))}
          />
        </div>
        <div className="mt-4">
          <Field
            label="Qualifying Order Size (meals)" type="number"
            value={String(settings.businessDiscountThreshold)}
            onChange={(v) => set("businessDiscountThreshold", Math.max(0, Number(v) || 0))}
          />
          <p className="mt-1.5 text-[11px]" style={{ color: "#9b9b89" }}>
            Minimum meals a business owner/key operator must buy for staff to qualify for the bulk discount.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl p-4" style={{ background: "#fdf8ec", border: "1px solid #e8e0cc" }}>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#0a0a0a" }}>Pricing Visible to Logged-in Users Only</p>
            <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>Hide prices from anyone who isn&apos;t signed in</p>
          </div>
          <SKToggle
            on={settings.pricingVisibleToLoggedInOnly}
            onChange={() => set("pricingVisibleToLoggedInOnly", !settings.pricingVisibleToLoggedInOnly)}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} iconColor="#0a3d8f" iconBg="#e8f0fe" delay={0.2}>
        <div className="space-y-4">
          {[
            { key: "emailNotifs" as const, label: "Email Notifications", sub: "Receive order alerts via email" },
            { key: "smsNotifs"   as const, label: "SMS Notifications",   sub: "Receive urgent alerts via SMS" },
            { key: "autoConfirm" as const, label: "Auto-confirm Orders", sub: "Automatically confirm new orders without manual review" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#0a0a0a" }}>{item.label}</p>
                <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>{item.sub}</p>
              </div>
              <SKToggle on={settings[item.key]} onChange={() => set(item.key, !settings[item.key])} />
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock} iconColor="#2d6a2d" iconBg="#edf7ed" delay={0.26}>
        <div className="space-y-2">
          {[
            { label: "Change Password",  sub: "Update your admin password" },
            { label: "Two-Factor Auth",  sub: "Add an extra layer of security" },
            { label: "Active Sessions",  sub: "View and revoke active sessions" },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ x: 4 }}
              onClick={() => toast.success(`${item.label} — coming soon`)}
              className="flex w-full items-center justify-between rounded-xl p-4 text-left transition-colors hover:bg-[#fdf8ec]"
              style={{ border: "1.5px solid #e8e0cc" }}
            >
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#0a0a0a" }}>{item.label}</p>
                <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>{item.sub}</p>
              </div>
              <ChevronRight size={15} style={{ color: "#9b9b89" }} />
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.32 }}
        className="flex justify-end pb-4"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { updateSettings(settings); toast.success("Settings saved!"); }}
          className="flex items-center gap-2.5 rounded-xl px-6 py-3 text-[13px] font-semibold transition-shadow hover:shadow-md"
          style={{ background: "#0a0a0a", color: "#ffffff" }}
        >
          <Save size={14} /> Save Changes
        </motion.button>
      </motion.div>
    </div>
  );
}
