import { apiFetch } from "./client";
import type { ApiPromoCode, ApiPromoCodeListResponse, ApiPromoCodeResponse } from "./types";

export interface PromoCodeInput {
  code: string;
  type: "percentage";
  value: number;
  label: string;
  description: string;
  active: boolean;
  expiresAt?: string;
  workspaceCodes: string[];
}

export async function fetchPromoCodes(): Promise<ApiPromoCode[]> {
  const res = await apiFetch<ApiPromoCodeListResponse>("/api/admin/promo-codes");
  return res.promoCodes;
}

export async function createPromoCode(input: PromoCodeInput): Promise<ApiPromoCode> {
  const res = await apiFetch<ApiPromoCodeResponse>("/api/admin/promo-codes", {
    method: "POST",
    body: input,
  });
  return res.promoCode;
}

export async function updatePromoCode(id: string, patch: Partial<PromoCodeInput>): Promise<ApiPromoCode> {
  const res = await apiFetch<ApiPromoCodeResponse>(`/api/admin/promo-codes/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return res.promoCode;
}

export async function deletePromoCode(id: string): Promise<void> {
  await apiFetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
}
