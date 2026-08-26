/**
 * Admin 数据看板单测（开源版 · 2026-08-27）.
 *
 * 数据源全部为开源服务：user（租户/用户/审计/通知）+ approval（审批）。
 */
import { render, screen, waitFor } from '@testing-library/react';
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
  countUsers.mockResolvedValue(0);
  listTenants.mockResolvedValue([]);
  getApprovalCounts.mockResolvedValue({ inbox: 0, mine: 0 });
  countAuditLogs.mockResolvedValue(0);
  unreadNotificationCount.mockResolvedValue(0);
  listApprovals.mockResolvedValue([]);
  listAuditLogs.mockResolvedValue([]);
});

const {
  countUsers,
  listTenants,
  getApprovalCounts,
  countAuditLogs,
  unreadNotificationCount,
  listApprovals,
  listAuditLogs,
} = vi.hoisted(() => ({
  countUsers: vi.fn(),
  listTenants: vi.fn(),
  getApprovalCounts: vi.fn(),
  countAuditLogs: vi.fn(),
  unreadNotificationCount: vi.fn(),
  listApprovals: vi.fn(),
  listAuditLogs: vi.fn(),
}));

vi.mock('../../services/user', () => ({ countUsers }));
vi.mock('../../services/tenant', () => ({ listTenants }));
vi.mock('../../services/approval', () => ({ getApprovalCounts, listApprovals }));
vi.mock('../../services/audit', () => ({ countAuditLogs, listAuditLogs }));
vi.mock('../../services/notification', () => ({ unreadNotificationCount }));
// ECharts 环形图在 jsdom 不可渲染，mock 为轻量占位；useApiError 一并 mock（来自同一包）
vi.mock('@lieshoucloud/ui', () => ({
  DatavDvRing: ({ data }: { data: { name: string; value: number }[] }) => (
    <div data-testid="dvring">{data.map((d) => `${d.name}:${d.value}`).join(',')}</div>
  ),
  useApiError: () => () => {},
}));

import Admin from '../Admin';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Admin 数据看板（开源版）', () => {
  it('PLATFORM_ADMIN：6 张统计卡 + 审批分布 + 最近审计 + 快捷入口', async () => {
    countUsers.mockResolvedValue(100);
    listTenants.mockResolvedValue([{}, {}, {}]);
    getApprovalCounts.mockResolvedValue({ inbox: 4, mine: 2 });
    countAuditLogs.mockResolvedValue(88);
    unreadNotificationCount.mockResolvedValue(7);
    listApprovals.mockResolvedValue([
      { id: 1, type: 'EXPENSE', title: '报销', status: 'PENDING' },
      { id: 2, type: 'PURCHASE', title: '采购', status: 'APPROVED' },
    ]);
    listAuditLogs.mockResolvedValue([
      { id: 1, action: 'CREATE', resourceType: 'USER', resourceId: 5, createdAt: '2026-08-27T00:00:00Z' },
    ]);
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('租户数')).toBeInTheDocument();
    });
    expect(screen.getByText('用户数')).toBeInTheDocument();
    expect(screen.getByText('审批待办')).toBeInTheDocument();
    expect(screen.getByText('我发起的审批')).toBeInTheDocument();
    expect(screen.getAllByText('审计日志').length).toBeGreaterThan(0);
    expect(screen.getByText('未读通知')).toBeInTheDocument();
    // 数值
    expect(screen.getByText('3')).toBeInTheDocument(); // 租户数
    expect(screen.getByText('100')).toBeInTheDocument(); // 用户数
    expect(screen.getByText('4')).toBeInTheDocument(); // 审批待办
    expect(screen.getByText('88')).toBeInTheDocument(); // 审计
    expect(screen.getByText('7')).toBeInTheDocument(); // 未读通知
    // 审批类型分布（ECharts mock 占位）
    expect(screen.getByTestId('dvring').textContent).toContain('支出报销');
    // 最近审计动态
    expect(screen.getByText('最近审计动态')).toBeInTheDocument();
    expect(screen.getByText('CREATE')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    // 快捷入口
    expect(screen.getByText('审批中心')).toBeInTheDocument();
    expect(screen.getByText('通知中心')).toBeInTheDocument();
    expect(listTenants).toHaveBeenCalled();
  });

  it('非平台管理员：租户数为空占位 + 不调 listTenants', async () => {
    countUsers.mockResolvedValue(5);
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 2, username: 'alice', roles: ['USER'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('用户数')).toBeInTheDocument();
    });
    expect(listTenants).not.toHaveBeenCalled();
    // 租户卡显示 '-'（null）
    expect(screen.getByText('租户数')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('审批为空：环形图占位提示', async () => {
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('暂无审批数据')).toBeInTheDocument();
    });
  });
});
