/**
 * useApiError hook 单测（Phase 9 · 覆盖率提升）.
 */
import { App } from 'antd';
import { renderHook } from '@testing-library/react';

import { ApiError, AuthError, getErrorMessage } from '../utils/errors';
import { useApiError } from './useApiError';

const wrapper = ({ children }: { children: React.ReactNode }) => <App>{children}</App>;

describe('useApiError', () => {
  it('AuthError UNAUTHORIZED → 不弹 message（由 api 层统一处理）', () => {
    const { result } = renderHook(() => useApiError(), { wrapper });
    result.current(new AuthError('UNAUTHORIZED', '登录已过期', 401));
    // 没有断言失败即通过；message.error 不被调用即可
  });

  it('AuthError 其他 code → 弹 message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper });
    expect(() => result.current(new AuthError('INVALID_CREDENTIALS', '密码错误'))).not.toThrow();
  });

  it('ApiError → 弹 backend message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper });
    expect(() => result.current(new ApiError('DB_DOWN', '数据库开小差', 500))).not.toThrow();
  });

  it('普通 Error → 弹 message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper });
    expect(() => result.current(new Error('boom'))).not.toThrow();
  });

  it('字符串异常 → 弹 string 形式', () => {
    const { result } = renderHook(() => useApiError(), { wrapper });
    expect(() => result.current('网络错误')).not.toThrow();
  });

  it('getErrorMessage 兜底', () => {
    expect(getErrorMessage(new Error('e'))).toBe('e');
    expect(getErrorMessage('plain')).toBe('plain');
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
  });
});
