/**
 * Role service 单测（ADR-0024 · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * services/role.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import { createRole, deleteRole, listRoles, updateRole } from './role';

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

describe('role service（core-web 上收 · ApiPort 传输）', () => {
  it('listRoles → GET /api/roles', async () => {
    portRequest.mockResolvedValue([]);
    await listRoles();
    expect(portRequest).toHaveBeenCalledWith('/api/roles', undefined);
  });

  it('createRole → POST /api/roles + body 透传', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createRole({ code: 'FINANCE_LEAD', name: '财务主管', description: '财务审批' });
    expect(portRequest).toHaveBeenCalledWith('/api/roles', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ code: 'FINANCE_LEAD', name: '财务主管', description: '财务审批' }),
    });
  });

  it('updateRole → PUT /api/roles/{id}', async () => {
    portRequest.mockResolvedValue({ id: 2 });
    await updateRole(2, { description: '更新描述' });
    expect(portRequest).toHaveBeenCalledWith('/api/roles/2', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ description: '更新描述' }),
    });
  });

  it('deleteRole → DELETE /api/roles/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteRole(2);
    expect(portRequest).toHaveBeenCalledWith('/api/roles/2', { method: 'DELETE' });
  });
});
