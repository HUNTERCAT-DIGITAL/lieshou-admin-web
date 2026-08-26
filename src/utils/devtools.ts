/**
 * 开发者工具 · 全局调试信息源（请求日志订阅 + 环境快照）.
 *
 * 与 React 解耦：api.ts 在请求完成/失败时 pushDevLog，DevTools 组件订阅刷新。
 */
export interface DevRequestLog {
  id: number;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  error?: string;
  at: string;
}

const MAX_LOGS = 100;
let logs: DevRequestLog[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export function pushDevLog(entry: Omit<DevRequestLog, 'id' | 'at'>): void {
  logs = [...logs.slice(-(MAX_LOGS - 1)), { ...entry, id: nextId++, at: new Date().toLocaleTimeString('zh-CN', { hour12: false })}];
  listeners.forEach((fn) => fn());
}

export function getDevLogs(): DevRequestLog[] {
  return logs;
}

export function clearDevLogs(): void {
  logs = [];
  listeners.forEach((fn) => fn());
}

export function subscribeDevLogs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 环境快照（诊断信息用） */
export interface EnvSnapshot {
  edition: string;
  apiBase: string;
  mode: string;
  isDev: boolean;
  isProd: boolean;
  appVersion: string;
  userAgent: string;
  pathname: string;
  href: string;
}

export function collectEnvSnapshot(): EnvSnapshot {
  return {
    edition: (import.meta.env.VITE_EDITION as string | undefined) ?? '(未注入)',
    apiBase: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
    mode: import.meta.env.MODE ?? '',
    isDev: Boolean(import.meta.env.DEV),
    isProd: Boolean(import.meta.env.PROD),
    appVersion: import.meta.env.VITE_APP_VERSION ?? 'dev',
    userAgent: navigator.userAgent,
    pathname: window.location.pathname,
    href: window.location.href,
  };
}

/** JWT payload 安全解码（token 脱敏展示用） */
export function decodeJwtPayload(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** 脱敏：长值只留头尾（token / secret 等） */
export function maskSecret(value: string | null | undefined, keep = 8): string {
  if (!value) return '(空)';
  if (value.length <= keep * 2) return `${value.slice(0, keep)}…`;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}
