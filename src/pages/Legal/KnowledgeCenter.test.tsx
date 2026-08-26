/**
 * 知识资产中心（KnowledgeCenter）单测.
 *
 * 验证：知识卡列表渲染（类型/状态 Tag + 内部受限 + 复用次数）、过滤、状态流转按钮、
 * 空态降级。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import KnowledgeCenter from './KnowledgeCenter';
import { knowledgeSummary, listKnowledgeCards } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, listKnowledgeCards: vi.fn(), knowledgeSummary: vi.fn() };
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
  vi.mocked(knowledgeSummary).mockResolvedValue({
    total: 1286,
    candidateCount: 28,
    reviewPendingCount: 2,
  } as never);
  vi.mocked(listKnowledgeCards).mockResolvedValue({
    items: [
      {
        id: 1,
        tenantId: 1,
        cardType: 'RULE',
        title: '资本维持原则与回购条款效力',
        content: '…',
        status: 'PUBLISHED',
        confidential: false,
        usageCount: 42,
        createdAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        cardType: 'LESSON',
        title: '高关注事项的阶段复核缺口',
        status: 'PENDING_REVIEW',
        confidential: true,
        usageCount: 0,
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    size: 20,
  } as never);
});

describe('知识资产中心', () => {
  it('总览统计：知识卡总量 / 候选待复核 / 待专业复核', async () => {
    render(wrap({ children: <KnowledgeCenter /> }));
    expect(await screen.findByText('知识卡总量')).toBeTruthy();
    // antd Statistic 千分位格式化：1286 → 1,286
    expect(await screen.findByText('1,286')).toBeTruthy();
    expect(screen.getAllByText('28').length).toBeGreaterThan(0);
  });

  it('知识卡列表：类型 Tag + 状态 + 内部受限 + 复用次数', async () => {
    render(wrap({ children: <KnowledgeCenter /> }));
    expect(await screen.findByText('资本维持原则与回购条款效力')).toBeTruthy();
    expect(screen.getByText('裁判规则')).toBeTruthy();
    expect(screen.getByText('可复用')).toBeTruthy();
    expect(screen.getByText('复用 42 次')).toBeTruthy();
    // 失败教训卡：内部受限 + 待复核
    expect(screen.getByText('失败教训')).toBeTruthy();
    expect(screen.getByText('内部受限')).toBeTruthy();
    expect(screen.getByText('待复核')).toBeTruthy();
  });

  it('状态流转按钮：待复核卡显示「通过复核」', async () => {
    render(wrap({ children: <KnowledgeCenter /> }));
    await screen.findByText('资本维持原则与回购条款效力');
    expect(screen.getByText('通过复核')).toBeTruthy();
  });

  it('无数据时降级：显示空态文案', async () => {
    vi.mocked(listKnowledgeCards).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 20,
    } as never);
    render(wrap({ children: <KnowledgeCenter /> }));
    expect(await screen.findByText(/暂无知识卡/)).toBeTruthy();
  });
});
