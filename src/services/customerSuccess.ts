/**
 * 客户成功中心 API service — 调 Spring Cloud gateway → crm-service.
 *
 * 售后闭环：联系函（/api/letters/**）+ 客户响应（/api/responses/**）+ 工作台汇总
 * （/api/customer-success/summary）。与 crm.ts 同构：后端强制 X-Tenant-Id，跨租户 404。
 */

import { api } from './api';
import type {
  ContactLetter,
  CreateLetterRequest,
  CreateResponseRequest,
  CreateTemplateRequest,
  CustomerResponse,
  CustomerSuccessSummary,
  LetterStatus,
  LetterTemplate,
  LetterType,
  ResponseSentiment,
  ResponseStatus,
  UpdateLetterRequest,
  UpdateResponseRequest,
  UpdateTemplateRequest,
} from '../types/customerSuccess';

// ============================================================
// 联系函
// ============================================================

/** GET /api/letters — 租户内联系函列表（可选 customerId / type / status 过滤） */
export async function listLetters(params?: {
  customerId?: number;
  type?: LetterType;
  status?: LetterStatus;
}): Promise<ContactLetter[]> {
  const qs: string[] = [];
  if (params?.customerId !== undefined) qs.push(`customerId=${params.customerId}`);
  if (params?.type) qs.push(`type=${params.type}`);
  if (params?.status) qs.push(`status=${params.status}`);
  return api.get<ContactLetter[]>(`/letters${qs.length > 0 ? `?${qs.join('&')}` : ''}`);
}

/** GET /api/letters/count — 租户内未删联系函数 */
export async function countLetters(): Promise<number> {
  return api.get<number>('/letters/count');
}

/** GET /api/letter-templates — 系统预置 + 租户自定义模板（含 {customer} 占位符） */
export async function getLetterTemplates(): Promise<LetterTemplate[]> {
  return api.get<LetterTemplate[]>('/letter-templates');
}

/** POST /api/letter-templates — 创建租户自定义模板（templateKey 租户内唯一，冲突 409） */
export async function createTemplate(body: CreateTemplateRequest): Promise<LetterTemplate> {
  return api.post<LetterTemplate>('/letter-templates', body);
}

/** PUT /api/letter-templates/{id} — 更新租户自定义模板（系统模板 404） */
export async function updateTemplate(
  id: number,
  body: UpdateTemplateRequest,
): Promise<LetterTemplate> {
  return api.put<LetterTemplate>(`/letter-templates/${id}`, body);
}

/** DELETE /api/letter-templates/{id} — 软删租户自定义模板（系统模板 404） */
export async function deleteTemplate(id: number): Promise<void> {
  return api.delete<void>(`/letter-templates/${id}`);
}

/** POST /api/letters — 创建（一律 DRAFT 草稿，发送走 /send） */
export async function createLetter(body: CreateLetterRequest): Promise<ContactLetter> {
  return api.post<ContactLetter>('/letters', body);
}

/** PUT /api/letters/{id} — 仅 DRAFT 可改（后端 409 兜底） */
export async function updateLetter(id: number, body: UpdateLetterRequest): Promise<ContactLetter> {
  return api.put<ContactLetter>(`/letters/${id}`, body);
}

/** DELETE /api/letters/{id} — 软删 */
export async function deleteLetter(id: number): Promise<void> {
  return api.delete<void>(`/letters/${id}`);
}

/** POST /api/letters/{id}/send — DRAFT → SENT */
export async function sendLetter(id: number): Promise<ContactLetter> {
  return api.post<ContactLetter>(`/letters/${id}/send`, {});
}

/** POST /api/letters/{id}/read — SENT → READ（客户已读） */
export async function readLetter(id: number): Promise<ContactLetter> {
  return api.post<ContactLetter>(`/letters/${id}/read`, {});
}

/** POST /api/letters/{id}/complete — SENT/READ → COMPLETED */
export async function completeLetter(id: number): Promise<ContactLetter> {
  return api.post<ContactLetter>(`/letters/${id}/complete`, {});
}

/** POST /api/letters/{id}/cancel — 非终态 → CANCELLED */
export async function cancelLetter(id: number): Promise<ContactLetter> {
  return api.post<ContactLetter>(`/letters/${id}/cancel`, {});
}

// ============================================================
// 客户响应（响应深化）
// ============================================================

/** GET /api/responses — 租户内响应列表（可选 customerId / letterId / status / sentiment / 跟进到期 过滤） */
export async function listResponses(params?: {
  customerId?: number;
  letterId?: number;
  status?: ResponseStatus;
  sentiment?: ResponseSentiment;
  /** 仅未闭环且已逾期（followUpAt < now） */
  followUpOverdue?: boolean;
  /** 仅未闭环且今日到期（followUpAt 在今日） */
  followUpDueToday?: boolean;
}): Promise<CustomerResponse[]> {
  const qs: string[] = [];
  if (params?.customerId !== undefined) qs.push(`customerId=${params.customerId}`);
  if (params?.letterId !== undefined) qs.push(`letterId=${params.letterId}`);
  if (params?.status) qs.push(`status=${params.status}`);
  if (params?.sentiment) qs.push(`sentiment=${params.sentiment}`);
  if (params?.followUpOverdue) qs.push('followUpOverdue=true');
  if (params?.followUpDueToday) qs.push('followUpDueToday=true');
  return api.get<CustomerResponse[]>(`/responses${qs.length > 0 ? `?${qs.join('&')}` : ''}`);
}

/** GET /api/responses/count — 租户内未删响应数 */
export async function countResponses(): Promise<number> {
  return api.get<number>('/responses/count');
}

/** POST /api/responses — 创建（默认 OPEN 待跟进） */
export async function createResponse(body: CreateResponseRequest): Promise<CustomerResponse> {
  return api.post<CustomerResponse>('/responses', body);
}

/** PUT /api/responses/{id} — 更新（含状态流转） */
export async function updateResponse(
  id: number,
  body: UpdateResponseRequest,
): Promise<CustomerResponse> {
  return api.put<CustomerResponse>(`/responses/${id}`, body);
}

/** POST /api/responses/{id}/resolve — → RESOLVED 闭环 */
export async function resolveResponse(id: number): Promise<CustomerResponse> {
  return api.post<CustomerResponse>(`/responses/${id}/resolve`, {});
}

/** DELETE /api/responses/{id} — 软删 */
export async function deleteResponse(id: number): Promise<void> {
  return api.delete<void>(`/responses/${id}`);
}

// ============================================================
// 工作台汇总
// ============================================================

/** GET /api/customer-success/summary — 客户成功中心工作台卡片聚合 */
export async function getCustomerSuccessSummary(): Promise<CustomerSuccessSummary> {
  return api.get<CustomerSuccessSummary>('/customer-success/summary');
}
