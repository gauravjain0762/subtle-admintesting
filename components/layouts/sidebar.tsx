"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import {
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkLogoAnimated, SkLogoMark } from "@/components/ui/sk-logo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette ── */
const GOLD = "#f8e396";
const INACTIVE = "#6b6b5a";
const HOVER_BG = "#111111";

interface NavChild { label: string; href: string; }
interface NavEntry { label: string; href: string; icon: React.ElementType; children?: NavChild[]; }

const NAV: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Company Management", href: "/dashboard/companies", icon: Building2,
    children: [
      { label: "Company List", href: "/dashboard/companies" },
      { label: "Company Request", href: "/dashboard/company-management/requests" },
    ],
  },
  { label: "Meal Management", href: "/dashboard/menu", icon: UtensilsCrossed },
  // { label: "Weekly Menu", href: "/dashboard/weekly-menu", icon: CalendarDays },
  { label: "Orders", href: "/dashboard/orders", icon: ClipboardList },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({
  label, href, Icon, active, collapsed,
}: {
  label: string; href: string; Icon: React.ElementType;
  active: boolean; collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-semibold shadow-xl"
            style={{ background: "#1a1a1a", color: "#ffffff", border: "1px solid #2a2a2a" }}
          >
            {label}
            <span
              className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
              style={{ borderRightColor: "#1a1a1a" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href={href}
        className="relative flex items-center rounded-[10px] transition-all duration-150"
        style={{
          padding: "11px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 13,
          background: active || hovered ? HOVER_BG : "transparent",
        }}
      >
        {/* Active right-side bar (mentor style) */}
        {active && (
          <motion.span
            layoutId="nav-bar"
            className="absolute right-0 top-[18%] h-[64%] w-[4px] rounded-l-[3px]"
            style={{ background: GOLD }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <Icon
          size={18}
          strokeWidth={active ? 2.2 : 1.8}
          style={{ color: active ? GOLD : INACTIVE, flexShrink: 0 }}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden whitespace-nowrap text-[14px] font-bold leading-none"
              style={{ color: active ? GOLD : INACTIVE }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </div>
  );
}

function NavGroup({
  label, Icon, items, collapsed, pathname,
}: {
  label: string; Icon: React.ElementType; items: NavChild[];
  collapsed: boolean; pathname: string;
}) {
  const router = useRouter();
  const anyChildActive = items.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(anyChildActive);
  const [hovered, setHovered] = useState(false);

  if (collapsed) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -6, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-semibold shadow-xl"
              style={{ background: "#1a1a1a", color: "#ffffff", border: "1px solid #2a2a2a" }}
            >
              {label}
              <span
                className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                style={{ borderRightColor: "#1a1a1a" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => router.push(items[0].href)}
          className="relative flex w-full items-center justify-center rounded-[10px] transition-all duration-150"
          style={{ padding: "11px 14px", background: anyChildActive || hovered ? HOVER_BG : "transparent" }}
        >
          {anyChildActive && (
            <span className="absolute right-0 top-[18%] h-[64%] w-[4px] rounded-l-[3px]" style={{ background: GOLD }} />
          )}
          <Icon size={18} strokeWidth={anyChildActive ? 2.2 : 1.8} style={{ color: anyChildActive ? GOLD : INACTIVE }} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex w-full items-center rounded-[10px] transition-all duration-150"
        style={{ padding: "11px 14px", background: anyChildActive || hovered ? HOVER_BG : "transparent" }}
      >
        {anyChildActive && (
          <motion.span
            layoutId="nav-bar"
            className="absolute right-0 top-[18%] h-[64%] w-[4px] rounded-l-[3px]"
            style={{ background: GOLD }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Icon size={18} strokeWidth={anyChildActive ? 2.2 : 1.8} style={{ color: anyChildActive ? GOLD : INACTIVE, flexShrink: 0, marginRight: 13 }} />
        <span className="min-w-0 shrink truncate text-left text-[12.5px] font-bold leading-none" style={{ color: anyChildActive ? GOLD : INACTIVE }}>
          {label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} className="shrink-0" style={{ marginLeft: 8 }}>
          <ChevronDown size={14} style={{ color: anyChildActive ? GOLD : INACTIVE }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[15px] mt-0.5 flex flex-col gap-0.5 border-l pl-4" style={{ borderColor: "#1c1c1c" }}>
              {items.map((c) => {
                const childActive = pathname === c.href || pathname.startsWith(c.href + "/");
                return (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="rounded-lg py-2 pl-2 pr-3 text-[12.5px] font-semibold transition-colors"
                    style={{ color: childActive ? GOLD : INACTIVE }}
                    onMouseEnter={(e) => { if (!childActive) (e.currentTarget as HTMLElement).style.color = "#8a8a78"; }}
                    onMouseLeave={(e) => { if (!childActive) (e.currentTarget as HTMLElement).style.color = INACTIVE; }}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : (pathname === href || pathname.startsWith(href + "/"));

  return (
    <div
      className={`flex h-full flex-col ${montserrat.className}`}
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Brand / Logo — total height fixed to 56px to match the topbar's border line ── */}
      <div className="shrink-0">
        <div className="flex items-center px-4" style={{ height: 36, justifyContent: collapsed ? "center" : "flex-start" }}>
          {collapsed ? (
            <SkLogoMark />
          ) : (
            <SkLogoAnimated collapsed={false} />
          )}
        </div>
        <div
          className="flex items-center overflow-hidden border-b px-4"
          style={{ height: 20, borderColor: "#181818" }}
        >
          <p
            className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.16em] transition-opacity duration-150"
            style={{
              color: "#3a3a3a",
              opacity: collapsed ? 0 : 1,
              width: "100%",
              textAlign: collapsed ? "center" : "left",
            }}
          >
            Admin Management System
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map((item) =>
          item.children ? (
            <NavGroup
              key={item.label}
              label={item.label}
              Icon={item.icon}
              items={item.children}
              collapsed={collapsed}
              pathname={pathname}
            />
          ) : (
            <NavItem
              key={item.href}
              label={item.label}
              href={item.href}
              Icon={item.icon}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          )
        )}
      </nav>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 264 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col overflow-hidden lg:flex"
        style={{ borderRight: "1px solid #181818" }}
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* Desktop collapse toggle — border-edge toggle, kick-analyst reference style */}
      <motion.button
        onClick={onToggle}
        animate={{ left: collapsed ? 64 - 10 : 264 - 10 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="fixed z-50 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border transition-colors lg:flex"
        style={{
          top: 20,
          background: "#1c1c1c",
          borderColor: "rgba(248,227,150,0.3)",
          color: "#c9b98a",
          boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#26231a";
          (e.currentTarget as HTMLElement).style.borderColor = "#f8e396";
          (e.currentTarget as HTMLElement).style.color = "#f8e396";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#1c1c1c";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,227,150,0.3)";
          (e.currentTarget as HTMLElement).style.color = "#c9b98a";
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.88 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={collapsed ? "right" : "left"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.12 }}
            className="flex items-center justify-center"
          >
            {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Tablet sidebar (always icon-only) */}
      <aside
        className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col overflow-hidden border-r md:flex lg:hidden"
        style={{ width: 64, background: "#0a0a0a", borderColor: "#181818" }}
      >
        <SidebarContent collapsed={true} />
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-drawer"
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 top-0 z-[60] flex flex-col md:hidden"
            style={{ width: 264 }}
          >
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ color: "#6b6b5a" }}
            >
              <X size={16} />
            </button>
            <SidebarContent collapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
