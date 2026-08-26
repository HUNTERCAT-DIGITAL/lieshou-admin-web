/**
 * openapi-fetch 类型化客户端实例（Phase 5 · OpenAPI typed client · ADR-0016）.
 *
 * - 由 SpringDoc spec 生成（packages/api-client/generated.legal.ts）驱动完整请求/响应类型
 * - 路径已含 /api 前缀（spec 路径），baseUrl 必须为空 —— 与 vite proxy / nginx /api 反代直接匹配
 * - middleware：自动注入 JWT（Bearer）+ 统一错误体（{error,message} → ApiError）+ 401 登出
 * - 用法：`const { data } = await legalClient.GET('/api/legal/cases', ...)`；错误统一 throw（调用方 catch → handleError）
 *
 * @see .ai/decisions/0016-springdoc-openapi.md
 */

import createClient from 'openapi-fetch';
import type { paths } from '@lieshoucloud/api-client/generated.legal';

import { useAuthStore } from '../stores/auth';
import { ApiError, AuthError } from '../utils/errors';

/** baseUrl 必须为空：spec 路径已含 /api 前缀（不再叠加 VITE_API_BASE_URL，避免 /api/api 双前缀） */
export const legalClient = createClient<paths>({ baseUrl: '' });

legalClient.use({
  /** 注入 JWT（与 services/api.ts 一致） */
  onRequest({ request }) {
    const token = useAuthStore.getState().accessToken;
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
  },
  /**
   * 统一错误处理：非 2xx 解析后端标准化错误体 → ApiError；
   * 401 直接登出（BasicLayout 注册的 unauthorizedHandler 已在 AuthError 路径处理）。
   */
  onResponse({ response }) {
    if (response.status === 401) {
      throw new AuthError('UNAUTHORIZED', '登录已过期，请重新登录', 401);
    }
    if (!response.ok && response.status !== 204) {
      return response.text().then((text) => {
        let code: string | undefined;
        let message: string | undefined;
        try {
          const body = JSON.parse(text) as { error?: string; message?: string };
          code = body.error;
          message = body.message;
        } catch {
          // 非 JSON 错误体（如网关 502）走兜底
        }
        throw new ApiError(
          code ?? `HTTP_${response.status}`,
          message ?? `HTTP ${response.status} ${response.statusText}`,
          response.status,
        );
      });
    }
    return undefined;
  },
});
