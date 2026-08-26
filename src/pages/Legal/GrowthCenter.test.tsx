/**
 * 专业成长中心（GrowthCenter）单测.
 *
 * 验证：成长指数/证据统计渲染、六维画像进度条（依据）、成长教练建议、合规声明。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GrowthCenter from './GrowthCenter';
import { growthSummary } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, growthSummary: vi.fn() };
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

const GROWTH: never = {
  growthIndex: 86.4,
  monthEvidence: 48,
  pendingConfirm: 2,
  focus: '团队贡献',
  dimensions: [
    { key: 'case_execution', name: '案件执行', score: 88, basis: '在办 5 件 · 平均进度 62%' },
    {
      key: 'professional',
      name: '专业能力',
      score: 84,
      basis: '已复核/可复用知识卡 3 张 · 复用 4 次',
    },
    {
      key: 'work_discipline',
      name: '工作规范',
      score: 93,
      basis: '卷宗文书 14 份 · 时间线事件 12 条',
    },
    { key: 'client_value', name: '客户价值', score: 86, basis: '联系函已确认 2/3' },
    { key: 'team_contribution', name: '团队贡献', score: 79, basis: '承办律师 3 人 · 协同办理' },
    { key: 'proactivity', name: '成长主动性', score: 82, basis: '本月新增知识卡 2 · 文书 4' },
  ],
  coach: {
    focus: '团队贡献',
    advice: '承担更多协同角色（案源/复核/审批），在真实案件中锻炼组织协作。',
    steps: [
      '把「团队贡献」相关工作判断结构化记录，形成底稿',
      '参与一次专业复核',
      '预约 20 分钟成长辅导',
    ],
  },
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(growthSummary).mockResolvedValue(GROWTH);
});

describe('专业成长中心', () => {
  it('本月成长概览：成长指数 + 证据统计 + 待确认 + 成长重点', async () => {
    render(wrap({ children: <GrowthCenter /> }));
    expect(await screen.findByText('本月成长指数')).toBeTruthy();
    // antd Statistic 将小数拆为 int/decimal 两个节点：断言整数部分
    expect(screen.getByText('86')).toBeTruthy();
    expect(screen.getByText('48')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getAllByText('团队贡献').length).toBeGreaterThan(0);
  });

  it('六维画像：六维度渲染（名称 + 依据 + 分数）', async () => {
    render(wrap({ children: <GrowthCenter /> }));
    await screen.findByText('案件执行');
    expect(screen.getByText('案件执行')).toBeTruthy();
    expect(screen.getByText('专业能力')).toBeTruthy();
    expect(screen.getByText('工作规范')).toBeTruthy();
    expect(screen.getByText('客户价值')).toBeTruthy();
    expect(screen.getAllByText('团队贡献').length).toBeGreaterThan(0);
    expect(screen.getByText('成长主动性')).toBeTruthy();
    expect(screen.getByText('在办 5 件 · 平均进度 62%')).toBeTruthy();
    expect(screen.getByText('88 分')).toBeTruthy();
  });

  it('成长教练：关键成长点 + 建议 + 三步行动', async () => {
    render(wrap({ children: <GrowthCenter /> }));
    await screen.findByText('本周关键成长点：团队贡献');
    expect(screen.getByText(/承担更多协同角色/)).toBeTruthy();
    expect(screen.getByText(/预约 20 分钟成长辅导/)).toBeTruthy();
  });

  it('合规声明展示', async () => {
    render(wrap({ children: <GrowthCenter /> }));
    await screen.findByText('本月成长指数');
    expect(screen.getByText(/不评价人格/)).toBeTruthy();
  });
});
