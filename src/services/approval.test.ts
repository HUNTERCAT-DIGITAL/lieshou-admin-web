/**
 * 审批流 service 单测（ADR-0032）.
 *
 * 验证 URL path / query / body 透传（approval-service 封装）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock('./api', () => ({
  api: { get: apiGet, post: apiPost },
}));

import {
  approveApproval,
  cancelApproval,
  createApproval,
  getApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
} from './approval';

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
});

describe('admin approval service', () => {
  it('listApprovals 无参数 → GET /approvals', async () => {
    apiGet.mockResolvedValue([]);
    await listApprovals();
    expect(apiGet).toHaveBeenCalledWith('/approvals');
  });

  it('listApprovals 带 role/status/type → query', async () => {
    apiGet.mockResolvedValue([]);
    await listApprovals({ role: 'inbox', status: 'PENDING', type: 'EXPENSE' });
    expect(apiGet).toHaveBeenCalledWith('/approvals?role=inbox&status=PENDING&type=EXPENSE');
  });

  it('getApprovalCounts → GET /approvals/counts', async () => {
    apiGet.mockResolvedValue({ inbox: 3, mine: 1 });
    await expect(getApprovalCounts()).resolves.toEqual({ inbox: 3, mine: 1 });
    expect(apiGet).toHaveBeenCalledWith('/approvals/counts');
  });

  it('getApproval 动态 id', async () => {
    apiGet.mockResolvedValue({ id: 7 });
    await getApproval(7);
    expect(apiGet).toHaveBeenCalledWith('/approvals/7');
  });

  it('createApproval body 透传', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createApproval({ type: 'EXPENSE', title: '报销', approverId: 10 });
    expect(apiPost).toHaveBeenCalledWith('/approvals', {
      type: 'EXPENSE',
      title: '报销',
      approverId: 10,
    });
  });

  it('approveApproval → POST /approvals/{id}/approve（空 body）', async () => {
    apiPost.mockResolvedValue({ id: 1, status: 'APPROVED' });
    await approveApproval(1);
    expect(apiPost).toHaveBeenCalledWith('/approvals/1/approve', {});
  });

  it('approveApproval 带意见', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await approveApproval(1, { comment: '同意' });
    expect(apiPost).toHaveBeenCalledWith('/approvals/1/approve', { comment: '同意' });
  });

  it('rejectApproval → POST /approvals/{id}/reject（comment 必填）', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await rejectApproval(1, '金额超预算');
    expect(apiPost).toHaveBeenCalledWith('/approvals/1/reject', { comment: '金额超预算' });
  });

  it('cancelApproval 无意见 → 空 body', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await cancelApproval(1);
    expect(apiPost).toHaveBeenCalledWith('/approvals/1/cancel', {});
  });
});
