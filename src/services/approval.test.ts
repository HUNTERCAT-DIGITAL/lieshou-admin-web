/**
 * 审批流 service 单测（ADR-0032 · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/approval.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort（token/refresh/错误体由各端桥接层承担）。本测试注入 portRequest spy，
 * 验证 URL path / query / body 透传（approval-service 封装，全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
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
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };

describe('approval service（core-web 上收 · ApiPort 传输）', () => {
  it('listApprovals 无参数 → GET /api/approvals', async () => {
    portRequest.mockResolvedValue([]);
    await listApprovals();
    expect(portRequest).toHaveBeenCalledWith('/api/approvals', undefined);
  });

  it('listApprovals 带 role/status/type → query', async () => {
    portRequest.mockResolvedValue([]);
    await listApprovals({ role: 'inbox', status: 'PENDING', type: 'EXPENSE' });
    expect(portRequest).toHaveBeenCalledWith(
      '/api/approvals?role=inbox&status=PENDING&type=EXPENSE',
      undefined,
    );
  });

  it('getApprovalCounts → GET /api/approvals/counts', async () => {
    portRequest.mockResolvedValue({ inbox: 3, mine: 1 });
    await expect(getApprovalCounts()).resolves.toEqual({ inbox: 3, mine: 1 });
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/counts', undefined);
  });

  it('getApproval 动态 id', async () => {
    portRequest.mockResolvedValue({ id: 7 });
    await getApproval(7);
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/7', undefined);
  });

  it('createApproval body 透传', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createApproval({ type: 'EXPENSE', title: '报销', approverId: 10 });
    expect(portRequest).toHaveBeenCalledWith('/api/approvals', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ type: 'EXPENSE', title: '报销', approverId: 10 }),
    });
  });

  it('approveApproval → POST /api/approvals/{id}/approve（空 body）', async () => {
    portRequest.mockResolvedValue({ id: 1, status: 'APPROVED' });
    await approveApproval(1);
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/1/approve', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });

  it('approveApproval 带意见', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await approveApproval(1, { comment: '同意' });
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/1/approve', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ comment: '同意' }),
    });
  });

  it('rejectApproval → POST /api/approvals/{id}/reject（comment 必填）', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await rejectApproval(1, '金额超预算');
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/1/reject', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ comment: '金额超预算' }),
    });
  });

  it('cancelApproval 无意见 → 空 body', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await cancelApproval(1);
    expect(portRequest).toHaveBeenCalledWith('/api/approvals/1/cancel', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });
});
