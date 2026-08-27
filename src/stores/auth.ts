/**
 * Auth store —— 由 lieshou-core-web 提供（业务逻辑唯一源，2026-09 试点）.
 * 原本地实现（login/refresh/fetchMe/switchTenant + persist）已上收 core-web，
 * 本文件仅保留 Selector helpers 兼容既有页面 import。
 *
 * @see .ai/decisions/0017-spring-security-jwt.md
 */
export { useAuthStore } from '@lieshoucloud/core-web';
export type { Session as AuthStoreState } from '@lieshoucloud/core-web';

export const selectAccessToken = (s: { accessToken: string | null }) => s.accessToken;
export const selectIsAuthenticated = (s: { isAuthenticated: boolean }) => s.isAuthenticated;
export const selectUser = (s: { user: unknown }) => s.user;
