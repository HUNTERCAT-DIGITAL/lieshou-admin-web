/**
 * 前端统一错误类型与展示（L0-2 · Bottom-Up）.
 *
 * 自 2026-08 起错误类收敛到 @lieshoucloud/api-client（共享包），本文件仅做 re-export，
 * 保证历史调用点（`import { ApiError } from '../utils/errors'`）零改动。
 */

export { ApiError, AuthError, getErrorMessage, isApiError, isAuthError } from '@lieshoucloud/api-client';
