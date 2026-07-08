import { addCompany, LOGO_COLORS } from "@/lib/companies-store";

export type EnquiryStatus = "new" | "approved" | "rejected";

export interface Enquiry {
  id: string;
  workspaceName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  totalEmployees: number;
  address: string;
  town: string;
  city: string;
  postcode: string;
  country: string;
  deliveryTimes: string[];
  dateISO: string;
  status: EnquiryStatus;
}

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-001", workspaceName: "Greenfield Logistics",
    firstName: "Tom", lastName: "Bracewell", email: "tom@greenfieldlogistics.co.uk", phone: "+44 7700 900111",
    businessType: "Logistics", totalEmployees: 40,
    address: "14 Dockside Road", town: "Poole", city: "Poole", postcode: "BH15 1TF", country: "United Kingdom",
    deliveryTimes: ["12:30 PM"],
    dateISO: "2025-07-01", status: "new",
  },
  {
    id: "ENQ-002", workspaceName: "Harbor Design Co.",
    firstName: "Nadia", lastName: "Shaw", email: "nadia@harbordesign.co.uk", phone: "+44 7700 900222",
    businessType: "Design Studio", totalEmployees: 18,
    address: "6 Quay Street", town: "Poole", city: "Poole", postcode: "BH15 1HH", country: "United Kingdom",
    deliveryTimes: ["12:00 PM"],
    dateISO: "2025-06-30", status: "new",
  },
  {
    id: "ENQ-003", workspaceName: "Bourne Auto Repairs",
    firstName: "Dean", lastName: "Foley", email: "dean@bourneauto.co.uk", phone: "+44 7700 900333",
    businessType: "Automotive / Garage", totalEmployees: 12,
    address: "22 Wessex Way", town: "Bournemouth", city: "Bournemouth", postcode: "BH1 2AA", country: "United Kingdom",
    deliveryTimes: ["1:00 PM"],
    dateISO: "2025-06-28", status: "new",
  },
  {
    id: "ENQ-004", workspaceName: "Solent Marine Supplies",
    firstName: "Ellie", lastName: "Marsh", email: "ellie@solentmarine.co.uk", phone: "+44 7700 900444",
    businessType: "Retail / Marine", totalEmployees: 25,
    address: "3 Harbourside", town: "Poole", city: "Poole", postcode: "BH15 1SU", country: "United Kingdom",
    deliveryTimes: ["12:30 PM"],
    dateISO: "2025-06-24", status: "approved",
  },
];

const KEY = "sk_admin_enquiries";

function load(): Enquiry[] {
  if (typeof window === "undefined") return [...INITIAL_ENQUIRIES];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_ENQUIRIES];
    const parsed = JSON.parse(raw) as Partial<Enquiry>[];
    return parsed.map((e) => ({
      phone: "", town: "", city: "", postcode: "", country: "United Kingdom", deliveryTimes: [],
      ...e,
    } as Enquiry));
  } catch {
    return [...INITIAL_ENQUIRIES];
  }
}

function save(enquiries: Enquiry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(enquiries));
}

export function getEnquiries(): Enquiry[] {
  return load();
}

export function getEnquiryIds(): string[] {
  return load().map((e) => e.id);
}

export function getEnquiry(id: string): Enquiry | undefined {
  return load().find((e) => e.id === id);
}

export function getNewEnquiriesCount(): number {
  return load().filter((e) => e.status === "new").length;
}

/** Buckets an exact employee count into the same ranges offered on the sign-up form. */
export function employeeRangeLabel(n: number): string {
  if (n <= 10) return "1 – 10";
  if (n <= 25) return "11 – 25";
  if (n <= 50) return "26 – 50";
  if (n <= 100) return "51 – 100";
  if (n <= 250) return "101 – 250";
  return "250+";
}

export function rejectEnquiry(id: string): void {
  save(load().map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));
}

/** Approves the enquiry and creates a matching Company record from it. */
export function approveEnquiry(id: string): void {
  const enquiry = getEnquiry(id);
  if (!enquiry || enquiry.status === "approved") return;

  const initials = enquiry.workspaceName.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const lc = LOGO_COLORS[0];
  const companyId = enquiry.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "") + Date.now();

  addCompany({
    id: companyId,
    name: enquiry.workspaceName,
    code: "",
    industry: enquiry.businessType,
    contact: `${enquiry.firstName} ${enquiry.lastName}`,
    email: enquiry.email,
    phone: enquiry.phone,
    employees: enquiry.totalEmployees,
    activeOrders: 0,
    monthlySpend: "£0",
    status: "active",
    since: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    plan: "Starter",
    logo: initials,
    logoColor: lc.color,
    logoText: lc.text,
    deliveryDays: [],
    deliveryTimes: enquiry.deliveryTimes,
    address: enquiry.address,
    town: enquiry.town,
    city: enquiry.city,
    postalCode: enquiry.postcode,
    country: enquiry.country,
    menuId: "standard",
  });

  save(load().map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
}
