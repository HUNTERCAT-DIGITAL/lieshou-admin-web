/**
 * CRM 线索 API service — 调 Spring Cloud gateway → crm-service（/api/leads/**）.
 *
 * 与 crm.ts（客户）同构：后端强制 X-Tenant-Id，跨租户 404。
 */

import { api } from './api';
import type { FollowUpRequest, Lead, LeadFollowUp, LeadRequest, LeadStatus } from '@lieshoucloud/contract-types/business/lead';

/** GET /api/leads — 租户内线索列表；owner=-1 线索池(未认领) 0 全部 >0 指定认领人 */
export async function listLeads(
  keyword?: string,
  status?: LeadStatus,
  owner: number = 0,
): Promise<Lead[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  if (owner !== 0) params.push(`owner=${owner}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Lead[]>(`/leads${qs}`);
}

/** GET /api/leads/{id} */
export async function getLead(id: number): Promise<Lead> {
  return api.get<Lead>(`/leads/${id}`);
}

/** POST /api/leads — 创建（进池，ownerId 为空） */
export async function createLead(body: LeadRequest): Promise<Lead> {
  return api.post<Lead>('/leads', body);
}

/** PUT /api/leads/{id} */
export async function updateLead(id: number, body: LeadRequest): Promise<Lead> {
  return api.put<Lead>(`/leads/${id}`, body);
}

/** DELETE /api/leads/{id} */
export async function deleteLead(id: number): Promise<{ deleted: boolean }> {
  return api.delete(`/leads/${id}`);
}

/** POST /api/leads/{id}/assign — 认领（当前用户） */
export async function assignLead(id: number): Promise<Lead> {
  return api.post<Lead>(`/leads/${id}/assign`, {});
}

/** POST /api/leads/{id}/release — 释放回池 */
export async function releaseLead(id: number): Promise<Lead> {
  return api.post<Lead>(`/leads/${id}/release`, {});
}

/** POST /api/leads/{id}/convert — 转化（创建客户并关联） */
export async function convertLead(id: number): Promise<Lead> {
  return api.post<Lead>(`/leads/${id}/convert`, {});
}

/** GET /api/leads/{id}/follow-ups — 跟进时间线 */
export async function listFollowUps(leadId: number): Promise<LeadFollowUp[]> {
  return api.get<LeadFollowUp[]>(`/leads/${leadId}/follow-ups`);
}

/** POST /api/leads/{id}/follow-ups — 添加跟进 */
export async function addFollowUp(leadId: number, body: FollowUpRequest): Promise<LeadFollowUp> {
  return api.post<LeadFollowUp>(`/leads/${leadId}/follow-ups`, body);
}

/** POST /api/leads/import — CSV 批量导入（进线索池，来源默认 IMPORT） */
export async function importLeads(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<ImportResult>('/leads/import', form);
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}
