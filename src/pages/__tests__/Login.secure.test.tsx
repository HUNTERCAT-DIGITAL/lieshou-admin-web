/**
 * 登录页可信身份理念区测试（SECURE WORKSPACE · 愿景「可信身份登录」）.
 *
 * 法律版（layer/legalmind · showLegal）登录页显示理念区；通用版不显示。
 * 用 vi.doMock editions + 动态 import（本文件不静态 import Login，避免 resetModules 失效）。
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../../stores/auth';

vi.mock('../../services/auth', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/auth');
  return {
    ...actual,
    oauthProviders: vi.fn(),
    oauthAuthorize: vi.fn(),
    oauthToken: vi.fn(),
  };
});

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

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter initialEntries={['/login']}>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

/** 以指定 showLegal 动态加载 Login（mock editions 配置层） */
async function loadLogin(showLegal: boolean) {
  vi.doMock('../../config/editions', () => ({
    getEdition: () => ({
      id: showLegal ? 'legalmind' : 'generic',
      showLegal,
      dutyConsole: false,
      hideTenantInput: false,
      brandName: 'LegalMind · 智法云枢',
      logo: '/logo-legalmind.png',
      defaultTenantCode: 'jxlkas',
      allowRegister: false,
      hiddenMenus: [],
    }),
  }));
  vi.resetModules();
  const mod = await import('../Login');
  vi.doUnmock('../../config/editions');
  return mod.default;
}

describe('登录页 · 可信身份理念区（SECURE WORKSPACE）', () => {
  it('法律版（showLegal）：显示理念区（标题 + 三个要点）', async () => {
    const LegalLogin = await loadLogin(true);
    const { unmount } = render(<LegalLogin />, { wrapper: wrap });
    expect(screen.getByText('SECURE WORKSPACE · 可信专业工作空间')).toBeTruthy();
    expect(screen.getByText('可信身份登录')).toBeTruthy();
    expect(screen.getByText('组织成员核验')).toBeTruthy();
    expect(screen.getByText('数据受控')).toBeTruthy();
    expect(screen.getByText(/进入您的可信专业工作空间/)).toBeTruthy();
    unmount();
  });

  it('通用版（generic）：不显示理念区', async () => {
    const GenericLogin = await loadLogin(false);
    const { unmount } = render(<GenericLogin />, { wrapper: wrap });
    expect(screen.queryByText('SECURE WORKSPACE · 可信专业工作空间')).toBeNull();
    expect(screen.queryByText('组织成员核验')).toBeNull();
    expect(screen.queryByTestId('oauth-login-button')).toBeNull();
    unmount();
  });
});

describe('登录页 · 可信身份 OAuth 通道', () => {
  it('法律版显示「Sign in with ChatGPT」按钮 → 打开授权 Modal（理念 + 通道）', async () => {
    const { oauthProviders } = await import('../../services/auth');
    vi.mocked(oauthProviders).mockResolvedValue([
      {
        provider: 'chatgpt',
        name: 'Sign in with ChatGPT',
        hint: '不保存密码',
        permissions: ['member:verify'],
      },
      {
        provider: 'wecom',
        name: '企业微信扫码',
        hint: 'AUTH REQUIRED',
        permissions: ['member:verify'],
      },
    ] as never);

    const LegalLogin = await loadLogin(true);
    const { unmount } = render(<LegalLogin />, { wrapper: wrap });
    expect(screen.getByTestId('oauth-login-button')).toBeTruthy();
    fireEvent.click(screen.getByTestId('oauth-login-button'));
    expect(await screen.findByText('进入您的可信专业工作空间')).toBeTruthy();
    // 按钮 + Modal 通道按钮均含该文案 → getAllByText
    expect(screen.getAllByText('Sign in with ChatGPT').length).toBeGreaterThan(0);
    expect(screen.getByText('企业微信扫码')).toBeTruthy();
    unmount();
  });

  it('授权并登录：核验通过 → 一次性授权码 → 安全会话建立 → 跳转', async () => {
    const { oauthProviders, oauthAuthorize, oauthToken } = await import('../../services/auth');
    vi.mocked(oauthProviders).mockResolvedValue([
      {
        provider: 'chatgpt',
        name: 'Sign in with ChatGPT',
        hint: '不保存密码',
        permissions: ['member:verify'],
      },
    ] as never);
    vi.mocked(oauthAuthorize).mockResolvedValue({
      code: 'oc_test',
      state: 'st_test',
      expiresInSeconds: 300,
      memberUsername: 'admin',
      tenantCode: 'jxlkas',
      memberStatus: 'VERIFIED',
    } as never);
    vi.mocked(oauthToken).mockResolvedValue({
      accessToken: 'at-oauth',
      refreshToken: 'rt-oauth',
      expiresIn: 1800,
      tokenType: 'Bearer',
      userId: 1,
      username: 'admin',
      tenantCode: 'jxlkas',
      tenantName: '凌科安时',
      tenantEdition: 'LEGALMIND',
      provider: 'chatgpt',
      memberStatus: 'VERIFIED',
      sessionAt: '2026-08-26T02:00:00Z',
    } as never);

    const LegalLogin = await loadLogin(true);
    const { unmount } = render(<LegalLogin />, { wrapper: wrap });
    fireEvent.click(screen.getByTestId('oauth-login-button'));
    await screen.findByText('进入您的可信专业工作空间');
    fireEvent.click(screen.getByTestId('oauth-authorize-button'));

    // 默认租户来自版别配置（jxlkas）→ 授权携带租户
    await waitFor(() => expect(oauthAuthorize).toHaveBeenCalledWith('chatgpt', 'admin', 'jxlkas'));
    await waitFor(() => expect(oauthToken).toHaveBeenCalledWith('oc_test', 'jxlkas'));
    // 授权成功后 onSuccess → setSession + 跳转（页面卸载）→ 授权按钮消失
    await waitFor(() => expect(screen.queryByTestId('oauth-authorize-button')).toBeNull());
    unmount();
  });

  it('授权失败：成员非 ACTIVE → 显示错误且不登录', async () => {
    const { oauthProviders, oauthAuthorize } = await import('../../services/auth');
    vi.mocked(oauthProviders).mockResolvedValue([
      {
        provider: 'chatgpt',
        name: 'Sign in with ChatGPT',
        hint: '不保存密码',
        permissions: ['member:verify'],
      },
    ] as never);
    vi.mocked(oauthAuthorize).mockRejectedValue(new Error('MEMBER_DISABLED'));

    const LegalLogin = await loadLogin(true);
    const { unmount } = render(<LegalLogin />, { wrapper: wrap });
    fireEvent.click(screen.getByTestId('oauth-login-button'));
    await screen.findByText('进入您的可信专业工作空间');
    fireEvent.click(screen.getByTestId('oauth-authorize-button'));

    expect(await screen.findByText(/登录失败/)).toBeTruthy();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    unmount();
  });
});
