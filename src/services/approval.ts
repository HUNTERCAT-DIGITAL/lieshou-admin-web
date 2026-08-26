/**
 * 审批流 API service（ADR-0032 · approval-service，走统一 api 封装）.
 */
import { api } from './api';
import type {
  ApprovalCounts,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  CreateApprovalRequest,
  DecideRequest,
} from '../types/approval';

/** GET /api/approvals — 租户内列表（role: mine=我发起的 / inbox=待我审批 / all=全部） */
export async function listApprovals(params?: {
  role?: 'mine' | 'inbox' | 'all';
  status?: ApprovalStatus;
  type?: ApprovalType;
}): Promise<ApprovalRequest[]> {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.status) qs.set('status', params.status);
  if (params?.type) qs.set('type', params.type);
  const s = qs.toString();
  return api.get<ApprovalRequest[]>(`/approvals${s ? `?${s}` : ''}`);
}

/** GET /api/approvals/counts — 待办计数（inbox=待我审批 / mine=我发起待处理） */
export async function getApprovalCounts(): Promise<ApprovalCounts> {
  return api.get<ApprovalCounts>('/approvals/counts');
}

/** GET /api/approvals/{id} */
export async function getApproval(id: number): Promise<ApprovalRequest> {
  return api.get<ApprovalRequest>(`/approvals/${id}`);
}

/** POST /api/approvals — 发起审批 */
export async function createApproval(body: CreateApprovalRequest): Promise<ApprovalRequest> {
  return api.post<ApprovalRequest>('/approvals', body);
}

/** POST /api/approvals/{id}/approve — 通过（仅审批人） */
export async function approveApproval(id: number, body?: DecideRequest): Promise<ApprovalRequest> {
  return api.post<ApprovalRequest>(`/approvals/${id}/approve`, body ?? {});
}

/** POST /api/approvals/{id}/reject — 驳回（仅审批人，comment 必填） */
export async function rejectApproval(id: number, comment: string): Promise<ApprovalRequest> {
  return api.post<ApprovalRequest>(`/approvals/${id}/reject`, { comment });
}

/** POST /api/approvals/{id}/cancel — 撤销（仅发起人） */
export async function cancelApproval(id: number, comment?: string): Promise<ApprovalRequest> {
  return api.post<ApprovalRequest>(`/approvals/${id}/cancel`, comment ? { comment } : {});
}
