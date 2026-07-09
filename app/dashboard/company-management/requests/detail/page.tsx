"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getEnquiry, approveEnquiry, rejectEnquiry,
  type Enquiry, type EnquiryStatus,
} from "@/lib/enquiries-store";
import { generateCode } from "@/lib/companies-store";
import { ApiError } from "@/lib/api/client";

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

function RejectModal({ workspaceName, working, onConfirm, onClose }: {
  workspaceName: string; working: boolean;
  onConfirm: (reason: string) => void; onClose: () => void;
}) {
  const [reason, setReason] = useState("Outside our current delivery area");
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="w-full max-w-[420px] rounded-2xl p-6"
        style={{ background: M.panel, border: `1px solid ${M.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-[15px] font-bold" style={{ color: M.white }}>Reject &ldquo;{workspaceName}&rdquo;</h2>
        <p className="mb-4 text-[12px]" style={{ color: M.textMuted }}>Provide a reason — this is sent to the applicant.</p>
        <textarea
          rows={3}
          value={reason}
          onChange={(ev) => setReason(ev.target.value)}
          className="w-full resize-none rounded-lg px-3.5 py-2.5 text-[13px] outline-none"
          style={{ border: `1px solid ${M.border}`, background: M.surface, color: M.white }}
        />
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={working}
            className="flex-1 rounded-lg py-2.5 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || "Outside our current delivery area")}
            disabled={working}
            className="flex-1 rounded-lg py-2.5 text-[12.5px] font-bold transition-opacity disabled:opacity-60"
            style={{ background: M.red, color: "#000000" }}
          >
            {working ? "Rejecting…" : "Reject Request"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RequestDetailPage() {
  return (
    <Suspense fallback={null}>
      <RequestDetailContent />
    </Suspense>
  );
}

function RequestDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!id) { router.replace("/dashboard/company-management/requests"); return; }
    let cancelled = false;
    setLoading(true);
    getEnquiry(id)
      .then((found) => {
        if (cancelled) return;
        if (!found) { router.replace("/dashboard/company-management/requests"); return; }
        setEnquiry(found);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "Failed to load request");
        router.replace("/dashboard/company-management/requests");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, router]);

  if (loading || !enquiry) return null;

  const cfg = STATUS_CFG[enquiry.status];

  const handleApprove = async () => {
    setWorking(true);
    try {
      const code = generateCode(enquiry.workspaceName);
      await approveEnquiry(enquiry.id, code);
      const refreshed = await getEnquiry(id);
      setEnquiry(refreshed ?? null);
      toast.success(`"${enquiry.workspaceName}" approved — code ${code}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to approve request");
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async (reason: string) => {
    setWorking(true);
    try {
      await rejectEnquiry(enquiry.id, reason);
      const refreshed = await getEnquiry(id);
      setEnquiry(refreshed ?? null);
      toast.error(`"${enquiry.workspaceName}" rejected`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reject request");
    } finally {
      setWorking(false);
      setShowRejectModal(false);
    }
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
          {enquiry.referenceId && (
            <p className="mt-1 font-mono text-[11px]" style={{ color: M.textFaint }}>{enquiry.referenceId}</p>
          )}
        </div>

        {enquiry.status !== "approved" && (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: working ? 1 : 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleApprove}
              disabled={working}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors disabled:opacity-60"
              style={{ border: `1px solid ${M.green}`, color: M.green }}
              onMouseEnter={(e) => { if (!working) { (e.currentTarget as HTMLElement).style.background = M.green; (e.currentTarget as HTMLElement).style.color = "#000000"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.green; }}
            >
              <Check size={13} /> Approve
            </motion.button>
            {enquiry.status === "new" && (
              <motion.button
                whileHover={{ scale: working ? 1 : 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowRejectModal(true)}
                disabled={working}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors disabled:opacity-60"
                style={{ border: `1px solid ${M.red}`, color: M.red }}
                onMouseEnter={(e) => { if (!working) { (e.currentTarget as HTMLElement).style.background = M.red; (e.currentTarget as HTMLElement).style.color = "#000000"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.red; }}
              >
                <XIcon size={13} /> Reject
              </motion.button>
            )}
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
            { label: "Address", value: enquiry.address || "—" },
            { label: "Town", value: enquiry.town || "—" },
            { label: "City", value: enquiry.city || "—" },
            { label: "Postcode", value: enquiry.postcode || "—" },
            { label: "Country", value: enquiry.country || "—" },
            { label: "Business Type", value: enquiry.businessType || "—" },
            { label: "No. of Employees", value: enquiry.totalEmployees || "—" },
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
            { label: "Submitted", value: new Date(enquiry.dateISO).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
          ].map((row) => (
            <div key={row.label} className="rounded-lg px-4 py-3" style={{ background: M.surface }}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: M.textFaint }}>{row.label}</p>
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: M.white }}>{row.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showRejectModal && (
          <RejectModal
            workspaceName={enquiry.workspaceName}
            working={working}
            onClose={() => setShowRejectModal(false)}
            onConfirm={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
