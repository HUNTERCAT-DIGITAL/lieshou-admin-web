/**
 * 质检追溯页 smoke + 交互单测（ADR-0037）.
 *
 * ProTable 在 jsdom 渲染脆，按项目惯例（Admin/Welcome 等）mock 服务层后
 * 验证：页面不抛错、两个 Tab 渲染、新建 Modal 打开、?trace= 自动打开商品追溯抽屉。
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const qualityApi = vi.hoisted(() => ({
  listInspections: vi.fn(),
  listBatches: vi.fn(),
  getBatchDetail: vi.fn(),
  getProductTrace: vi.fn(),
  createInspection: vi.fn(),
  createBatch: vi.fn(),
}));
const inventoryApi = vi.hoisted(() => ({ listProducts: vi.fn() }));

const { listInspections, listBatches, getBatchDetail, getProductTrace } = qualityApi;
const { listProducts } = inventoryApi;

vi.mock('../../services/quality', () => ({
  ...qualityApi,
  countBatches: vi.fn(),
  countInspections: vi.fn(),
  getInspection: vi.fn(),
}));

vi.mock('../../services/inventory', () => ({
  ...inventoryApi,
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  stockIn: vi.fn(),
  stockOut: vi.fn(),
  listMovements: vi.fn(),
}));

import QualityList from '../Quality/List';

const sampleProduct = { id: 1, name: '精密轴承', code: 'SKF-6204', stockQuantity: 120 };
const sampleBatch = {
  id: 10,
  tenantId: 1,
  productId: 1,
  batchNo: 'B20260826-001',
  supplier: '供应商甲',
  quantity: 500,
  remark: null,
  createdAt: '2026-08-26T02:00:00Z',
};
const sampleInspection = {
  id: 20,
  tenantId: 1,
  productId: 1,
  batchId: 10,
  type: 'IQC',
  result: 'PASS',
  quantity: 500,
  inspector: '张三',
  inspectedAt: '2026-08-26T02:30:00Z',
  remark: null,
  createdAt: '2026-08-26T02:31:00Z',
};

function renderQuality(initialEntry = '/quality/list') {
  return render(
    <ConfigProvider>
      <AntdApp>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/quality/list" element={<QualityList />} />
          </Routes>
        </MemoryRouter>
      </AntdApp>
    </ConfigProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  listProducts.mockResolvedValue([sampleProduct]);
  listInspections.mockResolvedValue([sampleInspection]);
  listBatches.mockResolvedValue([sampleBatch]);
  getBatchDetail.mockResolvedValue({
    batch: sampleBatch,
    productName: sampleProduct.name,
    inspections: [sampleInspection],
    movements: [
      { id: 1, tenantId: 1, productId: 1, type: 'IN', quantity: 500, batchId: 10, remark: null, createdAt: '2026-08-26T02:35:00Z' },
    ],
  });
  getProductTrace.mockResolvedValue({
    product: sampleProduct,
    batches: [sampleBatch],
    inspections: [sampleInspection],
    movements: [
      { id: 1, tenantId: 1, productId: 1, type: 'IN', quantity: 500, batchId: 10, remark: null, createdAt: '2026-08-26T02:35:00Z' },
    ],
  });
});

describe('Quality 质检追溯页', () => {
  it('渲染页面不抛错，并预载商品/质检列表', async () => {
    expect(() => renderQuality()).not.toThrow();
    await waitFor(() => expect(listProducts).toHaveBeenCalled());
    await waitFor(() => expect(listInspections).toHaveBeenCalled());
    // 两个 Tab 均渲染
    expect(screen.getByText('质检记录')).toBeTruthy();
    expect(screen.getByText('批次追溯')).toBeTruthy();
  });

  it('切换到批次追溯 Tab → 拉取批次列表', async () => {
    renderQuality();
    fireEvent.click(screen.getByText('批次追溯'));
    await waitFor(() => expect(listBatches).toHaveBeenCalled());
    expect(screen.getByText('B20260826-001')).toBeTruthy();
  });

  it('新建质检 Modal 打开', async () => {
    renderQuality();
    fireEvent.click(screen.getByText('新建质检'));
    // Modal 标题（ProTable 搜索栏也有“检验类型” label，用 Modal 特有文本断言）
    await waitFor(() => expect(screen.getByText('新建质检记录')).toBeTruthy());
  });

  it('新建批次 Modal 打开', async () => {
    renderQuality();
    fireEvent.click(screen.getByText('新建批次'));
    await waitFor(() => expect(screen.getByText('批次号')).toBeTruthy());
  });

  it('?trace=<id> 自动打开商品追溯抽屉（异常一键定位）', async () => {
    renderQuality('/quality/list?trace=1');
    await waitFor(() => expect(getProductTrace).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.getByText('商品追溯 · 精密轴承')).toBeTruthy());
    expect(screen.getByText('B20260826-001')).toBeTruthy();
  });

  it('批次行「追溯」→ 打开批次追溯抽屉（质检 + 流水链路）', async () => {
    renderQuality();
    fireEvent.click(screen.getByText('批次追溯'));
    await waitFor(() => expect(screen.getByText('B20260826-001')).toBeTruthy());
    fireEvent.click(screen.getAllByText('追溯')[0]);
    await waitFor(() => expect(getBatchDetail).toHaveBeenCalledWith(10));
    await waitFor(() => expect(screen.getByText('批次追溯 · B20260826-001')).toBeTruthy());
    // 抽屉内链路：质检记录 + 出入库流水（ProTable 表格可能也有同名文本，用 getAllByText 断言）
    await waitFor(() => expect(screen.getAllByText('来料检验').length).toBeGreaterThan(0));
    expect(screen.getByText('入库')).toBeTruthy();
  });
});
