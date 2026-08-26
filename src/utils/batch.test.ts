import { describe, expect, it, vi } from 'vitest';

import { runBatch } from './batch';

describe('runBatch', () => {
  it('空数组 → 0/0', async () => {
    const r = await runBatch([], async () => {});
    expect(r).toEqual({ ok: 0, fail: 0, failedIndexes: [] });
  });

  it('全部成功', async () => {
    const r = await runBatch([1, 2, 3], async (n) => n * 2);
    expect(r).toEqual({ ok: 3, fail: 0, failedIndexes: [] });
  });

  it('部分失败 → 不中断其他', async () => {
    const r = await runBatch([1, 2, 3, 4], async (n) => {
      if (n === 2) throw new Error('boom');
      if (n === 4) throw new Error('bang');
      return n;
    });
    expect(r.ok).toBe(2);
    expect(r.fail).toBe(2);
    expect(r.failedIndexes).toEqual([1, 3]);
  });

  it('全部失败', async () => {
    const r = await runBatch(['a', 'b'], async () => {
      throw new Error('x');
    });
    expect(r).toEqual({ ok: 0, fail: 2, failedIndexes: [0, 1] });
  });

  it('index 传参正确', async () => {
    const task = vi.fn(async () => undefined);
    await runBatch(['x', 'y', 'z'], task);
    expect(task).toHaveBeenCalledTimes(3);
    expect(task.mock.calls[0]).toEqual(['x', 0]);
    expect(task.mock.calls[1]).toEqual(['y', 1]);
    expect(task.mock.calls[2]).toEqual(['z', 2]);
  });
});
