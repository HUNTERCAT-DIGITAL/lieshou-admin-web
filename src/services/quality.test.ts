/**
 * 质检追溯 service 单测（ADR-0037 · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/quality.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort。本测试注入 portRequest spy，验证 URL path / query / body 透传
 * （全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countBatches,
  createBatch,
  createInspection,
  getBatchDetail,
  getInspection,
  getProductTrace,
  listBatches,
  listInspections,
} from './quality';

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

describe('quality service（core-web 上收 · ApiPort 传输）', () => {
  it('listBatches 不带参数 → GET /api/batches', async () => {
    portRequest.mockResolvedValue([]);
    await listBatches();
    expect(portRequest).toHaveBeenCalledWith('/api/batches', undefined);
  });

  it('listBatches 带 productId + keyword → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listBatches(7, 'B001');
    expect(portRequest).toHaveBeenCalledWith('/api/batches?productId=7&keyword=B001', undefined);
  });

  it('countBatches → GET /api/batches/count', async () => {
    portRequest.mockResolvedValue(3);
    await expect(countBatches()).resolves.toBe(3);
    expect(portRequest).toHaveBeenCalledWith('/api/batches/count', undefined);
  });

  it('createBatch POST /api/batches + 透传 body', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createBatch({
      productId: 1,
      batchNo: 'B001',
      supplier: '供应商甲',
      quantity: 500,
    });
    expect(portRequest).toHaveBeenCalledWith('/api/batches', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ productId: 1, batchNo: 'B001', supplier: '供应商甲', quantity: 500 }),
    });
  });

  it('getBatchDetail GET /api/batches/{id}', async () => {
    portRequest.mockResolvedValue({ batch: { id: 3 }, inspections: [], movements: [] });
    const detail = await getBatchDetail(3);
    expect(detail.batch.id).toBe(3);
    expect(portRequest).toHaveBeenCalledWith('/api/batches/3', undefined);
  });

  it('listInspections 带 type/result 过滤 → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listInspections({ type: 'IQC', result: 'FAIL' });
    expect(portRequest).toHaveBeenCalledWith(
      '/api/inspections?type=IQC&result=FAIL',
      undefined,
    );
  });

  it('listInspections 不带参数 → GET /api/inspections', async () => {
    portRequest.mockResolvedValue([]);
    await listInspections();
    expect(portRequest).toHaveBeenCalledWith('/api/inspections', undefined);
  });

  it('createInspection POST /api/inspections + 透传 body（含 batchId）', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    await createInspection({
      productId: 1,
      batchId: 11,
      type: 'IQC',
      result: 'PASS',
      quantity: 500,
      inspector: '张三',
    });
    expect(portRequest).toHaveBeenCalledWith('/api/inspections', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        productId: 1,
        batchId: 11,
        type: 'IQC',
        result: 'PASS',
        quantity: 500,
        inspector: '张三',
      }),
    });
  });

  it('getInspection GET /api/inspections/{id}', async () => {
    portRequest.mockResolvedValue({ inspection: { id: 9 } });
    const detail = await getInspection(9);
    expect(detail.inspection.id).toBe(9);
    expect(portRequest).toHaveBeenCalledWith('/api/inspections/9', undefined);
  });

  it('getProductTrace GET /api/products/{id}/trace', async () => {
    portRequest.mockResolvedValue({ batches: [], inspections: [] });
    const trace = await getProductTrace(5);
    expect(trace.batches).toEqual([]);
    expect(portRequest).toHaveBeenCalledWith('/api/products/5/trace', undefined);
  });
});
