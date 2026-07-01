"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import { PageTransition } from "@/components/ui/page-transition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 64 : 224;

  return (
    <div className="min-h-screen" style={{ background: "#fdf8ec" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Topbar
        onMobileMenuOpen={() => setMobileOpen(true)}
        sidebarWidth={sidebarWidth}
      />

      <main
        className="flex min-h-screen flex-col pt-[56px] transition-[padding] duration-300"
        style={{ paddingLeft: sidebarWidth }}
      >
        {/* Responsive sidebar-offset overrides */}
        <style>{`
          @media (max-width: 767px)  { main { padding-left: 0 !important; } }
          @media (min-width: 768px) and (max-width: 1023px) { main { padding-left: 64px !important; } }
        `}</style>

        <div className="flex-1 p-5 md:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
