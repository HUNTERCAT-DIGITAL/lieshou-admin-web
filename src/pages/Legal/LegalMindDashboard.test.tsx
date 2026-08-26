/**
 * LegalMind 今日作战台（LegalMindDashboard · TODAY COMMAND）单测.
 *
 * 验证：问候语、六大中心卡聚合、实时指标、在办案件列表渲染（关注度/阶段/进度）、
 *      空数据降级不 NPE。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LegalMindDashboard from './LegalMindDashboard';
import { listCases, workbenchRecent, workbenchSummary } from '../../services/legal';
import { useAuthStore } from '../../stores/auth';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, workbenchSummary: vi.fn(), workbenchRecent: vi.fn(), listCases: vi.fn() };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

function mockSummary() {
  return {
    statusCounts: { INTAKE: 2, FILED: 1, IN_TRIAL: 3, CLOSED: 1, ARCHIVED: 0 },
    activeCount: 6,
    closedCount: 1,
    highPriorityCount: 2,
    monthlyHours: 12.5,
    monthlyAmount: 8000,
    monthlyTimeCount: 6,
    pendingTimeCount: 2,
    documentCount: 14,
    unpassedIntakeCases: 1,
    pendingLetters: 2,
    knowledgeTotal: 14,
    knowledgeCandidates: 3,
    knowledgeReviewPending: 2,
    growthIndex: 86.4,
    clientSuccessScore: 92,
    clientTotal: 5,
    clientFollowUp: 2,
    clientHighAttention: 1,
  };
}

function mockCase(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 1,
    caseNo: '(2026)赣01民初5678号',
    matterNo: 'MAT-2026-0001',
    title: '宏远科技股权回购争议',
    caseType: 'CIVIL',
    status: 'IN_TRIAL',
    stage: 'STRATEGY_REPORT',
    stageProgress: 73,
    priority: 'HIGH',
    dataClassification: 'L4',
    createdAt: '2026-08-25T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: { username: '郝律师' } as never });
  vi.mocked(workbenchSummary).mockResolvedValue(mockSummary() as never);
  vi.mocked(workbenchRecent).mockResolvedValue([
    {
      kind: 'document',
      id: 5,
      caseId: 13,
      caseTitle: '宏远科技股权回购争议',
      matterNo: 'MAT-2026-0013',
      title: '策略分析报告 V2',
      at: new Date().toISOString(),
    },
  ] as never);
  vi.mocked(listCases).mockResolvedValue({
    items: [mockCase()],
    total: 1,
    page: 1,
    size: 50,
  } as never);
});

describe('LegalMind 今日作战台', () => {
  it('渲染问候语与用户名（今日工作汇总）', async () => {
    render(wrap({ children: <LegalMindDashboard /> }));
    expect(await screen.findByText(/郝律师/)).toBeTruthy();
    expect(screen.getByText(/项工作待关注/)).toBeTruthy();
  });

  it('六大中心卡聚合统计（01-06）', async () => {
    render(wrap({ children: <LegalMindDashboard /> }));
    await screen.findByText(/今日待办/);
    expect(screen.getByText('今日待办')).toBeTruthy();
    // 「在办案件」出现在中心卡 + 实时指标 + 列表标题，用 getAllByText 断言存在
    expect(screen.getAllByText('在办案件').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('客户成功')).toBeTruthy();
    expect(screen.getByText('律时 · 本月')).toBeTruthy();
    expect(screen.getByText('知识资产')).toBeTruthy();
    expect(screen.getByText('专业成长')).toBeTruthy();
    // 律时本月 12.5h
    expect(screen.getByText('12.5')).toBeTruthy();
    expect(screen.getByText('h')).toBeTruthy();
    // 待确认归属 2 笔
    expect(screen.getByText('本月 6 笔 · 2 笔待确认归属')).toBeTruthy();
    // 知识资产 14 张 · 3 候选待复核（KNOWLEDGE ASSETS 卡联动；「14」可能多处在——用卡 desc 断言）
    expect(screen.getByText('3 项候选待复核 · 含 2 待专业复核')).toBeTruthy();
  });

  it('实时指标条：高关注 / 立项闸门未通过', async () => {
    render(wrap({ children: <LegalMindDashboard /> }));
    await screen.findByText(/今日待办/);
    expect(screen.getByText('高关注案件')).toBeTruthy();
    expect(screen.getByText('立项闸门未通过')).toBeTruthy();
    expect(screen.getByText('接洽中客户')).toBeTruthy();
    // 联系函待确认（愿景「1 封联系函 · 2 项待确认」）
    expect(screen.getByText('联系函待确认')).toBeTruthy();
    expect(screen.getByText('组合健康度 92 · 2 待跟进 · 2 联系函待确认')).toBeTruthy();
  });

  it('在办案件列表：关注度分层 + 阶段 + 进度（L4 密级）', async () => {
    render(wrap({ children: <LegalMindDashboard /> }));
    expect(await screen.findByText('宏远科技股权回购争议')).toBeTruthy();
    expect(screen.getByText('高关注')).toBeTruthy();
    expect(screen.getByText('04 策略分析报告')).toBeTruthy();
    expect(screen.getByText('L4 客户秘密')).toBeTruthy();
    expect(screen.getByText('继续办理')).toBeTruthy();
  });

  it('最近工作：断点续作入口（文书产物 + 案件名）', async () => {
    render(wrap({ children: <LegalMindDashboard /> }));
    expect(await screen.findByText('RECENT WORK · 最近工作')).toBeTruthy();
    expect(screen.getByText('策略分析报告 V2')).toBeTruthy();
    expect(screen.getByText('文书')).toBeTruthy();
    expect(screen.getAllByText(/宏远科技股权回购争议/).length).toBeGreaterThan(0);
  });

  it('无数据时降级：不 NPE，显示空态文案', async () => {
    vi.mocked(workbenchSummary).mockResolvedValue({
      statusCounts: { INTAKE: 0, FILED: 0, IN_TRIAL: 0, CLOSED: 0, ARCHIVED: 0 },
      activeCount: 0,
      closedCount: 0,
      highPriorityCount: 0,
      monthlyHours: 0,
      monthlyAmount: 0,
      monthlyTimeCount: 0,
      pendingTimeCount: 0,
      documentCount: 0,
      unpassedIntakeCases: 0,
      pendingLetters: 0,
      knowledgeTotal: 0,
      knowledgeCandidates: 0,
      knowledgeReviewPending: 0,
    } as never);
    vi.mocked(workbenchRecent).mockResolvedValue([] as never);
    vi.mocked(listCases).mockResolvedValue({ items: [], total: 0, page: 1, size: 50 } as never);
    render(wrap({ children: <LegalMindDashboard /> }));
    expect(await screen.findByText(/暂无在办案件/)).toBeTruthy();
    expect(screen.getByText('今日待办')).toBeTruthy();
  });
});
