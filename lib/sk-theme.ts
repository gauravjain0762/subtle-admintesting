/**
 * SK Admin — single source of truth for all design tokens.
 * Import C (colors) and the style helpers wherever you need them.
 * Do NOT use raw hex strings anywhere in components — use these instead.
 */
import type { CSSProperties } from "react";

/* ── Color palette ──────────────────────────────────────────────── */
export const C = {
  // Brand
  black:       "#0a0a0a",
  cream:       "#fdf8ec",
  white:       "#ffffff",
  yellowLight: "#fff39a",
  yellow:      "#f5d800",

  // Text
  text:        "#0a0a0a",
  textSub:     "#6b6b5a",
  textMuted:   "#9b9b89",

  // Surfaces
  card:        "#ffffff",
  cardBorder:  "#e8e0cc",
  muted:       "#f0e9d6",
  inputBg:     "#fdf8ec",

  // Status
  green:       "#2d6a2d",
  greenBg:     "#edf7ed",
  red:         "#b83232",
  redBg:       "#fef2f2",
  blue:        "#0a3d8f",
  blueBg:      "#e8f0fe",
  amber:       "#7a5a00",
  amberBg:     "#fffce0",

  // Sidebar / dark gold
  sidebarBg:      "#0a0a0a",
  borderDark:     "#1a1a1a",
  borderDarkFaint: "rgba(255,255,255,0.06)",
  gold:           "#c9a96e",
  goldLight:      "#e8d8b8",
  goldBg:         "rgba(201,169,110,0.1)",
} as const;

/* ── Reusable style objects (spread into `style` props) ──────────── */

/** White card with brand border */
export const cardStyle = {
  background: C.card,
  border:     `1.5px solid ${C.cardBorder}`,
} as const;

/** Standard text input */
export const inputBaseStyle = {
  border:     `1.5px solid ${C.cardBorder}`,
  background: C.inputBg,
  color:      C.text,
} as const;

/** Dark background with SK cream dot texture */
export const darkBg = {
  background:      C.black,
  backgroundImage: "radial-gradient(rgba(255,243,154,0.045) 1px, transparent 1px)",
  backgroundSize:  "22px 22px",
} as const;

/** Dark background + radial yellow glow + dot texture */
export const darkGlowBg = (glowAt = "15% 50%"): CSSProperties => ({
  background: C.black,
  backgroundImage: [
    `radial-gradient(ellipse at ${glowAt}, rgba(245,216,0,0.1) 0%, transparent 55%)`,
    "radial-gradient(rgba(255,243,154,0.04) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "100% 100%, 22px 22px",
});

/* ── Status config ───────────────────────────────────────────────── */
export type StatusKey = "active" | "paused" | "cancelled";

export const STATUS_CFG: Record<StatusKey, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: C.green, bg: C.greenBg },
  paused:    { label: "Paused",    color: C.amber, bg: C.amberBg },
  cancelled: { label: "Cancelled", color: C.red,   bg: C.redBg   },
};

/* ── Plan badge config ───────────────────────────────────────────── */
export const PLAN_CFG: Record<string, { color: string; bg: string }> = {
  Enterprise: { color: C.blue,  bg: C.blueBg  },
  Business:   { color: C.green, bg: C.greenBg },
  Starter:    { color: C.textSub, bg: C.muted },
};

/* ── Animation easing preset ────────────────────────────────────── */
export const EASE_SK = [0.16, 1, 0.3, 1] as const;
