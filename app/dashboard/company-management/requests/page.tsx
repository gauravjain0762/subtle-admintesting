"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Check, MoreVertical, Trash2, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getEnquiries, approveEnquiry, rejectEnquiry,
  type Enquiry, type EnquiryStatus,
} from "@/lib/enquiries-store";
import { LOGO_COLORS, generateCode } from "@/lib/companies-store";
import { ApiError } from "@/lib/api/client";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { BulkDeleteDialog } from "@/components/ui/bulk-delete-dialog";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ── Mentor project reference palette ── */
const M = {
  bg: "#000000",
  panel: "#0d0d0d",
  surface: "#111111",
  border: "#1e1e1e",
  borderFaint: "#131313",
  gold: "#f8e396",
  goldMuted: "rgba(248,227,150,0.6)",
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

function RejectModal({ enquiry, working, onConfirm, onClose }: {
  enquiry: Enquiry; working: boolean;
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
        <h2 className="mb-1 text-[15px] font-bold" style={{ color: M.white }}>Reject &ldquo;{enquiry.workspaceName}&rdquo;</h2>
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

export default function CompanyRequestsPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Enquiry | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = () => {
    setLoading(true);
    getEnquiries()
      .then(setEnquiries)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load requests"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    return !q ||
      e.workspaceName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.businessType.toLowerCase().includes(q);
  });

  const handleApprove = async (e: Enquiry) => {
    setWorkingId(e.id);
    try {
      const code = generateCode(e.workspaceName);
      await approveEnquiry(e.id, code);
      refresh();
      toast.success(`"${e.workspaceName}" approved — code ${code}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to approve request");
    } finally {
      setWorkingId(null);
    }
  };

  const handleReject = async (e: Enquiry, reason: string) => {
    setWorkingId(e.id);
    try {
      await rejectEnquiry(e.id, reason);
      refresh();
      toast.error(`"${e.workspaceName}" rejected`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reject request");
    } finally {
      setWorkingId(null);
      setRejectTarget(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteIconClick = () => {
    if (!selectMode) { setSelectMode(true); return; }
    if (selectedIds.size === 0) { toast.error("Select at least one request first"); return; }
    setBulkConfirm(true);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      // No DELETE endpoint exists for workspace-requests yet — surface that clearly rather than pretending it worked.
      await new Promise((r) => setTimeout(r, 300));
      toast.error("Deleting requests isn't supported by the backend yet");
    } finally {
      setBulkDeleting(false);
      setBulkConfirm(false);
    }
  };

  return (
    <div
      className={montserrat.className}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: M.gold }}>Company Requests</h1>
        <p className="mt-1 text-[12px]" style={{ color: "#D0C5AF" }}>
          New workspace sign-up requests awaiting review.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          title={selectMode ? `Delete ${selectedIds.size} selected` : "Select requests to delete"}
          onClick={handleDeleteIconClick}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ border: `1px solid ${M.red}`, color: M.red, background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.red; (e.currentTarget as HTMLElement).style.color = "#000000"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = M.red; }}
        >
          <Trash2 size={15} />
        </button>

        <div
          className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5"
          style={{ border: `1px solid ${M.border}`, background: M.panel }}
        >
          <Search size={14} style={{ color: M.textFaint }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: M.white }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: M.textMuted }}>
              <XIcon size={13} />
            </button>
          )}
        </div>

        {selectMode && (
          <>
            <span className="text-[11.5px] font-semibold whitespace-nowrap" style={{ color: M.textMuted }}>
              {selectedIds.size} selected
            </span>
            <button
              title="Cancel selection"
              onClick={exitSelectMode}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
            >
              <XIcon size={14} />
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {[...(selectMode ? [""] : []), "Company", "Details", "Business Type", "Total Employees", "Address", "Status", "Actions"].map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-3.5 py-3 text-left text-[8.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: M.goldMuted, borderBottom: `1px solid ${M.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <motion.tr
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  style={{ borderBottom: `1px solid ${M.borderFaint}` }}
                  onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.background = M.surface)}
                  onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {selectMode && (
                    <td className="px-3.5 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(e.id)}
                        onChange={() => toggleSelected(e.id)}
                        className="h-4 w-4 cursor-pointer accent-[#f8e396]"
                      />
                    </td>
                  )}
                  <td className="px-3.5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
                        style={{ background: LOGO_COLORS[i % LOGO_COLORS.length].color, color: LOGO_COLORS[i % LOGO_COLORS.length].text }}
                      >
                        {e.workspaceName.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: M.white }}>{e.workspaceName}</p>
                        <p className="text-[10.5px]" style={{ color: M.textMuted }}>{e.businessType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <p className="text-[12.5px] font-semibold" style={{ color: "#cccccc" }}>{e.firstName} {e.lastName}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: M.textFaint }}>{e.email}</p>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <span className="text-[12px]" style={{ color: "#cccccc" }}>{e.businessType}</span>
                  </td>
                  <td className="px-3.5 py-3.5 text-center">
                    <span className="text-[13px] font-bold" style={{ color: M.white }}>
                      {e.totalEmployees || "—"}
                    </span>
                  </td>
                  <td className="max-w-[180px] px-3.5 py-3.5">
                    <span className="block truncate text-[11.5px]" style={{ color: M.textMuted }} title={e.address}>
                      {e.address}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-[10.5px] font-bold"
                      style={{ background: STATUS_CFG[e.status].bg, color: STATUS_CFG[e.status].color, border: `1px solid ${STATUS_CFG[e.status].color}` }}
                    >
                      {STATUS_CFG[e.status].label}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <RowActionsMenu
                      open={openMenuId === e.id}
                      onOpenChange={(v) => setOpenMenuId(v ? e.id : null)}
                      menuStyle={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                      trigger={
                        <button
                          onClick={() => setOpenMenuId((v) => (v === e.id ? null : e.id))}
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                          style={{ border: `1px solid ${M.border}`, color: M.textMuted }}
                          onMouseEnter={(ev) => { (ev.currentTarget as HTMLElement).style.color = M.gold; (ev.currentTarget as HTMLElement).style.borderColor = M.goldFaint; }}
                          onMouseLeave={(ev) => { (ev.currentTarget as HTMLElement).style.color = M.textMuted; (ev.currentTarget as HTMLElement).style.borderColor = M.border; }}
                          aria-label="Actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      }
                    >
                      <button
                        onClick={() => { setOpenMenuId(null); router.push(`/dashboard/company-management/requests/detail?id=${e.id}`); }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                        style={{ color: "#aaaaaa" }}
                        onMouseEnter={(ev) => { (ev.currentTarget as HTMLElement).style.background = M.surface; (ev.currentTarget as HTMLElement).style.color = M.gold; }}
                        onMouseLeave={(ev) => { (ev.currentTarget as HTMLElement).style.background = "transparent"; (ev.currentTarget as HTMLElement).style.color = "#aaaaaa"; }}
                      >
                        <Eye size={13} /> View
                      </button>
                      {e.status !== "approved" && (
                        <button
                          onClick={() => { setOpenMenuId(null); handleApprove(e); }}
                          disabled={workingId === e.id}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                          style={{ color: M.green }}
                          onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.background = M.surface)}
                          onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.background = "transparent")}
                        >
                          <Check size={13} /> {workingId === e.id ? "Approving…" : "Approve"}
                        </button>
                      )}
                      {e.status === "new" && (
                        <button
                          onClick={() => { setOpenMenuId(null); setRejectTarget(e); }}
                          disabled={workingId === e.id}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                          style={{ color: M.red }}
                          onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.background = M.surface)}
                          onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.background = "transparent")}
                        >
                          <XIcon size={13} /> Reject
                        </button>
                      )}
                    </RowActionsMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && enquiries.length === 0 && (
          <p className="px-4 py-10 text-center text-[12px]" style={{ color: M.textMuted }}>
            Loading requests…
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-[12px]" style={{ color: M.textMuted }}>
            No requests match your search.
          </p>
        )}
      </div>

      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            enquiry={rejectTarget}
            working={workingId === rejectTarget.id}
            onClose={() => setRejectTarget(null)}
            onConfirm={(reason) => handleReject(rejectTarget, reason)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bulkConfirm && (
          <BulkDeleteDialog
            count={selectedIds.size}
            noun="requests"
            working={bulkDeleting}
            onConfirm={handleBulkDelete}
            onCancel={() => setBulkConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
