/**
 * Admin 数据看板单测（Phase 9 · BI 雏形）.
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
  // 新业务统计默认值
  listProducts.mockResolvedValue([]);
  getLedgerSummary.mockResolvedValue({ income: 0, expense: 0, balance: 0, count: 0 });
  // 审批待办默认值（ADR-0032）
  getApprovalCounts.mockResolvedValue({ inbox: 0, mine: 0 });
  // 客户成功中心汇总默认值（工作台第 4 卡）
  getCustomerSuccessSummary.mockResolvedValue({
    totalLetters: 0,
    draftLetters: 0,
    sentLetters: 0,
    completedLetters: 0,
    totalResponses: 0,
    openResponses: 0,
    resolvedResponses: 0,
    negativeResponses: 0,
    weekResponses: 0,
    followUpOverdue: 0,
    followUpDueToday: 0,
  });
});

const {
  countUsers,
  listTenants,
  listCustomers,
  listProducts,
  getLedgerSummary,
  getApprovalCounts,
  getCustomerSuccessSummary,
} = vi.hoisted(() => ({
  countUsers: vi.fn(),
  listTenants: vi.fn(),
  listCustomers: vi.fn(),
  listProducts: vi.fn(),
  getLedgerSummary: vi.fn(),
  getApprovalCounts: vi.fn(),
  getCustomerSuccessSummary: vi.fn(),
}));

vi.mock('../../services/user', () => ({ countUsers }));
vi.mock('../../services/tenant', () => ({ listTenants }));
vi.mock('../../services/crm', () => ({ listCustomers }));
vi.mock('../../services/inventory', () => ({ listProducts }));
vi.mock('../../services/finance', () => ({ getLedgerSummary }));
vi.mock('../../services/approval', () => ({ getApprovalCounts }));
vi.mock('../../services/customerSuccess', () => ({ getCustomerSuccessSummary }));

import Admin from '../Admin';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Admin 数据看板', () => {
  it('PLATFORM_ADMIN 登录：3 张统计卡 + 趋势卡 + 状态分布 + 漏斗', async () => {
    countUsers.mockResolvedValue(100);
    listTenants.mockResolvedValue([{}, {}, {}]);
    listCustomers.mockResolvedValue([
      { id: 1, name: 'A', contactName: null, status: 'NEW', createdAt: '2026-08-23' },
      { id: 2, name: 'B', status: 'CONVERTED', createdAt: '2026-08-22' },
    ]);
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('租户总数')).toBeInTheDocument();
    });
    expect(screen.getByText('平台用户数')).toBeInTheDocument();
    expect(screen.getByText('租户客户总数')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 租户数
    expect(screen.getByText('30 天客户创建趋势')).toBeInTheDocument();
    expect(screen.getByText('客户状态分布')).toBeInTheDocument();
    expect(screen.getByText('客户生命周期漏斗')).toBeInTheDocument();
    expect(screen.getByText('快捷入口')).toBeInTheDocument();
    expect(screen.getByText('租户管理')).toBeInTheDocument();
  });

  it('客户成功中心（工作台第 4 卡）：汇总统计 + 进入入口', async () => {
    countUsers.mockResolvedValue(0);
    listTenants.mockResolvedValue([]);
    listCustomers.mockResolvedValue([]);
    getCustomerSuccessSummary.mockResolvedValue({
      totalLetters: 6,
      draftLetters: 2,
      sentLetters: 3,
      completedLetters: 1,
      totalResponses: 10,
      openResponses: 4,
      resolvedResponses: 7,
      negativeResponses: 2,
      weekResponses: 5,
      followUpOverdue: 3,
      followUpDueToday: 1,
    });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 4, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('客户成功中心')).toBeInTheDocument();
    });
    expect(screen.getByText('待发送联系函')).toBeInTheDocument();
    expect(screen.getByText('已发送待响应')).toBeInTheDocument();
    expect(screen.getByText('待跟进响应')).toBeInTheDocument();
    expect(screen.getByText('消极响应')).toBeInTheDocument();
    expect(screen.getByText('近 7 天响应')).toBeInTheDocument();
    expect(screen.getByText('响应闭环率')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument(); // 7/10 闭环率
    expect(screen.getByText('已逾期跟进')).toBeInTheDocument();
    expect(screen.getByText('今日到期跟进')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /进入客户成功中心/ })).toBeInTheDocument();
  });

  it('非平台：只显示 2 个统计卡 + 不调 listTenants', async () => {
    countUsers.mockResolvedValue(5);
    listCustomers.mockResolvedValue([]);
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 2, username: 'alice', roles: ['USER'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('本租户用户')).toBeInTheDocument();
    });
    expect(screen.getByText('本租户客户')).toBeInTheDocument();
    expect(screen.queryByText('租户总数')).not.toBeInTheDocument();
    expect(screen.queryByText('租户管理')).not.toBeInTheDocument();
    expect(listTenants).not.toHaveBeenCalled();
  });

  it('最近客户：按 createdAt 倒序取最新条目', async () => {
    countUsers.mockResolvedValue(0);
    listTenants.mockResolvedValue([]);
    listCustomers.mockResolvedValue([
      { id: 1, name: '最新', contactName: null, status: 'NEW', createdAt: '2026-08-23' },
      { id: 2, name: '较早', status: 'FOLLOWING', createdAt: '2026-08-22' },
    ]);
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 3, username: 'u', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('最新')).toBeInTheDocument();
    });
    expect(screen.getByText('较早')).toBeInTheDocument();
    expect(screen.getByText('最近客户')).toBeInTheDocument();
  });

  it('业务经营统计：商品数/库存总值/低库存/本月收支', async () => {
    countUsers.mockResolvedValue(0);
    listTenants.mockResolvedValue([]);
    listCustomers.mockResolvedValue([]);
    // 2 个商品：A(10 个 ×10 元 = 100)，B(2 个 ×50 元 = 100，低库存)
    listProducts.mockResolvedValue([
      { id: 1, name: 'A', price: 10, stockQuantity: 10 },
      { id: 2, name: 'B', price: 50, stockQuantity: 2 },
    ]);
    getLedgerSummary.mockResolvedValue({ income: 8000, expense: 3000, balance: 5000, count: 5 });
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 4, username: 'boss', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    render(<Admin />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('商品数')).toBeInTheDocument();
    });
    // 商品数 = 2
    expect(screen.getByText('2')).toBeInTheDocument();
    // 库存总值 = 100 + 100 = 200
    expect(screen.getByText('200')).toBeInTheDocument();
    // 低库存 = 1（B）
    expect(screen.getByText('1')).toBeInTheDocument();
    // 本月收入 8000 / 支出 3000 / 结余 5000（antd Statistic 千分位）
    expect(screen.getByText('8,000')).toBeInTheDocument();
    expect(screen.getByText('3,000')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(getLedgerSummary).toHaveBeenCalledWith(
      expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
    );
  });
});
