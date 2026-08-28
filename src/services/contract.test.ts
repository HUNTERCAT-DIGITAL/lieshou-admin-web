/**
 * 合同 service 单测（CRM V5 补齐 · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/contract.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort（token/refresh/错误体由各端桥接层承担）。本测试注入 portRequest spy，
 * 验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countContracts,
  createContract,
  deleteContract,
  getContract,
  listContracts,
  updateContract,
} from './contract';

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

describe('contract service（core-web 上收 · ApiPort 传输）', () => {
  it('listContracts 无参数 → GET /api/contracts', async () => {
    portRequest.mockResolvedValue([]);
    await listContracts();
    expect(portRequest).toHaveBeenCalledWith('/api/contracts', undefined);
  });

  it('listContracts 带 customerId + status + keyword → query', async () => {
    portRequest.mockResolvedValue([]);
    await listContracts(10, 'ACTIVE', 'HT-2026');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/contracts?customerId=10&status=ACTIVE&keyword=HT-2026',
      undefined,
    );
  });

  it('countContracts → GET /api/contracts/count', async () => {
    portRequest.mockResolvedValue(8);
    await expect(countContracts()).resolves.toBe(8);
    expect(portRequest).toHaveBeenCalledWith('/api/contracts/count', undefined);
  });

  it('getContract 动态 id', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await getContract(3);
    expect(portRequest).toHaveBeenCalledWith('/api/contracts/3', undefined);
  });

  it('createContract body 透传', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createContract({ customerId: 10, contractNo: 'HT-1', title: '年度合同', status: 'DRAFT' });
    expect(portRequest).toHaveBeenCalledWith('/api/contracts', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        customerId: 10,
        contractNo: 'HT-1',
        title: '年度合同',
        status: 'DRAFT',
      }),
    });
  });

  it('updateContract 动态 id + body', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await updateContract(3, { status: 'ACTIVE' });
    expect(portRequest).toHaveBeenCalledWith('/api/contracts/3', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
  });

  it('deleteContract → DELETE /api/contracts/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteContract(3);
    expect(portRequest).toHaveBeenCalledWith('/api/contracts/3', { method: 'DELETE' });
  });
});
