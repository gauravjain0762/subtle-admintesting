import {
  fetchCustomers, fetchCustomer, setCustomerStatus, type CustomerQuery,
} from "@/lib/api/customers";
import type { ApiCustomer, ApiCustomerSubscriptionStatus } from "@/lib/api/types";
import { colorFor } from "@/lib/companies-store";

export type CustomerStatus = "active" | "blocked";
export type CustomerType = "weekly" | "one-off";
export type CustomerSubscriptionStatus = ApiCustomerSubscriptionStatus;

export interface Customer {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  /** "Gaurav GJ" — first name + auto-generated initials, per the profile display spec. */
  displayName: string;
  /** Deterministic per-customer avatar color, same palette/hash as Company Management's letter box. */
  logoColor: string;
  logoText: string;
  email: string;
  phone: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  type: CustomerType;
  orderCount: number;
  subscriptionStatus: CustomerSubscriptionStatus;
  status: CustomerStatus;
  joinedISO: string;
  joinedDisplay: string;
}

function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function displayDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
}

function mapCustomer(c: ApiCustomer): Customer {
  const firstName = c.name.trim().split(/\s+/)[0] ?? c.name;
  const initials = deriveInitials(c.name);
  const lc = colorFor(c._id);
  return {
    id: c._id,
    name: c.name,
    firstName,
    initials,
    displayName: `${firstName} ${initials}`,
    logoColor: lc.color,
    logoText: lc.text,
    email: c.email ?? "",
    phone: c.phone ?? "",
    companyId: c.workspaceId,
    companyCode: c.workspaceCode,
    companyName: c.workspaceName,
    type: c.type,
    orderCount: c.orderCount ?? 0,
    subscriptionStatus: c.subscriptionStatus,
    status: c.status,
    joinedISO: (c.createdAt ?? "").slice(0, 10),
    joinedDisplay: displayDate(c.createdAt),
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType;
  workspaceId?: string;
  status?: CustomerStatus;
}

export interface CustomerPage {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getCustomers(filters: CustomerFilters = {}): Promise<CustomerPage> {
  const res = await fetchCustomers(filters as CustomerQuery);
  return { customers: res.customers.map(mapCustomer), total: res.total, page: res.page, totalPages: res.totalPages };
}

export async function getCustomer(id: string): Promise<Customer> {
  const raw = await fetchCustomer(id);
  return mapCustomer(raw);
}

export async function setCustomerActive(id: string, active: boolean): Promise<Customer> {
  const raw = await setCustomerStatus(id, active ? "active" : "blocked");
  return mapCustomer(raw);
}
