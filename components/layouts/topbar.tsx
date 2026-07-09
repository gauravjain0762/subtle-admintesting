"use client";

import { Bell, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SkLogoMark } from "@/components/ui/sk-logo";
import { logout } from "@/lib/api/auth";

interface TopbarProps {
  onMobileMenuOpen: () => void;
  /** Desktop sidebar width in px — used to push the right cluster so it doesn't sit under the sidebar */
  sidebarWidth?: number;
}

export function Topbar({ onMobileMenuOpen, sidebarWidth = 264 }: TopbarProps) {
  const router = useRouter();

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
