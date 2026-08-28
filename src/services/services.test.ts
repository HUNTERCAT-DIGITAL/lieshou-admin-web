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