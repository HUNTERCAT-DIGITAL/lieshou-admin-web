/**
 * 师资派遣 API service — 调 Spring Cloud gateway → edu-service（/api/dispatches/**）.
 *
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 师资派遣排期）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404；创建时做产能校验（时段重叠 409 / 周课时超 weekly_cap 409）。
 * 基于 services/api.ts 的通用封装（自动带 JWT）。
 */

import { api } from './api';
import type {
  CreateDispatchRequest,
  DispatchRecord,
  DispatchStatus,
} from '@lieshoucloud/types/business/dispatch';

/** GET /api/dispatches — 租户内派遣单列表（可选 keyword / status / teacherId 过滤；后端未分页） */
export async function listDispatches(
  keyword?: string,
  status?: DispatchStatus,
  teacherId?: number,
): Promise<DispatchRecord[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  if (teacherId) params.push(`teacherId=${teacherId}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<DispatchRecord[]>(`/dispatches${qs}`);
}

/** GET /api/dispatches/count — 租户内未删派遣单数 */
export async function countDispatches(): Promise<number> {
  return api.get<number>('/dispatches/count');
}

/** GET /api/dispatches/{id} */
export async function getDispatch(id: number): Promise<DispatchRecord> {
  return api.get<DispatchRecord>(`/dispatches/${id}`);
}

/** POST /api/dispatches — 创建（创建即派遣生效；产能校验失败返回 409） */
export async function createDispatch(body: CreateDispatchRequest): Promise<DispatchRecord> {
  return api.post<DispatchRecord>('/dispatches', body);
}

/** POST /api/dispatches/{id}/complete — 完成（教师无其他进行中派遣时释放回可用） */
export async function completeDispatch(id: number): Promise<DispatchRecord> {
  return api.post<DispatchRecord>(`/dispatches/${id}/complete`, {});
}

/** POST /api/dispatches/{id}/cancel — 取消（教师无其他进行中派遣时释放回可用） */
export async function cancelDispatch(id: number): Promise<DispatchRecord> {
  return api.post<DispatchRecord>(`/dispatches/${id}/cancel`, {});
}

/** DELETE /api/dispatches/{id} — 软删（仅终态 COMPLETED / CANCELLED） */
export async function deleteDispatch(id: number): Promise<void> {
  return api.delete<void>(`/dispatches/${id}`);
}
