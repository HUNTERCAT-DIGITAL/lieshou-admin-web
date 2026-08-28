/**
 * 供应结算 service wrapper 单测（zhiye 教育行业版 · edu-service · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/supply.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort。本测试注入 portRequest spy，验证 URL path / query / body 透传
 * （全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  approveSettlement,
  cancelSupplyOrder,
  completeSupplyOrder,
  countConsumptions,
  countSettlements,
  countSupplyOrders,
  createConsumption,
  createSettlement,
  createSupplyOrder,
  deleteSettlement,
  deleteSupplyOrder,
  getConsumption,
  getSettlement,
  getSupplyOrder,
  listConsumptions,
  listSettlements,
  listSupplyOrders,
  rejectSettlement,
} from './supply';
import dayjs from 'dayjs';
import {
  SETTLEMENT_STATUS_META,
  SUPPLY_STATUS_META,
  defaultSettlementPeriod,
  formatMoney,
} from '@lieshoucloud/contract-types/business/supply';

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

describe('supply service（core-web 上收 · ApiPort 传输）', () => {
  // ---------- 供应单 ----------

  it('listSupplyOrders 无过滤 → /api/supplies', async () => {
    portRequest.mockResolvedValue([]);
    await listSupplyOrders();
    expect(portRequest).toHaveBeenCalledWith('/api/supplies', undefined);
  });

  it('listSupplyOrders 带 keyword/status/partnerCustomerId → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listSupplyOrders('启蒙', 'ACTIVE', 3);
    expect(portRequest).toHaveBeenCalledWith(
      '/api/supplies?keyword=%E5%90%AF%E8%92%99&status=ACTIVE&partnerCustomerId=3',
      undefined,
    );
  });

  it('countSupplyOrders → /api/supplies/count', async () => {
    portRequest.mockResolvedValue(4);
    await expect(countSupplyOrders()).resolves.toBe(4);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies/count', undefined);
  });

  it('getSupplyOrder → /api/supplies/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getSupplyOrder(1);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies/1', undefined);
  });

  it('createSupplyOrder → POST /api/supplies + body 透传', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    const body = {
      partnerCustomerId: 3,
      partnerName: '南山区机器人培训中心',
      courseId: 5,
      courseName: '机器人启蒙班',
      lessonCount: 24,
      unitPrice: 128,
      validUntil: '2026-12-31',
      remark: '秋季学期',
    };
    await createSupplyOrder(body);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
  });

  it('completeSupplyOrder / cancelSupplyOrder → POST /api/supplies/{id}/complete|/cancel', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await completeSupplyOrder(1);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies/1/complete', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
    await cancelSupplyOrder(1);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies/1/cancel', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });

  it('deleteSupplyOrder → DELETE /api/supplies/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteSupplyOrder(1);
    expect(portRequest).toHaveBeenCalledWith('/api/supplies/1', { method: 'DELETE' });
  });

  // ---------- 消课明细 ----------

  it('listConsumptions 无过滤 → /api/consumptions；带 supplyOrderId → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listConsumptions();
    expect(portRequest).toHaveBeenCalledWith('/api/consumptions', undefined);
    await listConsumptions('启蒙', 1);
    expect(portRequest).toHaveBeenCalledWith(
      '/api/consumptions?keyword=%E5%90%AF%E8%92%99&supplyOrderId=1',
      undefined,
    );
  });

  it('countConsumptions → /api/consumptions/count', async () => {
    portRequest.mockResolvedValue(2);
    await expect(countConsumptions()).resolves.toBe(2);
    expect(portRequest).toHaveBeenCalledWith('/api/consumptions/count', undefined);
  });

  it('getConsumption → /api/consumptions/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getConsumption(1);
    expect(portRequest).toHaveBeenCalledWith('/api/consumptions/1', undefined);
  });

  it('createConsumption → POST /api/consumptions + body 透传', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    const body = {
      supplyOrderId: 1,
      consumedAt: '2026-09-01',
      lessonCount: 2,
      remark: '点名',
    };
    await createConsumption(body);
    expect(portRequest).toHaveBeenCalledWith('/api/consumptions', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
  });

  // ---------- 结算单 ----------

  it('listSettlements 无过滤 → /api/settlements；带 keyword/status/partnerCustomerId → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listSettlements();
    expect(portRequest).toHaveBeenCalledWith('/api/settlements', undefined);
    await listSettlements('南山', 'PENDING', 3);
    expect(portRequest).toHaveBeenCalledWith(
      '/api/settlements?keyword=%E5%8D%97%E5%B1%B1&status=PENDING&partnerCustomerId=3',
      undefined,
    );
  });

  it('countSettlements → /api/settlements/count', async () => {
    portRequest.mockResolvedValue(1);
    await expect(countSettlements()).resolves.toBe(1);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements/count', undefined);
  });

  it('getSettlement → /api/settlements/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getSettlement(1);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements/1', undefined);
  });

  it('createSettlement → POST /api/settlements + body 透传（含分成比例）', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    const body = {
      partnerCustomerId: 3,
      partnerName: '南山区机器人培训中心',
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
      revenueShare: 60,
      remark: '9 月结算',
    };
    await createSettlement(body);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
  });

  it('approveSettlement / rejectSettlement → POST /api/settlements/{id}/approve|/reject', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await approveSettlement(1);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements/1/approve', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
    await rejectSettlement(1);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements/1/reject', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });

  it('deleteSettlement → DELETE /api/settlements/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteSettlement(1);
    expect(portRequest).toHaveBeenCalledWith('/api/settlements/1', { method: 'DELETE' });
  });
});

describe('supply types', () => {
  it('SUPPLY_STATUS_META 覆盖全部供应单状态', () => {
    expect(Object.keys(SUPPLY_STATUS_META).sort()).toEqual(
      ['ACTIVE', 'COMPLETED', 'CANCELLED'].sort(),
    );
  });

  it('SETTLEMENT_STATUS_META 覆盖全部结算单状态', () => {
    expect(Object.keys(SETTLEMENT_STATUS_META).sort()).toEqual(
      ['PENDING', 'APPROVED', 'REJECTED'].sort(),
    );
  });

  it('formatMoney：千分位 + 两位小数；null/undefined → —', () => {
    expect(formatMoney(3072)).toBe('3,072.00');
    expect(formatMoney(128.5)).toBe('128.50');
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
  });
});

describe('defaultSettlementPeriod（结算周期可配置化 · customers.settle_cycle 驱动）', () => {
  /** 断言周期起止（YYYY-MM-DD） */
  const periodOf = (cycle: string, date: string): string[] =>
    defaultSettlementPeriod(cycle, dayjs(date))?.map((d) => d.format('YYYY-MM-DD')) ?? [];

  it('月结：2026-08-26 → 上一自然月 [7/1, 7/31]', () => {
    expect(periodOf('月', '2026-08-26')).toEqual(['2026-07-01', '2026-07-31']);
  });

  it('月结：跨年 2026-01-15 → [2025-12-01, 2025-12-31]', () => {
    expect(periodOf('月', '2026-01-15')).toEqual(['2025-12-01', '2025-12-31']);
  });

  it('季结：2026-08-26（Q3）→ 上一自然季 Q2 [4/1, 6/30]', () => {
    expect(periodOf('季', '2026-08-26')).toEqual(['2026-04-01', '2026-06-30']);
  });

  it('季结：跨年 2026-01-10（Q1）→ 上一季 Q4 [2025-10-01, 2025-12-31]', () => {
    expect(periodOf('季', '2026-01-10')).toEqual(['2025-10-01', '2025-12-31']);
  });

  it('学期结：2026-08-26（秋季学期内）→ 上一学期春季 [2026-02-01, 2026-07-31]', () => {
    expect(periodOf('学期', '2026-08-26')).toEqual(['2026-02-01', '2026-07-31']);
  });

  it('学期结：2026-03-15（春季学期内）→ 上一学期秋季 [2025-08-01, 2026-01-31]', () => {
    expect(periodOf('学期', '2026-03-15')).toEqual(['2025-08-01', '2026-01-31']);
  });

  it('学期结：2026-01-15（秋季学期内 1 月）→ 上一学期春季 [2026-02-01, 2026-07-31]', () => {
    expect(periodOf('学期', '2026-01-15')).toEqual(['2026-02-01', '2026-07-31']);
  });

  it('未设置 / 空串 / 未知值 → null（不预填，保持手动）', () => {
    expect(defaultSettlementPeriod(null, dayjs('2026-08-26'))).toBeNull();
    expect(defaultSettlementPeriod(undefined, dayjs('2026-08-26'))).toBeNull();
    expect(defaultSettlementPeriod('', dayjs('2026-08-26'))).toBeNull();
    expect(defaultSettlementPeriod('未知', dayjs('2026-08-26'))).toBeNull();
  });
});
