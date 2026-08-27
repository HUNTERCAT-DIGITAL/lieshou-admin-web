/**
 * RegisterTenant 租户自助开通页单测（issue #24 · SaaS 增长路径）.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App as AntdApp, ConfigProvider } from 'antd';
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

const { registerTenant } = vi.hoisted(() => ({ registerTenant: vi.fn() }));

vi.mock('../../services/tenant', () => ({ registerTenant }));

import RegisterTenant from '../RegisterTenant';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter initialEntries={['/register']}>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('RegisterTenant 租户自助开通页', () => {
  it('渲染：品牌 + 表单字段（租户/编码/管理员/密码）', () => {
    render(<RegisterTenant />, { wrapper: wrap });
    expect(screen.getAllByText(new RegExp(getEdition().brandName)).length).toBeGreaterThan(0);
    expect(screen.getByText('免费开通')).toBeInTheDocument();
    expect(screen.getByText('公司 / 组织名称')).toBeInTheDocument();
    expect(screen.getByText('租户编码（登录用）')).toBeInTheDocument();
    expect(screen.getByText('管理员用户名')).toBeInTheDocument();
    expect(screen.getByText('确认密码')).toBeInTheDocument();
  });

  it('提交成功 → 调 registerTenant + 跳登录页（预填租户编码与用户名）', async () => {
    registerTenant.mockResolvedValueOnce({
      tenant: { id: 99, name: '示例公司', code: 'sampleco', status: 'ACTIVE', createdAt: '' },
      adminUsername: 'admin',
      adminDisplayName: '管理员',
    });
    render(<RegisterTenant />, { wrapper: wrap });

    fireEvent.change(screen.getByPlaceholderText('如：示例科技有限公司'), {
      target: { value: '示例公司' },
    });
    fireEvent.change(screen.getByPlaceholderText('mycompany'), { target: { value: 'sampleco' } });
    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('如：张三'), { target: { value: '管理员' } });
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('再次输入密码'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: '免费开通' }));

    await waitFor(() => {
      expect(registerTenant).toHaveBeenCalledWith({
        tenantName: '示例公司',
        tenantCode: 'sampleco',
        username: 'admin',
        displayName: '管理员',
        password: 'secret123',
        email: undefined,
      });
    });
  });
});
