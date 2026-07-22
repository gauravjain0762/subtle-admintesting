/**
 * Shared dark-panel palette used by the real-backend admin pages (Orders, Promo Codes,
 * Customer Management). Kept separate from the light `C` palette in `sk-theme.ts`.
 */
export const DARK = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  borderFaint: "#131313",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  amber: "#f5c451",
  red: "#ff6b6b",
} as const;
