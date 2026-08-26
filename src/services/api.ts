/**
 * 后端 API 请求封装 —— 薄封装,逻辑收敛到 @lieshoucloud/api-client（L0-2 · Bottom-Up）
 *
 * - JWT 注入 / 401 单飞 refresh / 标准化错误体 → 全部由共享 api-client 承担
 * - 本文件只负责绑定本应用上下文：auth store、UI 登出出口、devlog
 *
 * @see BOTTOM_UP.md · L0-2
 */

import { createApiClient } from '@lieshoucloud/api-client';
import { useAuthStore } from '../stores/auth';
import { pushDevLog } from '../utils/devtools';

import { resolveApiBase } from '@lieshoucloud/config';

const BASE = resolveApiBase({ key: 'API_BASE_URL', defaultBase: '' });

/**
 * 登录过期后的 UI 出口（由 BasicLayout 注册：提示 + logout + 跳 /login）.
 * 登录页等未注册场景下为 null,此时 api 层仅抛 AuthError 由调用方处理。
 */
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

export const api = createApiClient({
  baseUrl: BASE,
  hooks: {
    getAccessToken: () => useAuthStore.getState().accessToken,
    /** 单飞 refresh：并发 401 只发起一次;失败即 logout（共享客户端内部统一单飞） */
    refreshTokens: async () => {
      try {
        await useAuthStore.getState().refresh();
        return true;
      } catch {
        useAuthStore.getState().logout();
        return false;
      }
    },
    onUnauthorized: () => unauthorizedHandler?.(),
    onLog: pushDevLog,
  },
});
