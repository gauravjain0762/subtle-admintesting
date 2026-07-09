import { fetchDishes, fetchDish, createDish, updateDish as apiUpdateDish, deleteDish as apiDeleteDish } from "@/lib/api/dishes";
import type { ApiDish, ApiNutritionalIngredient } from "@/lib/api/types";

export interface Ingredient {
  name: string;
  gramsPerMeal: number;
  price?: string;
}

export interface Portion {
  size: string;
  price: string;
}

/** One free-form nutrition property, e.g. { name: "Calories", value: "680" } or { name: "Fiber", value: "5g" }. */
export interface NutritionEntry {
  name: string;
  value: string;
}

export interface Dish {
  id: string;
  name: string;
  price: string;
  /** Raw, editable nutrition properties — source of truth for the edit form. */
  nutrition: NutritionEntry[];
  /** Convenience numbers derived from `nutrition` (falls back to legacy flat fields for older dishes), for list-table display. */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  available: boolean;
  popular: boolean;
  vegan: boolean;
  images: string[];
  category: string;
  allergens: string[];
  tags: string[];
  orders: number;
  rating: number;
  description?: string;
  menuId: string;
  ingredients: Ingredient[];
  portions: Portion[];
  availableDays: string[];
}

/** Fields the admin edits directly — `kcal`/`protein`/`carbs`/`fat` are derived from `nutrition`, not editable inputs. */
export type DishInput = Omit<Dish, "id" | "orders" | "rating" | "images" | "kcal" | "protein" | "carbs" | "fat">;

function deriveNutrition(d: ApiDish): NutritionEntry[] {
  if (d.nutritionalIngredients && d.nutritionalIngredients.length > 0) {
    return d.nutritionalIngredients.map((entry) => {
      const [key, value] = Object.entries(entry)[0] ?? ["", ""];
      return { name: key, value: String(value) };
    });
  }
  // Fallback for dishes created before the nutritionalIngredients migration — they only have flat scalar fields.
  const legacy: NutritionEntry[] = [];
  if (d.kcal !== undefined)    legacy.push({ name: "Calories", value: String(d.kcal) });
  if (d.protein !== undefined) legacy.push({ name: "Protein",  value: String(d.protein) });
  if (d.carbs !== undefined)   legacy.push({ name: "Carbs",    value: String(d.carbs) });
  if (d.fat !== undefined)     legacy.push({ name: "Fat",      value: String(d.fat) });
  return legacy;
}

function numFromNutrition(nutrition: NutritionEntry[], ...aliases: string[]): number {
  const lower = aliases.map((a) => a.toLowerCase());
  const hit = nutrition.find((n) => lower.includes(n.name.trim().toLowerCase()));
  const n = hit ? Number(hit.value) : NaN;
  return isNaN(n) ? 0 : n;
}

/** Converts editable rows into the API's array-of-single-key-object shape, sending numbers where possible and raw strings otherwise (e.g. "35gm"). */
function toApiNutrition(nutrition: NutritionEntry[]): ApiNutritionalIngredient[] {
  return nutrition
    .filter((n) => n.name.trim())
    .map((n) => {
      const num = Number(n.value);
      const value = n.value.trim() !== "" && !isNaN(num) ? num : n.value;
      return { [n.name.trim()]: value };
    });
}

function mapDish(d: ApiDish): Dish {
  const nutrition = deriveNutrition(d);
  return {
    id: d._id,
    name: d.name,
    price: d.price,
    nutrition,
    kcal:    numFromNutrition(nutrition, "kcal", "calories"),
    protein: numFromNutrition(nutrition, "protein"),
    carbs:   numFromNutrition(nutrition, "carbs", "carbohydrates"),
    fat:     numFromNutrition(nutrition, "fat"),
    available: d.available,
    popular: d.popular,
    vegan: d.vegan,
    images: d.images ?? [],
    category: d.category ?? "Main Course",
    allergens: d.allergens ?? [],
    tags: d.tags ?? [],
    orders: d.orders ?? 0,
    rating: d.rating ?? 0,
    description: d.description ?? "",
    menuId: d.menuId ?? "standard",
    ingredients: d.ingredients ?? [],
    portions: d.portions ?? [],
    availableDays: d.availableDays ?? [],
  };
}

/** In-memory cache of the last successful fetch, so navigating list → detail doesn't re-hit the network for data we already have. */
let cache: Dish[] | null = null;

export async function getDishes(): Promise<Dish[]> {
  const raw = await fetchDishes();
  cache = raw.map(mapDish);
  return cache;
}

export async function getDish(id: string): Promise<Dish | undefined> {
  const hit = cache?.find((d) => d.id === id);
  if (hit) return hit;
  const found = await fetchDish(id);
  return mapDish(found);
}

export async function getDishesByMenu(menuId: string): Promise<Dish[]> {
  const all = cache ?? (await getDishes());
  return all.filter((d) => d.menuId === menuId);
}

export async function addDish(dish: DishInput, images: (File | string)[]): Promise<Dish> {
  const created = await createDish({
    name:        dish.name,
    price:       dish.price,
    description: dish.description,
    category:    dish.category,
    menuId:      dish.menuId,
    nutritionalIngredients: toApiNutrition(dish.nutrition),
    allergens:   dish.allergens,
    tags:        dish.tags,
    ingredients: dish.ingredients,
    portions:    dish.portions,
    availableDays: dish.availableDays,
    available:   dish.available,
    popular:     dish.popular,
    vegan:       dish.vegan,
  }, images);
  cache = null;
  return mapDish(created);
}

/** Pass `images` only if the admin changed them — omitting it leaves existing images untouched (the API replaces the whole array, no merge, whenever the field is present at all). */
export async function updateDish(id: string, patch: DishInput, images?: (File | string)[]): Promise<void> {
  await apiUpdateDish(id, {
    name:        patch.name,
    price:       patch.price,
    description: patch.description,
    category:    patch.category,
    menuId:      patch.menuId,
    nutritionalIngredients: toApiNutrition(patch.nutrition),
    allergens:   patch.allergens,
    tags:        patch.tags,
    ingredients: patch.ingredients,
    portions:    patch.portions,
    availableDays: patch.availableDays,
    available:   patch.available,
    popular:     patch.popular,
    vegan:       patch.vegan,
  }, images);
  cache = null;
}

export async function toggleDishAvailable(id: string): Promise<boolean> {
  const dish = await getDish(id);
  const next = !dish?.available;
  await apiUpdateDish(id, { available: next });
  cache = null;
  return next;
}

export async function deleteDish(id: string): Promise<void> {
  await apiDeleteDish(id);
  cache = null;
}

export const TAG_COLORS: Record<string, { background: string; color: string }> = {
  "High Protein": { background: "#e8f0fe", color: "#0a3d8f" },
  "Gluten Free":  { background: "#edf7ed", color: "#2d6a2d" },
  "Low Cal":      { background: "#fdf0e4", color: "#7a3500" },
  "Vegan":        { background: "#edf7ed", color: "#2d6a2d" },
  "Vegetarian":   { background: "#edf7ed", color: "#2d6a2d" },
  "Comfort Food": { background: "#fffce0", color: "#7a5a00" },
  "Popular":      { background: "#fffce0", color: "#7a5a00" },
  "Light":        { background: "#f0e9d6", color: "#6b6b5a" },
};

export const AVAILABLE_TAGS = ["High Protein","Gluten Free","Low Cal","Vegan","Vegetarian","Comfort Food","Popular","Light"];

export const CATEGORIES = ["Main Course","Salad","Soup","Side","Breakfast","Dessert","Snack"];
export const ALLERGENS  = ["Gluten","Dairy","Eggs","Nuts","Peanuts","Soy","Shellfish","Fish","Sesame"];
export const MEAL_DAYS  = ["Mon","Tue","Wed","Thu","Fri"];
export const MAX_IMAGES = 3;
