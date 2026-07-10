import { apiFetch } from "./client";
import type { ApiWorkspaceRequest, ApiWorkspaceRequestListResponse } from "./types";

export async function fetchWorkspaceRequests(): Promise<ApiWorkspaceRequest[]> {
  const res = await apiFetch<ApiWorkspaceRequestListResponse>("/api/admin/workspace-requests");
  return res.requests;
}

export async function approveWorkspaceRequest(id: string, code: string): Promise<void> {
  await apiFetch(`/api/admin/workspace-requests/${id}/approve`, {
    method: "POST",
    body: { code },
  });
}

export async function rejectWorkspaceRequest(id: string, reason: string): Promise<void> {
  await apiFetch(`/api/admin/workspace-requests/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export async function deleteWorkspaceRequest(id: string): Promise<void> {
  await apiFetch(`/api/admin/workspace-requests/${id}`, { method: "DELETE" });
}
