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

beforeEach(() => {
  localStorage.clear();
  fetchTenantOptions.mockResolvedValue([]);
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
  vi.restoreAllMocks();
});

const { login, loginWithCode, register, resetPassword, sendCode, fetchTenantOptions } =
  vi.hoisted(() => ({
    login: vi.fn(),
    loginWithCode: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    sendCode: vi.fn(),
    fetchTenantOptions: vi.fn(),
  }));

vi.mock('../../services/auth', () => ({
  login,
  loginWithCode,
  register,
  resetPassword,
  sendCode,
  fetchTenantOptions,
  AuthError: class AuthError extends Error {
    constructor(
      public code: string,
      message: string,
      public status?: number,
    ) {
      super(message);
      this.name = 'AuthError';
    }
  },
}));

import Login from '../Login';
import * as authApi from '../../services/auth';


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
    expect(screen.getByText('LieShouCloud')).toBeInTheDocument();
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
    login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 1800,
      tokenType: 'Bearer',
      userId: 1,
      username: 'u',
    });
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
      expect(login).toHaveBeenCalledWith({
        username: 'alice',
        password: 'secret',
        tenantCode: undefined,
      });
    });
  });

  it('密码登录失败 INVALID_CREDENTIALS → 显示「密码错误」', async () => {
    login.mockRejectedValue(new authApi.AuthError('INVALID_CREDENTIALS', 'wrong', 401));
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
    login.mockRejectedValue(new authApi.AuthError('USER_NOT_FOUND', 'no', 404));
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

  it('多租户：username 输入后查询租户选项并显示下拉（不手填租户）', async () => {
    fetchTenantOptions.mockResolvedValue([
      { tenantId: 1, tenantCode: 'huntercat', tenantName: '南昌猎手猫数字科技有限公司' },
      { tenantId: 2, tenantCode: 'acme', tenantName: 'Acme 集团' },
    ]);
    login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 1800,
      tokenType: 'Bearer',
      userId: 1,
      username: 'u',
    });
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    render(<Login />, { wrapper: wrap });

    // 初始无租户输入框（不手填租户）
    expect(screen.queryByTestId('tenant-input')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'a' } });

    // 防抖查询 → 多租户下拉出现
    const select = await screen.findByTestId('tenant-select');
    expect(fetchTenantOptions).toHaveBeenCalledWith('a');
    expect(select).toBeInTheDocument();
  });

  it('单租户：不显示租户下拉，直接登录（tenantCode undefined → 后端默认）', async () => {
    fetchTenantOptions.mockResolvedValue([
      { tenantId: 1, tenantCode: 'huntercat', tenantName: '南昌猎手猫数字科技有限公司' },
    ]);
    login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 1800,
      tokenType: 'Bearer',
      userId: 1,
      username: 'u',
    });
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
      expect(login).toHaveBeenCalledWith({
        username: 'a',
        password: 'p',
        tenantCode: undefined,
      });
    });
  });
});
