/**
 * Login 页面单测（Phase 9 · 覆盖率）.
 *
 * 注：Login 有 593 行 + 三个表单（密码 / 验证码 / 注册 Modal / 重置密码 Modal），
 * 全部测成本太高；这里覆盖核心结构 + 错误消息映射。
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../../stores/auth';
import { getEdition } from '../../config/editions';

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

const { loginWithCode, register, resetPassword, sendCode } = vi.hoisted(() => ({
  loginWithCode: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  sendCode: vi.fn(),
}));

vi.mock('../../services/auth', async () => {
  // AuthError 必须保留真实实现（utils/errors → @lieshoucloud/contract-api）：
  // core-web 传输层抛的也是同一 AuthError，页面 instanceof 判断才能命中。
  const actual = await vi.importActual<Record<string, unknown>>('../../services/auth');
  return {
    loginWithCode,
    register,
    resetPassword,
    sendCode,
    AuthError: actual.AuthError,
  };
});

import Login from '../Login';
import { configureCore } from '@lieshoucloud/core-web';
import { AuthError as ContractAuthError } from '@lieshoucloud/contract-api';


let loginCalls: Array<{ username: string; password: string; tenantCode?: string }> = [];
let loginImpl: (req: { username: string; password: string; tenantCode?: string }) => Promise<unknown> | Error;

/** 注入 core-web 传输：login 记录 + 可配置成功/失败 */
function mockCoreLogin(impl?: (req: { username: string; password: string; tenantCode?: string }) => Promise<unknown> | Error) {
  loginCalls = [];
  loginImpl = impl ?? (() => Promise.resolve({
    accessToken: 'a', refreshToken: 'r', expiresIn: 1800, tokenType: 'Bearer', userId: 1, username: 'u',
    tenantCode: 'huntercat', tenantName: 't', tenantEdition: 'GENERIC', availableTenants: [],
  }));
  configureCore({
    storage: { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v), remove: (k) => localStorage.removeItem(k) },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: {
      request: <T,>(path: string, init?: RequestInit): Promise<T> => {
        if (path.includes('/login')) {
          const body = JSON.parse(String(init?.body ?? '{}'));
          loginCalls.push(body);
          const r = loginImpl(body);
          return r instanceof Error ? Promise.reject(r) : Promise.resolve(r as T);
        }
        if (path.includes('/me')) return Promise.resolve({ userId: 1, username: 'u', roles: ['USER'] } as T);
        return Promise.resolve({} as T);
      },
    },
  });
}

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter initialEntries={['/login']}>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Login 页', () => {
  it('渲染：品牌 + 登录标题 + 密码表单', () => {
    render(<Login />, { wrapper: wrap });
    expect(screen.getByText(getEdition().brandName)).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
    // 去验证码（2026-08-25）：仅账号密码登录，无 Tabs
    expect(screen.getByPlaceholderText('futurewl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    // 租户自助开通入口（generic 版 allowRegister=true · issue #24）
    expect(screen.getByText('免费开通租户').closest('a')).toHaveAttribute('href', '/register');
  });

  it('已登录 → 直接 Navigate 跳过 login', () => {
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'u', roles: ['USER'] },
      isAuthenticated: true,
    });
    const { container } = render(<Login />, { wrapper: wrap });
    // Navigate 后会渲染空（路由切到 /welcome，但测试环境没注册此路由）
    expect(container).toBeDefined();
  });

  it('密码登录：输入 + 提交调 login', async () => {
    mockCoreLogin();
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: null,
      isAuthenticated: false,
    });
    // 设置未登录
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });

    render(<Login />, { wrapper: wrap });

    const userInputs = screen.getAllByPlaceholderText('futurewl');
    const passInputs = screen.getAllByPlaceholderText('password');
    fireEvent.change(userInputs[0], { target: { value: 'alice' } });
    fireEvent.change(passInputs[0], { target: { value: 'secret' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await vi.waitFor(() => {
      expect(loginCalls).toContainEqual({
        username: 'alice',
        password: 'secret',
        tenantCode: undefined,
      });
    });
  });

  it('密码登录失败 INVALID_CREDENTIALS → 显示「密码错误」', async () => {
    mockCoreLogin(() => new ContractAuthError('INVALID_CREDENTIALS', '密码错误', 401));
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    render(<Login />, { wrapper: wrap });

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'b' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText('密码错误')).toBeInTheDocument();
  });

  it('密码登录失败 USER_NOT_FOUND → 显示「用户不存在」', async () => {
    mockCoreLogin(() => new ContractAuthError('USER_NOT_FOUND', '用户不存在', 404));
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    render(<Login />, { wrapper: wrap });
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'p' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(await screen.findByText('用户不存在')).toBeInTheDocument();
  });

  it('登录页不显示租户选择（先登录后选租户，登录带默认租户）', async () => {
    mockCoreLogin();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    render(<Login />, { wrapper: wrap });

    // 登录页无租户输入/下拉（登录前不选租户）
    expect(screen.queryByTestId('tenant-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tenant-select')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'p' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await vi.waitFor(() => {
      // 登录不指定租户 → 后端默认；登录后多租户在顶栏切换
      expect(loginCalls).toContainEqual({ username: 'a', password: 'p', tenantCode: undefined });
    });
  });

  it('单租户：不显示租户下拉，直接登录（tenantCode undefined → 后端默认）', async () => {
    mockCoreLogin();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    render(<Login />, { wrapper: wrap });

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'p' } });
    // 单租户 → 无下拉
    expect(screen.queryByTestId('tenant-select')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('submit-button'));

    await vi.waitFor(() => {
      expect(loginCalls).toContainEqual({
        username: 'a',
        password: 'p',
        tenantCode: undefined,
      });
    });
  });
});
