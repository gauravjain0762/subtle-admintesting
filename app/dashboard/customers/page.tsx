"use client";

import { useState } from "react";
import { Search, Plus, Mail, Phone, MoreHorizontal, Building2, User } from "lucide-react";
import { toast } from "sonner";

const CUSTOMERS = [
  { id: 1,  name: "Sarah Mitchell",  email: "sarah.m@acmecorp.com",    phone: "+44 7700 900142", type: "business", company: "Acme Corp.",       orders: 48, spend: "£634.00",  joined: "Jan 2025", active: true },
  { id: 2,  name: "James Thompson",  email: "james.t@gmail.com",        phone: "+44 7700 900288", type: "personal", company: null,               orders: 22, spend: "£287.50",  joined: "Feb 2025", active: true },
  { id: 3,  name: "Priya Kapoor",    email: "priya.k@techlondon.co.uk", phone: "+44 7700 900371", type: "business", company: "TechLondon Ltd",   orders: 31, spend: "£403.25",  joined: "Dec 2024", active: true },
  { id: 4,  name: "Luke Roberts",    email: "luke.r@email.com",         phone: "+44 7700 900453", type: "personal", company: null,               orders: 9,  spend: "£63.00",   joined: "Mar 2025", active: false },
  { id: 5,  name: "Emma Clarke",     email: "emma.c@financehub.com",    phone: "+44 7700 900512", type: "business", company: "FinanceHub UK",    orders: 57, spend: "£748.50",  joined: "Nov 2024", active: true },
  { id: 6,  name: "Daniel Park",     email: "d.park@studio.io",         phone: "+44 7700 900624", type: "business", company: "Creative Studio",  orders: 34, spend: "£442.00",  joined: "Jan 2025", active: true },
  { id: 7,  name: "Olivia Brown",    email: "olivia.b@gmail.com",       phone: "+44 7700 900734", type: "personal", company: null,               orders: 15, spend: "£195.75",  joined: "Mar 2025", active: true },
  { id: 8,  name: "Marcus Wilson",   email: "marcus.w@email.co.uk",     phone: "+44 7700 900845", type: "personal", company: null,               orders: 28, spend: "£364.00",  joined: "Feb 2025", active: true },
  { id: 9,  name: "Sophie Adams",    email: "sophie.a@gmail.com",       phone: "+44 7700 900956", type: "personal", company: null,               orders: 19, spend: "£247.50",  joined: "Apr 2025", active: false },
  { id: 10, name: "Raj Patel",       email: "raj.p@consultants.co.uk",  phone: "+44 7700 901067", type: "business", company: "Patel Consulting", orders: 42, spend: "£546.00",  joined: "Dec 2024", active: true },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "personal" | "business">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = CUSTOMERS.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchActive = activeFilter === "all" || (activeFilter === "active" ? c.active : !c.active);
    return matchSearch && matchType && matchActive;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "#0a0a0a" }}>Customers</h1>
          <p className="text-[13px]" style={{ color: "#6b6b5a" }}>{CUSTOMERS.length} total customers</p>
        </div>
        <button
          onClick={() => toast.success("Add customer coming soon!")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold"
          style={{ background: "#0a0a0a", color: "#ffffff" }}
        >
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total",    value: CUSTOMERS.length,                          color: "#0a0a0a", bg: "#f0e9d6" },
          { label: "Active",   value: CUSTOMERS.filter((c) => c.active).length,  color: "#2d6a2d", bg: "#edf7ed" },
          { label: "Business", value: CUSTOMERS.filter((c) => c.type === "business").length, color: "#0a3d8f", bg: "#e8f0fe" },
          { label: "Personal", value: CUSTOMERS.filter((c) => c.type === "personal").length, color: "#7a5a00", bg: "#fffce0" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>{s.label}</p>
            <p className="mt-1.5 text-[26px] font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ border: "1.5px solid #e8e0cc", background: "#ffffff" }}
        >
          <Search size={14} style={{ color: "#9b9b89" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: "#0a0a0a" }}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "personal", "business"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className="rounded-lg px-3 py-2.5 text-[11.5px] font-semibold capitalize"
              style={{
                background: typeFilter === v ? "#0a0a0a" : "#ffffff",
                color: typeFilter === v ? "#ffffff" : "#6b6b5a",
                border: "1.5px solid #e8e0cc",
              }}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveFilter(v)}
              className="rounded-lg px-3 py-2.5 text-[11.5px] font-semibold capitalize"
              style={{
                background: activeFilter === v ? "#0a0a0a" : "#ffffff",
                color: activeFilter === v ? "#ffffff" : "#6b6b5a",
                border: "1.5px solid #e8e0cc",
              }}
            >
              {v === "all" ? "All Status" : v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl" style={{ background: "#ffffff", border: "1.5px solid #e8e0cc" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0e9d6" }}>
                {["Customer", "Contact", "Type", "Orders", "Total Spend", "Joined", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "#9b9b89" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-[#fdf8ec]"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0e9d6" : "none" }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: c.type === "business" ? "#e8f0fe" : "#f0e9d6", color: c.type === "business" ? "#0a3d8f" : "#6b6b5a" }}
                      >
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[12.5px] font-semibold" style={{ color: "#0a0a0a" }}>{c.name}</p>
                        {c.company && (
                          <p className="flex items-center gap-1 text-[11px]" style={{ color: "#9b9b89" }}>
                            <Building2 size={10} /> {c.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-[11.5px] hover:underline" style={{ color: "#6b6b5a" }}>
                        <Mail size={11} /> {c.email}
                      </a>
                      <p className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "#9b9b89" }}>
                        <Phone size={11} /> {c.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
                      style={{
                        background: c.type === "business" ? "#e8f0fe" : "#f0e9d6",
                        color: c.type === "business" ? "#0a3d8f" : "#6b6b5a",
                      }}
                    >
                      {c.type === "business" ? <Building2 size={10} /> : <User size={10} />}
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12.5px] font-semibold" style={{ color: "#0a0a0a" }}>{c.orders}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12.5px] font-bold" style={{ color: "#0a0a0a" }}>{c.spend}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px]" style={{ color: "#9b9b89" }}>{c.joined}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: c.active ? "#edf7ed" : "#fef2f2",
                        color: c.active ? "#2d6a2d" : "#b83232",
                      }}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f0e9d6]" style={{ color: "#9b9b89" }}>
                      <MoreHorizontal size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
