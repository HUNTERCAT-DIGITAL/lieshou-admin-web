/**
 * 会员 API service — 调 Spring Cloud gateway → crm-service（/api/members/**）.
 *
 * V5 补齐（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404；会员号租户内唯一。
 */

import { api } from './api';
import type {
  CreateMemberRequest,
  Member,
  MemberLevel,
  MemberStatus,
  UpdateMemberRequest,
} from '@lieshoucloud/types/business/member';

/** GET /api/members — 租户内会员列表（可选 customerId / level / status / keyword 过滤） */
export async function listMembers(
  customerId?: number,
  level?: MemberLevel,
  status?: MemberStatus,
  keyword?: string,
): Promise<Member[]> {
  const params: string[] = [];
  if (customerId) params.push(`customerId=${customerId}`);
  if (level) params.push(`level=${level}`);
  if (status) params.push(`status=${status}`);
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Member[]>(`/members${qs}`);
}

/** GET /api/members/count — 租户内未删会员总数 */
export async function countMembers(): Promise<number> {
  return api.get<number>('/members/count');
}

/** GET /api/members/{id} */
export async function getMember(id: number): Promise<Member> {
  return api.get<Member>(`/members/${id}`);
}

/** POST /api/members — 创建（tenant 强制取请求租户） */
export async function createMember(body: CreateMemberRequest): Promise<Member> {
  return api.post<Member>('/members', body);
}

/** PUT /api/members/{id} */
export async function updateMember(id: number, body: UpdateMemberRequest): Promise<Member> {
  return api.put<Member>(`/members/${id}`, body);
}

/** DELETE /api/members/{id} — 软删 */
export async function deleteMember(id: number): Promise<void> {
  return api.delete<void>(`/members/${id}`);
}
