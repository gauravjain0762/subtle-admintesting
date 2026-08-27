"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getPlans, createPlan, updatePlan, deletePlan, type Plan as PlanType, type DeliveryPattern } from "@/lib/api/plans";
import { getPlanSubscribers, type SubscribersResponse } from "@/lib/api/subscribers";
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
  const [activeTab, setActiveTab] = useState<"all" | "weekly" | "one-day-off">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [subscribersData, setSubscribersData] = useState<SubscribersResponse | null>(null);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

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

  const handleViewSubscribers = async (plan: PlanType) => {
    setShowSubscribersModal(true);
    setLoadingSubscribers(true);
    try {
      const data = await getPlanSubscribers(plan._id);
      setSubscribersData(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load subscribers");
      setShowSubscribersModal(false);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const filtered = plans.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "weekly") return p.type === "weekly";
    if (activeTab === "one-day-off") return p.type === "one-off";
    return false;
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
        {(["all", "weekly", "one-day-off"] as const).map((tab, i) => (
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
            {tab === "all" ? "All Plans" : tab === "weekly" ? "Weekly Plan" : "One-Day Off"}
          </button>
        ))}
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
              className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${M.panel} 0%, #0f0f0f 100%)`,
                border: `1.5px solid ${M.border}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = M.gold;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px rgba(248,227,150,0.15)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = M.border;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Gradient accent */}
              <div
                className="absolute top-0 left-0 w-1 h-16 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(180deg, ${M.gold} 0%, transparent 100%)` }}
              />

              {/* Header */}
              <div className="mb-5 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold leading-tight" style={{ color: M.white }}>
                    {plan.name}
                  </h3>
                  <p className="mt-1.5 text-[11px] font-medium" style={{ color: M.textMuted }}>
                    {plan.type === "weekly" ? "Weekly Plan" : "One-off Pattern"}
                  </p>
                  {plan.description && (
                    <p className="mt-2 text-[12px] line-clamp-2" style={{ color: M.textMuted }}>
                      {plan.description}
                    </p>
                  )}
                </div>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold backdrop-blur-sm"
                  style={{
                    border: `1px solid ${plan.status === "active" ? M.green : M.red}`,
                    color: plan.status === "active" ? M.green : M.red,
                    background: plan.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(255,107,107,0.1)",
                  }}
                >
                  {plan.status === "active" ? "●" : "○"} {plan.status === "active" ? "Active" : "Inactive"}
                </motion.span>
              </div>

              {/* Stats Grid */}
              <div className="mb-5 grid grid-cols-2 gap-4 py-4 px-3 rounded-xl" style={{ background: M.surface }}>
              </div>

              {/* Delivery Info */}
              {plan.type === "weekly" && plan.pattern && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: M.textFaint }}>
                    Delivery Days
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.pattern.map((day) => (
                      <span
                        key={day}
                        className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold"
                        style={{ border: `1px solid ${M.goldFaint}`, color: M.gold, background: "rgba(248,227,150,0.08)" }}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plan.type === "one-off" && plan.patterns && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: M.textFaint }}>
                    Patterns
                  </p>
                  <div className="mt-2 space-y-2">
                    {plan.patterns.map((p, idx) => (
                      <div key={idx} className="text-[11px]" style={{ color: M.textMuted }}>
                        <span style={{ color: M.gold }}>{p.name}</span>
                        <span className="mx-2">•</span>
                        <span>{p.days.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: M.border }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingPlan(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[11px] font-bold transition-all"
                  style={{
                    border: `1px solid ${M.border}`,
                    color: M.textMuted,
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = M.surface;
                    (e.currentTarget as HTMLElement).style.color = M.gold;
                    (e.currentTarget as HTMLElement).style.borderColor = M.gold;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = M.textMuted;
                    (e.currentTarget as HTMLElement).style.borderColor = M.border;
                  }}
                >
                  <Edit2 size={13} /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewSubscribers(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[11px] font-bold transition-all"
                  style={{
                    border: `1px solid ${M.border}`,
                    color: M.textMuted,
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = M.surface;
                    (e.currentTarget as HTMLElement).style.color = M.gold;
                    (e.currentTarget as HTMLElement).style.borderColor = M.gold;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = M.textMuted;
                    (e.currentTarget as HTMLElement).style.borderColor = M.border;
                  }}
                >
                  <Eye size={13} /> Subs
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Modal — portaled to document.body to escape PageTransition stacking context */}
      {typeof document !== "undefined" && createPortal(
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
          {editingPlan && (
            <EditPlanModal
              plan={editingPlan}
              onClose={() => setEditingPlan(null)}
              onSave={() => {
                setEditingPlan(null);
                fetchPlans();
              }}
            />
          )}
          {showSubscribersModal && subscribersData && (
            <SubscribersModal
              data={subscribersData}
              isLoading={loadingSubscribers}
              onClose={() => {
                setShowSubscribersModal(false);
                setSubscribersData(null);
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function CreatePlanModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [planType, setPlanType] = useState<"weekly" | "one-off" | "one-time-order">("weekly");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [patterns, setPatterns] = useState<DeliveryPattern[]>([
    { id: "p1", name: "Mon-Wed-Fri", days: ["Mon", "Wed", "Fri"] },
  ]);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternDays, setNewPatternDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const togglePatternDay = (day: string) => {
    setNewPatternDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addPattern = () => {
    if (!newPatternName.trim() || newPatternDays.length === 0) {
      toast.error("Pattern name and days are required");
      return;
    }
    setPatterns((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        name: newPatternName.trim(),
        days: newPatternDays,
      },
    ]);
    setNewPatternName("");
    setNewPatternDays([]);
  };

  const removePattern = (id: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (planType === "one-off" && patterns.length === 0) {
      toast.error("One-off plans require at least one pattern");
      return;
    }

    setSaving(true);
    try {
      await createPlan({
        type: planType,
        name: name.trim(),
        description: description.trim() || undefined,
        pattern: planType === "weekly" ? selectedDays : undefined,
        patterns: planType === "one-off" ? patterns : undefined,
        status: "active",
      });
      toast.success(`${name} plan created successfully!`);
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[380px] rounded-xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 p-5 border-b" style={{ borderColor: M.border }}>
          <h2 className="text-[18px] font-bold" style={{ color: M.white }}>
            Create New Plan
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: M.textMuted }}>
            Set up a new subscription plan for your customers
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Plan Name */}
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Plan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Meal Plan"
              className="w-full rounded-lg px-4 py-1.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mon-Fri delivery"
              rows={1}
              className="w-full resize-none rounded-lg px-4 py-1.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Days Selection (Weekly only) */}
          {planType === "weekly" && (
            <div>
              <label className="mb-2 block text-[11px] font-bold" style={{ color: M.textMuted }}>
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

          {/* Patterns (One-off only) */}
          {planType === "one-off" && (
            <div>
              <label className="mb-2 block text-[11px] font-bold" style={{ color: M.textMuted }}>
                Delivery Patterns *
              </label>

              {/* Current Patterns */}
              <div className="mb-4 space-y-2">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ background: M.surface, border: `1px solid ${M.border}` }}
                  >
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: M.white }}>
                        {pattern.name}
                      </p>
                      <p className="text-[11px]" style={{ color: M.textMuted }}>
                        {pattern.days.join(", ")}
                      </p>
                    </div>
                    <button
                      onClick={() => removePattern(pattern.id)}
                      className="text-[11px] font-bold transition-colors"
                      style={{ color: M.red }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Pattern Form */}
              <div className="space-y-2 rounded-lg p-3" style={{ background: M.surface, border: `1px dashed ${M.border}` }}>
                <input
                  type="text"
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                  placeholder="Pattern name (e.g. Mon-Wed-Fri)"
                  className="w-full rounded-lg px-3 py-2 text-[12px] outline-none"
                  style={{ border: `1px solid ${M.border}`, background: M.panel, color: M.white }}
                />
                <div className="flex gap-1">
                  {days.map((day) => (
                    <motion.button
                      key={day}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => togglePatternDay(day)}
                      className="flex-1 rounded-md py-1.5 text-[11px] font-bold transition-colors"
                      style={{
                        background: newPatternDays.includes(day) ? M.gold : M.panel,
                        color: newPatternDays.includes(day) ? "#000000" : M.textMuted,
                        border: `1px solid ${newPatternDays.includes(day) ? M.gold : M.border}`,
                      }}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addPattern}
                  className="w-full rounded-lg py-2 text-[11px] font-bold transition-colors"
                  style={{ border: `1px solid ${M.gold}`, color: M.gold, background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = M.gold;
                    (e.currentTarget as HTMLElement).style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = M.gold;
                  }}
                >
                  + Add Pattern
                </motion.button>
              </div>
            </div>
          )}

          {/* Subscription Type */}
          <div>
            <label className="mb-3 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Subscription Type
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
                    {type === "weekly" ? "Weekly" : "One-Day Off"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t p-6" style={{ borderColor: M.border }}>
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
            className="flex-1 rounded-lg py-2 text-[12px] font-bold disabled:opacity-60"
            style={{ background: M.gold, color: "#000000" }}
          >
            {saving ? "Creating..." : "Create Plan"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditPlanModal({ plan, onClose, onSave }: { plan: PlanType; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description || "");
  const [selectedDays, setSelectedDays] = useState<string[]>(plan.pattern || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [saving, setSaving] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await updatePlan(plan._id, {
        name: name.trim(),
        description: description.trim() || undefined,
        pattern: plan.type === "weekly" ? selectedDays : undefined,
        status: plan.status,
      });
      toast.success("Plan updated successfully!");
      onSave();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[380px] rounded-xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: M.panel, border: `1px solid ${M.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 p-5 border-b" style={{ borderColor: M.border }}>
          <h2 className="text-[18px] font-bold" style={{ color: M.white }}>
            Edit Plan
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: M.textMuted }}>
            Update subscription plan details
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Subscription Type (Read-only) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold" style={{ color: M.textMuted }}>
              Subscription Type
            </label>
            <div
              className="w-full rounded-lg px-4 py-2.5 text-[13px]"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
            >
              {plan.type === "weekly" ? "Weekly Plan" : "One-off Pattern"}
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
              rows={2}
              className="w-full resize-none rounded-lg px-4 py-2.5 text-[13px] outline-none"
              style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = M.gold)}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = M.border)}
            />
          </div>

          {/* Days Selection (Weekly only) */}
          {plan.type === "weekly" && (
            <div>
              <label className="mb-2 block text-[11px] font-bold" style={{ color: M.textMuted }}>
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

        <div className="shrink-0 flex gap-3 border-t p-5" style={{ borderColor: M.border }}>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg py-2 text-[12px] font-semibold transition-colors disabled:opacity-50"
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
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg py-2 text-[12px] font-bold disabled:opacity-60"
            style={{ background: M.gold, color: "#000000" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SubscribersModal({
  data,
  isLoading,
  onClose,
}: {
  data: SubscribersResponse;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused">("all");

  const filteredSubscribers = data.subscribers.filter((sub) => {
    if (activeTab === "all") return true;
    return sub.status === activeTab;
  });

  const getTabCount = (tab: typeof activeTab) => {
    if (tab === "all") return data.subscribers.length;
    return data.subscribers.filter((sub) => sub.status === tab).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        {/* Header */}
        <div className="shrink-0 border-b p-5" style={{ borderColor: M.border }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-bold" style={{ color: M.gold }}>
                {data.plan.name}
              </h2>
              <p className="text-[12px] mt-1" style={{ color: M.textMuted }}>
                Plan Type: {data.plan.type === "weekly" ? "Weekly" : "One-Off"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[20px] transition-colors"
              style={{ color: M.textMuted }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = M.gold;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = M.textMuted;
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            {(["all", "active", "paused"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors"
                style={{
                  background: activeTab === tab ? M.gold : M.surface,
                  color: activeTab === tab ? "#000000" : M.textMuted,
                  border: `1px solid ${activeTab === tab ? M.gold : M.border}`,
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab)})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: M.textMuted }}>Loading subscribers...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: M.textFaint }}>No subscribers found</p>
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {filteredSubscribers.map((subscriber) => (
                <motion.div
                  key={subscriber._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg p-4 space-y-2"
                  style={{ background: M.surface, border: `1px solid ${M.border}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: M.white }}>
                        {subscriber.user.name}
                      </p>
                      <p className="text-[11px]" style={{ color: M.textMuted }}>
                        {subscriber.user.email}
                      </p>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-black"
                      style={{
                        background:
                          subscriber.status === "active"
                            ? M.green
                            : subscriber.status === "paused"
                            ? "#f59e0b"
                            : M.red,
                      }}
                    >
                      {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <p style={{ color: M.textFaint }}>Meal</p>
                      <p style={{ color: M.white }}>{subscriber.meal.name}</p>
                    </div>
                    <div>
                      <p style={{ color: M.textFaint }}>Quantity</p>
                      <p style={{ color: M.white }}>{subscriber.quantity}</p>
                    </div>
                    <div>
                      <p style={{ color: M.textFaint }}>Pattern</p>
                      <p style={{ color: M.white }}>{subscriber.pattern.join(", ")}</p>
                    </div>
                    <div>
                      <p style={{ color: M.textFaint }}>Next Charge</p>
                      <p style={{ color: M.white }}>
                        {new Date(subscriber.nextChargeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t p-4" style={{ borderColor: M.border }}>
          <p className="text-[11px]" style={{ color: M.textMuted }}>
            Showing {filteredSubscribers.length} of {data.subscribers.length} subscribers
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
