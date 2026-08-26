/**
 * 仪表板数据聚合 + 趋势 mock（Phase 9 · BI 看板雏形）.
 *
 * 现状：后端无时间序列接口；前端 listCustomers 全量 → 真实状态分布；
 * 30 天客户创建趋势用确定性 mock（同一租户每次看到相同曲线）。
 * 后续后端提供时间序列接口时，只换 `getCustomerCreatedSeries` 实现即可。
 */
import type { Customer, CustomerStatus } from '@lieshoucloud/types/business/customer';

/** 桶：YYYY-MM-DD → 当天创建的客户数 */
export type DailyBucket = { date: string; count: number };

/** 4 阶段分布：状态 → 计数 + 百分比（百分比基于 TOTAL） */
export type StatusBucket = {
  status: CustomerStatus;
  count: number;
  pct: number;
};

/** 漏斗：每个状态的客户数（漏斗可视化用，顺序按客户生命周期） */
export const FUNNEL_ORDER: CustomerStatus[] = ['NEW', 'FOLLOWING', 'CONVERTED', 'LOST'];

/** 把日期向前数 30 天（含今天）按 YYYY-MM-DD 列出 */
function last30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/** 客户状态分布聚合（基于 listCustomers 全量） */
export function aggregateStatus(customers: Customer[]): StatusBucket[] {
  const total = customers.length || 1; // 防 0 除
  const counts: Record<CustomerStatus, number> = {
    NEW: 0,
    FOLLOWING: 0,
    CONVERTED: 0,
    LOST: 0,
  };
  customers.forEach((c) => {
    counts[c.status] += 1;
  });
  return (Object.keys(counts) as CustomerStatus[]).map((status) => ({
    status,
    count: counts[status],
    pct: Math.round((counts[status] / total) * 100),
  }));
}

/** 漏斗（按 FUNNEL_ORDER 顺序） */
export function aggregateFunnel(customers: Customer[]): StatusBucket[] {
  return FUNNEL_ORDER.map((s) => {
    const found = aggregateStatus(customers).find((b) => b.status === s);
    return found ?? { status: s, count: 0, pct: 0 };
  });
}

/**
 * 30 天客户创建趋势 mock.
 *
 * 用种子（默认 'default'）产生确定性数据：同一种子每次返回相同曲线。
 * 真实数据接入后只需：拉每日 count 序列 → 转 DailyBucket[]。
 */
export function getCustomerCreatedSeries(seed = 'default'): DailyBucket[] {
  const days = last30Days();
  // 简单确定性 hash
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const base = (hash(seed) % 8) + 2; // 2~9 baseline
  return days.map((date, i) => {
    // 周期: 周一周五高点, 周末低点 + 线性递增
    const dow = new Date(date).getDay();
    const weekly = dow >= 1 && dow <= 5 ? 1.5 : 0.6;
    const trend = 1 + (i / 29) * 0.8; // 0~29 天增长 1x→1.8x
    const noise = ((hash(date + seed) % 5) - 2) * 0.3; // -0.6 ~ +0.6
    const count = Math.max(0, Math.round(base * weekly * trend + noise));
    return { date, count };
  });
}

/** 一组数的最大 + 最小（用于图表坐标） */
export function seriesExtent(series: DailyBucket[]): { max: number; min: number } {
  if (series.length === 0) return { max: 1, min: 0 };
  let max = 0,
    min = Infinity;
  series.forEach((b) => {
    if (b.count > max) max = b.count;
    if (b.count < min) min = b.count;
  });
  return { max: Math.max(1, max), min };
}

/** 7 天总和（用于趋势卡对比） */
export function seriesTotal(series: DailyBucket[], days: number): number {
  return series.slice(-days).reduce((s, b) => s + b.count, 0);
}
