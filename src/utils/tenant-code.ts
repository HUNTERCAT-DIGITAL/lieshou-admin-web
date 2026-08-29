/**
 * 记住最近一次使用的租户编码（Phase 9 · 登录体验 · B-2）.
 *
 * 实现已下沉 @lieshoucloud/ui（2026-10 纯函数族,共享层无客户默认值）;
 * 本文件保留客户默认值 'default'（凌科专属）+ 回退逻辑。
 */
export { setTenantCode, clearTenantCode, TENANT_CODE_STORAGE_KEY } from '@lieshoucloud/ui';
import { getTenantCode as getRememberedTenantCode } from '@lieshoucloud/ui';

export const DEFAULT_TENANT_CODE = 'default';

/** 返回记忆值;无记忆回退客户默认 */
export function getTenantCode(): string {
  return getRememberedTenantCode() ?? DEFAULT_TENANT_CODE;
}
