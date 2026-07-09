import { apiFetch } from "./client";
import type {
  ApiOrder, ApiOrderListResponse, ApiOrderResponse, ApiBulkOrderStatusResponse, ApiOrderStatus,
} from "./types";

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: ApiOrderStatus;
  type?: "weekly" | "one-off";
  workspaceId?: string;
  dayFilter?: "today" | "yesterday" | "last7days" | "custom";
  startDate?: string;
  endDate?: string;
  search?: string;
}

function toQueryString(params: OrderQuery): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchOrders(params: OrderQuery = {}): Promise<ApiOrderListResponse> {
  return apiFetch<ApiOrderListResponse>(`/api/admin/orders${toQueryString(params)}`);
}

export async function fetchOrder(id: string): Promise<ApiOrder> {
  const res = await apiFetch<ApiOrderResponse>(`/api/admin/orders/${id}`);
  return res.order;
}

export async function setOrderStatus(id: string, status: ApiOrderStatus): Promise<ApiOrder> {
  const res = await apiFetch<ApiOrderResponse>(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return res.order;
}

export async function bulkSetOrderStatus(orderIds: string[], status: ApiOrderStatus): Promise<number> {
  const res = await apiFetch<ApiBulkOrderStatusResponse>("/api/admin/orders/bulk-status", {
    method: "PATCH",
    body: { orderIds, status },
  });
  return res.updatedCount;
}
