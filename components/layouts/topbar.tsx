"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SkLogoMark } from "@/components/ui/sk-logo";
import { logout } from "@/lib/api/auth";
import { getStripeMode, switchStripeMode, type StripeModeResponse } from "@/lib/api/stripe";
import { ApiError } from "@/lib/api/client";

interface TopbarProps {
  onMobileMenuOpen: () => void;
  /** Desktop sidebar width in px — used to push the right cluster so it doesn't sit under the sidebar */
  sidebarWidth?: number;
}

export function Topbar({ onMobileMenuOpen, sidebarWidth = 264 }: TopbarProps) {
  const router = useRouter();
  const [stripeMode, setStripeMode] = useState<"test" | "live">("test");
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchStripeMode();
  }, []);

  const fetchStripeMode = async () => {
    try {
      const res = await getStripeMode();
      setStripeMode(res.currentMode);
    } catch (err) {
      console.error("Failed to fetch Stripe mode:", err);
    }
  };

  const handleSwitchMode = async (newMode: "test" | "live") => {
    if (newMode === stripeMode) {
      setModeDropdownOpen(false);
      return;
    }
    setSwitching(true);
    try {
      await switchStripeMode(newMode);
      setStripeMode(newMode);
      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
      setModeDropdownOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to switch mode");
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 h-[56px]"
      style={{
        background: "rgba(10,10,10,0.92)",
        borderBottom: "1px solid rgba(248,227,150,0.12)",
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
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-[#161616]"
            style={{ color: "#888888" }}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <div
            className="flex items-center justify-center rounded-xl px-2.5 py-1.5"
            style={{ background: "#111111", border: "1px solid #1c1c1c" }}
          >
            <SkLogoMark />
          </div>
        </div>

        {/* ── Right cluster ── */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications bell */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#161616]"
            style={{ color: "#888888" }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span
              className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full"
              style={{ background: "#f8e396" }}
            />
          </button>

          {/* Stripe Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              disabled={switching}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors"
              style={{
                border: `1px solid ${stripeMode === "live" ? "#ff6b6b" : "rgba(248,227,150,0.25)"}`,
                color: stripeMode === "live" ? "#ff6b6b" : "#f8e396",
                background: stripeMode === "live" ? "rgba(255,107,107,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!switching) {
                  (e.currentTarget as HTMLElement).style.background = stripeMode === "live" ? "rgba(255,107,107,0.2)" : "#f8e396";
                  (e.currentTarget as HTMLElement).style.color = stripeMode === "live" ? "#ff6b6b" : "#000000";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = stripeMode === "live" ? "rgba(255,107,107,0.1)" : "transparent";
                (e.currentTarget as HTMLElement).style.color = stripeMode === "live" ? "#ff6b6b" : "#f8e396";
              }}
              aria-label="Stripe mode"
            >
              <span className="hidden sm:inline">{stripeMode.toUpperCase()}</span>
              <span className="sm:hidden">{stripeMode === "live" ? "🔴" : "🟡"}</span>
              <ChevronDown size={14} style={{ transition: "transform 0.2s" }} style={{ transform: modeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {modeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl py-2"
                  style={{ background: "#141414", border: "1px solid rgba(248,227,150,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleSwitchMode("test")}
                    disabled={switching || stripeMode === "test"}
                    className="w-full px-4 py-2 text-left text-[12px] font-semibold transition-colors disabled:opacity-50"
                    style={{
                      color: stripeMode === "test" ? "#f8e396" : "#888888",
                      background: stripeMode === "test" ? "rgba(248,227,150,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (stripeMode !== "test" && !switching) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(248,227,150,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = stripeMode === "test" ? "rgba(248,227,150,0.1)" : "transparent";
                    }}
                  >
                    🟡 Test Mode
                  </button>
                  <div style={{ height: "1px", background: "rgba(248,227,150,0.1)", margin: "4px 0" }} />
                  <button
                    onClick={() => handleSwitchMode("live")}
                    disabled={switching || stripeMode === "live"}
                    className="w-full px-4 py-2 text-left text-[12px] font-semibold transition-colors disabled:opacity-50"
                    style={{
                      color: stripeMode === "live" ? "#ff6b6b" : "#888888",
                      background: stripeMode === "live" ? "rgba(255,107,107,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (stripeMode !== "live" && !switching) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,107,107,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = stripeMode === "live" ? "rgba(255,107,107,0.1)" : "transparent";
                    }}
                  >
                    🔴 Live Mode
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: "#111111", color: "#f8e396", border: "1.5px solid rgba(248,227,150,0.35)" }}
          >
            SK
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors"
            style={{ border: "1px solid rgba(248,227,150,0.25)", color: "#f8e396" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8e396"; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#f8e396"; }}
            aria-label="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
