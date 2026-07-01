"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  CreditCard,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SkLogoAnimated, SkLogoMark } from "@/components/ui/sk-logo";

const NAV = [
  { label: "Dashboard",     href: "/dashboard",               icon: LayoutDashboard },
  { label: "Orders",        href: "/dashboard/orders",        icon: ShoppingBag },
  { label: "Menu",          href: "/dashboard/menu",          icon: UtensilsCrossed },
  { label: "Companies",     href: "/dashboard/companies",     icon: Building2 },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Deliveries",    href: "/dashboard/deliveries",    icon: Truck },
  { label: "Analytics",     href: "/dashboard/analytics",     icon: BarChart3 },
  { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
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
            className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-xl px-3 py-1.5 text-[12px] font-semibold shadow-xl"
            style={{
              background: "#1a1a12",
              color: "#f0f0e0",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {label}
            {/* Arrow */}
            <span
              className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
              style={{ borderRightColor: "#1a1a12" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href={href}
        className="relative flex items-center rounded-xl transition-all duration-150"
        style={{
          padding: "9px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 10,
          background: active
            ? "rgba(201,169,110,0.1)"
            : hovered
            ? "rgba(255,255,255,0.04)"
            : "transparent",
        }}
      >
        {/* Active left stripe */}
        {active && (
          <motion.span
            layoutId="nav-stripe"
            className="absolute left-0 top-2.5 bottom-2.5 w-[2.5px] rounded-full"
            style={{ background: "#c9a96e" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <motion.div
          animate={active ? { scale: 1.08 } : { scale: 1 }}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 460, damping: 22 }}
        >
          <Icon
            size={17}
            strokeWidth={active ? 2.2 : 1.8}
            style={{ color: active ? "#c9a96e" : "#7a7a68", flexShrink: 0 }}
          />
        </motion.div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden whitespace-nowrap text-[13px] font-medium leading-none"
              style={{ color: active ? "#e8d8b8" : "#8a8a78" }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </div>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div
      className="flex h-full flex-col"
      style={{
        background: "#0a0a0a",
        backgroundImage:
          "radial-gradient(rgba(255,243,154,0.045) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >

      {/* ── Brand / Logo ── */}
      <div
        className="flex shrink-0 items-center border-b px-4"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          minHeight: 72,
          paddingTop: 14,
          paddingBottom: 14,
        }}
      >
        {collapsed ? (
          <SkLogoMark />
        ) : (
          <SkLogoAnimated collapsed={false} />
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin">
        {!collapsed && (
          <p
            className="px-3 pb-2 pt-1 text-[9.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#2e2e26" }}
          >
            Main
          </p>
        )}
        {NAV.slice(0, 6).map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            Icon={item.icon}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        {!collapsed && (
          <p
            className="px-3 pb-2 pt-4 text-[9.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#2e2e26" }}
          >
            Reports & Config
          </p>
        )}
        {collapsed && <div className="my-3 mx-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }} />}
        {NAV.slice(6).map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            Icon={item.icon}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── Admin user + sign out ── */}
      <div
        className="shrink-0 border-t px-2 py-3 space-y-1"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 overflow-hidden"
              style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)" }}
            >
              {/* Avatar uses the gold bar + S mark */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}
              >
                SK
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold" style={{ color: "#e8d8b8" }}>
                  Admin User
                </p>
                <p className="truncate text-[10.5px]" style={{ color: "#4a4a3a" }}>
                  admin@subtlekitchen.com
                </p>
              </div>
              <Bell size={13} style={{ color: "#4a4a3a", flexShrink: 0 }} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            toast.success("Signed out successfully");
            router.push("/login");
          }}
          className="flex w-full items-center rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
          style={{
            gap: collapsed ? 0 : 9,
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#4a4a3a",
          }}
        >
          <LogOut size={15} />
          {!collapsed && (
            <span className="text-[12.5px] font-medium" style={{ color: "#5a5a48" }}>
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col overflow-hidden lg:flex"
        style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* Desktop collapse toggle */}
      <motion.button
        onClick={onToggle}
        animate={{ left: collapsed ? 54 : 214 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed z-50 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-colors lg:flex"
        style={{
          top: "50vh",
          background: "#1a1a10",
          borderColor: "rgba(201,169,110,0.2)",
          color: "#6b6b5a",
        }}
        whileHover={{ scale: 1.2, borderColor: "rgba(201,169,110,0.5)" }}
        whileTap={{ scale: 0.88 }}
      >
        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </motion.button>

      {/* Tablet sidebar (always icon-only) */}
      <aside
        className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col overflow-hidden border-r md:flex lg:hidden"
        style={{ width: 64, background: "#0a0a0a", borderColor: "rgba(255,255,255,0.04)" }}
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
            initial={{ x: -224 }}
            animate={{ x: 0 }}
            exit={{ x: -224 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 top-0 z-[60] flex flex-col md:hidden"
            style={{ width: 224 }}
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
