/**
 * User API service — 调 Spring Cloud gateway → user-service（/api/users/**）.
 *
 * Phase 7 · 用户管理 CRUD。基于 services/api.ts 的通用封装（自动带 JWT）。
 * @see .ai/decisions/0021-flyway-schema.md
 */

import { api } from './api';
import type { CreateUserRequest, UpdateUserRequest, User } from '@lieshoucloud/types/business/user';

/** GET /api/users — 全量列表（后端暂未分页） */
export async function listUsers(): Promise<User[]> {
  return api.get<User[]>('/users');
}

/** GET /api/users/count */
export async function countUsers(): Promise<number> {
  return api.get<number>('/users/count');
}

/** GET /api/users/{id} */
export async function getUser(id: number): Promise<User> {
  return api.get<User>(`/users/${id}`);
}

/** POST /api/users */
export async function createUser(body: CreateUserRequest): Promise<User> {
  return api.post<User>('/users', body);
}

/** PUT /api/users/{id} */
export async function updateUser(id: number, body: UpdateUserRequest): Promise<User> {
  return api.put<User>(`/users/${id}`, body);
}

/** DELETE /api/users/{id} */
export async function deleteUser(id: number): Promise<void> {
  return api.delete<void>(`/users/${id}`);
}
