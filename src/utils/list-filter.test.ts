import { describe, expect, it } from 'vitest';

import { filterByKeywordAndStatus } from './list-filter';

interface Row extends Record<string, unknown> {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'DISABLED';
}

const ROWS: Row[] = [
  {
    id: 1,
    username: 'futurewl',
    displayName: 'Future Wang',
    email: 'future@example.com',
    phone: '13800000001',
    status: 'ACTIVE',
  },
  {
    id: 2,
    username: 'alice',
    displayName: 'Alice Li',
    email: 'alice@huntercat.cn',
    phone: null,
    status: 'DISABLED',
  },
  {
    id: 3,
    username: 'bob',
    displayName: 'Bob Zhang',
    email: null,
    phone: '13900000002',
    status: 'ACTIVE',
  },
];

describe('filterByKeywordAndStatus', () => {
  it('空 keyword + 空 status → 原数组', () => {
    expect(filterByKeywordAndStatus(ROWS, {}, ['username'])).toEqual(ROWS);
  });

  it('keyword 大小写不敏感', () => {
    const r = filterByKeywordAndStatus(ROWS, { keyword: 'FUTURE' }, ['username']);
    expect(r).toHaveLength(1);
    expect(r[0].username).toBe('futurewl');
  });

  it('keyword 多字段拼接命中（email）', () => {
    const r = filterByKeywordAndStatus(ROWS, { keyword: 'huntercat' }, [
      'username',
      'displayName',
      'email',
      'phone',
    ]);
    expect(r).toHaveLength(1);
    expect(r[0].username).toBe('alice');
  });

  it('keyword 命中 phone（null 字段被跳过）', () => {
    const r = filterByKeywordAndStatus(ROWS, { keyword: '139' }, [
      'username',
      'displayName',
      'email',
      'phone',
    ]);
    expect(r.map((x) => x.id)).toEqual([3]);
  });

  it('status 精确匹配', () => {
    const r = filterByKeywordAndStatus(ROWS, { status: 'DISABLED' }, ['username']);
    expect(r.map((x) => x.id)).toEqual([2]);
  });

  it('keyword + status AND 组合', () => {
    const r = filterByKeywordAndStatus(ROWS, { keyword: 'alice', status: 'ACTIVE' }, [
      'username',
      'displayName',
      'email',
      'phone',
    ]);
    expect(r).toHaveLength(0); // alice 是 DISABLED，与 ACTIVE 不符
  });

  it('keyword 无命中返回空数组', () => {
    expect(filterByKeywordAndStatus(ROWS, { keyword: 'nonexistent' }, ['username'])).toEqual([]);
  });

  it('keyword trim 后再比较', () => {
    const r = filterByKeywordAndStatus(ROWS, { keyword: '  alice  ' }, ['username']);
    expect(r).toHaveLength(1);
  });
});
