/**
 * CRM 客户 API service — 调 Spring Cloud gateway → crm-service（/api/customers/**）.
 *
 * 首个租户内业务模块（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404。
 * 基于 services/api.ts 的通用封装（自动带 JWT）。
 */

import { api } from './api';
import type {
  CreateCustomerRequest,
  Customer,
  CustomerStatus,
  UpdateCustomerRequest,
} from '../types/customer';

/** GET /api/customers — 租户内客户列表（可选 keyword / status 过滤；后端未分页） */
export async function listCustomers(
  keyword?: string,
  status?: CustomerStatus,
): Promise<Customer[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Customer[]>(`/customers${qs}`);
}

/** GET /api/customers/count — 租户内未删客户数 */
export async function countCustomers(): Promise<number> {
  return api.get<number>('/customers/count');
}

/** GET /api/customers/{id} */
export async function getCustomer(id: number): Promise<Customer> {
  return api.get<Customer>(`/customers/${id}`);
}

/** POST /api/customers — 创建（tenant 强制取请求租户） */
export async function createCustomer(body: CreateCustomerRequest): Promise<Customer> {
  return api.post<Customer>('/customers', body);
}

/** PUT /api/customers/{id} */
export async function updateCustomer(id: number, body: UpdateCustomerRequest): Promise<Customer> {
  return api.put<Customer>(`/customers/${id}`, body);
}

/** DELETE /api/customers/{id} — 软删（后端置 is_deleted=true） */
export async function deleteCustomer(id: number): Promise<void> {
  return api.delete<void>(`/customers/${id}`);
}

/** POST /api/customers/import — CSV 批量导入（multipart） */
export async function importCustomers(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<ImportResult>('/customers/import', form);
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}
