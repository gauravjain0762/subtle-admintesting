"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Check, MoreVertical, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getEnquiries, approveEnquiry, rejectEnquiry, employeeRangeLabel,
  type Enquiry,
} from "@/lib/enquiries-store";
import { LOGO_COLORS } from "@/lib/companies-store";

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

export default function CompanyRequestsPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const refresh = () => setEnquiries(getEnquiries());
  useEffect(() => { refresh(); }, []);

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    return !q ||
      e.workspaceName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.businessType.toLowerCase().includes(q);
  });

  const handleApprove = (e: Enquiry) => {
    approveEnquiry(e.id);
    refresh();
    toast.success(`"${e.workspaceName}" approved — company created`);
  };

  const handleReject = (e: Enquiry) => {
    rejectEnquiry(e.id);
    refresh();
    toast.error(`"${e.workspaceName}" rejected`);
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
      <div className="mb-6 flex flex-wrap gap-3">
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl" style={{ background: M.panel, border: `1px solid ${M.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: M.surface }}>
                {["Company", "Details", "Business Type", "Total Employees", "Address", "Actions"].map((h) => (
                  <th
                    key={h}
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
                    <span className="text-[13px] font-bold" style={{ color: M.white }} title={`${e.totalEmployees} employees`}>
                      {employeeRangeLabel(e.totalEmployees)}
                    </span>
                  </td>
                  <td className="max-w-[180px] px-3.5 py-3.5">
                    <span className="block truncate text-[11.5px]" style={{ color: M.textMuted }} title={e.address}>
                      {e.address}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <div className="relative inline-block" onClick={(ev) => ev.stopPropagation()}>
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

                      <AnimatePresence>
                        {openMenuId === e.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.14 }}
                            className="absolute right-0 top-[calc(100%+6px)] z-[90] min-w-[170px] rounded-lg p-1.5"
                            style={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                          >
                            <button
                              onClick={() => { setOpenMenuId(null); router.push(`/dashboard/company-management/requests/${e.id}`); }}
                              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                              style={{ color: "#aaaaaa" }}
                              onMouseEnter={(ev) => { (ev.currentTarget as HTMLElement).style.background = M.surface; (ev.currentTarget as HTMLElement).style.color = M.gold; }}
                              onMouseLeave={(ev) => { (ev.currentTarget as HTMLElement).style.background = "transparent"; (ev.currentTarget as HTMLElement).style.color = "#aaaaaa"; }}
                            >
                              <Eye size={13} /> View
                            </button>
                            {e.status === "new" && (
                              <>
                                <button
                                  onClick={() => { setOpenMenuId(null); handleApprove(e); }}
                                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                                  style={{ color: M.green }}
                                  onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.background = M.surface)}
                                  onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.background = "transparent")}
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => { setOpenMenuId(null); handleReject(e); }}
                                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
                                  style={{ color: M.red }}
                                  onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.background = M.surface)}
                                  onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.background = "transparent")}
                                >
                                  <XIcon size={13} /> Reject
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-[12px]" style={{ color: M.textMuted }}>
            No requests match your search.
          </p>
        )}
      </div>
    </div>
  );
}
