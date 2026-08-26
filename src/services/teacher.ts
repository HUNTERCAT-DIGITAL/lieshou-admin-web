/**
 * 师资档案 API service — 调 Spring Cloud gateway → edu-service（/api/teachers/**）.
 *
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 师资档案）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404。基于 services/api.ts 的通用封装（自动带 JWT）。
 */

import { api } from './api';
import type {
  CreateTeacherRequest,
  Teacher,
  TeacherStatus,
  UpdateTeacherRequest,
} from '../types/teacher';

/** GET /api/teachers — 租户内师资列表（可选 keyword / status 过滤；后端未分页） */
export async function listTeachers(keyword?: string, status?: TeacherStatus): Promise<Teacher[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Teacher[]>(`/teachers${qs}`);
}

/** GET /api/teachers/count — 租户内未删师资数 */
export async function countTeachers(): Promise<number> {
  return api.get<number>('/teachers/count');
}

/** GET /api/teachers/{id} */
export async function getTeacher(id: number): Promise<Teacher> {
  return api.get<Teacher>(`/teachers/${id}`);
}

/** POST /api/teachers — 创建（tenant 强制取请求租户；idCard 只写不读） */
export async function createTeacher(body: CreateTeacherRequest): Promise<Teacher> {
  return api.post<Teacher>('/teachers', body);
}

/** PUT /api/teachers/{id} */
export async function updateTeacher(id: number, body: UpdateTeacherRequest): Promise<Teacher> {
  return api.put<Teacher>(`/teachers/${id}`, body);
}

/** DELETE /api/teachers/{id} — 软删（后端置 is_deleted=true） */
export async function deleteTeacher(id: number): Promise<void> {
  return api.delete<void>(`/teachers/${id}`);
}
