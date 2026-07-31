import { apiFetch } from "./client";

export interface SelectPlanPayload {
  planId: string;
  mealSelections: {
    dayOfWeek: string;
    mealId: string;
  }[];
  startDate?: string;
}

export interface DeliveryDate {
  date: string;
  dayOfWeek: string;
  mealId: string;
  mealName: string;
  price: number;
}

export interface OrderSummary {
  totalPrice: number;
  deliveryCount: number;
  startDate: string;
  endDate: string;
  planName: string;
}

export interface SelectPlanResponse {
  success: boolean;
  deliveryDates: DeliveryDate[];
  summary: OrderSummary;
  checkoutUrl: string;
  sessionId: string;
}

export interface CheckoutResponse {
  success: boolean;
  subscriptionId: string;
  status: string;
  message: string;
}

export async function selectPlan(payload: SelectPlanPayload): Promise<SelectPlanResponse> {
  const res = await apiFetch<SelectPlanResponse>("/api/subscriptions/select-plan", {
    method: "POST",
    body: payload,
  });
  return res;
}

export async function handleCheckoutSuccess(sessionId: string): Promise<CheckoutResponse> {
  const res = await apiFetch<CheckoutResponse>("/api/subscriptions/checkout-success", {
    method: "POST",
    body: { sessionId },
  });
  return res;
}
