/**
 * Tenant API service — 调 Spring Cloud gateway → user-service（/api/tenants/**）.
 *
 * Phase 8 · 租户管理（开通/停用/列表）运营视角。
 * @see .ai/decisions/0022-multitenant-schema.md
 */

import { api } from './api';
import type {
  CreateInviteRequest,
  CreateTenantRequest,
  RegisterTenantRequest,
  RegisterTenantResult,
  Tenant,
  TenantInvite,
  UpdateTenantRequest,
} from '../types/tenant';

/** GET /api/tenants — 全量列表 */
export async function listTenants(): Promise<Tenant[]> {
  return api.get<Tenant[]>('/tenants');
}

/** POST /api/tenants/register — 租户自助开通（公开端点，无鉴权 · issue #24） */
export async function registerTenant(body: RegisterTenantRequest): Promise<RegisterTenantResult> {
  return api.post<RegisterTenantResult>('/tenants/register', body);
}

/** GET /api/tenants/{id} */
export async function getTenant(id: number): Promise<Tenant> {
  return api.get<Tenant>(`/tenants/${id}`);
}

/** POST /api/tenants — 开通租户 */
export async function createTenant(body: CreateTenantRequest): Promise<Tenant> {
  return api.post<Tenant>('/tenants', body);
}

/** PUT /api/tenants/{id} — 更新（改名 / 启停） */
export async function updateTenant(id: number, body: UpdateTenantRequest): Promise<Tenant> {
  return api.put<Tenant>(`/tenants/${id}`, body);
}

/** DELETE /api/tenants/{id} — 删除（仅无用户时） */
export async function deleteTenant(id: number): Promise<void> {
  return api.delete<void>(`/tenants/${id}`);
}

// ============================================================
// 邀请码（ADR-0023 Phase 2）
// ============================================================

/** POST /api/tenants/{tenantId}/invites — 生成邀请码 */
export async function createInvite(
  tenantId: number,
  body: CreateInviteRequest,
): Promise<TenantInvite> {
  return api.post<TenantInvite>(`/tenants/${tenantId}/invites`, body);
}

/** GET /api/tenants/{tenantId}/invites — 列表 */
export async function listInvites(tenantId: number): Promise<TenantInvite[]> {
  return api.get<TenantInvite[]>(`/tenants/${tenantId}/invites`);
}

/** POST /api/tenants/{tenantId}/invites/{id}/revoke — 撤销 */
export async function revokeInvite(tenantId: number, id: number): Promise<void> {
  return api.post<void>(`/tenants/${tenantId}/invites/${id}/revoke`, {});
}
