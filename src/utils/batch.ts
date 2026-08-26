/**
 * 批量操作执行器（Phase 9 · 表格增强）.
 *
 * 并行执行 N 个独立的异步任务，统计成功 / 失败数（部分失败不中断其他）。
 * 用于批量删除 / 批量改状态等场景。
 */
export interface BatchSummary {
  /** 成功的任务数 */
  ok: number;
  /** 失败的任务数 */
  fail: number;
  /** 失败项的原始 index（在传入数组中的位置），便于上层展示或重试 */
  failedIndexes: number[];
}

/** 并行执行任务（每个任务接受 index + 整体数组） */
export async function runBatch<T>(
  items: T[],
  task: (item: T, index: number) => Promise<unknown>,
): Promise<BatchSummary> {
  const results = await Promise.allSettled(items.map((item, i) => task(item, i)));
  const failedIndexes: number[] = [];
  let ok = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') ok += 1;
    else failedIndexes.push(i);
  });
  return { ok, fail: results.length - ok, failedIndexes };
}
