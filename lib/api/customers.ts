import { apiFetch } from "./client";
import type {
  ApiCustomer, ApiCustomerListResponse, ApiCustomerResponse, ApiCustomerStatus, ApiCustomerType,
} from "./types";

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ApiCustomerType;
  workspaceId?: string;
  status?: ApiCustomerStatus;
}

function toQueryString(params: CustomerQuery): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchCustomers(params: CustomerQuery = {}): Promise<ApiCustomerListResponse> {
  return apiFetch<ApiCustomerListResponse>(`/api/admin/customers${toQueryString(params)}`);
}

export async function fetchCustomer(id: string): Promise<ApiCustomer> {
  const res = await apiFetch<ApiCustomerResponse>(`/api/admin/customers/${id}`);
  return res.customer;
}

export async function setCustomerStatus(id: string, status: ApiCustomerStatus): Promise<ApiCustomer> {
  const res = await apiFetch<ApiCustomerResponse>(`/api/admin/customers/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return res.customer;
}
