/**
 * 后端 API 请求封装 (Phase 5 · JWT 鉴权闭环 + Phase 9 · 体验打磨).
 *
 * - 自动从 Zustand auth store 取 accessToken 注入 Authorization header
 * - 401 集中处理：单飞 refresh → 用新 token 重试一次；refresh 失败 → logout + 通知布局跳登录
 * - 非 2xx 解析后端标准化错误体 { error, message } 透传给 UI（ApiError）
 *
 * @see .ai/decisions/0017-spring-security-jwt.md
 */

import { ApiError, AuthError } from '../utils/errors';
import { useAuthStore } from '../stores/auth';
import { pushDevLog } from '../utils/devtools';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

interface RequestInitJson extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * 登录过期后的 UI 出口（由 BasicLayout 注册：提示 + logout + 跳 /login）.
 * 登录页等未注册场景下为 null，此时 api 层仅抛 AuthError 由调用方处理。
 */
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

/** 单飞 refresh：并发 401 只发起一次刷新 */
let refreshPromise: Promise<boolean> | null = null;
async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await useAuthStore.getState().refresh();
        return true;
      } catch {
        useAuthStore.getState().logout();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** 解析后端标准化错误体 { error?, message? } */
async function readErrorBody(res: Response): Promise<{ error: string; message: string }> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return {
      error: body.error ?? `HTTP_${res.status}`,
      message: body.message ?? `HTTP ${res.status} ${res.statusText}`,
    };
  } catch {
    return { error: `HTTP_${res.status}`, message: `HTTP ${res.status} ${res.statusText}` };
  }
}

async function request<T>(
  path: string,
  init: RequestInitJson = {},
  retried = false,
  asBlob = false,
): Promise<T> {
  const startedAt = performance.now();
  const method = (init.method ?? 'GET').toUpperCase();
  const accessToken = useAuthStore.getState().accessToken;

  const log = (status: number, error?: string) =>
    pushDevLog({
      method,
      path,
      status,
      durationMs: Math.round(performance.now() - startedAt),
      error,
    });

  // multipart（FormData）：浏览器自动带 boundary，不能手动设 Content-Type
  const isForm = init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      body:
        init.body !== undefined
          ? isForm
            ? (init.body as FormData)
            : JSON.stringify(init.body)
          : undefined,
    });
  } catch (e) {
    log(0, `NETWORK_ERROR ${String(e)}`);
    throw new ApiError('NETWORK_ERROR', `网络请求失败，请检查网络后重试（${String(e)}）`, 0);
  }

  if (res.status === 401) {
    if (!retried) {
      const ok = await refreshOnce();
      if (ok) return request<T>(path, init, true, asBlob);
    }
    // refresh 失败 / 重试仍 401：统一登出（logout 已在 refreshOnce 中执行）
    unauthorizedHandler?.();
    log(401, 'UNAUTHORIZED 登录已过期');
    throw new AuthError('UNAUTHORIZED', '登录已过期，请重新登录', 401);
  }

  if (!res.ok) {
    const { error, message } = await readErrorBody(res);
    log(res.status, `${error} ${message}`);
    throw new ApiError(error, message, res.status);
  }

  // 204 No Content（DELETE 等）：无响应体
  if (res.status === 204) {
    log(204);
    return undefined as T;
  }
  log(res.status);
  // blob 模式（文件下载/预览）：字节流返回，调用方负责 objectURL 等消费
  if (asBlob) return (await res.blob()) as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  /** multipart 上传（CSV 导入等）：FormData 由浏览器带 boundary */
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  /** blob 下载（文件内容流 · 自动带 Authorization；用于强制鉴权资源的预览/下载） */
  getBlob: (path: string) => request<Blob>(path, {}, false, true),
};
