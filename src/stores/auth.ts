/**
 * Auth store —— 由 lieshou-core-web 提供（业务逻辑唯一源，2026-09 试点）.
 * 原本地实现（login/refresh/fetchMe/switchTenant + persist）已上收 core-web，
 * 本文件仅保留 Selector helpers 兼容既有页面 import。
 *
 * @see .ai/decisions/0017-spring-security-jwt.md
 */
export { useAuthStore } from '@lieshoucloud/core-web';
export type { Session as AuthStoreState } from '@lieshoucloud/core-web';

import { AuthError, fetchCurrentUser, login as loginApi, refreshTokens, switchTenant as switchTenantApi } from '../services/auth';
import type { CurrentUser, TokenResponse, TenantOption } from '@lieshoucloud/contract-types/business/auth';

const STORAGE_KEY = 'lieshoucloud:auth';

interface AuthStoreState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  /** 该用户名可登录的合法租户（登录后切换用） */
  availableTenants: TenantOption[];

  // actions
  login: (username: string, password: string, tenantCode?: string) => Promise<void>;
  refresh: () => Promise<void>;
  /** 拉取当前用户（401 由 api 层自动 refresh；返回用户便于页面展示） */
  fetchMe: () => Promise<CurrentUser>;
  logout: () => void;
  /** 直接写入 token 会话（验证码登录 / 注册即登录用 · Phase 8） */
  setSession: (token: TokenResponse) => void;
  /** 切换租户（先登录后选租户）：refresh token 换目标租户新会话 */
  switchTenant: (tenantCode: string) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      availableTenants: [],

      login: async (username, password, tenantCode) => {
        try {
          const token = await loginApi({ username, password, tenantCode });
          set({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            user: {
              userId: token.userId,
              username: token.username,
              roles: ['USER'],
              tenantCode: token.tenantCode,
              tenantName: token.tenantName,
              tenantEdition: token.tenantEdition,
            },
            isAuthenticated: true,
            availableTenants: token.availableTenants ?? [],
          });
          // 异步 fetch /me 拿真实 roles（不阻塞登录）
          get()
            .fetchMe()
            .catch(() => {
              /* ignore; 后续按需刷新 */
            });
        } catch (e) {
          if (e instanceof AuthError) throw e;
          throw new AuthError('UNKNOWN', String(e));
        }
      },

      refresh: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) throw new AuthError('NO_REFRESH_TOKEN', 'not logged in');
        const token = await refreshTokens(refreshToken);
        set({ accessToken: token.accessToken, refreshToken: token.refreshToken });
      },

      fetchMe: async () => {
        const me = await fetchCurrentUser();
        set({ user: me });
        return me;
      },

      setSession: (token) => {
        set({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user: {
            userId: token.userId,
            username: token.username,
            roles: ['USER'],
            tenantCode: token.tenantCode,
            tenantName: token.tenantName,
            tenantEdition: token.tenantEdition,
          },
          isAuthenticated: true,
          availableTenants: token.availableTenants ?? [],
        });
        // 异步拉真实 roles（不阻塞）
        get()
          .fetchMe()
          .catch(() => {
            /* ignore */
          });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          availableTenants: [],
        });
      },

      switchTenant: async (tenantCode: string) => {
        const rt = get().refreshToken;
        if (!rt) throw new AuthError('UNAUTHORIZED', '未登录');
        const token = await switchTenantApi(rt, tenantCode);
        set({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user: {
            userId: token.userId,
            username: token.username,
            roles: ['USER'],
            tenantCode: token.tenantCode,
            tenantName: token.tenantName,
            tenantEdition: token.tenantEdition,
          },
          isAuthenticated: true,
          availableTenants: token.availableTenants ?? [],
        });
        // 异步拉真实 roles（切换租户后角色可能不同）
        get()
          .fetchMe()
          .catch(() => {
            /* ignore */
          });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        availableTenants: s.availableTenants,
      }),
    },
  ),
);

/**
 * Selector helpers
 */
export const selectAccessToken = (s: AuthStoreState) => s.accessToken;
export const selectIsAuthenticated = (s: AuthStoreState) => s.isAuthenticated;
export const selectUser = (s: AuthStoreState) => s.user;
