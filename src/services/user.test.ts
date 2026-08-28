/**
 * User service 单测（ADR-0021 · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * services/user.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import { countUsers, createUser, deleteUser, getUser, listUsers, updateUser } from './user';

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

describe('user service（core-web 上收 · ApiPort 传输）', () => {
  it('listUsers → GET /api/users', async () => {
    portRequest.mockResolvedValue([]);
    await listUsers();
    expect(portRequest).toHaveBeenCalledWith('/api/users', undefined);
  });

  it('countUsers → GET /api/users/count', async () => {
    portRequest.mockResolvedValue(3);
    await expect(countUsers()).resolves.toBe(3);
    expect(portRequest).toHaveBeenCalledWith('/api/users/count', undefined);
  });

  it('getUser → GET /api/users/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getUser(1);
    expect(portRequest).toHaveBeenCalledWith('/api/users/1', undefined);
  });

  it('createUser → POST /api/users + body 透传', async () => {
    portRequest.mockResolvedValue({ id: 5 });
    await createUser({ username: 'zhangsan', displayName: '张三', password: 'secret123' });
    expect(portRequest).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: 'zhangsan', displayName: '张三', password: 'secret123' }),
    });
  });

  it('updateUser → PUT /api/users/{id}', async () => {
    portRequest.mockResolvedValue({ id: 5 });
    await updateUser(5, { displayName: '张四', status: 'DISABLED', roles: ['USER'] });
    expect(portRequest).toHaveBeenCalledWith('/api/users/5', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ displayName: '张四', status: 'DISABLED', roles: ['USER'] }),
    });
  });

  it('deleteUser → DELETE /api/users/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteUser(5);
    expect(portRequest).toHaveBeenCalledWith('/api/users/5', { method: 'DELETE' });
  });
});
