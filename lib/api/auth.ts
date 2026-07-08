import { apiFetch, setToken, clearToken, getToken } from "./client";
import type { ApiAdmin, ApiLoginResponse } from "./types";

const ADMIN_KEY = "sk_admin_user";

export async function login(email: string, password: string): Promise<ApiAdmin> {
  const res = await apiFetch<ApiLoginResponse>("/api/admin/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setToken(res.token);
  if (typeof window !== "undefined") localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
  return res.admin;
}

export function logout(): void {
  clearToken();
  if (typeof window !== "undefined") localStorage.removeItem(ADMIN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getCurrentAdmin(): ApiAdmin | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiAdmin;
  } catch {
    return null;
  }
}
