import { apiFetch } from "./client";

export interface Company {
  _id: string;
  name: string;
  code: string;
  town: string;
  city: string;
  postcode: string;
  status: "active" | "suspended" | string;
}

export interface AssignDishResponse {
  success: boolean;
  message: string;
  dishId: string;
  assignedCompanies: string[];
}

export interface AssignedCompaniesResponse {
  success: boolean;
  dishId: string;
  companies: Company[];
  menuId: string;
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await apiFetch<{ success: boolean; companies: Company[] }>("/api/admin/companies");
  return res.companies;
}

export async function assignDishToCompanies(dishId: string, companyIds: string[]): Promise<AssignDishResponse> {
  const res = await apiFetch<AssignDishResponse>(`/api/admin/dishes/${dishId}/assign-companies`, {
    method: "POST",
    body: { companyIds },
  });
  return res;
}

export async function getAssignedCompanies(dishId: string): Promise<Company[]> {
  try {
    const res = await apiFetch<AssignedCompaniesResponse>(`/api/admin/dishes/${dishId}/assigned-companies`);
    return res.companies || [];
  } catch {
    // API not yet implemented - return empty array
    return [];
  }
}

export async function unassignDishFromCompanies(dishId: string, companyIds: string[]): Promise<AssignDishResponse> {
  const res = await apiFetch<AssignDishResponse>(`/api/admin/dishes/${dishId}/unassign-companies`, {
    method: "DELETE",
    body: { companyIds },
  });
  return res;
}
