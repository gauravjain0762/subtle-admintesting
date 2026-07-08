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
  /** Contact fields added by the backend on 2026-07-08 — flat, unlike workspace-requests' nested `contact` object. */
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  totalUsers: number;
  totalOrders: number;
  createdAt: string;
}

export interface ApiWorkspaceListResponse {
  success: boolean;
  workspaces: ApiWorkspace[];
}

export interface ApiIngredient {
  name: string;
  gramsPerMeal: number;
  price?: string;
}

export interface ApiPortion {
  size: string;
  price: string;
}

/** Each entry is a single-key object, e.g. `{ "kcal": 680 }` or `{ "carbohydrates": "35gm" }` — key names and value types (number or string) are free-form, not a fixed schema. */
export type ApiNutritionalIngredient = Record<string, number | string>;

export interface ApiDish {
  _id: string;
  name: string;
  price: string;
  description?: string;
  category?: string;
  menuId?: string;
  /** Current schema (2026-07-08+) — replaces the old flat kcal/protein/carbs/fat fields below. */
  nutritionalIngredients?: ApiNutritionalIngredient[];
  /** Legacy flat fields — only present on dishes created before the nutritionalIngredients migration; not written by new saves. */
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  allergens: string[];
  tags: string[];
  ingredients: ApiIngredient[];
  portions: ApiPortion[];
  availableDays: string[];
  available: boolean;
  popular: boolean;
  vegan: boolean;
  images: string[];
  orders: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDishListResponse {
  success: boolean;
  dishes: ApiDish[];
}

export interface ApiDishResponse {
  success: boolean;
  dish: ApiDish;
}

export type WeekDayCode = "MON" | "TUE" | "WED" | "THU" | "FRI";

export interface ApiWeeklyMenuDay {
  day: WeekDayCode;
  date: string;
  theme: string;
  closed: boolean;
  dishes: string[];
}

export interface ApiWeeklyMenuRequest {
  weekStart: string;
  weekEnd: string;
  days: ApiWeeklyMenuDay[];
}

export interface ApiWeeklyMenuResponse {
  success: boolean;
  menu: {
    _id: string;
    weekStart: string;
    published: boolean;
  };
}
