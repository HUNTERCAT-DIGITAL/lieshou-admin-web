/**
 * 页面统一错误提示 hook（Admin 体验打磨 · Phase 9）.
 *
 * 401 由 services/api.ts 集中处理（自动 refresh → 重试 → 失败跳登录），
 * 页面无需再关心；这里只负责把后端透传的错误 message 弹出提示。
 */
import { App } from 'antd';
import { useCallback } from 'react';

import { AuthError, getErrorMessage } from '../utils/errors';

export function useApiError(): (e: unknown) => void {
  const { message } = App.useApp();
  return useCallback(
    (e: unknown) => {
      if (e instanceof AuthError && e.code === 'UNAUTHORIZED') return; // api 层已统一处理
      message.error(getErrorMessage(e));
    },
    [message],
  );
}
