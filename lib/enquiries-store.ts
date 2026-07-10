import { fetchWorkspaceRequests, approveWorkspaceRequest, rejectWorkspaceRequest, deleteWorkspaceRequest } from "@/lib/api/workspace-requests";
import type { ApiWorkspaceRequest } from "@/lib/api/types";

export type EnquiryStatus = "new" | "approved" | "rejected";

export interface Enquiry {
  id: string;
  referenceId: string;
  workspaceName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Business/premise type as captured on the sign-up form, e.g. "Call centre". */
  businessType: string;
  /** Already a bucketed range from the sign-up form, e.g. "26 – 50" — the backend doesn't send an exact headcount. */
  totalEmployees: string;
  address: string;
  town: string;
  city: string;
  postcode: string;
  country: string;
  deliveryTimes: string[];
  dateISO: string;
  status: EnquiryStatus;
  /** Only populated once approved. */
  code: string;
}

function mapStatus(status: string): EnquiryStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "new";
}

function mapEnquiry(r: ApiWorkspaceRequest): Enquiry {
  return {
    id: r._id,
    referenceId: r.referenceId,
    workspaceName: r.workspace?.name ?? "",
    firstName: r.contact?.firstName ?? "",
    lastName: r.contact?.lastName ?? "",
    email: r.contact?.email ?? "",
    phone: r.contact?.phone ?? "",
    businessType: r.workspace?.premiseType ?? "",
    totalEmployees: r.workspace?.employees ?? "",
    address: r.workspace?.address1 ?? "",
    town: r.workspace?.town ?? "",
    city: r.workspace?.city ?? "",
    postcode: r.workspace?.postcode ?? "",
    country: r.workspace?.country ?? "",
    deliveryTimes: r.workspace?.deliveryTimes ?? [],
    dateISO: r.createdAt,
    status: mapStatus(r.status),
    code: "",
  };
}

/** In-memory cache of the last successful fetch, so navigating list → detail doesn't re-hit the network for data we already have. */
let cache: Enquiry[] | null = null;

export async function getEnquiries(): Promise<Enquiry[]> {
  const raw = await fetchWorkspaceRequests();
  cache = raw.map(mapEnquiry);
  return cache;
}

export async function getEnquiry(id: string): Promise<Enquiry | undefined> {
  const hit = cache?.find((e) => e.id === id);
  if (hit) return hit;
  const all = await getEnquiries();
  return all.find((e) => e.id === id);
}

export async function getNewEnquiriesCount(): Promise<number> {
  const all = await getEnquiries();
  return all.filter((e) => e.status === "new").length;
}

/** Approves the workspace request. The backend creates the matching workspace itself. */
export async function approveEnquiry(id: string, code: string): Promise<void> {
  await approveWorkspaceRequest(id, code);
}

/** Rejects the workspace request with a reason (required by the backend). */
export async function rejectEnquiry(id: string, reason: string): Promise<void> {
  await rejectWorkspaceRequest(id, reason);
}

export async function deleteEnquiry(id: string): Promise<void> {
  await deleteWorkspaceRequest(id);
}
