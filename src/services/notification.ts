/**
 * 站内通知 API service — 调 gateway → user-service（/api/notifications/**）.
 *
 * 开源版消息通知模块：当前用户通知列表 / 未读数 / 标记已读 / 全部已读。
 * 接收者上下文（X-User-Id / X-Tenant-Id）由 gateway 从 JWT 注入。
 */
import { api } from './api';

export interface NotificationItem {
  id: number;
  tenantId: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  bizType?: string | null;
  bizId?: number | null;
  readAt?: string | null;
  createdAt: string;
}

/** GET /api/notifications — 我的通知（未读优先，新→旧） */
export async function listNotifications(params?: {
  page?: number;
  size?: number;
}): Promise<NotificationItem[]> {
  const qs = new URLSearchParams();
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  if (page !== null) qs.set('page', String(page));
  if (size !== null) qs.set('size', String(size));
  const s = qs.toString();
  return api.get<NotificationItem[]>(`/notifications${s ? `?${s}` : ''}`);
}

/** GET /api/notifications/unread-count — 未读数 */
export async function unreadNotificationCount(): Promise<number> {
  const r = await api.get<{ unread: number }>('/notifications/unread-count');
  return r.unread;
}

/** POST /api/notifications/{id}/read — 标记单条已读 */
export async function markNotificationRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

/** POST /api/notifications/read-all — 全部已读（返回本次标记条数） */
export async function markAllNotificationsRead(): Promise<number> {
  const r = await api.post<{ updated: number }>('/notifications/read-all');
  return r.updated;
}
