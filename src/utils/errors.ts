/**
 * 前端统一错误类型与展示（Admin 体验打磨 · Phase 9）.
 *
 * - AuthError: 鉴权类错误（401 由 services/api.ts 集中处理：refresh → 重试 → 跳登录）
 * - ApiError: 后端标准化错误体 { error, message } 透传（ADR-0021 起统一）
 */

/** 鉴权类错误 */
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** 后端标准化错误体（{ error, message }）透传 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 任意异常 → 可读 message（兜底展示用） */
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return String(e);
}
