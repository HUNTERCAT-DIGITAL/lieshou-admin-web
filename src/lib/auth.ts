/**
 * 管理后台 · 登录态与 API 访问（端自身实现 · 零上游共享依赖）
 * localStorage + fetch；/api 走 dev proxy（vite）或 nginx 同源反代。
 */
const TOKEN_KEY = 'lsc_admin_access_token';
const REFRESH_KEY = 'lsc_admin_refresh_token';
const USER_KEY = 'lsc_admin_user';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const fn of listeners) fn();
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** 订阅登录态变化（登录/登出时触发） */
export function onAuthChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export interface SessionUser {
  username?: string;
  displayName?: string;
  tenantCode?: string;
  tenantName?: string;
}

export function getUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function persistSession(data: { accessToken: string; refreshToken?: string } & SessionUser): void {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: data.username,
      displayName: data.displayName,
      tenantCode: data.tenantCode,
      tenantName: data.tenantName,
    }),
  );
  notify();
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  notify();
}

/** 登录（POST /api/auth/login · 同源相对路径，由 dev proxy / nginx 反代到 gateway） */
export async function login(
  username: string,
  password: string,
  tenantCode?: string,
): Promise<SessionUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, tenantCode }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `登录失败（HTTP ${res.status}）`);
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken?: string;
    username?: string;
    displayName?: string;
    tenantCode?: string;
    tenantName?: string;
  };
  persistSession(data);
  return data;
}

/** 当前用户（GET /api/auth/me · 同时验证 token 有效性/连通性） */
export async function fetchMe(): Promise<SessionUser> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (res.status === 401) {
    logout();
    throw new Error('登录已过期，请重新登录');
  }
  if (!res.ok) {
    throw new Error(`获取当前用户失败（HTTP ${res.status}）`);
  }
  const me = (await res.json()) as SessionUser;
  localStorage.setItem(USER_KEY, JSON.stringify(me));
  return me;
}
