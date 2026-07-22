"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const D = {
  panel: "#141414",
  surface: "#1c1c1c",
  border: "#242424",
  gold: "#f8e396",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#4a4a4a",
  red: "#ff6b6b",
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface YMD { y: number; m: number; d: number; }

function parseISO(iso: string): YMD {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatMDY(iso: string): string {
  if (!iso) return "";
  const { y, m, d } = parseISO(iso);
  return `${String(m + 1).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

interface ThemeDatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  placeholder?: string;
  hasError?: boolean;
}

/** Custom themed date picker (MM/DD/YYYY display) — replaces the native browser date input so styling is fully controlled. */
export function ThemeDatePicker({ value, onChange, min, placeholder = "MM/DD/YYYY", hasError }: ThemeDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [placement, setPlacement] = useState<"below" | "above">("below");

  const seed = value ? parseISO(value) : min ? parseISO(min) : (() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  })();
  const [viewY, setViewY] = useState(seed.y);
  const [viewM, setViewM] = useState(seed.m);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      setRect({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rect || !popupRef.current) return;
    const h = popupRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setPlacement(spaceBelow < h + 12 && spaceAbove > spaceBelow ? "above" : "below");
  }, [open, rect]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const minParsed = min ? parseISO(min) : null;
  const isDisabled = (d: number) => {
    if (!minParsed) return false;
    const cur = new Date(viewY, viewM, d).setHours(0, 0, 0, 0);
    const minD = new Date(minParsed.y, minParsed.m, minParsed.d).setHours(0, 0, 0, 0);
    return cur < minD;
  };

  const goPrevMonth = () => setViewM((m) => { if (m === 0) { setViewY((y) => y - 1); return 11; } return m - 1; });
  const goNextMonth = () => setViewM((m) => { if (m === 11) { setViewY((y) => y + 1); return 0; } return m + 1; });

  const selectDay = (d: number) => {
    onChange(toISO(viewY, viewM, d));
    setOpen(false);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
        style={{ border: `1.5px solid ${hasError ? D.red : D.border}`, background: "#111111", color: value ? D.white : "#666666" }}
      >
        <span>{value ? formatMDY(value) : placeholder}</span>
        <CalendarDays size={14} style={{ color: D.textFaint }} />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, y: placement === "below" ? -6 : 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === "below" ? -4 : 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="fixed z-[200] rounded-xl p-3"
              style={{
                left: rect.left,
                width: Math.max(rect.width, 250),
                ...(placement === "below" ? { top: rect.bottom + 6 } : { bottom: window.innerHeight - rect.top + 6 }),
                background: D.panel,
                border: `1px solid ${D.border}`,
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                  style={{ color: D.textMuted }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[12.5px] font-semibold" style={{ color: D.gold }}>{MONTHS[viewM]} {viewY}</span>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                  style={{ color: D.textMuted }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="flex h-6 items-center justify-center text-[10px] font-bold" style={{ color: D.textFaint }}>
                    {w}
                  </div>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const disabled = isDisabled(d);
                  const iso = toISO(viewY, viewM, d);
                  const selected = value === iso;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDay(d)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ background: selected ? D.gold : "transparent", color: selected ? "#000000" : D.white }}
                      onMouseEnter={(e) => { if (!disabled && !selected) (e.currentTarget as HTMLElement).style.background = D.surface; }}
                      onMouseLeave={(e) => { if (!disabled && !selected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="mt-2 w-full rounded-md py-1.5 text-[11px] font-semibold transition-colors"
                  style={{ color: D.textMuted, border: `1px solid ${D.border}` }}
                >
                  Clear date
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
