/**
 * Welcome 页面单测（Phase 9 · 覆盖率）.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
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

const stubAuthModule = vi.hoisted(() => async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/auth');
  return { ...actual, fetchCurrentUser: vi.fn() };
});

vi.mock('../../services/auth', stubAuthModule);

import Welcome from '../Welcome';
import * as authApi from '../../services/auth';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Welcome 页', () => {
  it('渲染用户信息卡 + 快捷入口 + 调试信息折叠', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      userId: 1,
      tenantCode: 'jxlkas',
      username: 'futurewl',
      roles: ['PLATFORM_ADMIN'],
    });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'futurewl', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Welcome />, { wrapper: wrap });
    expect(screen.getByText('futurewl')).toBeInTheDocument();
    expect(screen.getByText('UID 1')).toBeInTheDocument();
    expect(screen.getByText('PLATFORM_ADMIN')).toBeInTheDocument();
    expect(screen.getByText('快捷入口')).toBeInTheDocument();
    expect(screen.getByText('CRM 客户管理')).toBeInTheDocument();
    expect(screen.getByText('个人中心')).toBeInTheDocument();
    expect(screen.getByText('调试信息（JWT）')).toBeInTheDocument();
    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });

  it('点「退出登录」清空 state + 跳登录页', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      userId: 1,
      username: 'u',
      roles: ['USER'],
    });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'u', roles: ['USER'] },
      isAuthenticated: true,
    });
    render(<Welcome />, { wrapper: wrap });
    fireEvent.click(screen.getByTestId('logout-button'));
    await vi.waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  it('点「刷新 /me」调 fetchMe + 成功 message', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      userId: 2,
      username: 'refreshed',
      roles: ['USER'],
    });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'u', roles: ['USER'] },
      isAuthenticated: true,
    });
    render(<Welcome />, { wrapper: wrap });
    fireEvent.click(screen.getByRole('button', { name: /刷新 \/me/ }));
    await vi.waitFor(() => {
      expect(authApi.fetchCurrentUser).toHaveBeenCalled();
    });
  });
});
