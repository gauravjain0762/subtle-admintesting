import { CheckCircle2, Sparkles, Ban } from "lucide-react";
import { fetchOrders, fetchOrder, setOrderStatus, bulkSetOrderStatus, type OrderQuery } from "@/lib/api/orders";
import type { ApiOrder } from "@/lib/api/types";

export interface OrderLineItem {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: string;
  portion?: string;
  addOns?: string[];
}

export type OrderStatus = "new" | "delivered" | "cancelled";
export type OrderType = "weekly" | "one-off" | "one-time";
export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export interface Order {
  id: string;
  orderNumber: string;
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
  orderDateISO: string;
  orderDateDisplay: string;
  deliveryDateISO: string;
  deliveryDateDisplay: string;
  preferredTime?: string;
  /** Alias for deliveryDateISO/Display — the older report pages filter by "which day did this happen" against this pair. */
  dateISO: string;
  dateDisplay: string;
}

export interface GroupedSubscriptionOrder {
  subscriptionId: string;
  orderNumber: string;
  customerName: string;
  customerInitials: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  totalAmount: string;
  status: OrderStatus;
  type: Exclude<OrderType, "one-time">;
  paymentMethod: PaymentMethod;
  items: OrderLineItem[];
  preferredTime?: string;
  deliveryCount: number;
  deliveries: Array<{
    date: string;
    dateDisplay: string;
    orderId: string;
    orderNumber: string;
  }>;
  isExpanded?: boolean;
}

export function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function displayDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Backend has been observed sending totalAmount as either a bare number (13.25) or a pre-formatted string ("£13.25") — normalize to the latter. */
function formatAmount(amount: number | string): string {
  if (typeof amount === "number") return `£${amount.toFixed(2)}`;
  return amount.trim().startsWith("£") ? amount : `£${amount}`;
}

function mapOrder(o: ApiOrder): Order {
  const deliveryISO = (o.deliveryDate ?? o.orderDate ?? "").slice(0, 10);
  const orderISO = (o.orderDate ?? "").slice(0, 10);
  return {
    id: o._id,
    /** Observed missing on some live test orders (pre-dates orderNumber generation) — fall back to _id rather than showing a blank Order ID. */
    orderNumber: o.orderNumber || o._id,
    customerName: o.customerName,
    customerInitials: deriveInitials(o.customerName),
    companyId: o.workspaceId,
    companyCode: o.workspaceCode,
    companyName: o.workspaceName,
    items: o.items.map((it) => ({
      dishId: it.dishId,
      dishName: it.dishName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      portion: it.portion,
      addOns: it.addOns,
    })),
    totalAmount: formatAmount(o.totalAmount),
    status: o.status,
    type: o.planType,
    paymentMethod: o.paymentMethod,
    orderDateISO: orderISO,
    orderDateDisplay: displayDate(o.orderDate),
    deliveryDateISO: deliveryISO,
    deliveryDateDisplay: displayDate(o.deliveryDate),
    preferredTime: o.preferredTime,
    dateISO: deliveryISO,
    dateDisplay: displayDate(o.deliveryDate ?? o.orderDate),
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  workspaceId?: string;
  customerId?: string;
  dayFilter?: "today" | "yesterday" | "last7days" | "custom";
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderPage {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

/** Main paginated fetch — used directly by the Orders list page, which owns its own filter/pagination UI. */
export async function getOrders(filters: OrderFilters = {}): Promise<OrderPage> {
  const res = await fetchOrders(filters as OrderQuery);
  return { orders: res.orders.map(mapOrder), total: res.total, page: res.page, totalPages: res.totalPages };
}

/** Convenience for report/dashboard views that want the full matching set rather than one page of it. */
export async function getAllOrders(filters: Omit<OrderFilters, "page" | "limit"> = {}): Promise<Order[]> {
  const res = await fetchOrders({ ...filters, page: 1, limit: 500 } as OrderQuery);
  return res.orders.map(mapOrder);
}

export async function getTodaysOrders(): Promise<Order[]> {
  return getAllOrders({ dayFilter: "today" });
}

export async function getOrder(id: string): Promise<Order> {
  const raw = await fetchOrder(id);
  return mapOrder(raw);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const raw = await setOrderStatus(id, status);
  return mapOrder(raw);
}

export async function bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number> {
  return bulkSetOrderStatus(ids, status);
}

export function groupSubscriptionOrders(orders: Order[]): (Order | GroupedSubscriptionOrder)[] {
  const subscriptionOrders = orders.filter((o) => o.type === "weekly" || o.type === "one-off");
  const oneTimeOrders = orders.filter((o) => o.type === "one-time");

  const groupMap = new Map<string, Order[]>();

  for (const order of subscriptionOrders) {
    const key = `${order.customerName}|${order.type}|${order.companyId || ""}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(order);
  }

  const grouped: (Order | GroupedSubscriptionOrder)[] = [];

  for (const orderGroup of groupMap.values()) {
    if (orderGroup.length === 0) continue;

    const first = orderGroup[0];
    const deliveries = orderGroup
      .sort((a, b) => a.deliveryDateISO.localeCompare(b.deliveryDateISO))
      .map((o) => ({
        date: o.deliveryDateISO,
        dateDisplay: o.deliveryDateDisplay,
        orderId: o.id,
        orderNumber: o.orderNumber,
      }));

    grouped.push({
      subscriptionId: first.id,
      orderNumber: first.orderNumber,
      customerName: first.customerName,
      customerInitials: first.customerInitials,
      companyId: first.companyId,
      companyCode: first.companyCode,
      companyName: first.companyName,
      totalAmount: first.totalAmount,
      status: first.status,
      type: first.type as Exclude<OrderType, "one-time">,
      paymentMethod: first.paymentMethod,
      items: first.items,
      preferredTime: first.preferredTime,
      deliveryCount: orderGroup.length,
      deliveries,
      isExpanded: false,
    });
  }

  return [...grouped, ...oneTimeOrders];
}

export function parseAmount(amount: string): number {
  return parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
}

export const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:       { label: "New",       color: "#7a5a00", bg: "#fffce0", icon: Sparkles },
  delivered: { label: "Delivered", color: "#2d6a2d", bg: "#edf7ed", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "#b83232", bg: "#fef2f2", icon: Ban },
};

export const TYPE_CFG: Record<OrderType, { color: string; bg: string }> = {
  weekly:    { color: "#7a5a00", bg: "#fffce0" },
  "one-off": { color: "#6b6b5a", bg: "#f0e9d6" },
  "one-time": { color: "#5a7a5a", bg: "#e8f5e9" },
};

export const PAYMENT_CFG: Record<PaymentMethod, { label: string }> = {
  card: { label: "Card" },
  apple_pay: { label: "Apple Pay" },
  google_pay: { label: "Google Pay" },
};
