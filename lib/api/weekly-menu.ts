import { apiFetch } from "./client";
import type { ApiWeeklyMenuRequest, ApiWeeklyMenuResponse } from "./types";

/**
 * Assigns (creates/overwrites) a week's themed menu plan. There is no corresponding GET —
 * confirmed 404 on `GET /api/admin/menu` — so this is write-only; nothing can be pre-loaded
 * for editing an already-saved week.
 */
export async function assignWeek(payload: ApiWeeklyMenuRequest): Promise<ApiWeeklyMenuResponse["menu"]> {
  const res = await apiFetch<ApiWeeklyMenuResponse>("/api/admin/menu", {
    method: "PUT",
    body: payload,
  });
  return res.menu;
}
