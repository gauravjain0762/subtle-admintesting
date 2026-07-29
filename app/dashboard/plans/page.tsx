"use client";

import { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getPlans, createPlan, updatePlan, deletePlan, type Plan as PlanType, type DeliveryPattern } from "@/lib/api/plans";
import { ApiError } from "@/lib/api/client";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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


export default function PlansPage() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "weekly" | "one-off">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      setPlans(res);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const filtered = plans.filter((p) => {
    if (activeTab === "all") return true;
    return p.type === activeTab;
  });

  return (
    <div className={montserrat.className}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>
            Subscription Plans
          </h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>
            Manage meal subscription plans and view active subscriptions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ border: `1.5px solid ${M.gold}`, color: M.gold, background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = M.gold;
            (e.currentTarget as HTMLElement).style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = M.gold;
          }}
        >
          <Plus size={14} /> New Plan
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex w-fit overflow-hidden rounded-lg border"
        style={{ borderColor: M.goldFaint }}
      >
        {(["all", "weekly", "one-off"] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-[11.5px] font-bold transition-colors"
            style={{
              background: activeTab === tab ? M.gold : "transparent",
              color: activeTab === tab ? "#000000" : M.gold,
              borderRight: i < 2 ? `1px solid rgba(248,227,150,0.2)` : "none",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) (e.currentTarget as HTMLElement).style.background = "rgba(248,227,150,0.08)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {tab === "all" ? "All Plans" : tab === "weekly" ? "Weekly" : "One-off"}
          </button>
        ))}
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
      >
        {loading ? (
          <p className="py-8 text-center text-[13px]" style={{ color: M.textMuted }}>
            Loading plans...
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-[13px] font-semibold" style={{ color: M.white }}>
              No plans found
            </p>
            <p className="text-[12px]" style={{ color: M.textMuted }}>
              Create your first subscription plan to get started
            </p>
          </div>
        ) : (
          filtered.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-xl p-5"
              style={{ background: M.panel, border: `1px solid ${M.border}` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = M.gold;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = M.border;
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: M.white }}>
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-[12px]" style={{ color: M.textMuted }}>
                    {plan.type === "weekly" ? "Weekly Plan" : "One-off Pattern"}
                  </p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    border: `1px solid ${plan.status === "active" ? M.green : M.red}`,
                    color: plan.status === "active" ? M.green : M.red,
                  }}
                >
                  {plan.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ color: M.textMuted }}>
                    Price per week
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: M.gold }}>
                    £{plan.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ color: M.textMuted }}>
                    Active subscriptions
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: M.white }}>
                    {plan.activeSubs}
                  </span>
                </div>
                {plan.type === "weekly" && plan.deliveryDays && (
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: M.textMuted }}>
                      Delivery days
                    </span>
                    <span className="text-[12px]" style={{ color: M.white }}>
                      {plan.deliveryDays.join(", ")}
                    </span>
                  </div>
                )}
                {plan.type === "one-off" && plan.patterns && (
                  <div>
                    <span className="text-[12px]" style={{ color: M.textMuted }}>
                      Patterns:
                    </span>
                    <div className="mt-1 space-y-1">
                      {plan.patterns.map((p, idx) => (
                        <div key={idx} className="text-[11px]" style={{ color: M.white }}>
                          • {p.name}: {p.days.join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors"
                  style={{ border: `1px solid ${M.border}`, color: M.textMuted, background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = M.surface;
                    (e.currentTarget as HTMLElement).style.color = M.gold;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = M.textMuted;
                  }}
                >
                  <Edit2 size={12} /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors"
                  style={{ border: `1px solid ${M.border}`, color: M.textMuted, background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = M.surface;
                    (e.currentTarget as HTMLElement).style.color = M.gold;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = M.textMuted;
                  }}
                >
                  <Eye size={12} /> Subscriptions
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePlanModal
            onClose={() => setShowCreateModal(false)}
            onSave={() => {
              setShowCreateModal(false);
              fetchPlans();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreatePlanModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [planType, setPlanType] = useState<"weekly" | "one-off">("weekly");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [saving, setSaving] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await createPlan({
        type: planType,
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        deliveryDays: planType === "weekly" ? selectedDays : undefined,
        patterns: planType === "one-off" ? [] : undefined,
        status: "active",
      });
      toast.success("Plan created successfully");
      onSave();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[500px] rounded-xl p-7"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-bold" style={{ color: M.white }}>
          Create New Plan
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: M.textMuted }}>
          Set up a new subscription plan for your customers
        </p>

        <div className="mt-6 space-y-5">
          {/* Plan Type */}
          <div>
            <label className="mb-3 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Plan Type
            </label>
            <div className="flex gap-3">
              {(["weekly", "one-off"] as const).map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="planType"
                    value={type}
                    checked={planType === type}
                    onChange={() => setPlanType(type)}
                    className="h-4 w-4"
                  />
                  <span className="text-[12px]" style={{ color: M.white }}>
                    {type === "weekly" ? "Weekly" : "One-off Pattern"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Plan Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Plan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Meal Plan"
              className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mon-Fri delivery"
              rows={2}
              className="w-full resize-none rounded-lg px-4 py-2.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Price per Week (£) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="47.50"
              step="0.01"
              min="0"
              className="w-full rounded-lg px-4 py-2.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Days Selection (Weekly only) */}
          {planType === "weekly" && (
            <div>
              <label className="mb-3 block text-[11px] font-bold" style={{ color: M.textMuted }}>
                Delivery Days
              </label>
              <div className="flex gap-2">
                {days.map((day) => (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleDay(day)}
                    className="flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors"
                    style={{
                      background: selectedDays.includes(day) ? M.gold : M.surface,
                      color: selectedDays.includes(day) ? "#000000" : M.textMuted,
                      border: `1px solid ${selectedDays.includes(day) ? M.gold : M.border}`,
                    }}
                  >
                    {day}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 border-t pt-4" style={{ borderColor: M.border }}>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => {
              if (!saving) {
                (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint;
                (e.currentTarget as HTMLElement).style.color = M.gold;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = M.border;
              (e.currentTarget as HTMLElement).style.color = M.textMuted;
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-bold disabled:opacity-60"
            style={{ background: M.gold, color: "#000000" }}
          >
            {saving ? "Creating..." : "Create Plan"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
