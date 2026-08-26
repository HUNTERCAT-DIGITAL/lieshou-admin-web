/**
 * Service wrapper 单测（Phase 9 · 覆盖率提升）.
 *
 * 这些 service 都是 api.get/post/put/delete 的轻量包装，主要验证：
 * - URL path 拼接正确（含动态 id）
 * - query string 拼接正确（crm 的 listCustomers 关键字 + status）
 * - body 透传
 *
 * api.ts 本身有独立测试覆盖 401 重试等。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 用 vi.mock 替换整个 api 模块（这些 service 用的都是这个 api 对象）。
// vi.mock 会被 hoist 到文件顶部，factory 不能引用外层变量；
// 用 vi.hoisted 提前定义可变 mock 函数。
const { apiGet, apiPost, apiPut, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
  },
}));

// 必须在 mock 之后 import service 模块
import {
  createCustomer,
  countCustomers,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from './crm';
import { createRole, deleteRole, listRoles, updateRole } from './role';
import {
  createInvite,
  createTenant,
  deleteTenant,
  getTenant,
  listInvites,
  listTenants,
  revokeInvite,
  updateTenant,
} from './tenant';
import { countUsers, createUser, deleteUser, getUser, listUsers, updateUser } from './user';

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiDelete.mockReset();
});

// ============================================================
// crm
// ============================================================
describe('crm service', () => {
  it('listCustomers 无过滤 → /customers', async () => {
    apiGet.mockResolvedValue([]);
    await listCustomers();
    expect(apiGet).toHaveBeenCalledWith('/customers');
  });

  it('listCustomers keyword + status → query string', async () => {
    apiGet.mockResolvedValue([]);
    await listCustomers('hello world', 'NEW');
    const url = apiGet.mock.calls[0][0] as string;
    expect(url).toContain('/customers?');
    expect(url).toContain('keyword=hello%20world');
    expect(url).toContain('status=NEW');
  });

  it('listCustomers keyword 单独', async () => {
    apiGet.mockResolvedValue([]);
    await listCustomers('foo');
    expect(apiGet.mock.calls[0][0]).toBe('/customers?keyword=foo');
  });

  it('listCustomers status 单独', async () => {
    apiGet.mockResolvedValue([]);
    await listCustomers(undefined, 'FOLLOWING');
    expect(apiGet.mock.calls[0][0]).toBe('/customers?status=FOLLOWING');
  });

  it('countCustomers → /customers/count', async () => {
    apiGet.mockResolvedValue(42);
    await countCustomers();
    expect(apiGet).toHaveBeenCalledWith('/customers/count');
  });

  it('getCustomer → /customers/{id}', async () => {
    apiGet.mockResolvedValue({ id: 7 });
    await getCustomer(7);
    expect(apiGet).toHaveBeenCalledWith('/customers/7');
  });

  it('createCustomer → POST /customers + body', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createCustomer({ name: 'A' } as never);
    expect(apiPost).toHaveBeenCalledWith('/customers', { name: 'A' });
  });

  it('updateCustomer → PUT /customers/{id}', async () => {
    apiPut.mockResolvedValue({ id: 9 });
    await updateCustomer(9, { name: 'B' } as never);
    expect(apiPut).toHaveBeenCalledWith('/customers/9', { name: 'B' });
  });

  it('deleteCustomer → DELETE /customers/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteCustomer(11);
    expect(apiDelete).toHaveBeenCalledWith('/customers/11');
  });
});

// ============================================================
// user
// ============================================================
describe('user service', () => {
  it('listUsers → /users', async () => {
    apiGet.mockResolvedValue([]);
    await listUsers();
    expect(apiGet).toHaveBeenCalledWith('/users');
  });

  it('countUsers → /users/count', async () => {
    apiGet.mockResolvedValue(0);
    await countUsers();
    expect(apiGet).toHaveBeenCalledWith('/users/count');
  });

  it('getUser → /users/{id}', async () => {
    apiGet.mockResolvedValue({});
    await getUser(3);
    expect(apiGet).toHaveBeenCalledWith('/users/3');
  });

  it('createUser → POST /users', async () => {
    apiPost.mockResolvedValue({});
    await createUser({ username: 'x' } as never);
    expect(apiPost).toHaveBeenCalledWith('/users', { username: 'x' });
  });

  it('updateUser → PUT /users/{id}', async () => {
    apiPut.mockResolvedValue({});
    await updateUser(2, { displayName: 'X' } as never);
    expect(apiPut).toHaveBeenCalledWith('/users/2', { displayName: 'X' });
  });

  it('deleteUser → DELETE /users/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteUser(5);
    expect(apiDelete).toHaveBeenCalledWith('/users/5');
  });
});

// ============================================================
// role
// ============================================================
describe('role service', () => {
  it('listRoles → /roles', async () => {
    apiGet.mockResolvedValue([]);
    await listRoles();
    expect(apiGet).toHaveBeenCalledWith('/roles');
  });

  it('createRole → POST /roles', async () => {
    apiPost.mockResolvedValue({});
    await createRole({ code: 'X' } as never);
    expect(apiPost).toHaveBeenCalledWith('/roles', { code: 'X' });
  });

  it('updateRole → PUT /roles/{id}', async () => {
    apiPut.mockResolvedValue({});
    await updateRole(4, { name: 'Y' } as never);
    expect(apiPut).toHaveBeenCalledWith('/roles/4', { name: 'Y' });
  });

  it('deleteRole → DELETE /roles/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteRole(6);
    expect(apiDelete).toHaveBeenCalledWith('/roles/6');
  });
});

// ============================================================
// tenant
// ============================================================
describe('tenant service', () => {
  it('listTenants → /tenants', async () => {
    apiGet.mockResolvedValue([]);
    await listTenants();
    expect(apiGet).toHaveBeenCalledWith('/tenants');
  });

  it('getTenant → /tenants/{id}', async () => {
    apiGet.mockResolvedValue({});
    await getTenant(2);
    expect(apiGet).toHaveBeenCalledWith('/tenants/2');
  });

  it('createTenant → POST /tenants', async () => {
    apiPost.mockResolvedValue({});
    await createTenant({ name: 'A' } as never);
    expect(apiPost).toHaveBeenCalledWith('/tenants', { name: 'A' });
  });

  it('updateTenant → PUT /tenants/{id}', async () => {
    apiPut.mockResolvedValue({});
    await updateTenant(3, { name: 'B' } as never);
    expect(apiPut).toHaveBeenCalledWith('/tenants/3', { name: 'B' });
  });

  it('deleteTenant → DELETE /tenants/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteTenant(4);
    expect(apiDelete).toHaveBeenCalledWith('/tenants/4');
  });

  it('createInvite → POST /tenants/{id}/invites', async () => {
    apiPost.mockResolvedValue({});
    await createInvite(5, { role: 'USER' } as never);
    expect(apiPost).toHaveBeenCalledWith('/tenants/5/invites', { role: 'USER' });
  });

  it('listInvites → /tenants/{id}/invites', async () => {
    apiGet.mockResolvedValue([]);
    await listInvites(7);
    expect(apiGet).toHaveBeenCalledWith('/tenants/7/invites');
  });

  it('revokeInvite → POST /tenants/{tenantId}/invites/{id}/revoke', async () => {
    apiPost.mockResolvedValue(undefined);
    await revokeInvite(8, 99);
    expect(apiPost).toHaveBeenCalledWith('/tenants/8/invites/99/revoke', {});
  });
});
