/**
 * Auth store —— 由 lieshou-core-web 提供（业务逻辑唯一源，2026-09 铺开）.
 * 本地实现已上收 core-web；本文件保留 Selector helpers 兼容既有页面。
 */
export { useAuthStore } from '@lieshoucloud/core-web';

export const selectAccessToken = (s: { accessToken: string | null }) => s.accessToken;
export const selectIsAuthenticated = (s: { isAuthenticated: boolean }) => s.isAuthenticated;
export const selectUser = (s: { user: unknown }) => s.user;
