/**
 * Role API service — 调 Spring Cloud gateway → user-service（/api/roles/**）.
 *
 * Phase 8 · RBAC（ADR-0024）。写操作需 PLATFORM_ADMIN，读操作平台/租户管理员可。
 */

import { api } from './api';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '@lieshoucloud/contract-types/business/role';

/** GET /api/roles — 角色列表 */
export async function listRoles(): Promise<Role[]> {
  return api.get<Role[]>('/roles');
}

/** POST /api/roles — 创建自定义角色 */
export async function createRole(body: CreateRoleRequest): Promise<Role> {
  return api.post<Role>('/roles', body);
}

/** PUT /api/roles/{id} — 更新（系统角色只读） */
export async function updateRole(id: number, body: UpdateRoleRequest): Promise<Role> {
  return api.put<Role>(`/roles/${id}`, body);
}

/** DELETE /api/roles/{id} — 删除（系统角色不可删） */
export async function deleteRole(id: number): Promise<void> {
  return api.delete<void>(`/roles/${id}`);
}
