import { fetchWorkspaces, updateWorkspace, deleteWorkspace } from "@/lib/api/workspaces";
import type { ApiWorkspace } from "@/lib/api/types";
import { formatDateWithTimeIST } from "@/lib/utils/date-format";

export interface Company {
  id: string;
  name: string;
  code: string;
  /** Business/premise type as captured on the sign-up form, e.g. "Call centre". The backend has no "industry" concept. */
  industry: string;
  contact: string;
  email: string;
  phone: string;
  countryCode?: string;
  /** Already a bucketed range from the sign-up form, e.g. "26 – 50" — the backend doesn't send an exact headcount. */
  employees: string;
  activeOrders: number;
  monthlySpend: string;
  status: "active" | "suspended" | string;
  since: string;
  plan: string;
  logo: string;
  logoColor: string;
  logoText: string;
  deliveryDays: string[];
  deliveryTimes: string[];
  address: string;
  town: string;
  city: string;
  postalCode: string;
  country: string;
  menuId: string;
  /** Total registered users under this workspace, from the backend. */
  totalUsers: number;
}

export const LOGO_COLORS = [
  { color: "#e8f0fe", text: "#0a3d8f" },
  { color: "#edf7ed", text: "#2d6a2d" },
  { color: "#fffce0", text: "#7a5a00" },
  { color: "#fdf0e4", text: "#7a3500" },
  { color: "#f0e9d6", text: "#6b6b5a" },
  { color: "#fef2f2", text: "#b83232" },
];

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

/** Deterministic so the same workspace always gets the same avatar color. */
export function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

function mapCompany(w: ApiWorkspace): Company {
  const initials = initialsOf(w.name);
  const lc = colorFor(w._id);
  return {
    id: w._id,
    name: w.name,
    code: w.code ?? "",
    industry: w.premiseType ?? "",
    contact: [w.firstName, w.lastName].filter(Boolean).join(" "),
    email: w.email ?? "",
    phone: w.phone ?? "",
    countryCode: w.countryCode,
    employees: w.employees ?? "",
    activeOrders: w.totalOrders ?? 0,
    // No spend/billing field on the backend yet.
    monthlySpend: "",
    status: w.status,
    since: formatDateWithTimeIST(w.createdAt),
    // No subscription-plan field on the backend yet.
    plan: "",
    logo: initials,
    logoColor: lc.color,
    logoText: lc.text,
    // No day-of-week delivery schedule on the backend yet — only delivery times.
    deliveryDays: [],
    deliveryTimes: w.deliveryTimes ?? [],
    // No street address on the workspace record — only town/city/postcode.
    address: "",
    town: w.town ?? "",
    city: w.city ?? "",
    postalCode: w.postcode ?? "",
    // No country field on the workspace record.
    country: "",
    // No menu-assignment concept on the backend.
    menuId: "standard",
    totalUsers: w.totalUsers ?? 0,
  };
}

/** In-memory cache of the last successful fetch, so navigating list → detail doesn't re-hit the network for data we already have. */
let cache: Company[] | null = null;

export async function getCompanies(): Promise<Company[]> {
  const raw = await fetchWorkspaces();
  cache = raw.map(mapCompany);
  return cache;
}

export async function getCompany(id: string): Promise<Company | undefined> {
  const hit = cache?.find((c) => c.id === id);
  if (hit) return hit;
  const all = await getCompanies();
  return all.find((c) => c.id === id);
}

export async function setCompanyStatus(id: string, status: Company["status"]): Promise<void> {
  await updateWorkspace(id, { status });
}

export async function deleteCompany(id: string): Promise<void> {
  await deleteWorkspace(id);
}

/** Generates a company code client-side — the admin supplies this when approving a workspace request. */
export function generateCode(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4).padEnd(4, "X");
  const year   = String(new Date().getFullYear()).slice(2);
  const month  = String(new Date().getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}`;
}

export const INDUSTRIES = [
  "Technology","Software","Finance","Design","Consulting",
  "Media","Healthcare","Construction","Retail","Education","Other",
];

export const DELIVERY_DAYS = ["Mon","Tue","Wed","Thu","Fri"];

export const PLAN_OPTIONS = [
  { name: "Starter",    price: "From £8.50/wk",  desc: "Small teams up to 50",     features: ["1–2 days/week","Basic dishes","Email support"] },
  { name: "Business",   price: "From £17/wk",    desc: "Growing teams 50–150",      features: ["3 days/week","Full menu","Priority support"] },
  { name: "Enterprise", price: "Custom pricing",  desc: "Large teams 150+",          features: ["5 days/week","Custom menu","Dedicated manager"] },
];

export const PLAN_COLOR: Record<string, { color: string; bg: string }> = {
  Enterprise: { color: "#0a3d8f", bg: "#e8f0fe" },
  Business:   { color: "#2d6a2d", bg: "#edf7ed" },
  Starter:    { color: "#6b6b5a", bg: "#f0e9d6" },
};

export const STATUS_DISPLAY = {
  active:    { label: "Active",    color: "#2d6a2d", bg: "#edf7ed" },
  suspended: { label: "Inactive", color: "#b83232", bg: "#fef2f2" },
} as const;
