/**
 * Tenant service 单测（ADR-0022 · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * services/tenant.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  createInvite,
  createTenant,
  deleteTenant,
  getTenant,
  listInvites,
  listTenants,
  registerTenant,
  revokeInvite,
  updateTenant,
} from './tenant';

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

describe('tenant service（core-web 上收 · ApiPort 传输）', () => {
  it('listTenants → GET /api/tenants', async () => {
    portRequest.mockResolvedValue([]);
    await listTenants();
    expect(portRequest).toHaveBeenCalledWith('/api/tenants', undefined);
  });

  it('registerTenant → POST /api/tenants/register + body 透传', async () => {
    portRequest.mockResolvedValue({ tenantCode: 'abc', adminUsername: 'admin' });
    await registerTenant({
      tenantName: '示例公司',
      tenantCode: 'abc',
      username: 'admin',
      displayName: '管理员',
      password: 'secret123',
    });
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/register', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        tenantName: '示例公司',
        tenantCode: 'abc',
        username: 'admin',
        displayName: '管理员',
        password: 'secret123',
      }),
    });
  });

  it('getTenant → GET /api/tenants/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getTenant(1);
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/1', undefined);
  });

  it('createTenant → POST /api/tenants', async () => {
    portRequest.mockResolvedValue({ id: 2 });
    await createTenant({ name: '新租户', code: 'new' });
    expect(portRequest).toHaveBeenCalledWith('/api/tenants', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: '新租户', code: 'new' }),
    });
  });

  it('updateTenant → PUT /api/tenants/{id}', async () => {
    portRequest.mockResolvedValue({ id: 2 });
    await updateTenant(2, { name: '改名', status: 'DISABLED' });
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/2', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: '改名', status: 'DISABLED' }),
    });
  });

  it('deleteTenant → DELETE /api/tenants/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteTenant(2);
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/2', { method: 'DELETE' });
  });

  it('createInvite → POST /api/tenants/{tenantId}/invites', async () => {
    portRequest.mockResolvedValue({ id: 9, code: 'AB12' });
    await createInvite(2, { role: 'USER', expiresInDays: 30 });
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/2/invites', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ role: 'USER', expiresInDays: 30 }),
    });
  });

  it('listInvites → GET /api/tenants/{tenantId}/invites', async () => {
    portRequest.mockResolvedValue([]);
    await listInvites(2);
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/2/invites', undefined);
  });

  it('revokeInvite → POST /api/tenants/{tenantId}/invites/{id}/revoke', async () => {
    portRequest.mockResolvedValue(undefined);
    await revokeInvite(2, 9);
    expect(portRequest).toHaveBeenCalledWith('/api/tenants/2/invites/9/revoke', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });
});
