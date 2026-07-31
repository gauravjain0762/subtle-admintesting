import { apiFetch } from "./client";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  workspace: string;
}

export interface Meal {
  _id: string;
  name: string;
  price: number;
}

export interface Subscriber {
  _id: string;
  user: User;
  meal: Meal;
  quantity: number;
  pattern: string[];
  status: "active" | "paused" | "cancelled";
  startDate: string;
  nextChargeDate: string;
  totalCharges: number;
  createdAt: string;
}

export interface SubscribersPlan {
  _id: string;
  name: string;
  type: "weekly" | "one-off";
}

export interface SubscribersResponse {
  success: boolean;
  plan: SubscribersPlan;
  subscribers: Subscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export async function getPlanSubscribers(
  planId: string,
  page = 1,
  limit = 20,
  status?: "active" | "paused"
): Promise<SubscribersResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const res = await apiFetch<SubscribersResponse>(
    `/api/admin/plans/${planId}/subscribers?${params.toString()}`
  );
  return res;
}
