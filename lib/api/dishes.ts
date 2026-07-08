import { apiFetch } from "./client";
import type { ApiDish, ApiDishListResponse, ApiDishResponse, ApiNutritionalIngredient } from "./types";

export interface DishPayload {
  name?: string;
  price?: string;
  description?: string;
  category?: string;
  menuId?: string;
  nutritionalIngredients?: ApiNutritionalIngredient[];
  allergens?: string[];
  tags?: string[];
  ingredients?: { name: string; gramsPerMeal: number; price?: string }[];
  portions?: { size: string; price: string }[];
  availableDays?: string[];
  available?: boolean;
  popular?: boolean;
  vegan?: boolean;
}

/** Existing images are string URLs; a newly-picked image is a raw File. The API's `images` field is a full
 *  replace (not a merge), so to keep an existing image on update we re-fetch its URL as a Blob and re-attach it. */
async function toFile(entry: File | string, index: number): Promise<File> {
  if (entry instanceof File) return entry;
  const res = await fetch(entry);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "jpg";
  return new File([blob], `image-${index}.${ext}`, { type: blob.type || "image/jpeg" });
}

async function buildFormData(payload: DishPayload, images?: (File | string)[]): Promise<FormData> {
  const fd = new FormData();
  if (payload.name !== undefined) fd.append("name", payload.name);
  if (payload.price !== undefined) fd.append("price", payload.price);
  if (payload.description !== undefined) fd.append("description", payload.description);
  if (payload.category !== undefined) fd.append("category", payload.category);
  if (payload.menuId !== undefined) fd.append("menuId", payload.menuId);
  if (payload.nutritionalIngredients !== undefined) fd.append("nutritionalIngredients", JSON.stringify(payload.nutritionalIngredients));
  if (payload.allergens !== undefined) fd.append("allergens", JSON.stringify(payload.allergens));
  if (payload.tags !== undefined) fd.append("tags", JSON.stringify(payload.tags));
  if (payload.ingredients !== undefined) fd.append("ingredients", JSON.stringify(payload.ingredients));
  if (payload.portions !== undefined) fd.append("portions", JSON.stringify(payload.portions));
  if (payload.availableDays !== undefined) fd.append("availableDays", JSON.stringify(payload.availableDays));
  if (payload.available !== undefined) fd.append("available", String(payload.available));
  if (payload.popular !== undefined) fd.append("popular", String(payload.popular));
  if (payload.vegan !== undefined) fd.append("vegan", String(payload.vegan));
  if (images !== undefined) {
    const files = await Promise.all(images.map((img, i) => toFile(img, i)));
    for (const f of files) fd.append("images", f);
  }
  return fd;
}

export async function fetchDishes(): Promise<ApiDish[]> {
  const res = await apiFetch<ApiDishListResponse>("/api/admin/dishes");
  return res.dishes;
}

export async function fetchDish(id: string): Promise<ApiDish> {
  const res = await apiFetch<ApiDishResponse>(`/api/admin/dishes/${id}`);
  return res.dish;
}

/** `images` is required on create — every new dish needs at least the images the admin picked (may be empty). */
export async function createDish(payload: DishPayload, images: (File | string)[]): Promise<ApiDish> {
  const fd = await buildFormData(payload, images);
  const res = await apiFetch<ApiDishResponse>("/api/admin/dishes", {
    method: "POST",
    body: fd,
  });
  return res.dish;
}

/** Pass `images` only when the admin actually changed them — omitting it leaves the existing images untouched;
 *  the API replaces the whole array (no merge) if the field is present at all. */
export async function updateDish(id: string, patch: DishPayload, images?: (File | string)[]): Promise<ApiDish> {
  const fd = await buildFormData(patch, images);
  const res = await apiFetch<ApiDishResponse>(`/api/admin/dishes/${id}`, {
    method: "PATCH",
    body: fd,
  });
  return res.dish;
}

export async function deleteDish(id: string): Promise<void> {
  await apiFetch(`/api/admin/dishes/${id}`, { method: "DELETE" });
}
