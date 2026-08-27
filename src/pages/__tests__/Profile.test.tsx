/**
 * Profile 页面单测（Phase 9 · 覆盖率）.
 *
 * 用户信息已上收 @lieshoucloud/core-web（2026-09）：页面经 store.fetchMe
 * → core-web auth.api → 传输端口（setup.ts 注入全局 mock 适配器，测试内可覆盖）。
 */
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

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

/** 覆盖 core-web 传输端口：/api/auth/me 返回给定用户（或 reject） */
function mockMe(user: unknown | Error): void {
  configureCore({
    storage: { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v), remove: (k) => localStorage.removeItem(k) },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: {
      request: <T,>(path: string): Promise<T> => {
        if (path.includes('/me')) return user instanceof Error ? Promise.reject(user) : Promise.resolve(user as T);
        return Promise.resolve({} as T);
      },
    },
  });
}

import Profile from '../Profile';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>{children}</AntdApp>
  </ConfigProvider>
);

describe('Profile 页', () => {
  it('挂载时调用 fetchMe 渲染当前用户信息', async () => {
    mockMe({
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
  });

  it('fetchMe 失败时显示 (unknown) + —', async () => {
    mockMe(new Error('network down'));
    render(<Profile />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('(unknown)')).toBeInTheDocument();
    });
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
