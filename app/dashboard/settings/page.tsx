"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Bell, Globe, Lock, UtensilsCrossed, ChevronRight } from "lucide-react";
import { SKToggle } from "@/components/ui/sk-toggle";

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

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [kitchenName,    setKitchenName]    = useState("Subtle Kitchen");
  const [kitchenEmail,   setKitchenEmail]   = useState("hello@subtlekitchen.com");
  const [kitchenPhone,   setKitchenPhone]   = useState("+44 20 7946 0958");
  const [deliveryRadius, setDeliveryRadius] = useState("5");
  const [orderCutoff,    setOrderCutoff]    = useState("09:00");
  const [deliveryTime,   setDeliveryTime]   = useState("12:00-13:00");
  const [emailNotifs,    setEmailNotifs]    = useState(true);
  const [smsNotifs,      setSmsNotifs]      = useState(false);
  const [autoConfirm,    setAutoConfirm]    = useState(true);
  const [pauseOrders,    setPauseOrders]    = useState(false);

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
          <Field label="Kitchen Name"       value={kitchenName}    onChange={setKitchenName}    />
          <Field label="Contact Email"      type="email" value={kitchenEmail}   onChange={setKitchenEmail}   />
          <Field label="Phone"              type="tel"   value={kitchenPhone}   onChange={setKitchenPhone}   />
          <Field label="Delivery Radius (km)" type="number" value={deliveryRadius} onChange={setDeliveryRadius} />
        </div>
      </Section>

      {/* Delivery schedule */}
      <Section title="Delivery Schedule" icon={Globe} iconColor="#7a5a00" iconBg="#fffce0" delay={0.12}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Order Cut-off Time" type="time"   value={orderCutoff}  onChange={setOrderCutoff}  />
          <Field label="Delivery Window"               value={deliveryTime} onChange={setDeliveryTime} placeholder="12:00-13:00" />
        </div>

        <div
          className="mt-4 flex items-center justify-between rounded-xl p-4"
          style={{ background: pauseOrders ? "#fef2f2" : "#fdf8ec", border: "1px solid #e8e0cc" }}
        >
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#b83232" }}>Pause All Orders</p>
            <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>Temporarily stop accepting new orders</p>
          </div>
          <SKToggle
            on={pauseOrders}
            onChange={() => {
              const next = !pauseOrders;
              setPauseOrders(next);
              toast[next ? "error" : "success"](next ? "All orders paused" : "Orders resumed");
            }}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} iconColor="#0a3d8f" iconBg="#e8f0fe" delay={0.18}>
        <div className="space-y-4">
          {[
            { label: "Email Notifications", sub: "Receive order alerts via email",                             value: emailNotifs, onChange: setEmailNotifs },
            { label: "SMS Notifications",   sub: "Receive urgent alerts via SMS",                             value: smsNotifs,   onChange: setSmsNotifs   },
            { label: "Auto-confirm Orders", sub: "Automatically confirm new orders without manual review",    value: autoConfirm, onChange: setAutoConfirm },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#0a0a0a" }}>{item.label}</p>
                <p className="text-[11.5px]" style={{ color: "#9b9b89" }}>{item.sub}</p>
              </div>
              <SKToggle on={item.value} onChange={() => item.onChange(!item.value)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock} iconColor="#2d6a2d" iconBg="#edf7ed" delay={0.24}>
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
          onClick={() => toast.success("Settings saved!")}
          className="flex items-center gap-2.5 rounded-xl px-6 py-3 text-[13px] font-semibold transition-shadow hover:shadow-md"
          style={{ background: "#0a0a0a", color: "#ffffff" }}
        >
          <Save size={14} /> Save Changes
        </motion.button>
      </motion.div>
    </div>
  );
}
