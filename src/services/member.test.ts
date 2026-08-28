/**
 * 会员 service 单测（CRM V5 补齐 · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/member.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort（token/refresh/错误体由各端桥接层承担）。本测试注入 portRequest spy，
 * 验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countMembers,
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from './member';

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

describe('member service（core-web 上收 · ApiPort 传输）', () => {
  it('listMembers 无参数 → GET /api/members', async () => {
    portRequest.mockResolvedValue([]);
    await listMembers();
    expect(portRequest).toHaveBeenCalledWith('/api/members', undefined);
  });

  it('listMembers 带 customerId + level + status + keyword → query', async () => {
    portRequest.mockResolvedValue([]);
    await listMembers(10, 'GOLD', 'ACTIVE', 'VIP-2026');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/members?customerId=10&level=GOLD&status=ACTIVE&keyword=VIP-2026',
      undefined,
    );
  });

  it('countMembers → GET /api/members/count', async () => {
    portRequest.mockResolvedValue(12);
    await expect(countMembers()).resolves.toBe(12);
    expect(portRequest).toHaveBeenCalledWith('/api/members/count', undefined);
  });

  it('getMember 动态 id', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await getMember(3);
    expect(portRequest).toHaveBeenCalledWith('/api/members/3', undefined);
  });

  it('createMember body 透传', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createMember({ customerId: 10, memberNo: 'VIP-1', level: 'GOLD', points: 100 });
    expect(portRequest).toHaveBeenCalledWith('/api/members', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ customerId: 10, memberNo: 'VIP-1', level: 'GOLD', points: 100 }),
    });
  });

  it('updateMember 动态 id + body', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await updateMember(3, { balance: 800.5, status: 'DISABLED' });
    expect(portRequest).toHaveBeenCalledWith('/api/members/3', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ balance: 800.5, status: 'DISABLED' }),
    });
  });

  it('deleteMember → DELETE /api/members/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteMember(3);
    expect(portRequest).toHaveBeenCalledWith('/api/members/3', { method: 'DELETE' });
  });
});
