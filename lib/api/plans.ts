import { apiFetch } from "./client";

export interface PlanPayload {
  name: string;
  type: "weekly" | "one-off";
  price: number;
  description?: string;
  deliveryDays?: string[]; // For weekly plans
  patterns?: Array<{ name: string; days: string[] }>; // For one-off plans
  status?: "active" | "inactive";
}

export interface Plan extends PlanPayload {
  _id: string;
  activeSubscriptions: number;
  status: "active" | "inactive";
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
}

// TODO: Replace with actual API endpoints
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

export async function deletePlan(planId: string): Promise<void> {
  await apiFetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
}
