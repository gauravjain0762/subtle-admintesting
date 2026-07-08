import { apiFetch } from "./client";
import type { ApiWorkspace, ApiWorkspaceListResponse } from "./types";

export async function fetchWorkspaces(): Promise<ApiWorkspace[]> {
  const res = await apiFetch<ApiWorkspaceListResponse>("/api/admin/workspaces");
  return res.workspaces;
}

export async function updateWorkspace(id: string, patch: { status?: string }): Promise<void> {
  await apiFetch(`/api/admin/workspaces/${id}`, {
    method: "PATCH",
    body: patch,
  });
}
