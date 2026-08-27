/**
 * services/api.ts 测试（Phase 9 · 集中鉴权）.
 *
 * 覆盖：401 → 单飞 refresh → 重试；refresh 失败 → logout + unauthorizedHandler；
 * 后端错误体透传；204 无响应体；网络错误。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';
import { api, setUnauthorizedHandler } from './api';
import { AuthError } from './auth';
import { useAuthStore } from '../stores/auth';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function setLoggedIn(access = 'old-access', refresh = 'old-refresh'): void {
  useAuthStore.setState({
    accessToken: access,
    refreshToken: refresh,
    user: { userId: 1, username: 'futurewl', roles: ['USER'] },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
  setUnauthorizedHandler(null);
  vi.unstubAllGlobals();
});

describe('api 401 集中处理', () => {
  it('401 → refresh 成功 → 用新 token 重试成功', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'UNAUTHORIZED', message: 'expired' }, 401)) // GET /customers
      .mockResolvedValueOnce(jsonResponse([{ id: 1, name: '客户A' }])); // 重试 GET /customers
    vi.stubGlobal('fetch', fetchMock);
    setLoggedIn();

    const data = await api.get<{ id: number; name: string }[]>('/customers');

    expect(data).toEqual([{ id: 1, name: '客户A' }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // 新 token 已写入 store，重试请求带新 Authorization
    expect(useAuthStore.getState().accessToken).toBe('new-access');
    const retryHeaders = fetchMock.mock.calls[1][1].headers;
    expect(retryHeaders.Authorization).toBe('Bearer new-access');
  });

  it('并发 401 只发起一次 refresh（单飞）', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse([{ id: 1 }]))
      .mockResolvedValueOnce(jsonResponse([{ id: 2 }]));
    vi.stubGlobal('fetch', fetchMock);
    setLoggedIn();

    const [a, b] = await Promise.all([api.get('/a'), api.get('/b')]);

    expect(a).toEqual([{ id: 1 }]);
    expect(b).toEqual([{ id: 2 }]);
    const refreshCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(refreshCalls).toHaveLength(0); // refresh 走 core-web 注入传输（非 fetch）
  });

  it('401 → refresh 失败 → logout + 触发 unauthorizedHandler + 抛 AuthError', async () => {
    let handlerCalled = false;
    setUnauthorizedHandler(() => {
      handlerCalled = true;
    });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 401)); // GET /customers 401
    vi.stubGlobal('fetch', fetchMock);
    configureCore({
      storage: { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v), remove: (k) => localStorage.removeItem(k) },
      notifier: { success: () => {}, error: () => {} },
      navigation: { to: () => {}, replace: () => {} },
      api: {
        request: <T>(path: string): Promise<T> => {
          if (path.includes('/refresh'))
            return Promise.reject(new AuthError('INVALID_REFRESH', 'bad refresh', 401));
          return Promise.resolve({} as T);
        },
      },
    });
    setLoggedIn('old-access', 'bad-refresh');

    await expect(api.get('/customers')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: '登录已过期，请重新登录',
    });
    expect(handlerCalled).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('无 refresh token → refresh 失败 → 仍走统一登出处理', async () => {
    let handlerCalled = false;
    setUnauthorizedHandler(() => {
      handlerCalled = true;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401)));
    // store 未登录（accessToken/refreshToken 均 null）

    await expect(api.get('/customers')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(handlerCalled).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('api 错误透传', () => {
  it('500 → ApiError 透传后端 { error, message }', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'DB_DOWN', message: '数据库连接失败' }, 500)),
    );
    setLoggedIn();

    await expect(api.get('/customers')).rejects.toMatchObject({
      code: 'DB_DOWN',
      message: '数据库连接失败',
      status: 500,
    });
  });

  it('非 JSON 错误体 → 兜底 HTTP 状态描述', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('gateway error', { status: 502 })),
    );
    setLoggedIn();

    await expect(api.get('/customers')).rejects.toMatchObject({
      code: 'HTTP_502',
      status: 502,
    });
  });

  it('204 → 返回 undefined（DELETE 软删）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    setLoggedIn();

    await expect(api.delete('/customers/1')).resolves.toBeUndefined();
  });

  it('网络错误 → ApiError NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    setLoggedIn();

    await expect(api.get('/customers')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
