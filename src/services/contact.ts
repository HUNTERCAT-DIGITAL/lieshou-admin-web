/**
 * 联系人 API service — 调 Spring Cloud gateway → crm-service（/api/contacts/**）.
 *
 * V5 补齐（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404。
 */

import { api } from './api';
import type { Contact, CreateContactRequest, UpdateContactRequest } from '@lieshoucloud/contract-types/business/contact';

/** GET /api/contacts — 租户内联系人列表（可选 customerId / keyword 过滤） */
export async function listContacts(
  customerId?: number,
  keyword?: string,
): Promise<Contact[]> {
  const params: string[] = [];
  if (customerId) params.push(`customerId=${customerId}`);
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Contact[]>(`/contacts${qs}`);
}

/** GET /api/contacts/count — 租户内未删联系人总数 */
export async function countContacts(): Promise<number> {
  return api.get<number>('/contacts/count');
}

/** GET /api/contacts/{id} */
export async function getContact(id: number): Promise<Contact> {
  return api.get<Contact>(`/contacts/${id}`);
}

/** POST /api/contacts — 创建（tenant 强制取请求租户） */
export async function createContact(body: CreateContactRequest): Promise<Contact> {
  return api.post<Contact>('/contacts', body);
}

/** PUT /api/contacts/{id} */
export async function updateContact(id: number, body: UpdateContactRequest): Promise<Contact> {
  return api.put<Contact>(`/contacts/${id}`, body);
}

/** DELETE /api/contacts/{id} — 软删 */
export async function deleteContact(id: number): Promise<void> {
  return api.delete<void>(`/contacts/${id}`);
}
