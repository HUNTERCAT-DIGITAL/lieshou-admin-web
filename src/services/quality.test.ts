/**
 * 质检追溯 service 单测（ADR-0037 · 覆盖率）.
 *
 * 覆盖 services/quality.ts 的 API 路径与查询参数拼接
 * （页面含 ProTable，jsdom 渲染脆，按项目惯例测服务层）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as quality from '../services/quality';

beforeEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('services/quality.ts（批次 + 质检追溯 API）', () => {
  it('listBatches 不带参数 → GET /batches', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);
    await quality.listBatches();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/batches$/);
  });

  it('listBatches 带 productId + keyword → query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);
    await quality.listBatches(7, 'B001');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/batches\?productId=7&keyword=B001/);
  });

  it('createBatch POST /batches + 透传 body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    await quality.createBatch({
      productId: 1,
      batchNo: 'B001',
      supplier: '供应商甲',
      quantity: 500,
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/batches$/);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      productId: 1,
      batchNo: 'B001',
      supplier: '供应商甲',
      quantity: 500,
    });
  });

  it('getBatchDetail GET /batches/{id}', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ batch: { id: 3 }, inspections: [], movements: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const detail = await quality.getBatchDetail(3);
    expect(detail.batch.id).toBe(3);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/batches\/3$/);
  });

  it('listInspections 带 type/result 过滤 → query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);
    await quality.listInspections({ type: 'IQC', result: 'FAIL' });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/inspections\?type=IQC&result=FAIL/);
  });

  it('listInspections 不带参数 → GET /inspections', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);
    await quality.listInspections();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/inspections$/);
  });

  it('createInspection POST /inspections + 透传 body（含 batchId）', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 9 }));
    vi.stubGlobal('fetch', fetchMock);
    await quality.createInspection({
      productId: 1,
      batchId: 11,
      type: 'IQC',
      result: 'PASS',
      quantity: 500,
      inspector: '张三',
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/inspections$/);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      productId: 1,
      batchId: 11,
      type: 'IQC',
      result: 'PASS',
      quantity: 500,
      inspector: '张三',
    });
  });

  it('getInspection GET /inspections/{id}', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ inspection: { id: 9 } }));
    vi.stubGlobal('fetch', fetchMock);
    const detail = await quality.getInspection(9);
    expect(detail.inspection.id).toBe(9);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/inspections\/9$/);
  });

  it('getProductTrace GET /products/{id}/trace', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ batches: [], inspections: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const trace = await quality.getProductTrace(5);
    expect(trace.batches).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/products\/5\/trace$/);
  });
});
