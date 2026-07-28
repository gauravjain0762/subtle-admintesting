import { apiFetch } from "./client";

export interface StripeModeResponse {
  success: boolean;
  currentMode: "test" | "live";
  available?: {
    test: boolean;
    live: boolean;
  };
}

export interface SwitchModeResponse {
  success: boolean;
  message: string;
  currentMode: "test" | "live";
}

export async function getStripeMode(): Promise<StripeModeResponse> {
  const res = await apiFetch<StripeModeResponse>("/api/admin/stripe/mode");
  return res;
}

export async function switchStripeMode(mode: "test" | "live"): Promise<SwitchModeResponse> {
  const res = await apiFetch<SwitchModeResponse>("/api/admin/stripe/mode", {
    method: "POST",
    body: { mode },
  });
  return res;
}
