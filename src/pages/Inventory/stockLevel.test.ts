/**
 * 进销存库存预警逻辑单测（Phase 9）.
 *
 * stockLevel 是页面内纯函数，直接验证三段判定：
 * - OUT：≤ 0
 * - LOW：1..LOW_STOCK_THRESHOLD
 * - OK：> LOW_STOCK_THRESHOLD
 */
import { describe, expect, it } from 'vitest';

import { stockLevel } from './List';

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
