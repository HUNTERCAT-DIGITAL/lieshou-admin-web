import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from '../services/auth';
import { configureCore } from '@lieshoucloud/core-web';
import { useAuthStore } from '../stores/auth';

/** 注入 mock api 端口（core-web 传输） */
function mockApi(overrides?: Record<string, unknown | Error>) {
  configureCore({
    storage: { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v), remove: (k) => localStorage.removeItem(k) },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: {
      request: <T>(path: string): Promise<T> => {
        if (overrides && path in overrides) {
          const v = overrides[path];
          return v instanceof Error ? Promise.reject(v) : Promise.resolve(v as T);
        }
        if (path.includes('/login'))
          return Promise.resolve({ accessToken: 'access-x', refreshToken: 'refresh-x', expiresIn: 1800, tokenType: 'Bearer', userId: 42, username: 'futurewl', tenantCode: 'huntercat', tenantName: 't', tenantEdition: 'GENERIC', availableTenants: [] } as T);
        if (path.includes('/me'))
          return Promise.resolve({ userId: 42, username: 'futurewl', roles: ['USER'] } as T);
        if (path.includes('/refresh'))
          return Promise.resolve({ accessToken: 'new-access', refreshToken: 'old-refresh', expiresIn: 1800, tokenType: 'Bearer', userId: 1, username: 'u' } as T);
        return Promise.resolve({} as T);
      },
    },
  });
}

describe('useAuthStore (Zustand)', () => {
  beforeEach(() => {
    // 重置 store 与 localStorage
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    vi.restoreAllMocks();
  });

  it('初始 isAuthenticated=false', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('login 成功：写 token + 标 authenticated', async () => {
    mockApi();

    await useAuthStore.getState().login('futurewl', 'secret');

    const s = useAuthStore.getState();
    expect(s.accessToken).toBe('access-x');
    expect(s.refreshToken).toBe('refresh-x');
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.userId).toBe(42);
  });

  it('login 失败：抛 AuthError + 不改 state', async () => {
    mockApi({ '/api/auth/login': new AuthError('INVALID_CREDENTIALS', 'wrong password', 401) });

    await expect(useAuthStore.getState().login('x', 'wrong')).rejects.toThrow(AuthError);

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.accessToken).toBeNull();
  });

  it('login 成功但 fetchMe 失败：吞错不阻塞（lines 57-58）', async () => {
    mockApi({ '/api/auth/me': new Error('network down') });

    await expect(useAuthStore.getState().login('futurewl', 'secret')).resolves.toBeUndefined();

    // 等一个 tick 让 fire-and-forget 的 catch 跑完
    await new Promise((r) => setTimeout(r, 0));

    const s = useAuthStore.getState();
    // login 主体成功 → token 已写入；fetchMe 失败被忽略
    expect(s.isAuthenticated).toBe(true);
    expect(s.accessToken).toBe('access-x');
  });

  it('setSession 成功但 fetchMe 失败：吞错不阻塞（lines 75-91）', async () => {
    mockApi({ '/api/auth/me': new Error('network down') });
    useAuthStore.getState().setSession({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 1800,
      tokenType: 'Bearer',
      userId: 1,
      username: 'u',
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(useAuthStore.getState().accessToken).toBe('a');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout：清空 token + user', () => {
    useAuthStore.setState({
      accessToken: 'a',
      refreshToken: 'r',
      user: { userId: 1, username: 'u', roles: [] },
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it('refresh：无 refresh token 抛 AuthError(NO_REFRESH_TOKEN)', async () => {
    await expect(useAuthStore.getState().refresh()).rejects.toMatchObject({
      code: 'NO_REFRESH_TOKEN',
    });
  });

  it('refresh：成功换 access token', async () => {
    useAuthStore.setState({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      user: null,
      isAuthenticated: true,
    });
    mockApi();

    await useAuthStore.getState().refresh();
    expect(useAuthStore.getState().accessToken).toBe('new-access');
  });
});
