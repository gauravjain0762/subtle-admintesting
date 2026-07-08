export interface Menu {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
}

const INITIAL_MENUS: Menu[] = [
  { id: "standard", name: "Standard Menu", description: "Default menu served to most companies, Monday–Friday.", isDefault: true, createdAt: "Jan 2024" },
];

const KEY = "sk_admin_menus";

function load(): Menu[] {
  if (typeof window === "undefined") return [...INITIAL_MENUS];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_MENUS];
    return JSON.parse(raw) as Menu[];
  } catch {
    return [...INITIAL_MENUS];
  }
}

function save(menus: Menu[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(menus));
}

export function getMenus(): Menu[] {
  return load();
}

export function getMenuIds(): string[] {
  return load().map((m) => m.id);
}

export function getMenu(id: string): Menu | undefined {
  return load().find((m) => m.id === id);
}

export function getDefaultMenu(): Menu {
  const menus = load();
  return menus.find((m) => m.isDefault) ?? INITIAL_MENUS[0];
}

export function addMenu(menu: { name: string; description?: string }): Menu {
  const menus = load();
  const id = menu.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
  const newMenu: Menu = {
    id,
    name: menu.name,
    description: menu.description,
    isDefault: false,
    createdAt: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
  };
  save([newMenu, ...menus]);
  return newMenu;
}

export function updateMenu(id: string, patch: { name?: string; description?: string }): void {
  save(load().map((m) => (m.id === id ? { ...m, ...patch } : m)));
}

export function canDeleteMenu(id: string, dishCount: number, companyCount: number): boolean {
  const menu = getMenu(id);
  if (!menu || menu.isDefault) return false;
  return dishCount === 0 && companyCount === 0;
}

export function deleteMenu(id: string): boolean {
  const menu = getMenu(id);
  if (!menu || menu.isDefault) return false;
  save(load().filter((m) => m.id !== id));
  return true;
}
