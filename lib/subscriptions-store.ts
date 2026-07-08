export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface SubscriptionSummary {
  id: string;
  customer: string;
  status: SubscriptionStatus;
}

/**
 * Mirrors the mock records in app/dashboard/subscriptions/page.tsx.
 * Kept as a lightweight summary here so the dashboard can report a
 * "Weekly Subscriptions" count without duplicating the full Sub shape.
 */
const SUBSCRIPTIONS: SubscriptionSummary[] = [
  { id: "SUB-001", customer: "Sarah Mitchell", status: "active" },
  { id: "SUB-002", customer: "Emma Clarke",    status: "active" },
  { id: "SUB-003", customer: "Marcus Wilson",  status: "paused" },
  { id: "SUB-004", customer: "Priya Kapoor",   status: "active" },
  { id: "SUB-005", customer: "Daniel Park",    status: "active" },
  { id: "SUB-006", customer: "Raj Patel",      status: "active" },
  { id: "SUB-007", customer: "Luke Roberts",   status: "cancelled" },
  { id: "SUB-008", customer: "Olivia Brown",   status: "active" },
];

export function getSubscriptions(): SubscriptionSummary[] {
  return SUBSCRIPTIONS;
}

export function getActiveWeeklySubscriptionsCount(): number {
  return SUBSCRIPTIONS.filter((s) => s.status === "active").length;
}
