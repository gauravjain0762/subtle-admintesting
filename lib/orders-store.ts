import { CheckCircle2, Truck, Clock, AlertCircle } from "lucide-react";

export interface OrderLineItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: string;
}

export type OrderStatus = "delivered" | "in-transit" | "preparing" | "cancelled";
export type OrderType = "weekly" | "one-time" | "business";
export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export interface Order {
  id: string;
  customerName: string;
  customerInitials: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  items: OrderLineItem[];
  totalAmount: string;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  dateISO: string;
  dateDisplay: string;
}

export function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function displayDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function line(dishId: number, dishName: string, unitPrice: string, quantity = 1): OrderLineItem {
  return { dishId, dishName, quantity, unitPrice };
}

function total(items: OrderLineItem[]): string {
  const sum = items.reduce((acc, it) => acc + parseFloat(it.unitPrice) * it.quantity, 0);
  return `£${sum.toFixed(2)}`;
}

function mkOrder(o: {
  id: string; customerName: string; companyId?: string; companyCode?: string; companyName?: string;
  items: OrderLineItem[]; status: OrderStatus; type: OrderType; paymentMethod: PaymentMethod; daysAgo: number;
}): Order {
  return {
    id: o.id,
    customerName: o.customerName,
    customerInitials: deriveInitials(o.customerName),
    companyId: o.companyId,
    companyCode: o.companyCode,
    companyName: o.companyName,
    items: o.items,
    totalAmount: total(o.items),
    status: o.status,
    type: o.type,
    paymentMethod: o.paymentMethod,
    dateISO: isoDate(o.daysAgo),
    dateDisplay: displayDate(o.daysAgo),
  };
}

const INITIAL_ORDERS: Order[] = [
  mkOrder({ id: "#ORD-4821", customerName: "Sarah Mitchell", companyId: "acme", companyCode: "ACME-2401", companyName: "Acme Corp.",
    items: [line(1, "Chicken Katsu Curry", "13.25")], status: "delivered", type: "weekly", paymentMethod: "card", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4820", customerName: "James Thompson",
    items: [line(2, "Mediterranean Salmon", "13.25")], status: "in-transit", type: "one-time", paymentMethod: "apple_pay", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4819", customerName: "Priya Kapoor", companyId: "techlondon", companyCode: "TECH-2412", companyName: "TechLondon Ltd",
    items: [line(3, "Chicken Teriyaki", "8.50", 2)], status: "preparing", type: "weekly", paymentMethod: "google_pay", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4818", customerName: "Acme Corp.", companyId: "acme", companyCode: "ACME-2401", companyName: "Acme Corp.",
    items: [line(1, "Chicken Katsu Curry", "8.50", 8)], status: "delivered", type: "business", paymentMethod: "card", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4817", customerName: "Luke Roberts",
    items: [line(4, "Tuscan Bean Soup", "7.00")], status: "cancelled", type: "one-time", paymentMethod: "card", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4816", customerName: "Emma Clarke", companyId: "financehub", companyCode: "FHUB-2411", companyName: "FinanceHub UK",
    items: [line(5, "Margherita Focaccia Pizza", "8.50")], status: "delivered", type: "weekly", paymentMethod: "apple_pay", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4815", customerName: "Daniel Park", companyId: "creativestudio", companyCode: "CRST-2501", companyName: "Creative Studio",
    items: [line(1, "Chicken Katsu Curry", "13.25")], status: "delivered", type: "weekly", paymentMethod: "card", daysAgo: 1 }),
  mkOrder({ id: "#ORD-4814", customerName: "TechLondon Ltd", companyId: "techlondon", companyCode: "TECH-2412", companyName: "TechLondon Ltd",
    items: [line(3, "Chicken Teriyaki", "8.50", 12)], status: "in-transit", type: "business", paymentMethod: "card", daysAgo: 1 }),
  mkOrder({ id: "#ORD-4813", customerName: "Olivia Brown",
    items: [line(2, "Mediterranean Salmon", "13.25")], status: "delivered", type: "one-time", paymentMethod: "google_pay", daysAgo: 1 }),
  mkOrder({ id: "#ORD-4812", customerName: "Marcus Wilson",
    items: [line(4, "Tuscan Bean Soup", "7.00")], status: "delivered", type: "weekly", paymentMethod: "card", daysAgo: 1 }),
  mkOrder({ id: "#ORD-4811", customerName: "Sophie Adams",
    items: [line(3, "Chicken Teriyaki", "8.50")], status: "preparing", type: "weekly", paymentMethod: "apple_pay", daysAgo: 2 }),
  mkOrder({ id: "#ORD-4810", customerName: "Creative Studio", companyId: "creativestudio", companyCode: "CRST-2501", companyName: "Creative Studio",
    items: [line(5, "Margherita Focaccia Pizza", "8.50", 20)], status: "delivered", type: "business", paymentMethod: "card", daysAgo: 2 }),
  mkOrder({ id: "#ORD-4809", customerName: "Raj Patel", companyId: "patelconsulting", companyCode: "PCON-2412", companyName: "Patel Consulting",
    items: [line(8, "Lemon Herb Chicken", "11.50", 3)], status: "preparing", type: "weekly", paymentMethod: "card", daysAgo: 0 }),
  mkOrder({ id: "#ORD-4808", customerName: "Dr. James Ford", companyId: "greenleaf", companyCode: "GLHC-2502", companyName: "Greenleaf Health",
    items: [line(7, "Caesar Salad Bowl", "9.00", 2), line(4, "Tuscan Bean Soup", "7.00")], status: "preparing", type: "business", paymentMethod: "card", daysAgo: 0 }),
];

const KEY = "sk_admin_orders";

function load(): Order[] {
  if (typeof window === "undefined") return [...INITIAL_ORDERS];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...INITIAL_ORDERS];
    return JSON.parse(raw) as Order[];
  } catch {
    return [...INITIAL_ORDERS];
  }
}

function save(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  return load();
}

export function getOrder(id: string): Order | undefined {
  return load().find((o) => o.id === id);
}

export function getTodaysOrders(): Order[] {
  const today = new Date().toISOString().slice(0, 10);
  return load().filter((o) => o.dateISO === today);
}

export function parseAmount(amount: string): number {
  return parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
}

export function getOrdersInRange(startISO: string, endISO: string): Order[] {
  return load().filter((o) => o.dateISO >= startISO && o.dateISO <= endISO);
}

/** Trailing window of `days` days, inclusive of today (days=1 -> today only, days=7 -> today + previous 6 days). */
export function getOrdersInTrailingDays(days: number): Order[] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return getOrdersInRange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
}

export function getRevenue(orders: Order[]): number {
  return orders.reduce((sum, o) => sum + parseAmount(o.totalAmount), 0);
}

export function addOrder(order: Omit<Order, "id" | "customerInitials" | "totalAmount" | "dateISO" | "dateDisplay">): Order {
  const orders = load();
  const newOrder: Order = {
    ...order,
    id: `#ORD-${Date.now().toString().slice(-6)}`,
    customerInitials: deriveInitials(order.customerName),
    totalAmount: total(order.items),
    dateISO: new Date().toISOString().slice(0, 10),
    dateDisplay: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  };
  save([newOrder, ...orders]);
  return newOrder;
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  save(load().map((o) => (o.id === id ? { ...o, status } : o)));
}

export function deleteOrder(id: string): void {
  save(load().filter((o) => o.id !== id));
}

export const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  delivered:    { label: "Delivered",  color: "#2d6a2d", bg: "#edf7ed", icon: CheckCircle2 },
  "in-transit": { label: "In Transit", color: "#0a3d8f", bg: "#e8f0fe", icon: Truck },
  preparing:    { label: "Preparing",  color: "#7a5a00", bg: "#fffce0", icon: Clock },
  cancelled:    { label: "Cancelled",  color: "#b83232", bg: "#fef2f2", icon: AlertCircle },
};

export const TYPE_CFG: Record<OrderType, { color: string; bg: string }> = {
  business: { color: "#0a3d8f", bg: "#e8f0fe" },
  weekly:   { color: "#7a5a00", bg: "#fffce0" },
  "one-time": { color: "#6b6b5a", bg: "#f0e9d6" },
};

export const PAYMENT_CFG: Record<PaymentMethod, { label: string }> = {
  card: { label: "Card" },
  apple_pay: { label: "Apple Pay" },
  google_pay: { label: "Google Pay" },
};
