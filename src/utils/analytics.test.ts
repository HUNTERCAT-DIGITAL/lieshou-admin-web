/**
 * analytics 聚合 + 趋势 mock 单测（Phase 9 · BI 看板）.
 */
import { describe, expect, it } from 'vitest';

import {
  aggregateFunnel,
  aggregateStatus,
  getCustomerCreatedSeries,
  seriesExtent,
  seriesTotal,
} from './analytics';
import type { Customer } from '../types/customer';

function customer(overrides: Partial<Customer>): Customer {
  return {
    id: 1,
    tenantId: 1,
    name: 'C',
    status: 'NEW',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('aggregateStatus', () => {
  it('空数组 → 全 0% / 0 条', () => {
    const r = aggregateStatus([]);
    expect(r).toHaveLength(4);
    expect(r.every((b) => b.count === 0 && b.pct === 0)).toBe(true);
  });

  it('混合状态：计数 + 百分比', () => {
    const list = [
      customer({ id: 1, status: 'NEW' }),
      customer({ id: 2, status: 'NEW' }),
      customer({ id: 3, status: 'FOLLOWING' }),
      customer({ id: 4, status: 'CONVERTED' }),
    ];
    const r = aggregateStatus(list);
    expect(r.find((b) => b.status === 'NEW')).toMatchObject({ count: 2, pct: 50 });
    expect(r.find((b) => b.status === 'FOLLOWING')).toMatchObject({ count: 1, pct: 25 });
    expect(r.find((b) => b.status === 'CONVERTED')).toMatchObject({ count: 1, pct: 25 });
    expect(r.find((b) => b.status === 'LOST')).toMatchObject({ count: 0, pct: 0 });
  });
});

describe('aggregateFunnel', () => {
  it('按 FUNNEL_ORDER 顺序输出 4 个桶', () => {
    const r = aggregateFunnel([]);
    expect(r.map((b) => b.status)).toEqual(['NEW', 'FOLLOWING', 'CONVERTED', 'LOST']);
  });
});

describe('getCustomerCreatedSeries (mock)', () => {
  it('返回 30 天（按 YYYY-MM-DD）', () => {
    const s = getCustomerCreatedSeries('any');
    expect(s).toHaveLength(30);
    expect(s[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s[29].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('同一种子每次返回相同曲线（确定性）', () => {
    const a = getCustomerCreatedSeries('seed-x');
    const b = getCustomerCreatedSeries('seed-x');
    expect(a).toEqual(b);
  });

  it('不同种子产生不同曲线', () => {
    const a = getCustomerCreatedSeries('seed-a');
    const b = getCustomerCreatedSeries('seed-b');
    expect(a).not.toEqual(b);
  });

  it('每个 count ≥ 0（无负数）', () => {
    const s = getCustomerCreatedSeries('any');
    expect(s.every((b) => b.count >= 0)).toBe(true);
  });
});

describe('seriesExtent / seriesTotal', () => {
  it('extent 返回最大 + 最小', () => {
    const e = seriesExtent([
      { date: '2026-01-01', count: 1 },
      { date: '2026-01-02', count: 5 },
      { date: '2026-01-03', count: 3 },
    ]);
    expect(e).toEqual({ max: 5, min: 1 });
  });

  it('extent：空数组 → max: 1 / min: 0', () => {
    expect(seriesExtent([])).toEqual({ max: 1, min: 0 });
  });

  it('total 取最后 N 天总和', () => {
    const series = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      count: i + 1,
    }));
    expect(seriesTotal(series, 7)).toBe(24 + 25 + 26 + 27 + 28 + 29 + 30); // 最后 7 天
    expect(seriesTotal(series, 30)).toBe(465); // 1..30 sum
  });
});
