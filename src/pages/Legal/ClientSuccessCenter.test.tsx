/**
 * 客户成功中心（ClientSuccessCenter）单测.
 *
 * 验证：组合健康度 + 健康四维、生命周期漏斗渲染、客户组合表（健康分/状态 Tag）、
 * 客户价值记录弹窗、合规声明。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ClientSuccessCenter from './ClientSuccessCenter';
import { clientSuccessSummary, listClients } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return {
    ...actual,
    clientSuccessSummary: vi.fn(),
    listClients: vi.fn(),
    listClientValues: vi.fn(),
    confirmClientValue: vi.fn(),
  };
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientSuccessSummary).mockResolvedValue({
    funnel: {
      VISITOR: 0,
      LEAD: 0,
      TRIAGE: 0,
      DIAGNOSIS: 0,
      PRODUCT: 0,
      ENGAGED: 0,
      SERVING: 3,
      CLOSED: 2,
      REPEAT: 0,
      REFERRAL: 0,
    },
    clientTotal: 5,
    portfolioHealth: 90,
    followUpCount: 2,
    highAttentionCount: 1,
    healthDimensions: { response: 96, communication: 88, todo: 83, stability: 91 },
    valueConfirmed: 14,
    valuePending: 3,
    valueConfirmedByType: { RISK_ALERT: 5, DECISION_SUPPORT: 4, OUTCOME_ADOPTED: 3 },
  } as never);
  vi.mocked(listClients).mockResolvedValue({
    items: [
      {
        id: 1,
        tenantId: 1,
        name: '江西宏远科技',
        lifecycleStage: 'SERVING',
        currentService: '宏远科技股权回购争议',
        healthScore: 68,
        status: 'HIGH_ATTENTION',
        note: '今日 16:00 前审定策略分析报告 V2',
        createdAt: '2026-08-25T00:00:00Z',
        updatedAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        name: '安澜医疗',
        lifecycleStage: 'SERVING',
        currentService: '常年法律顾问',
        healthScore: 94,
        status: 'HEALTHY',
        createdAt: '2026-08-25T00:00:00Z',
        updatedAt: '2026-08-25T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    size: 20,
  } as never);
});

describe('客户成功中心', () => {
  it('组合健康度 + 健康四维（HEALTH MODEL）', async () => {
    render(wrap({ children: <ClientSuccessCenter /> }));
    expect(await screen.findByText('组合健康度')).toBeTruthy();
    expect(screen.getByText('90')).toBeTruthy();
    expect(screen.getByText('响应时效')).toBeTruthy();
    expect(screen.getByText('96')).toBeTruthy();
    expect(screen.getByText('情绪稳定')).toBeTruthy();
  });

  it('生命周期漏斗：各阶段计数渲染', async () => {
    render(wrap({ children: <ClientSuccessCenter /> }));
    expect(await screen.findByText('客户生命周期漏斗（本月）')).toBeTruthy();
    // 漏斗标签 = 「序号 · 阶段名」同一 span，用正则匹配（服务中 3 / 已结案 2）
    expect(screen.getByText(/7 · 服务中客户/)).toBeTruthy();
    expect(screen.getByText(/8 · 已结案客户/)).toBeTruthy();
  });

  it('本周客户价值：已确认 + 分类 + 待核验提示', async () => {
    render(wrap({ children: <ClientSuccessCenter /> }));
    expect(await screen.findByText('已确认价值记录')).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    expect(screen.getByText('风险提前提示 5')).toBeTruthy();
    expect(screen.getByText('决策支持 4')).toBeTruthy();
    expect(screen.getByText(/3 项价值记录等待核验/)).toBeTruthy();
  });

  it('客户组合表：客户名 / 生命周期 Tag / 关注状态 Tag / 动态', async () => {
    render(wrap({ children: <ClientSuccessCenter /> }));
    expect(await screen.findByText('江西宏远科技')).toBeTruthy();
    expect(screen.getByText('安澜医疗')).toBeTruthy();
    expect(screen.getAllByText('服务中客户').length).toBeGreaterThan(0);
    expect(screen.getByText('高关注')).toBeTruthy();
    expect(screen.getByText('健康')).toBeTruthy();
    expect(screen.getByText('今日 16:00 前审定策略分析报告 V2')).toBeTruthy();
  });

  it('价值记录弹窗：打开显示记录 + 待确认可确认', async () => {
    const { listClientValues, confirmClientValue } = await import('../../services/legal');
    vi.mocked(listClientValues).mockResolvedValue([
      {
        id: 9,
        tenantId: 1,
        clientId: 1,
        valueType: 'RISK_ALERT',
        description: '回购通知送达日期与纪要相差 3 日',
        confirmed: false,
        createdAt: '2026-08-25T00:00:00Z',
      },
    ] as never);
    vi.mocked(confirmClientValue).mockResolvedValue({
      id: 9,
      tenantId: 1,
      clientId: 1,
      valueType: 'RISK_ALERT',
      description: '回购通知送达日期与纪要相差 3 日',
      confirmed: true,
      createdAt: '2026-08-25T00:00:00Z',
    } as never);
    render(wrap({ children: <ClientSuccessCenter /> }));
    await screen.findByText('江西宏远科技');
    fireEvent.click(screen.getAllByText('价值')[0]);
    expect(await screen.findByText(/客户价值记录/)).toBeTruthy();
    expect(await screen.findByText('回购通知送达日期与纪要相差 3 日')).toBeTruthy();
    expect(screen.getByText('风险提前提示 · 待确认')).toBeTruthy();
    // 确认后状态更新（antd 对无图标双字按钮自动插入空格 → 「确 认」）
    fireEvent.click(screen.getByText('确 认'));
    await waitFor(() => expect(confirmClientValue).toHaveBeenCalledWith(9));
  });

  it('合规声明展示', async () => {
    render(wrap({ children: <ClientSuccessCenter /> }));
    expect(await screen.findByText(/情绪稳定维度仅用于服务升级提示/)).toBeTruthy();
  });
});
