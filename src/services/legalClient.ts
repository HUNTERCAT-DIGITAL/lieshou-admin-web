/**
 * legal 模块类型化客户端 —— openapi-fetch 兼容适配层（L0-2 · Bottom-Up）
 *
 * - 底层为共享 @lieshoucloud/api-client 实例（JWT 注入 + 401 单飞 refresh + 标准化错误体 throw）
 * - 对外保持 openapi-fetch 调用形态：GET(path, { params })/POST(path, { body })/PUT/DELETE
 *   → services/legal.ts 74 处调用零改动
 * - 路径含 /api 前缀,baseUrl 为空 —— 与 vite proxy / nginx /api 反代直接匹配
 *
 * @see BOTTOM_UP.md · L0-2
 */

import { createApiClient } from '@lieshoucloud/api-client';
import { useAuthStore } from '../stores/auth';

export const legalClient = createClientLike();

function createClientLike() {
  const client = createApiClient({
    baseUrl: '',
    hooks: {
      getAccessToken: () => useAuthStore.getState().accessToken,
      refreshTokens: async () => {
        try {
          await useAuthStore.getState().refresh();
          return true;
        } catch {
          useAuthStore.getState().logout();
          return false;
        }
      },
    },
  });

  type PathParams = Record<string, string | number>;
  interface OpenApiOpts {
    params?: { query?: Record<string, unknown>; path?: PathParams };
    body?: unknown;
  }

  /** openapi-fetch 风格：/api/legal/cases/{id} + path params → /api/legal/cases/5 */
  function resolve(template: string, opts?: OpenApiOpts): string {
    let p = template;
    if (opts?.params?.path) {
      for (const [k, v] of Object.entries(opts.params.path)) {
        p = p.replace(`{${k}}`, String(v));
      }
    }
    return p;
  }

  function queryOf(opts?: OpenApiOpts): Record<string, string | number | boolean | undefined> | undefined {
    return opts?.params?.query as Record<string, string | number | boolean | undefined> | undefined;
  }

  return {
    GET: async <T>(path: string, opts?: OpenApiOpts): Promise<{ data?: T }> => {
      const data = await client.get<T>(resolve(path, opts));
      return { data };
    },
    POST: async <T>(path: string, opts?: OpenApiOpts): Promise<{ data?: T }> => {
      const data = await client.post<T>(resolve(path, opts), opts?.body);
      return { data };
    },
    PUT: async <T>(path: string, opts?: OpenApiOpts): Promise<{ data?: T }> => {
      const data = await client.put<T>(resolve(path, opts), opts?.body);
      return { data };
    },
    DELETE: async <T>(path: string, opts?: OpenApiOpts): Promise<{ data?: T }> => {
      const data = await client.delete<T>(resolve(path, opts));
      return { data };
    },
  };
}
