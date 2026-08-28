/**
 * 进销存库存预警逻辑单测（Phase 9）.
 *
 * stockLevel 已下沉 @lieshoucloud/core-web（2026-10 纯函数族）,
 * 此处直接测共享实现;页面(List.tsx)与列表页共用同一规则源。
 */
import { describe, expect, it } from 'vitest';

import { stockLevel } from '@lieshoucloud/core-web';

describe('stockLevel（低库存预警阈值）', () => {
  it('stock ≤ 0 → OUT（缺货）', () => {
    expect(stockLevel(0)).toBe('OUT');
    expect(stockLevel(-3)).toBe('OUT');
  });

  it('1..5 → LOW（低库存）', () => {
    expect(stockLevel(1)).toBe('LOW');
    expect(stockLevel(5)).toBe('LOW');
  });

  it('> 5 → OK', () => {
    expect(stockLevel(6)).toBe('OK');
    expect(stockLevel(100)).toBe('OK');
  });
});
