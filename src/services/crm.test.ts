/**
 * CRM 客户 service 单测（ADR-0025 · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/crm.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / query / body 透传（全路径带 /api 前缀）。
 * 原 services.test.ts 中的 crm 用例迁移至此（该聚合文件已随上收解散）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countCustomers,
  createCustomer,
  deleteCustomer,
  getCustomer,
  importCustomers,
  listCustomers,
  updateCustomer,
} from './crm';

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

describe('crm service（core-web 上收 · ApiPort 传输）', () => {
  it('listCustomers 无过滤 → /api/customers', async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers();
    expect(portRequest).toHaveBeenCalledWith('/api/customers', undefined);
  });

  it('listCustomers keyword + status → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers('猎手', 'NEW');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/customers?keyword=%E7%8C%8E%E6%89%8B&status=NEW',
      undefined,
    );
  });

  it('listCustomers keyword 单独', async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers('猎手');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/customers?keyword=%E7%8C%8E%E6%89%8B',
      undefined,
    );
  });

  it('listCustomers status 单独', async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers(undefined, 'NEW');
    expect(portRequest).toHaveBeenCalledWith('/api/customers?status=NEW', undefined);
  });

  it('countCustomers → /api/customers/count', async () => {
    portRequest.mockResolvedValue(5);
    await expect(countCustomers()).resolves.toBe(5);
    expect(portRequest).toHaveBeenCalledWith('/api/customers/count', undefined);
  });

  it('getCustomer → /api/customers/{id}', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await getCustomer(3);
    expect(portRequest).toHaveBeenCalledWith('/api/customers/3', undefined);
  });

  it('createCustomer → POST /api/customers + body', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createCustomer({ name: 'A公司', contactName: '王经理' });
    expect(portRequest).toHaveBeenCalledWith('/api/customers', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: 'A公司', contactName: '王经理' }),
    });
  });

  it('updateCustomer → PUT /api/customers/{id}', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    await updateCustomer(9, { name: 'B公司' });
    expect(portRequest).toHaveBeenCalledWith('/api/customers/9', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: 'B公司' }),
    });
  });

  it('deleteCustomer → DELETE /api/customers/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteCustomer(11);
    expect(portRequest).toHaveBeenCalledWith('/api/customers/11', { method: 'DELETE' });
  });

  it('importCustomers → POST /api/customers/import（FormData 原样透传）', async () => {
    portRequest.mockResolvedValue({ total: 3, success: 2, failed: 1, errors: [] });
    const file = new File(['a,b'], 'customers.csv', { type: 'text/csv' });
    const result = await importCustomers(file);
    expect(result.success).toBe(2);
    const [path, init] = portRequest.mock.calls[0];
    expect(path).toBe('/api/customers/import');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBe(file);
  });
});
