/**
 * Profile 租户展示测试（ADR-0035 配置层 · 法律版单租户不体现「租户」概念）.
 *
 * 法律版（showLegal）个人中心不显示租户；通用版保留。用 vi.doMock editions + 动态 import。
 */
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../../stores/auth';
import type { CurrentUser } from '@lieshoucloud/contract-types/business/auth';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: 't',
    refreshToken: 'r',
    user: {
      userId: 1,
      tenantId: 1,
      tenantCode: 'jxlkas',
      username: 'ops',
      roles: ['PLATFORM_ADMIN'],
    } as CurrentUser,
    isAuthenticated: true,
  });
  vi.restoreAllMocks();
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>{children}</AntdApp>
  </ConfigProvider>
);

/** 以指定 showLegal 动态加载 Profile（mock editions 配置层） */
async function loadProfile(showLegal: boolean) {
  vi.doMock('../../config/editions', () => ({
    getEdition: () => ({ showLegal, dutyConsole: false }),
  }));
  vi.resetModules();
  const mod = await import('../Profile');
  vi.doUnmock('../../config/editions');
  return mod.default;
}

describe('Profile · 租户展示（法律版隐藏）', () => {
  it('法律版（showLegal）：不显示租户/租户编码', async () => {
    const LegalProfile = await loadProfile(true);
    const { unmount } = render(<LegalProfile />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('个人中心')).toBeTruthy();
    });
    expect(screen.queryByText(/租户/)).toBeNull();
    unmount();
  });

  it('通用版（generic）：显示租户编码', async () => {
    const GenericProfile = await loadProfile(false);
    const { unmount } = render(<GenericProfile />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText(/租户：jxlkas/)).toBeTruthy();
    });
    unmount();
  });
});
