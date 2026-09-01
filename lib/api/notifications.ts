import { apiFetch } from "./client";

export interface NotificationData {
  workspaceName?: string;
  contactEmail?: string;
  orderNumber?: string;
  orderTotal?: number;
  planType?: string;
  [key: string]: any;
}

export interface Notification {
  _id: string;
  type: "workspace_request" | "new_order";
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export async function getNotifications(
  page = 1,
  limit = 20,
  read?: boolean,
  type?: string
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (read !== undefined) params.append("read", read.toString());
  if (type) params.append("type", type);

  const res = await apiFetch<NotificationsResponse>(
    `/api/admin/notifications?${params.toString()}`,
    { dontClearTokenOn401: true }
  );
  return res;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const res = await apiFetch<UnreadCountResponse>(
    "/api/admin/notifications/unread-count"
  );
  return res;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const res = await apiFetch<{ success: boolean; notification: Notification }>(
    `/api/admin/notifications/${notificationId}/read`,
    { method: "PATCH" }
  );
  return res.notification;
}

export async function markAllAsRead(): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    "/api/admin/notifications/mark-all-read",
    { method: "PATCH" }
  );
  return res;
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    `/api/admin/notifications/${notificationId}`,
    { method: "DELETE" }
  );
  return res;
}

export async function deleteAllNotifications(): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    "/api/admin/notifications",
    { method: "DELETE" }
  );
  return res;
}
