"use client";

import { useState, useEffect, useMemo } from "react";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Check, X as XIcon, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { assignWeek } from "@/lib/api/weekly-menu";
import type { WeekDayCode } from "@/lib/api/types";
import { getDishes, type Dish } from "@/lib/menu-store";
import { SKToggle } from "@/components/ui/sk-toggle";
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

const DAY_CODES: WeekDayCode[] = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS: Record<WeekDayCode, string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday",
};

interface DayPlan {
  code: WeekDayCode;
  theme: string;
  closed: boolean;
  dishIds: string[];
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

function mondayOfThisWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

function formatDisplay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function WeeklyMenuPage() {
  const [weekStart, setWeekStart] = useState(mondayOfThisWeek);
  const [days, setDays] = useState<DayPlan[]>(() => DAY_CODES.map((code) => ({ code, theme: "", closed: false, dishIds: [] })));
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpenFor, setPickerOpenFor] = useState<WeekDayCode | null>(null);

  useEffect(() => {
    getDishes()
      .then(setDishes)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load dishes"))
      .finally(() => setLoadingDishes(false));
  }, []);

  const weekEnd = useMemo(() => addDays(weekStart, 4), [weekStart]);

  const shiftWeek = (deltaDays: number) => setWeekStart((w) => addDays(w, deltaDays));

  const updateDay = (code: WeekDayCode, patch: Partial<DayPlan>) =>
    setDays((ds) => ds.map((d) => (d.code === code ? { ...d, ...patch } : d)));

  const toggleDish = (code: WeekDayCode, dishId: string) =>
    setDays((ds) => ds.map((d) => {
      if (d.code !== code) return d;
      const has = d.dishIds.includes(dishId);
      return { ...d, dishIds: has ? d.dishIds.filter((id) => id !== dishId) : [...d.dishIds, dishId] };
    }));

  const resetWeek = () => {
    setWeekStart(mondayOfThisWeek());
    setDays(DAY_CODES.map((code) => ({ code, theme: "", closed: false, dishIds: [] })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignWeek({
        weekStart,
        weekEnd,
        days: days.map((d, i) => ({
          day: d.code,
          date: addDays(weekStart, i),
          theme: d.theme.trim(),
          closed: d.closed,
          dishes: d.dishIds,
        })),
      });
      toast.success(`Week of ${formatDisplay(weekStart)} assigned!`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign week");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: M.gold }}>Weekly Menu</h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "#D0C5AF" }}>
            Assign a themed menu and dishes for each weekday. Saving overwrites any existing plan for the selected week.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: saving ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-bold disabled:opacity-60"
          style={{ background: M.gold, color: "#000000" }}
        >
          <Check size={15} /> {saving ? "Saving…" : "Save Week"}
        </motion.button>
      </motion.div>

      {/* Week selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="flex flex-wrap items-center gap-3 rounded-xl p-4"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="flex items-center gap-1.5">
          <CalendarDays size={15} style={{ color: M.gold }} />
          <span className="text-[13px] font-bold" style={{ color: M.white }}>
            {formatDisplay(weekStart)} – {formatDisplay(weekEnd)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => shiftWeek(-7)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
            aria-label="Previous week"
          >
            <ChevronLeft size={15} />
          </button>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => e.target.value && setWeekStart(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-[12.5px] outline-none"
            style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white, colorScheme: "dark" }}
          />
          <button
            onClick={() => shiftWeek(7)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
            aria-label="Next week"
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={resetWeek}
            className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = M.gold; (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = M.textMuted; (e.currentTarget as HTMLElement).style.borderColor = M.border; }}
          >
            This Week
          </button>
        </div>
      </motion.div>

      {/* Day cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {days.map((day, i) => {
          const dateISO = addDays(weekStart, i);
          const selectedDishes = dishes.filter((d) => day.dishIds.includes(d.id));
          return (
            <motion.div
              key={day.code}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              className="flex flex-col gap-3 rounded-xl p-4"
              style={{ background: M.panel, border: `1px solid ${day.closed ? M.red : M.border}`, opacity: day.closed ? 0.6 : 1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold" style={{ color: M.gold }}>{DAY_LABELS[day.code]}</p>
                  <p className="text-[10.5px]" style={{ color: M.textFaint }}>{formatDisplay(dateISO)}</p>
                </div>
                <SKToggle on={!day.closed} onChange={() => updateDay(day.code, { closed: !day.closed })} />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: M.textMuted }}>
                  Theme
                </label>
                <input
                  type="text"
                  value={day.theme}
                  onChange={(e) => updateDay(day.code, { theme: e.target.value })}
                  placeholder="e.g. Asian Kitchen"
                  disabled={day.closed}
                  className="w-full rounded-lg px-3 py-2 text-[12.5px] outline-none transition-all disabled:opacity-50"
                  style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
                  onFocus={(e) => (e.target.style.borderColor = M.gold)}
                  onBlur={(e) => (e.target.style.borderColor = M.border)}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider" style={{ color: M.textMuted }}>
                    Dishes ({day.dishIds.length})
                  </label>
                  <button
                    onClick={() => setPickerOpenFor(pickerOpenFor === day.code ? null : day.code)}
                    disabled={day.closed}
                    className="text-[10.5px] font-bold disabled:opacity-50"
                    style={{ color: M.gold }}
                  >
                    {pickerOpenFor === day.code ? "Done" : "+ Add"}
                  </button>
                </div>

                {selectedDishes.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedDishes.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-medium"
                        style={{ background: M.surface, border: `1px solid ${M.border}`, color: M.white }}
                      >
                        {d.name}
                        <button onClick={() => toggleDish(day.code, d.id)} style={{ color: M.textFaint }}>
                          <XIcon size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {pickerOpenFor === day.code && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.16 }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg p-2" style={{ background: M.surface, border: `1px solid ${M.border}` }}>
                        {loadingDishes && <p className="px-2 py-2 text-[11px]" style={{ color: M.textMuted }}>Loading dishes…</p>}
                        {!loadingDishes && dishes.length === 0 && (
                          <p className="px-2 py-2 text-[11px]" style={{ color: M.textMuted }}>No dishes available.</p>
                        )}
                        {dishes.map((d) => {
                          const active = day.dishIds.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              onClick={() => toggleDish(day.code, d.id)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] font-medium transition-colors"
                              style={{ background: active ? "#2a2400" : "transparent", color: active ? M.gold : "#cccccc" }}
                            >
                              <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                                style={{ border: `1px solid ${active ? M.gold : M.border}`, background: active ? M.gold : "transparent" }}
                              >
                                {active && <Check size={10} color="#000000" />}
                              </span>
                              <UtensilsCrossed size={12} style={{ color: M.textFaint, flexShrink: 0 }} />
                              <span className="truncate">{d.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
