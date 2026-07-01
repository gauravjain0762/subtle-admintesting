export interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  contact: string;
  email: string;
  phone: string;
  employees: number;
  activeOrders: number;
  monthlySpend: string;
  status: "active" | "paused" | "cancelled";
  since: string;
  plan: string;
  logo: string;
  logoColor: string;
  logoText: string;
  deliveryDays: string[];
  city: string;
}

const INITIAL_COMPANIES: Company[] = [
  { id: "acme",           name: "Acme Corp.",        code: "ACME-2401", industry: "Technology",   contact: "Sarah Mitchell",  email: "sarah.m@acmecorp.com",           phone: "+44 20 7946 0100", employees: 120, activeOrders: 48, monthlySpend: "£2,480", status: "active",    since: "Jan 2024", plan: "Enterprise", logo: "A",  logoColor: "#e8f0fe", logoText: "#0a3d8f", deliveryDays: ["Mon","Wed","Fri"],            city: "London" },
  { id: "techlondon",     name: "TechLondon Ltd",    code: "TECH-2412", industry: "Software",     contact: "Priya Kapoor",    email: "priya.k@techlondon.co.uk",       phone: "+44 20 7946 0200", employees: 85,  activeOrders: 34, monthlySpend: "£1,760", status: "active",    since: "Dec 2024", plan: "Business",   logo: "TL", logoColor: "#fffce0", logoText: "#7a5a00", deliveryDays: ["Tue","Thu"],                  city: "London" },
  { id: "financehub",     name: "FinanceHub UK",     code: "FHUB-2411", industry: "Finance",      contact: "Emma Clarke",     email: "emma.c@financehub.com",          phone: "+44 20 7946 0300", employees: 200, activeOrders: 72, monthlySpend: "£3,720", status: "active",    since: "Nov 2024", plan: "Enterprise", logo: "FH", logoColor: "#edf7ed", logoText: "#2d6a2d", deliveryDays: ["Mon","Tue","Wed","Thu","Fri"], city: "London" },
  { id: "creativestudio", name: "Creative Studio",   code: "CRST-2501", industry: "Design",       contact: "Daniel Park",     email: "d.park@studio.io",               phone: "+44 20 7946 0400", employees: 40,  activeOrders: 16, monthlySpend: "£832",   status: "active",    since: "Jan 2025", plan: "Starter",    logo: "CS", logoColor: "#fdf0e4", logoText: "#7a3500", deliveryDays: ["Wed"],                        city: "Manchester" },
  { id: "patelconsulting",name: "Patel Consulting",  code: "PCON-2412", industry: "Consulting",   contact: "Raj Patel",       email: "raj.p@consultants.co.uk",        phone: "+44 20 7946 0500", employees: 55,  activeOrders: 22, monthlySpend: "£1,144", status: "active",    since: "Dec 2024", plan: "Business",   logo: "PC", logoColor: "#f0e9d6", logoText: "#6b6b5a", deliveryDays: ["Mon","Thu"],                  city: "Birmingham" },
  { id: "northstar",      name: "NorthStar Media",   code: "NMED-2503", industry: "Media",        contact: "Laura Hayes",     email: "laura.h@northstar.co.uk",        phone: "+44 20 7946 0600", employees: 30,  activeOrders: 0,  monthlySpend: "£0",     status: "paused",    since: "Mar 2025", plan: "Starter",    logo: "NS", logoColor: "#f0e9d6", logoText: "#6b6b5a", deliveryDays: [],                             city: "London" },
  { id: "greenleaf",      name: "Greenleaf Health",  code: "GLHC-2502", industry: "Healthcare",   contact: "Dr. James Ford",  email: "j.ford@greenleaf.nhs.uk",        phone: "+44 20 7946 0700", employees: 160, activeOrders: 60, monthlySpend: "£3,120", status: "active",    since: "Feb 2025", plan: "Enterprise", logo: "GL", logoColor: "#edf7ed", logoText: "#2d6a2d", deliveryDays: ["Mon","Wed","Fri"],            city: "Leeds" },
  { id: "urbanworks",     name: "UrbanWorks Co.",    code: "UWRK-2504", industry: "Construction", contact: "Mike Adams",      email: "m.adams@urbanworks.co.uk",       phone: "+44 20 7946 0800", employees: 0,   activeOrders: 0,  monthlySpend: "£0",     status: "cancelled", since: "Apr 2025", plan: "Starter",    logo: "UW", logoColor: "#fef2f2", logoText: "#b83232", deliveryDays: [],                             city: "Bristol" },
];

const KEY = "sk_admin_companies";

function load(): Company[] {
  if (typeof window === "undefined") return [...INITIAL_COMPANIES];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_COMPANIES];
    return JSON.parse(raw) as Company[];
  } catch {
    return [...INITIAL_COMPANIES];
  }
}

function save(companies: Company[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(companies));
}

export function getCompanies(): Company[] {
  return load();
}

export function getCompanyIds(): string[] {
  return load().map((c) => c.id);
}

export function getCompany(id: string): Company | undefined {
  return load().find((c) => c.id === id);
}

export function addCompany(company: Company): void {
  save([company, ...load()]);
}

export function updateCompany(id: string, patch: Partial<Omit<Company, "id" | "code" | "since" | "activeOrders" | "monthlySpend">>): void {
  save(load().map((c) => c.id === id ? { ...c, ...patch } : c));
}

export function setCompanyStatus(id: string, status: Company["status"]): void {
  save(load().map((c) => c.id === id ? { ...c, status } : c));
}

export function deleteCompany(id: string): void {
  save(load().filter((c) => c.id !== id));
}

export function generateCode(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4).padEnd(4, "X");
  const year   = String(new Date().getFullYear()).slice(2);
  const month  = String(new Date().getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}`;
}

export const LOGO_COLORS = [
  { color: "#e8f0fe", text: "#0a3d8f" },
  { color: "#edf7ed", text: "#2d6a2d" },
  { color: "#fffce0", text: "#7a5a00" },
  { color: "#fdf0e4", text: "#7a3500" },
  { color: "#f0e9d6", text: "#6b6b5a" },
  { color: "#fef2f2", text: "#b83232" },
];

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
  paused:    { label: "Paused",    color: "#7a5a00", bg: "#fffce0" },
  cancelled: { label: "Cancelled", color: "#b83232", bg: "#fef2f2" },
} as const;
