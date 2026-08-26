/**
 * tenant-code localStorage 工具单测（Phase 9 · 登录体验）.
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  clearTenantCode,
  DEFAULT_TENANT_CODE,
  getTenantCode,
  setTenantCode,
  TENANT_CODE_STORAGE_KEY,
} from './tenant-code';

afterEach(() => {
  localStorage.clear();
});

describe('getTenantCode', () => {
  it('空 localStorage → 默认 jxlkas', () => {
    expect(getTenantCode()).toBe(DEFAULT_TENANT_CODE);
    expect(getTenantCode()).toBe('jxlkas');
  });

  it('有值 → 返回记忆值', () => {
    localStorage.setItem(TENANT_CODE_STORAGE_KEY, 'acme');
    expect(getTenantCode()).toBe('acme');
  });

  it('空白值 → 默认（视同未记忆）', () => {
    localStorage.setItem(TENANT_CODE_STORAGE_KEY, '   ');
    expect(getTenantCode()).toBe(DEFAULT_TENANT_CODE);
  });

  it('trim 后比较', () => {
    localStorage.setItem(TENANT_CODE_STORAGE_KEY, '  acme  ');
    expect(getTenantCode()).toBe('acme');
  });
});

describe('setTenantCode', () => {
  it('正常字符串写入', () => {
    setTenantCode('acme');
    expect(localStorage.getItem(TENANT_CODE_STORAGE_KEY)).toBe('acme');
  });

  it('trim 后写入', () => {
    setTenantCode('  acme  ');
    expect(localStorage.getItem(TENANT_CODE_STORAGE_KEY)).toBe('acme');
  });

  it('空字符串 / null / undefined → 不写', () => {
    setTenantCode('');
    setTenantCode('   ');
    setTenantCode(null);
    setTenantCode(undefined);
    expect(localStorage.getItem(TENANT_CODE_STORAGE_KEY)).toBeNull();
  });
});

describe('clearTenantCode', () => {
  it('写入后清除', () => {
    setTenantCode('acme');
    clearTenantCode();
    expect(getTenantCode()).toBe(DEFAULT_TENANT_CODE);
  });
});
