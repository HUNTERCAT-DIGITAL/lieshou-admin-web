/**
 * 会员 service 单测（CRM V5 补齐）.
 *
 * 验证 URL path / query / body 透传（member service 封装）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost, apiPut, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete },
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
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiDelete.mockReset();
});

describe('admin member service', () => {
  it('listMembers 无参数 → GET /members', async () => {
    apiGet.mockResolvedValue([]);
    await listMembers();
    expect(apiGet).toHaveBeenCalledWith('/members');
  });

  it('listMembers 带 customerId + level + status + keyword → query', async () => {
    apiGet.mockResolvedValue([]);
    await listMembers(10, 'GOLD', 'ACTIVE', 'VIP-2026');
    expect(apiGet).toHaveBeenCalledWith(
      '/members?customerId=10&level=GOLD&status=ACTIVE&keyword=VIP-2026',
    );
  });

  it('countMembers → GET /members/count', async () => {
    apiGet.mockResolvedValue(12);
    await expect(countMembers()).resolves.toBe(12);
    expect(apiGet).toHaveBeenCalledWith('/members/count');
  });

  it('getMember 动态 id', async () => {
    apiGet.mockResolvedValue({ id: 3 });
    await getMember(3);
    expect(apiGet).toHaveBeenCalledWith('/members/3');
  });

  it('createMember body 透传', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createMember({ customerId: 10, memberNo: 'VIP-1', level: 'GOLD', points: 100 });
    expect(apiPost).toHaveBeenCalledWith('/members', {
      customerId: 10,
      memberNo: 'VIP-1',
      level: 'GOLD',
      points: 100,
    });
  });

  it('updateMember 动态 id + body', async () => {
    apiPut.mockResolvedValue({ id: 3 });
    await updateMember(3, { balance: 800.5, status: 'DISABLED' });
    expect(apiPut).toHaveBeenCalledWith('/members/3', { balance: 800.5, status: 'DISABLED' });
  });

  it('deleteMember → DELETE /members/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteMember(3);
    expect(apiDelete).toHaveBeenCalledWith('/members/3');
  });
});
