import {
  fetchPromoCodes,
  createPromoCode as apiCreatePromoCode,
  updatePromoCode as apiUpdatePromoCode,
  deletePromoCode as apiDeletePromoCode,
  type PromoCodeInput,
} from "@/lib/api/promo-codes";
import type { ApiPromoCode } from "@/lib/api/types";

export interface PromoCode {
  id: string;
  code: string;
  label: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  oneTimeUse: boolean;
  firstTimeUserOnly: boolean;
  maxUses?: number;
  active: boolean;
  expiresAtISO: string;
  expiresAtDisplay: string;
}

export interface PromoCodeFormValues {
  code: string;
  label: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  oneTimeUse: boolean;
  firstTimeUserOnly: boolean;
  maxUses?: number;
  active: boolean;
  expiresAt?: string;
}

function displayDate(iso: string | undefined): string {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No expiry";
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
}

function mapPromoCode(p: ApiPromoCode): PromoCode {
  return {
    id: p._id,
    code: p.code,
    label: p.label,
    description: p.description ?? "",
    type: p.type ?? "percentage",
    value: p.value,
    oneTimeUse: p.oneTimeUse ?? false,
    firstTimeUserOnly: p.firstTimeUserOnly ?? false,
    maxUses: p.maxUses,
    active: p.active,
    expiresAtISO: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
    expiresAtDisplay: displayDate(p.expiresAt),
  };
}

function toInput(values: PromoCodeFormValues): PromoCodeInput {
  return {
    code: values.code,
    type: values.type,
    value: values.value,
    label: values.label,
    description: values.description,
    oneTimeUse: values.oneTimeUse,
    firstTimeUserOnly: values.firstTimeUserOnly,
    maxUses: values.maxUses,
    active: values.active,
    expiresAt: values.expiresAt || undefined,
    workspaceCodes: [],
  };
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const raw = await fetchPromoCodes();
  return raw.map(mapPromoCode);
}

export async function addPromoCode(values: PromoCodeFormValues): Promise<PromoCode> {
  const raw = await apiCreatePromoCode(toInput(values));
  return mapPromoCode(raw);
}

export async function editPromoCode(id: string, values: PromoCodeFormValues): Promise<PromoCode> {
  const raw = await apiUpdatePromoCode(id, toInput(values));
  return mapPromoCode(raw);
}

export async function setPromoCodeActive(id: string, active: boolean): Promise<PromoCode> {
  const raw = await apiUpdatePromoCode(id, { active });
  return mapPromoCode(raw);
}

export async function removePromoCode(id: string): Promise<void> {
  await apiDeletePromoCode(id);
}
