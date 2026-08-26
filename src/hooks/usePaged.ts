/**
 * 分页子列表通用钩子（案件详情 Tab / 知识资产中心等共用）.
 */
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from './useApiError';

export function usePaged<T>(
  fetcher: (page: number, size: number) => Promise<{ items: T[]; total: number }>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const handleError = useApiError();
  const size = 20;

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const r = await fetcher(p, size);
        setItems(r.items);
        setTotal(r.total);
        setPage(p);
      } catch (e) {
        handleError(e);
      } finally {
        setLoading(false);
      }
    },
    [fetcher, handleError],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  return {
    items,
    total,
    page,
    size,
    loading,
    reload: () => load(page),
    goPage: (p: number) => load(p),
  };
}
