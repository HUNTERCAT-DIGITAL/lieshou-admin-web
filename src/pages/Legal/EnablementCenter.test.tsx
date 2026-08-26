/**
 * 组织赋能驾驶舱（EnablementCenter）单测.
 *
 * 验证：组织今日统计、支持信号卡、组织看板、团队成长与负荷、律时建议/管理帮助、
 * 职业里程碑、合规声明。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EnablementCenter from './EnablementCenter';
import { enablementSummary } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, enablementSummary: vi.fn() };
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
  vi.mocked(enablementSummary).mockResolvedValue({
    signals: [
      {
        id: 1,
        tenantId: 1,
        signalType: 'LOAD',
        label: '负荷需要调节',
        countValue: 2,
        status: 'PENDING',
        createdAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        signalType: 'REVIEW_BACKLOG',
        label: '专业复核拥堵',
        countValue: 3,
        disposition: '主办/合伙人示范复核',
        status: 'IN_PROGRESS',
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    pendingSignals: 3,
    boards: [
      {
        id: 1,
        tenantId: 1,
        boardKey: 'TALENT',
        label: '招聘',
        metricLabel: '候选人',
        metricValue: '7',
        detail: '2 建议进入业务模拟',
        status: 'NORMAL',
      },
      {
        id: 2,
        tenantId: 1,
        boardKey: 'FINANCE',
        label: '财务',
        metricLabel: '工时已归属',
        metricValue: '93%',
        detail: '2 项回款需协助',
        status: 'NORMAL',
      },
    ],
    members: [
      {
        id: 1,
        tenantId: 1,
        name: '林助理',
        role: '助理律师',
        loadPercent: 72,
        growthScore: 86,
        growthDelta: 8,
        opportunity: '安排策略表达共创',
        createdAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        name: '陈律师',
        role: '协办律师',
        loadPercent: 91,
        growthScore: 91,
        growthDelta: 5,
        opportunity: '增加高压客户沟通机会',
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    actions: [
      {
        id: 1,
        tenantId: 1,
        actionType: 'SUGGESTION',
        title: '先调负荷，再配机会',
        owner: '管理合伙人',
        status: 'PENDING',
        createdAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        actionType: 'ASSISTANCE',
        title: '策略卡停留 18 小时协助重新排期',
        owner: '管理合伙人',
        status: 'DONE',
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    pendingActions: 3,
    milestones: [
      {
        id: 1,
        tenantId: 1,
        goal: '高级律师',
        readiness: 94,
        advice: '建议进入发展确认',
        status: 'ACTIVE',
      },
      {
        id: 2,
        tenantId: 1,
        goal: '主办律师',
        readiness: 82,
        advice: '配置共同主办机会',
        status: 'ACTIVE',
      },
    ],
    backboneActive: 6,
  } as never);
});

describe('组织赋能驾驶舱', () => {
  it('组织今日：支持信号 / 待安排 / 今日建议 / 底层能力', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('今日支持信号')).toBeTruthy();
    expect(screen.getByText('待安排事项')).toBeTruthy();
    // 今日建议出现在统计卡 + 建议列表 → getAllByText
    expect(screen.getAllByText('先调负荷，再配机会').length).toBeGreaterThan(0);
    // Statistic 值（6）与 suffix（/ 6 ACTIVE）分开发布
    expect(screen.getByText('/ 6 ACTIVE')).toBeTruthy();
  });

  it('支持信号：类型文案 + 计数 + 处置按钮', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('负荷需要调节')).toBeTruthy();
    // 信号卡 meta 文案 + label 相同 → getAllByText
    expect(screen.getAllByText('专业复核拥堵').length).toBeGreaterThan(0);
    expect(screen.getAllByText('完成处置').length).toBeGreaterThan(0);
  });

  it('组织看板：指标卡', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('组织看板')).toBeTruthy();
    expect(screen.getByText('TALENT 招聘')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('FINANCE 财务')).toBeTruthy();
    expect(screen.getByText('93%')).toBeTruthy();
  });

  it('团队成长与负荷：成员 + 负荷 + 成长评分 + 机会', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('团队成长与工作负荷（TEAM GROWTH MAP）')).toBeTruthy();
    expect(screen.getByText('林助理')).toBeTruthy();
    expect(screen.getByText('陈律师')).toBeTruthy();
    expect(screen.getByText('助理律师')).toBeTruthy();
    expect(screen.getByText('安排策略表达共创')).toBeTruthy();
    expect(screen.getByText('↑+8')).toBeTruthy();
  });

  it('律时建议与管理帮助：类型 Tag + 已完成标记', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('律时建议安排与管理帮助（MANAGER ASSISTANCE）')).toBeTruthy();
    expect(screen.getByText('律时建议')).toBeTruthy();
    expect(screen.getByText('管理帮助')).toBeTruthy();
    expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
  });

  it('职业里程碑：目标 + 准备度', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText('职业里程碑准备度')).toBeTruthy();
    expect(screen.getByText('高级律师')).toBeTruthy();
    // 里程碑 Progress 与文字均含 94% → getAllByText
    expect(screen.getAllByText('94%').length).toBeGreaterThan(0);
    expect(screen.getByText('主办律师')).toBeTruthy();
  });

  it('合规声明展示', async () => {
    render(wrap({ children: <EnablementCenter /> }));
    expect(await screen.findByText(/以上组织信息均由相关成员确认/)).toBeTruthy();
  });
});
