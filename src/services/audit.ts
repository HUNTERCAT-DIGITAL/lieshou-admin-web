/**
 * 审计日志 API service — 调 gateway → user-service（/api/audit-logs/**）.
 *
 * append-only 只读端点；租户作用域由 gateway 注入的 X-Tenant-Id 决定。
 * @see .ai/decisions/0030-audit-log.md
 */

import { api } from './api';
import type { AuditAction, AuditLog } from '@lieshoucloud/contract-types/business/audit';

export interface AuditQuery {
  action?: AuditAction;
  resourceType?: string;
  limit?: number;
}

/** GET /api/audit-logs — 审计列表（新→旧） */
export async function listAuditLogs(query: AuditQuery = {}): Promise<AuditLog[]> {
  const params = new URLSearchParams();
  if (query.action) params.set('action', query.action);
  if (query.resourceType) params.set('resourceType', query.resourceType);
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return api.get<AuditLog[]>(`/audit-logs${qs ? `?${qs}` : ''}`);
}

/** GET /api/audit-logs/count */
export async function countAuditLogs(): Promise<number> {
  return api.get<number>('/audit-logs/count');
}
