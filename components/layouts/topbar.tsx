"use client";

import { Bell, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkLogoMark } from "@/components/ui/sk-logo";

interface TopbarProps {
  onMobileMenuOpen: () => void;
  /** Desktop sidebar width in px — used to push search bar right so it doesn't sit under the sidebar */
  sidebarWidth?: number;
}

export function Topbar({ onMobileMenuOpen, sidebarWidth = 224 }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-30 h-[56px]"
        style={{
          background: "rgba(253,248,236,0.94)",
          borderBottom: "1px solid #e8e0cc",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex h-full items-center gap-3 px-4">

          {/* ── Desktop: sidebar spacer ── */}
          <div
            className="hidden shrink-0 lg:block transition-[width] duration-300"
            style={{ width: sidebarWidth }}
          />
          {/* ── Tablet: fixed 64px spacer ── */}
          <div className="hidden w-16 shrink-0 md:block lg:hidden" />

          {/* ── Mobile: burger + logo ── */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              onClick={onMobileMenuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-[#f0e9d6]"
              style={{ color: "#6b6b5a" }}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
            <div
              className="flex items-center justify-center rounded-xl px-2.5 py-1.5"
              style={{ background: "#0a0a0a" }}
            >
              <SkLogoMark />
            </div>
          </div>

          {/* ── Search bar (desktop / tablet) ── */}
          <div className="hidden flex-1 md:flex" style={{ maxWidth: 480 }}>
            <div
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all"
              style={{
                background: searchFocused ? "#ffffff" : "#f0e9d6",
                border: `1.5px solid ${searchFocused ? "#f5d800" : "#e8e0cc"}`,
                boxShadow: searchFocused ? "0 0 0 3px rgba(245,216,0,0.12)" : "none",
              }}
            >
              <Search size={13} style={{ color: "#9b9b89", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search orders, companies, dishes…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "#0a0a0a" }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchValue ? (
                <button onClick={() => setSearchValue("")} style={{ color: "#9b9b89" }}>
                  <X size={12} />
                </button>
              ) : (
                <span
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "#e8e0cc", color: "#6b6b5a" }}
                >
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* ── Right cluster ── */}
          <div className="ml-auto flex items-center gap-2">

            {/* Mobile: search icon */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#f0e9d6] md:hidden"
              style={{ color: "#6b6b5a" }}
              aria-label="Search"
            >
              {mobileSearchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {/* Notifications bell */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#f0e9d6]"
              style={{ color: "#6b6b5a" }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span
                className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full"
                style={{ background: "#f5d800" }}
              />
            </button>

            {/* Today badge */}
            <div
              className="hidden items-center gap-2 rounded-xl px-3 py-1.5 sm:flex"
              style={{ background: "#f5d800" }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#0a0a0a" }}>
                Today
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "#0a0a0a" }}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </div>

            {/* Avatar */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: "#0a0a0a", color: "#f5d800" }}
            >
              SK
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile search bar (dropdown below topbar) ── */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 top-[56px] z-30 px-4 py-3 md:hidden"
            style={{
              background: "rgba(253,248,236,0.98)",
              borderBottom: "1px solid #e8e0cc",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
              style={{
                background: "#ffffff",
                border: "1.5px solid #f5d800",
                boxShadow: "0 0 0 3px rgba(245,216,0,0.1)",
              }}
            >
              <Search size={14} style={{ color: "#9b9b89" }} />
              <input
                type="text"
                autoFocus
                placeholder="Search orders, companies, dishes…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "#0a0a0a" }}
              />
              {searchValue && (
                <button onClick={() => setSearchValue("")} style={{ color: "#9b9b89" }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
