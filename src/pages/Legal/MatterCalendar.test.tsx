/**
 * 任务与日程（MatterCalendar）单测.
 *
 * 验证：本周期统计卡、冲突提示、未来日程按日分组（类型/职责 Tag + 案件编号）、
 * 今日 NEXT ACTIONS、按案件投入分布。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MatterCalendar from './MatterCalendar';
import { listSchedules, matterCalendarSummary } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, listSchedules: vi.fn(), matterCalendarSummary: vi.fn(), listCases: vi.fn() };
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(matterCalendarSummary).mockResolvedValue({
    workCount: 9,
    estimatedMinutes: 28.6 * 60,
    meetingCount: 2,
    pendingConfirm: 1,
    conflicts: [
      {
        date: tomorrow,
        a: {
          id: 1,
          tenantId: 1,
          title: '客户阶段沟通',
          scheduleDate: tomorrow,
          startMinute: 930,
          durationMinutes: 60,
          scheduleType: 'CLIENT_MEETING',
          responsibility: 'PRIMARY',
          confirmed: true,
          createdAt: '2026-08-25T00:00:00Z',
        },
        b: {
          id: 2,
          tenantId: 1,
          title: '策略报告内部复核',
          scheduleDate: tomorrow,
          startMinute: 960,
          durationMinutes: 45,
          scheduleType: 'REVIEW',
          responsibility: 'REVIEW',
          confirmed: false,
          createdAt: '2026-08-25T00:00:00Z',
        },
        overlapMinutes: 30,
      },
    ],
    capacity: {
      '11': {
        caseId: 11,
        matterNo: 'MAT-2026-0087',
        caseTitle: '宏远科技股权回购争议',
        minutes: 510,
      },
      '12': {
        caseId: 12,
        matterNo: 'MAT-2026-0091',
        caseTitle: '智启能源数据资产合规治理专项',
        minutes: 360,
      },
    },
  } as never);
  vi.mocked(listSchedules).mockResolvedValue({
    from: today,
    to: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    items: [
      {
        id: 1,
        tenantId: 1,
        title: '今日 16:00 前审定策略分析报告 V2',
        scheduleDate: today,
        startMinute: 570,
        durationMinutes: 90,
        scheduleType: 'NODE_TASK',
        responsibility: 'PRIMARY',
        confirmed: true,
        createdAt: '2026-08-25T00:00:00Z',
        caseMatterNo: 'MAT-2026-0087',
        caseTitle: '宏远科技股权回购争议',
      },
      {
        id: 2,
        tenantId: 1,
        title: '策略报告内部复核',
        scheduleDate: tomorrow,
        startMinute: 960,
        durationMinutes: 45,
        scheduleType: 'REVIEW',
        responsibility: 'REVIEW',
        confirmed: false,
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
  } as never);
});

describe('任务与日程', () => {
  it('本周期统计卡：工作项 / 预计工时 / 会议 / 待确认变动', async () => {
    render(wrap({ children: <MatterCalendar /> }));
    expect(await screen.findByText('本周期工作')).toBeTruthy();
    expect(screen.getByText('9')).toBeTruthy();
    expect(screen.getByText('预计专业工时')).toBeTruthy();
    // antd Statistic 拆分整数/小数 → 断言整数部分
    expect(screen.getByText('28')).toBeTruthy();
    expect(screen.getByText('客户与团队会议')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('待确认变动')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('冲突提示：重叠分钟数展示', async () => {
    render(wrap({ children: <MatterCalendar /> }));
    expect(await screen.findByText(/发现 1 处时间冲突/)).toBeTruthy();
    expect(screen.getByText(/重叠 30 分钟/)).toBeTruthy();
  });

  it('未来日程按日分组：时间 + 类型/职责 Tag + 案件编号 + 待确认标记', async () => {
    render(wrap({ children: <MatterCalendar /> }));
    // 今日日程同时出现在日历视图与 NEXT ACTIONS → 用 getAllByText
    expect((await screen.findAllByText('今日 16:00 前审定策略分析报告 V2')).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('09:30').length).toBeGreaterThan(0);
    // 类型/职责 Tag 同时出现在日历视图与 NEXT ACTIONS
    expect(screen.getAllByText('节点任务').length).toBeGreaterThan(0);
    expect(screen.getAllByText('主责').length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/MAT-2026-0087/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('专业复核').length).toBeGreaterThan(0);
    expect(screen.getAllByText('待确认').length).toBeGreaterThan(0);
  });

  it('今日 NEXT ACTIONS：显示今日日程', async () => {
    render(wrap({ children: <MatterCalendar /> }));
    expect(await screen.findByText('接下来（今日 · 自动更新）')).toBeTruthy();
    expect(screen.getAllByText('今日 16:00 前审定策略分析报告 V2').length).toBeGreaterThan(0);
  });

  it('本周期工作分布：按案件投入（h）', async () => {
    render(wrap({ children: <MatterCalendar /> }));
    expect(await screen.findByText('本周期工作分布（按案件）')).toBeTruthy();
    expect(screen.getByText(/宏远科技股权回购争议/)).toBeTruthy();
    // Text 内「8.5」+「h」为相邻文本节点 → 断言合并文本
    expect(screen.getByText('8.5h')).toBeTruthy();
    expect(screen.getByText('6.0h')).toBeTruthy();
  });
});
