/**
 * Profile 页面单测（Phase 9 · 覆盖率）.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../../stores/auth';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
  vi.restoreAllMocks();
});

// mock factory 必须在 import 之前；提到顶部用 vi.hoisted 创 stub 函数
const stubAuthModule = vi.hoisted(() => async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/auth');
  return { ...actual, fetchCurrentUser: vi.fn() };
});

vi.mock('../../services/auth', stubAuthModule);

import Profile from '../Profile';
import * as authApi from '../../services/auth';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>{children}</AntdApp>
  </ConfigProvider>
);

describe('Profile 页', () => {
  it('挂载时调用 fetchMe 渲染当前用户信息', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      userId: 42,
      tenantId: 7,
      tenantCode: 'jxlkas',
      username: 'futurewl',
      roles: ['PLATFORM_ADMIN', 'USER'],
    });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 42, username: 'futurewl', roles: ['USER'] },
      isAuthenticated: true,
    });
    render(<Profile />, { wrapper: wrap });

    await waitFor(() => {
      // 期望 (username) 文本在 h4 里
      expect(screen.getByRole('heading', { level: 4, name: 'futurewl' })).toBeInTheDocument();
    });
    expect(screen.getByText(/租户：jxlkas/)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    // RoleTag 中文化（2026-08-25）：PLATFORM_ADMIN → 平台管理员
    expect(screen.getByText('平台管理员')).toBeInTheDocument();
    expect(screen.getByText('普通用户')).toBeInTheDocument();
    expect(authApi.fetchCurrentUser).toHaveBeenCalled();
  });

  it('user 为 null 时显示 (unknown) + —', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      userId: 0,
      username: '',
      roles: [],
    });
    render(<Profile />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('(unknown)')).toBeInTheDocument();
    });
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
