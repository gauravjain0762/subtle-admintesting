"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin,
  Users, Calendar, Briefcase, Clock, Globe,
  Copy, Power, UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { getCompany, getCompanyIds, setCompanyStatus, type Company } from "@/lib/companies-store";
import { getMenu } from "@/lib/menus-store";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette (matches companies/page.tsx) ── */
const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  red: "#ff6b6b",
};

const STATUS_DISPLAY_M: Record<string, { label: string; color: string }> = {
  active:   { label: "Active",   color: M.green },
  inactive: { label: "Inactive", color: M.red },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompanyIds().map((id) => ({ id }));
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
});

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();

  const [company, setCompanyData] = useState<Company | null>(null);

  useEffect(() => {
    const found = getCompany(id);
    if (!found) { router.replace("/dashboard/companies"); return; }
    setCompanyData(found);
  }, [id, router]);

  if (!company) return null;

  const sd = STATUS_DISPLAY_M[company.status] ?? STATUS_DISPLAY_M.active;
  const assignedMenu = getMenu(company.menuId ?? "standard");

  const copyCode = () => {
    navigator.clipboard.writeText(company.code);
    toast.success(`Company code "${company.code}" copied!`);
  };

  const sendCodeToMail = () => {
    toast.success(`Code "${company.code}" sent to ${company.email}`);
  };

  const toggleStatus = () => {
    const next = company.status === "active" ? "inactive" : "active";
    setCompanyStatus(id, next);
    setCompanyData(getCompany(id) ?? null);
    toast.success(`"${company.name}" marked ${next}`);
  };

  return (
    <div className={`space-y-6 ${montserrat.className}`}>
      {/* Back link */}
      <motion.div {...fade(0)}>
        <Link
          href="/dashboard/companies"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
          style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
        >
          <ArrowLeft size={12} /> Back
        </Link>

        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: M.gold }}>{company.name}</h1>
      </motion.div>

      {/* Company Code banner */}
      <motion.div
        {...fade(0.06)}
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-[14px] font-bold"
            style={{ background: company.logoColor, color: company.logoText }}
          >
            {company.logo}
          </div>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em]" style={{ color: M.textFaint }}>Company Code</p>
            <p className="mt-0.5 font-mono text-[22px] font-bold tracking-widest" style={{ color: M.gold }}>{company.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={copyCode}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-semibold"
            style={{ background: M.gold, color: "#000000" }}
          >
            <Copy size={13} /> Copy Code
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={sendCodeToMail}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-semibold transition-colors"
            style={{ border: `1px solid ${M.gold}`, color: M.gold, background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.gold; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.gold; }}
          >
            <Mail size={13} /> Send to Mail
          </motion.button>
        </div>
      </motion.div>

      {/* Workspace Details */}
      <motion.div {...fade(0.14)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Workspace Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Building2, label: "Company Name", value: company.name    },
            { icon: Briefcase, label: "Business Type", value: company.industry },
            { icon: MapPin,    label: "Address",      value: company.address || "—" },
            { icon: MapPin,    label: "Town",         value: company.town || "—" },
            { icon: MapPin,    label: "City",         value: company.city    },
            { icon: MapPin,    label: "Postal Code",  value: company.postalCode || "—" },
            { icon: Globe,     label: "Country",      value: company.country || "—" },
            { icon: UtensilsCrossed, label: "Assigned Menu", value: assignedMenu?.name ?? "Standard Menu" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: M.surface }}>
                <Icon size={14} style={{ color: M.goldMuted }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: M.textFaint }}>{label}</p>
                <p className="text-[13px] font-medium" style={{ color: M.white }}>{value}</p>
              </div>
            </div>
          ))}

          {/* Lunch Delivery Time — supports multiple break slots */}
          <div className="flex items-center gap-3 sm:col-span-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: M.surface }}>
              <Clock size={14} style={{ color: M.goldMuted }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: M.textFaint }}>Lunch Delivery Time</p>
              {company.deliveryTimes.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {company.deliveryTimes.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium"
                      style={{ background: M.surface, border: `1px solid ${M.border}`, color: M.white }}
                    >
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: M.goldFaint, color: M.gold }}>
                        BREAK {i + 1}
                      </span>
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] font-medium" style={{ color: M.white }}>—</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Details */}
      <motion.div {...fade(0.18)} className="rounded-xl p-6" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Contact Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Users,     label: "HR Contact",   value: company.contact },
            { icon: Mail,      label: "Email",        value: company.email   },
            { icon: Phone,     label: "Phone",        value: company.phone   },
            { icon: Calendar,  label: "Client Since", value: company.since   },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: M.surface }}>
                <Icon size={14} style={{ color: M.goldMuted }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: M.textFaint }}>{label}</p>
                <p className="text-[13px] font-medium" style={{ color: M.white }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Company Status */}
      <motion.div
        {...fade(0.24)}
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-6"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13px] font-bold" style={{ color: M.white }}>Company Status</h2>
            <span
              className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
              style={{ border: `1px solid ${sd.color}`, color: sd.color }}
            >
              {sd.label}
            </span>
          </div>
          <p className="mt-1 text-[12px]" style={{ color: M.textMuted }}>
            {company.status === "active"
              ? "This company is active and can place orders. Marking it inactive will pause ordering."
              : "This company is inactive and cannot place orders. Marking it active will resume ordering."}
          </p>
        </div>

        {(() => {
          const target = company.status === "active" ? "inactive" : "active";
          const tCfg = STATUS_DISPLAY_M[target];
          return (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={toggleStatus}
              className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors"
              style={{ border: `1px solid ${tCfg.color}`, color: tCfg.color }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = tCfg.color; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = tCfg.color; }}
            >
              <Power size={13} /> Set {tCfg.label}
            </motion.button>
          );
        })()}
      </motion.div>
    </div>
  );
}
