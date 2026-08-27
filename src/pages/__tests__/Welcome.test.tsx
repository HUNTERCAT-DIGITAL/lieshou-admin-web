/**
 * Welcome 页面单测（Phase 9 · 覆盖率）.
 *
 * auth 会话已上收 @lieshoucloud/core-web（2026-09）：页面经 store 的 fetchMe
 * → core-web auth.api → 传输端口（缺省裸 fetch）。故「刷新 /me」测试 stub
 * 全局 fetch（与 src/services/api.test.ts 同策略），不再 mock 本地 services/auth。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../../stores/auth';
import { configureCore } from '@lieshoucloud/core-web';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

import Welcome from '../Welcome';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Welcome 页', () => {
  it('渲染用户信息卡 + 快捷入口 + 调试信息折叠', async () => {
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
    // fetchMe → core-web auth.api → 传输端口；setup.ts 已注入全局 mock 适配器，
    // 这里仅覆盖 /me 返回值以验证刷新生效。
    configureCore({
      storage: { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v), remove: (k) => localStorage.removeItem(k) },
      notifier: { success: () => {}, error: () => {} },
      navigation: { to: () => {}, replace: () => {} },
      api: {
        request: <T,>(path: string): Promise<T> => {
          if (path.includes('/me'))
            return Promise.resolve({ userId: 2, username: 'refreshed', roles: ['USER'] } as T);
          return Promise.resolve({} as T);
        },
      },
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
      expect(screen.getByText('refreshed')).toBeInTheDocument();
    });
  });
});
