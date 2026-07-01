"use client";

import { motion } from "framer-motion";
import { C } from "@/lib/sk-theme";

interface SKToggleProps {
  on: boolean;
  onChange: () => void;
  stopPropagation?: boolean;
  size?: "sm" | "md";
}

/**
 * SK brand toggle.
 * OFF → neutral gray pill + white knob
 * ON  → yellow pill + black knob   (brand-correct: SK yellow = "active")
 *
 * Uses overflow:hidden so the knob is always clipped to the rounded-full pill.
 */
export function SKToggle({
  on,
  onChange,
  stopPropagation = false,
  size = "md",
}: SKToggleProps) {
  const W = size === "sm" ? 36 : 44;   // pill width
  const H = size === "sm" ? 22 : 26;   // pill height
  const D = size === "sm" ? 14 : 18;   // knob diameter
  const PAD = 4;                        // gap between knob edge and pill border
  const BORDER = 1.5;

  // Inner usable width (excluding the two borders)
  const inner = W - BORDER * 2;
  const xOff  = PAD;
  const xOn   = inner - D - PAD;       // = 41 - 18 - 4 = 19 for md
  const top   = (H - D) / 2;           // vertically centred

  return (
    <button
      type="button"
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onChange();
      }}
      aria-checked={on}
      role="switch"
      className="relative shrink-0 cursor-pointer rounded-full focus-visible:outline-none"
      style={{
        width:    W,
        height:   H,
        overflow: "hidden",            // <-- clips knob to rounded pill
        background:  on ? C.yellow    : "#c8c0b4",
        border:      `${BORDER}px solid ${on ? "#d4b800" : "#b0a89c"}`,
        transition:  "background 0.22s ease, border-color 0.22s ease",
        flexShrink:  0,
      }}
    >
      <motion.span
        animate={{ x: on ? xOn : xOff }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
        style={{
          position:     "absolute",
          top,
          left:         0,
          width:        D,
          height:       D,
          borderRadius: 9999,
          background:   on ? C.black : C.white,
          boxShadow:    on
            ? "0 1px 4px rgba(0,0,0,0.55)"
            : "0 1px 3px rgba(0,0,0,0.18)",
        }}
      />
    </button>
  );
}
