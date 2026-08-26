/**
 * 合同 service 单测（CRM V5 补齐）.
 *
 * 验证 URL path / query / body 透传（contract service 封装）。
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
  countContracts,
  createContract,
  deleteContract,
  getContract,
  listContracts,
  updateContract,
} from './contract';

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiDelete.mockReset();
});

describe('admin contract service', () => {
  it('listContracts 无参数 → GET /contracts', async () => {
    apiGet.mockResolvedValue([]);
    await listContracts();
    expect(apiGet).toHaveBeenCalledWith('/contracts');
  });

  it('listContracts 带 customerId + status + keyword → query', async () => {
    apiGet.mockResolvedValue([]);
    await listContracts(10, 'ACTIVE', 'HT-2026');
    expect(apiGet).toHaveBeenCalledWith(
      '/contracts?customerId=10&status=ACTIVE&keyword=HT-2026',
    );
  });

  it('countContracts → GET /contracts/count', async () => {
    apiGet.mockResolvedValue(8);
    await expect(countContracts()).resolves.toBe(8);
    expect(apiGet).toHaveBeenCalledWith('/contracts/count');
  });

  it('getContract 动态 id', async () => {
    apiGet.mockResolvedValue({ id: 3 });
    await getContract(3);
    expect(apiGet).toHaveBeenCalledWith('/contracts/3');
  });

  it('createContract body 透传', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createContract({ customerId: 10, contractNo: 'HT-1', title: '年度合同', status: 'DRAFT' });
    expect(apiPost).toHaveBeenCalledWith('/contracts', {
      customerId: 10,
      contractNo: 'HT-1',
      title: '年度合同',
      status: 'DRAFT',
    });
  });

  it('updateContract 动态 id + body', async () => {
    apiPut.mockResolvedValue({ id: 3 });
    await updateContract(3, { status: 'ACTIVE' });
    expect(apiPut).toHaveBeenCalledWith('/contracts/3', { status: 'ACTIVE' });
  });

  it('deleteContract → DELETE /contracts/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteContract(3);
    expect(apiDelete).toHaveBeenCalledWith('/contracts/3');
  });
});
