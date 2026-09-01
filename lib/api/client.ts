import { API_BASE_URL } from "./config";

const TOKEN_KEY = "sk_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Attach the stored bearer token. Defaults to true — pass false for the login call itself. */
  auth?: boolean;
  body?: unknown;
  /** Don't clear token on 401 (useful for non-critical endpoints like notifications). */
  dontClearTokenOn401?: boolean;
}

/**
 * Thin fetch wrapper for the admin backend: injects the base URL, JSON headers,
 * and the stored bearer token, then normalizes error handling around the
 * `{ success: boolean, ... }` envelope this API returns.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, body, headers, dontClearTokenOn401 = false, ...rest } = options;

  // FormData sets its own multipart boundary in the Content-Type header — never override it.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    if (!dontClearTokenOn401) {
      clearToken();
    }
    throw new ApiError((data && (data.error || data.message)) || "Session expired — please sign in again.", 401);
  }

  if (!res.ok || (data && data.success === false)) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}
