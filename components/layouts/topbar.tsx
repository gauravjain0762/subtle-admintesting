"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, LogOut, ChevronDown, Trash2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SkLogoMark } from "@/components/ui/sk-logo";
import { logout } from "@/lib/api/auth";
import { getStripeMode, switchStripeMode, type StripeModeResponse } from "@/lib/api/stripe";
import { getNotifications, markNotificationAsRead, deleteNotification, type Notification } from "@/lib/api/notifications";
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(false);

  useEffect(() => {
    fetchStripeMode();
    fetchNotifications();
    const notifInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notifInterval);
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

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(1, 20, false);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchNotifications();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
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
          {/* Notifications bell with dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#161616]"
              style={{ color: "#888888" }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full animate-pulse"
                  style={{ background: "#f8e396" }}
                />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-16px)] rounded-xl overflow-hidden"
                  style={{ background: "#141414", border: "1px solid rgba(248,227,150,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "#1e1e1e" }}>
                    <div>
                      <h3 className="text-[13px] font-bold" style={{ color: "#ffffff" }}>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <p className="mt-0.5 text-[11px]" style={{ color: "#f8e396" }}>
                          {unreadCount} unread
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8">
                        <Bell size={24} style={{ color: "#444444" }} />
                        <p className="text-[12px]" style={{ color: "#666666" }}>
                          No notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="flex gap-3 border-b p-3 transition-colors hover:bg-[#1a1a1a]"
                          style={{ borderColor: "#1e1e1e" }}
                        >
                          {/* Icon */}
                          <div className="mt-0.5 shrink-0">
                            {notif.type === "workspace_request" ? (
                              <span className="text-[16px]">🏢</span>
                            ) : (
                              <span className="text-[16px]">🛒</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-bold" style={{ color: "#ffffff" }}>
                              {notif.title}
                            </h4>
                            <p className="mt-1 text-[11px] line-clamp-2" style={{ color: "#888888" }}>
                              {notif.message}
                            </p>
                            {notif.type === "workspace_request" && notif.data.workspaceName && (
                              <p className="mt-1.5 text-[10px]" style={{ color: "#666666" }}>
                                {notif.data.workspaceName} • {notif.data.contactEmail}
                              </p>
                            )}
                            {notif.type === "new_order" && notif.data.orderNumber && (
                              <p className="mt-1.5 text-[10px]" style={{ color: "#666666" }}>
                                {notif.data.orderNumber} • £{notif.data.orderTotal} • {notif.data.planType}
                              </p>
                            )}
                            <p className="mt-1 text-[10px]" style={{ color: "#555555" }}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 flex-col gap-1">
                            {!notif.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif._id, e)}
                                className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[#1a1a1a]"
                                style={{ color: "#f8e396" }}
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notif._id, e)}
                              className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[#1a1a1a]"
                              style={{ color: "#888888" }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: modeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
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
