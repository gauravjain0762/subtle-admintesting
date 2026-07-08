/**
 * Raw shapes returned by the admin backend, captured from live responses on
 * 2026-07-08. Only fields actually observed are typed — the backend may
 * return more later, but these are what the UI can rely on today.
 */

export interface ApiAdmin {
  _id: string;
  email: string;
  role: string;
}

export interface ApiLoginResponse {
  success: boolean;
  token: string;
  admin: ApiAdmin;
}

export interface ApiWorkspaceRequestWorkspace {
  name: string;
  address1: string;
  town: string;
  city: string;
  postcode: string;
  country: string;
  deliveryTimes: string[];
  /** Already a bucketed range from the sign-up form, e.g. "26 – 50" — not a raw number. */
  employees: string;
  premiseType: string;
}

export interface ApiWorkspaceRequestContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ApiWorkspaceRequest {
  _id: string;
  referenceId: string;
  /** Only "approved" has been observed live; "pending"/"rejected" are assumed, not confirmed. */
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  updatedAt: string;
  workspace: ApiWorkspaceRequestWorkspace;
  contact: ApiWorkspaceRequestContact;
}

export interface ApiWorkspaceRequestListResponse {
  success: boolean;
  requests: ApiWorkspaceRequest[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ApiWorkspace {
  _id: string;
  code: string;
  name: string;
  town: string;
  city: string;
  postcode: string;
  deliveryTimes: string[];
  employees: string;
  premiseType: string;
  /** Only "active" has been observed live; "suspended" is confirmed via the PATCH example, others are unknown. */
  status: "active" | "suspended" | string;
  totalUsers: number;
  totalOrders: number;
  createdAt: string;
}

export interface ApiWorkspaceListResponse {
  success: boolean;
  workspaces: ApiWorkspace[];
}
