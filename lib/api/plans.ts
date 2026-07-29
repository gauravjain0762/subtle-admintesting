import { apiFetch } from "./client";

export interface DeliveryPattern {
  id: string;
  name: string;
  days: string[];
}

export interface PlanPayload {
  type: "weekly" | "one-off";
  name: string;
  description?: string;
  price: number;
  deliveryDays?: string[];
  patterns?: DeliveryPattern[];
  status: "active" | "inactive";
}

export interface Plan {
  _id: string;
  type: "weekly" | "one-off";
  name: string;
  description?: string;
  price: number;
  deliveryDays?: string[];
  patterns?: DeliveryPattern[];
  status: "active" | "inactive";
  activeSubs: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlansListResponse {
  success: boolean;
  plans: Plan[];
}

export interface PlanResponse {
  success: boolean;
  plan: Plan;
  activeSubs?: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export async function getPlans(): Promise<Plan[]> {
  const res = await apiFetch<PlansListResponse>("/api/admin/plans");
  return res.plans;
}

export async function getPlan(planId: string): Promise<Plan> {
  const res = await apiFetch<PlanResponse>(`/api/admin/plans/${planId}`);
  return res.plan;
}

export async function createPlan(payload: PlanPayload): Promise<Plan> {
  const res = await apiFetch<PlanResponse>("/api/admin/plans", {
    method: "POST",
    body: payload,
  });
  return res.plan;
}

export async function updatePlan(planId: string, payload: Partial<PlanPayload>): Promise<Plan> {
  const res = await apiFetch<PlanResponse>(`/api/admin/plans/${planId}`, {
    method: "PATCH",
    body: payload,
  });
  return res.plan;
}

export async function deletePlan(planId: string): Promise<DeleteResponse> {
  const res = await apiFetch<DeleteResponse>(`/api/admin/plans/${planId}`, {
    method: "DELETE",
  });
  return res;
}
