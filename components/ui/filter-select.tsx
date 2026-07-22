"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { DARK as M } from "@/lib/sk-theme-dark";

export function FilterSelect({ value, options, onChange, minWidth }: {
  value: string; options: string[]; onChange: (v: string) => void; minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <RowActionsMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-none items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-medium transition-colors"
          style={{ border: `1px solid ${open ? M.gold : M.border}`, background: M.panel, color: M.white, minWidth }}
        >
          {value}
          <ChevronDown size={13} style={{ color: M.textFaint, flexShrink: 0 }} />
        </button>
      }
      menuStyle={{ background: "#141414", border: `1px solid ${M.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: minWidth ?? 160 }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => { onChange(opt); setOpen(false); }}
          className="flex w-full items-center whitespace-nowrap rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors"
          style={{ color: opt === value ? M.gold : "#aaaaaa", background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = M.surface; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          {opt}
        </button>
      ))}
    </RowActionsMenu>
  );
}
