/**
 * 列表客户端过滤（Phase 9 · 后端暂无搜索接口时的兜底）.
 *
 * 关键字 case-insensitive 模糊匹配（按字段拼接后 substring 包含）；
 * 状态精确匹配。
 */
export interface ListFilterParams {
  keyword?: string | undefined;
  status?: string | undefined;
}

/** 关键字命中：把每行的多个可搜字段拼成一个串，判断 keyword 是否是子串 */
function matchKeyword(row: object, keyword: string, fields: string[]): boolean {
  if (!keyword) return true;
  const hay = fields
    .map((f) => (row as Record<string, unknown>)[f])
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v).toLowerCase())
    .join(' ');
  return hay.includes(keyword);
}

/** 状态精确匹配（未传 / 不匹配都返回 true 表示不过滤） */
function matchStatus(row: object, status: string | undefined): boolean {
  if (!status) return true;
  return (row as Record<string, unknown>).status === status;
}

/** 按 keyword（多字段拼接）+ status 过滤列表；保留原数组顺序 */
export function filterByKeywordAndStatus<T extends object>(
  rows: T[],
  params: ListFilterParams,
  searchFields: string[],
): T[] {
  const keyword = params.keyword?.toLowerCase().trim();
  if (!keyword && !params.status) return rows;
  return rows.filter(
    (row) => matchKeyword(row, keyword ?? '', searchFields) && matchStatus(row, params.status),
  );
}
