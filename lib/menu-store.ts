export interface Ingredient {
  name: string;
  gramsPerMeal: number;
}

export interface Portion {
  size: string;
  price: string;
}

export interface Dish {
  id: number;
  name: string;
  price: string;
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

const INITIAL_DISHES: Dish[] = [
  { id: 1,  name: "Chicken Katsu Curry",       price: "13.25", kcal: 680, protein: 38, carbs: 62, fat: 24, available: true,  popular: true,  vegan: false, images: [], category: "Main Course", allergens: ["Gluten"],         tags: ["High Protein","Comfort Food"], orders: 284, rating: 4.9, description: "Crispy breaded chicken in a rich katsu curry sauce, served with steamed jasmine rice.", menuId: "standard", ingredients: [{ name: "Chicken", gramsPerMeal: 160 }, { name: "Rice", gramsPerMeal: 180 }, { name: "Katsu Sauce", gramsPerMeal: 80 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 2,  name: "Mediterranean Salmon",      price: "13.25", kcal: 520, protein: 42, carbs: 12, fat: 30, available: true,  popular: true,  vegan: false, images: [], category: "Main Course", allergens: ["Fish"],           tags: ["Gluten Free","High Protein"],  orders: 218, rating: 4.8, description: "Oven-baked salmon with cherry tomatoes, olives, capers and fresh herbs.", menuId: "standard", ingredients: [{ name: "Salmon", gramsPerMeal: 150 }, { name: "Cherry Tomatoes", gramsPerMeal: 90 }, { name: "Olives", gramsPerMeal: 30 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 3,  name: "Chicken Teriyaki",          price: "8.50",  kcal: 490, protein: 34, carbs: 58, fat: 14, available: true,  popular: false, vegan: false, images: [], category: "Main Course", allergens: ["Gluten","Soy"],   tags: ["Low Cal"],                      orders: 176, rating: 4.7, description: "Tender chicken glazed in sweet teriyaki sauce with sesame seeds and rice.", menuId: "standard", ingredients: [{ name: "Chicken", gramsPerMeal: 150 }, { name: "Rice", gramsPerMeal: 160 }, { name: "Teriyaki Sauce", gramsPerMeal: 50 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 4,  name: "Tuscan Bean Soup",          price: "7.00",  kcal: 380, protein: 16, carbs: 48, fat: 8,  available: true,  popular: false, vegan: true,  images: [], category: "Soup",         allergens: [],                  tags: ["Vegan","Low Cal"],             orders: 142, rating: 4.6, description: "Hearty cannellini bean soup with kale, tomatoes and fresh rosemary.", menuId: "standard", ingredients: [{ name: "Cannellini Beans", gramsPerMeal: 140 }, { name: "Kale", gramsPerMeal: 60 }, { name: "Tomatoes", gramsPerMeal: 100 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 5,  name: "Margherita Focaccia Pizza", price: "8.50",  kcal: 620, protein: 22, carbs: 70, fat: 22, available: true,  popular: false, vegan: false, images: [], category: "Main Course", allergens: ["Gluten","Dairy"], tags: ["Vegetarian","Popular"],        orders: 193, rating: 4.7, description: "Classic margherita on fluffy focaccia base with buffalo mozzarella.", menuId: "standard", ingredients: [{ name: "Focaccia Dough", gramsPerMeal: 200 }, { name: "Mozzarella", gramsPerMeal: 100 }, { name: "Tomatoes", gramsPerMeal: 70 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 6,  name: "Chicken Pasta",             price: "8.00",  kcal: 580, protein: 35, carbs: 64, fat: 18, available: false, popular: false, vegan: false, images: [], category: "Main Course", allergens: ["Gluten","Dairy"], tags: ["Comfort Food"],                 orders: 98,  rating: 4.5, description: "Penne pasta with grilled chicken, spinach and creamy tomato sauce.", menuId: "standard", ingredients: [{ name: "Chicken", gramsPerMeal: 140 }, { name: "Pasta", gramsPerMeal: 170 }, { name: "Spinach", gramsPerMeal: 40 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 7,  name: "Caesar Salad Bowl",         price: "9.00",  kcal: 320, protein: 28, carbs: 14, fat: 20, available: true,  popular: false, vegan: false, images: [], category: "Salad",       allergens: ["Dairy","Eggs"],   tags: ["Low Cal","Light"],             orders: 87,  rating: 4.4, description: "Crisp romaine, shaved parmesan, croutons and house Caesar dressing.", menuId: "standard", ingredients: [{ name: "Romaine Lettuce", gramsPerMeal: 120 }, { name: "Parmesan", gramsPerMeal: 30 }, { name: "Chicken", gramsPerMeal: 100 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 8,  name: "Lemon Herb Chicken",        price: "11.50", kcal: 450, protein: 40, carbs: 30, fat: 12, available: true,  popular: false, vegan: false, images: [], category: "Main Course", allergens: [],                  tags: ["High Protein","Gluten Free"],  orders: 124, rating: 4.8, description: "Grilled chicken breast marinated in lemon, garlic and fresh herbs.", menuId: "standard", ingredients: [{ name: "Chicken", gramsPerMeal: 170 }, { name: "Potato", gramsPerMeal: 180 }, { name: "Green Beans", gramsPerMeal: 70 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 9,  name: "Grilled Chicken Power Bowl", price: "10.50", kcal: 480, protein: 44, carbs: 32, fat: 16, available: true,  popular: true,  vegan: false, images: [], category: "Main Course", allergens: [],                  tags: ["High Protein","Low Cal"],      orders: 61,  rating: 4.8, description: "Grilled chicken breast over quinoa with roasted broccoli, peppers and a tahini drizzle.", menuId: "corporate-wellness", ingredients: [{ name: "Chicken", gramsPerMeal: 150 }, { name: "Quinoa", gramsPerMeal: 120 }, { name: "Broccoli", gramsPerMeal: 90 }], portions: [{ size: "Regular", price: "10.50" }, { size: "Large", price: "13.00" }], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 10, name: "Quinoa & Roasted Veg Salad", price: "9.50",  kcal: 410, protein: 14, carbs: 46, fat: 18, available: true,  popular: false, vegan: true,  images: [], category: "Salad",       allergens: [],                  tags: ["Vegan","Low Cal","Light"],     orders: 38,  rating: 4.6, description: "Tri-colour quinoa with roasted courgette, red onion, chickpeas and a lemon herb dressing.", menuId: "corporate-wellness", ingredients: [{ name: "Quinoa", gramsPerMeal: 130 }, { name: "Chickpeas", gramsPerMeal: 80 }, { name: "Courgette", gramsPerMeal: 70 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
  { id: 11, name: "Miso Baked Cod",             price: "12.50", kcal: 440, protein: 38, carbs: 24, fat: 20, available: true,  popular: false, vegan: false, images: [], category: "Main Course", allergens: ["Fish","Soy"],      tags: ["Gluten Free","High Protein"],  orders: 27,  rating: 4.7, description: "Miso-glazed cod fillet with steamed pak choi and brown rice.", menuId: "corporate-wellness", ingredients: [{ name: "Cod", gramsPerMeal: 160 }, { name: "Brown Rice", gramsPerMeal: 150 }, { name: "Pak Choi", gramsPerMeal: 80 }], portions: [], availableDays: ["Mon","Wed","Fri"] },
  { id: 12, name: "Berry Protein Smoothie Bowl",price: "7.50",  kcal: 360, protein: 24, carbs: 50, fat: 8,  available: true,  popular: false, vegan: false, images: [], category: "Breakfast",   allergens: ["Dairy"],           tags: ["Vegetarian","Low Cal"],        orders: 19,  rating: 4.5, description: "Mixed berry and Greek yoghurt smoothie base topped with granola, chia and fresh berries.", menuId: "corporate-wellness", ingredients: [{ name: "Greek Yoghurt", gramsPerMeal: 150 }, { name: "Mixed Berries", gramsPerMeal: 100 }, { name: "Granola", gramsPerMeal: 40 }], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"] },
];

const KEY = "sk_admin_dishes";

function load(): Dish[] {
  if (typeof window === "undefined") return [...INITIAL_DISHES];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_DISHES];
    const parsed = JSON.parse(raw) as Partial<Dish>[];
    return parsed.map((d) => ({
      menuId: "standard", ingredients: [], carbs: 0, fat: 0, images: [], category: "Main Course",
      allergens: [], portions: [], availableDays: ["Mon","Tue","Wed","Thu","Fri"],
      ...d,
    } as Dish));
  } catch {
    return [...INITIAL_DISHES];
  }
}

function save(dishes: Dish[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(dishes));
}

export function getDishes(): Dish[] {
  return load();
}

export function getDishIds(): number[] {
  return load().map((d) => d.id);
}

export function getDish(id: number): Dish | undefined {
  return load().find((d) => d.id === id);
}

export function getDishesByMenu(menuId: string): Dish[] {
  return load().filter((d) => d.menuId === menuId);
}

export function addDish(dish: Omit<Dish, "id" | "orders" | "rating">): Dish {
  const dishes = load();
  const newDish: Dish = { ...dish, id: Date.now(), orders: 0, rating: 0 };
  save([newDish, ...dishes]);
  return newDish;
}

export function updateDish(id: number, patch: Omit<Dish, "id" | "orders" | "rating">): void {
  const dishes = load();
  save(dishes.map((d) => d.id === id ? { ...d, ...patch } : d));
}

export function toggleDishAvailable(id: number): boolean {
  const dishes = load();
  let next = false;
  save(dishes.map((d) => {
    if (d.id !== id) return d;
    next = !d.available;
    return { ...d, available: next };
  }));
  return next;
}

export function deleteDish(id: number): void {
  save(load().filter((d) => d.id !== id));
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
