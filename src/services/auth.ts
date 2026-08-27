/**
 * Auth API service - 调 Spring Cloud auth-service:8083.
 * Phase 5: 与 SpringDoc bearerAuth scheme 对齐.
 * @see .ai/decisions/0017-spring-security-jwt.md
 */

import { api } from './api';
import type { CurrentUser, LoginRequest, TokenResponse } from '@lieshoucloud/types/business/auth';
import { AuthError } from '../utils/errors';

// 兼容既有 import：AuthError 已迁移至 utils/errors.ts（避免 api/auth 循环依赖）
export { AuthError };

// VITE_API_BASE_URL 语义: gateway 的 API 前缀（dev 下为 /api, 由 vite proxy 原样转发;
// 未配置时同源 /api（与 services/api.ts 一致，nginx 反代 gateway）
const GATEWAY_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

// gateway 路由为 /api/auth/**，故 GATEWAY_BASE 后只拼 /auth（不要再重复 /api）
const AUTH_BASE = `${GATEWAY_BASE}/auth`;

/**
 * POST /api/auth/login
 * @throws AuthError INVALID_CREDENTIALS (401) / USER_NOT_FOUND (404)
 */
export async function login(req: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return parseTokenOrThrow(res);
}

/** 登录页租户选项（同用户名多租户时供选择） */
export interface TenantOption {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  tenantEdition?: string | null;
}

/**
 * POST /api/auth/tenant-options — 按 username 查可登录租户（公开，不校验密码）
 */
export async function fetchTenantOptions(username: string): Promise<TenantOption[]> {
  const res = await fetch(`${AUTH_BASE}/tenant-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as TenantOption[]) : [];
}

/**
 * POST /api/auth/refresh
 */
export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return parseTokenOrThrow(res);
}

/**
 * GET /api/auth/me - 当前用户（走统一 api 封装：自动带 JWT + 401 自动 refresh）
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  return api.get<CurrentUser>('/auth/me');
}

// ============================================================
// Phase 8 · 认证体系扩展（ADR-0023）：验证码 / 注册 / 重置密码
// ============================================================

export type CodeChannel = 'SMS' | 'EMAIL';
export type CodePurpose = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';

/** POST /api/auth/send-code */
export async function sendCode(
  channel: CodeChannel,
  target: string,
  purpose: CodePurpose,
): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, target, purpose }),
  });
  if (!res.ok) {
    throw new AuthError('SEND_CODE_FAILED', `HTTP ${res.status}`, res.status);
  }
}

/** POST /api/auth/login/code - 验证码登录 */
export async function loginWithCode(
  tenantCode: string | undefined,
  channel: CodeChannel,
  target: string,
  code: string,
): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/login/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantCode, channel, target, code }),
  });
  return parseTokenOrThrow(res);
}

/** POST /api/auth/register - 注册（注册即登录）；inviteCode 可选（自动入租户） */
export async function register(req: {
  tenantCode?: string;
  username: string;
  displayName: string;
  password: string;
  channel: CodeChannel;
  target: string;
  code: string;
  inviteCode?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return parseTokenOrThrow(res);
}

/** POST /api/auth/reset-password - 忘记密码 */
export async function resetPassword(
  channel: CodeChannel,
  target: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, target, code, newPassword }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new AuthError('RESET_FAILED', body?.message ?? `HTTP ${res.status}`, res.status);
  }
}

async function parseTokenOrThrow(res: Response): Promise<TokenResponse> {
  if (res.ok) return (await res.json()) as TokenResponse;
  let body: { error?: string; message?: string } = {};
  try {
    body = (await res.json()) as { error?: string; message?: string };
  } catch {
    // ignore
  }
  if (res.status === 401) {
    throw new AuthError('INVALID_CREDENTIALS', body.message ?? 'invalid credentials', 401);
  }
  if (res.status === 404) {
    throw new AuthError('USER_NOT_FOUND', body.message ?? 'user not found', 404);
  }
  throw new AuthError(body.error ?? 'UNKNOWN', body.message ?? `HTTP ${res.status}`, res.status);
}

// ============================================================
// 可信身份登录（SECURE WORKSPACE · OAuth 演示通道）
// ============================================================

export interface OAuthProvider {
  provider: string;
  name: string;
  hint: string;
  permissions: string[];
}

export interface OAuthAuthorizeResult {
  code: string;
  state: string;
  expiresInSeconds: number;
  memberUsername: string;
  tenantCode: string;
  memberStatus: string;
}

/** OAuth token 响应 = TokenResponse + 可信身份字段 */
export interface OAuthTokenResult extends TokenResponse {
  provider: string;
  memberStatus: string;
  sessionAt: string;
}

export interface SecureSession {
  provider: string;
  username: string;
  tenantCode: string;
  roles: string[];
  at: string;
  memberStatus: string;
}

/** GET /api/auth/oauth/providers - 可信身份通道注册表 */
export async function oauthProviders(): Promise<OAuthProvider[]> {
  const res = await fetch(`${AUTH_BASE}/oauth/providers`);
  if (!res.ok) throw new AuthError('OAUTH_FAILED', `HTTP ${res.status}`, res.status);
  return (await res.json()) as OAuthProvider[];
}

/** POST /api/auth/oauth/authorize - 可信身份通道授权（一次性授权码） */
export async function oauthAuthorize(
  provider: string,
  memberUsername: string,
  tenantCode?: string,
): Promise<OAuthAuthorizeResult> {
  const res = await fetch(`${AUTH_BASE}/oauth/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, memberUsername, tenantCode }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new AuthError(
      'OAUTH_AUTHORIZE_FAILED',
      body?.message ?? `HTTP ${res.status}`,
      res.status,
    );
  }
  return (await res.json()) as OAuthAuthorizeResult;
}

/** POST /api/auth/oauth/token - 授权码换组织会话 JWT */
export async function oauthToken(code: string, tenantCode?: string): Promise<OAuthTokenResult> {
  const res = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, tenantCode }),
  });
  return parseTokenOrThrow(res) as unknown as Promise<OAuthTokenResult>;
}
