/**
 * 记住最近一次使用的租户编码（Phase 9 · 登录体验 · B-2）.
 *
 * localStorage key: 'lieshoucloud:lastTenantCode'
 * - 读：返回记忆值，没有则返回默认 'jxlkas'
 * - 写：空值/空白不写；只接受非空字符串且 trim 后非空
 */

const KEY = 'lieshoucloud:lastTenantCode';
const DEFAULT = 'jxlkas';

/** 安全读取 localStorage（SSR / 隐私模式抛错兜底） */
export function getTenantCode(): string {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const v = window.localStorage.getItem(KEY);
    return v && v.trim() ? v.trim() : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

/** 写入；空值/非法输入忽略 */
export function setTenantCode(code: string | undefined | null): void {
  if (typeof window === 'undefined') return;
  const v = (code ?? '').trim();
  if (!v) return; // 空值不写
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* 隐私模式 / 配额超限：忽略 */
  }
}

/** 测试 / 切换租户时可调用 */
export function clearTenantCode(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const TENANT_CODE_STORAGE_KEY = KEY;
export const DEFAULT_TENANT_CODE = DEFAULT;
