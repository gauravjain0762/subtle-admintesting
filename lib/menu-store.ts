export interface Dish {
  id: number;
  name: string;
  price: string;
  kcal: number;
  protein: number;
  available: boolean;
  popular: boolean;
  vegan: boolean;
  img: string;
  tags: string[];
  orders: number;
  rating: number;
  description?: string;
}

const INITIAL_DISHES: Dish[] = [
  { id: 1,  name: "Chicken Katsu Curry",       price: "13.25", kcal: 680, protein: 38, available: true,  popular: true,  vegan: false, img: "🍛", tags: ["High Protein","Comfort Food"], orders: 284, rating: 4.9, description: "Crispy breaded chicken in a rich katsu curry sauce, served with steamed jasmine rice." },
  { id: 2,  name: "Mediterranean Salmon",      price: "13.25", kcal: 520, protein: 42, available: true,  popular: true,  vegan: false, img: "🐟", tags: ["Gluten Free","High Protein"],  orders: 218, rating: 4.8, description: "Oven-baked salmon with cherry tomatoes, olives, capers and fresh herbs." },
  { id: 3,  name: "Chicken Teriyaki",          price: "8.50",  kcal: 490, protein: 34, available: true,  popular: false, vegan: false, img: "🍱", tags: ["Low Cal"],                      orders: 176, rating: 4.7, description: "Tender chicken glazed in sweet teriyaki sauce with sesame seeds and rice." },
  { id: 4,  name: "Tuscan Bean Soup",          price: "7.00",  kcal: 380, protein: 16, available: true,  popular: false, vegan: true,  img: "🥣", tags: ["Vegan","Low Cal"],             orders: 142, rating: 4.6, description: "Hearty cannellini bean soup with kale, tomatoes and fresh rosemary." },
  { id: 5,  name: "Margherita Focaccia Pizza", price: "8.50",  kcal: 620, protein: 22, available: true,  popular: false, vegan: false, img: "🍕", tags: ["Vegetarian","Popular"],        orders: 193, rating: 4.7, description: "Classic margherita on fluffy focaccia base with buffalo mozzarella." },
  { id: 6,  name: "Chicken Pasta",             price: "8.00",  kcal: 580, protein: 35, available: false, popular: false, vegan: false, img: "🍝", tags: ["Comfort Food"],                 orders: 98,  rating: 4.5, description: "Penne pasta with grilled chicken, spinach and creamy tomato sauce." },
  { id: 7,  name: "Caesar Salad Bowl",         price: "9.00",  kcal: 320, protein: 28, available: true,  popular: false, vegan: false, img: "🥗", tags: ["Low Cal","Light"],             orders: 87,  rating: 4.4, description: "Crisp romaine, shaved parmesan, croutons and house Caesar dressing." },
  { id: 8,  name: "Lemon Herb Chicken",        price: "11.50", kcal: 450, protein: 40, available: true,  popular: false, vegan: false, img: "🍗", tags: ["High Protein","Gluten Free"],  orders: 124, rating: 4.8, description: "Grilled chicken breast marinated in lemon, garlic and fresh herbs." },
];

const KEY = "sk_admin_dishes";

function load(): Dish[] {
  if (typeof window === "undefined") return [...INITIAL_DISHES];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_DISHES];
    return JSON.parse(raw) as Dish[];
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
export const EMOJI_OPTIONS  = ["🍛","🐟","🍱","🥣","🍕","🍝","🥗","🍗","🥩","🍜","🥘","🫕","🍲","🥙","🌯","🥪"];
