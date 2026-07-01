"use client";

import { motion, AnimatePresence } from "framer-motion";

/* ── Proper leaf SVG — wide oval leaf, diagonal ── */
function Leaf({ size = 28 }: { size?: number }) {
  const h = size * 0.78;
  const w = h * 0.62;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 12 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        transform: "rotate(20deg)",
        marginLeft: 1,
        marginRight: 1,
        marginBottom: 2,
      }}
    >
      {/* Leaf body — nice wide almond shape */}
      <path
        d="M6 0 C11 3 13 10 10 16 C8 19 4 20 2 18 C-1 14 0 5 6 0Z"
        fill="#4d8f38"
      />
      {/* Highlight on right edge */}
      <path
        d="M6 0 C11 3 13 10 10 16"
        stroke="#5faa45"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Centre midrib vein */}
      <path
        d="M6 1 C5 7 4 13 3 18"
        stroke="#2e6420"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Full logo (login page) ── */
export function SkLogoFull({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
      {/* Gold vertical bar */}
      <div
        style={{
          width: 2.5,
          height: 58,
          background: "linear-gradient(to bottom, #d4a843, #9a7030)",
          borderRadius: 2,
          marginTop: 2,
          flexShrink: 0,
        }}
      />
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: "var(--font-inter), 'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 300,
          color: "#c9a050",
          letterSpacing: "0.08em",
          marginBottom: 2,
        }}>
          subtle
        </div>
        <div style={{
          fontFamily: "var(--font-inter), 'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
        }}>
          <span>KITCH</span>
          <Leaf size={32} />
          <span>N</span>
        </div>
      </div>
    </div>
  );
}

/* ── Logo mark (collapsed sidebar, topbar mobile) ── */
export function SkLogoMark({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div
        style={{
          width: 2.5,
          height: 32,
          background: "linear-gradient(to bottom, #d4a843, #9a7030)",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <div style={{
        fontFamily: "var(--font-inter), 'Inter', sans-serif",
        fontSize: 15,
        fontWeight: 900,
        color: "#ffffff",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
      }}>
        SK
      </div>
    </div>
  );
}

/* ── Animated logo for sidebar (collapses/expands) ── */
export function SkLogoAnimated({ collapsed }: { collapsed: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11, overflow: "hidden", minHeight: 62 }}>
      {/* Gold bar */}
      <motion.div
        animate={{ height: collapsed ? 32 : 58 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 2.5,
          background: "linear-gradient(to bottom, #d4a843, #9a7030)",
          borderRadius: 2,
          marginTop: 2,
          flexShrink: 0,
        }}
      />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="text"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1 }}
          >
            <div style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 300,
              color: "#c9a050",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}>
              subtle
            </div>
            <div style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
              fontSize: 30,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}>
              <span>KITCH</span>
              <Leaf size={30} />
              <span>N</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
