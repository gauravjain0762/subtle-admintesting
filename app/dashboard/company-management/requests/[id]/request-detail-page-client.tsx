"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getEnquiry, approveEnquiry, rejectEnquiry, employeeRangeLabel,
  type Enquiry, type EnquiryStatus,
} from "@/lib/enquiries-store";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const M = {
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  gold: "#f8e396",
  goldFaint: "rgba(248,227,150,0.28)",
  white: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
  green: "#22c55e",
  red: "#ff6b6b",
};

const STATUS_CFG: Record<EnquiryStatus, { label: string; color: string; bg: string }> = {
  new:      { label: "Pending",  color: M.gold,  bg: "#2a2400" },
  approved: { label: "Approved", color: M.green, bg: "#0d2a1a" },
  rejected: { label: "Rejected", color: M.red,   bg: "#2a0a0a" },
};

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);

  useEffect(() => {
    const found = getEnquiry(id);
    if (!found) { router.replace("/dashboard/company-management/requests"); return; }
    setEnquiry(found);
  }, [id, router]);

  if (!enquiry) return null;

  const cfg = STATUS_CFG[enquiry.status];

  const handleApprove = () => {
    approveEnquiry(enquiry.id);
    setEnquiry(getEnquiry(id) ?? null);
    toast.success(`"${enquiry.workspaceName}" approved — company created`);
  };

  const handleReject = () => {
    rejectEnquiry(enquiry.id);
    setEnquiry(getEnquiry(id) ?? null);
    toast.error(`"${enquiry.workspaceName}" rejected`);
  };

  return (
    <div className={montserrat.className}>
      <button
        onClick={() => router.push("/dashboard/company-management/requests")}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
        style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.textMuted }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.goldFaint; (e.currentTarget as HTMLElement).style.color = M.gold; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = M.border; (e.currentTarget as HTMLElement).style.color = M.textMuted; }}
      >
        <ArrowLeft size={12} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 size={18} style={{ color: M.gold }} />
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: M.gold }}>{enquiry.workspaceName}</h1>
            <span
              className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}` }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        {enquiry.status === "new" && (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleApprove}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors"
              style={{ border: `1px solid ${M.green}`, color: M.green }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.green; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.green; }}
            >
              <Check size={13} /> Approve
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleReject}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors"
              style={{ border: `1px solid ${M.red}`, color: M.red }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.red; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.red; }}
            >
              <XIcon size={13} /> Reject
            </motion.button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 rounded-xl p-6"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Workspace Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Workspace Name", value: enquiry.workspaceName },
            { label: "Address", value: enquiry.address },
            { label: "Town", value: enquiry.town },
            { label: "City", value: enquiry.city },
            { label: "Postcode", value: enquiry.postcode },
            { label: "Country", value: enquiry.country },
            { label: "Business Type", value: enquiry.businessType },
            { label: "No. of Employees", value: employeeRangeLabel(enquiry.totalEmployees) },
          ].map((row) => (
            <div key={row.label} className="rounded-lg px-4 py-3" style={{ background: M.surface }}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: M.textFaint }}>{row.label}</p>
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: M.white }}>{row.value}</p>
            </div>
          ))}

          {/* Lunch Delivery Time — supports multiple break slots */}
          <div className="rounded-lg px-4 py-3 sm:col-span-2" style={{ background: M.surface }}>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: M.textFaint }}>Lunch Delivery Time</p>
            {enquiry.deliveryTimes.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {enquiry.deliveryTimes.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium"
                    style={{ background: M.panel, border: `1px solid ${M.border}`, color: M.white }}
                  >
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: M.goldFaint, color: M.gold }}>
                      BREAK {i + 1}
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: M.white }}>—</p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 rounded-xl p-6"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
      >
        <h2 className="mb-5 text-[13px] font-bold" style={{ color: M.white }}>Contact Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Contact", value: `${enquiry.firstName} ${enquiry.lastName}` },
            { label: "Email", value: enquiry.email },
            { label: "Phone", value: enquiry.phone },
            { label: "Submitted", value: enquiry.dateISO },
          ].map((row) => (
            <div key={row.label} className="rounded-lg px-4 py-3" style={{ background: M.surface }}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: M.textFaint }}>{row.label}</p>
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: M.white }}>{row.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
