/**
 * 案件作战室（MatterRoom · V35 程序树）单测.
 *
 * 验证：八阶段程序树状态计算（已封版/当前/未到达）、当前阶段摘要、推进按钮触发后端调用。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MatterRoom from './MatterRoom';
import { CASE_STAGE_FLOW, stageIndex, type LegalCase } from '@lieshoucloud/types/business/legal';
import { updateCase } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, updateCase: vi.fn() };
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>{children}</AntdApp>
  </ConfigProvider>
);

function makeCase(overrides: Partial<LegalCase> = {}): LegalCase {
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
    createdAt: '2026-08-25T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('案件作战室 · 程序树', () => {
  it('八阶段流程常量完整（01-08 · V35 主责角色）', () => {
    expect(CASE_STAGE_FLOW).toHaveLength(8);
    expect(CASE_STAGE_FLOW[0]).toMatchObject({ no: '01', key: 'CLIENT_MEETING', role: '案源律师' });
    expect(CASE_STAGE_FLOW[3]).toMatchObject({ no: '04', key: 'STRATEGY_REPORT', role: '主办律师' });
    expect(CASE_STAGE_FLOW[7]).toMatchObject({ no: '08', key: 'FINAL_OUTCOME' });
  });

  it('stageIndex 正确返回流程序号', () => {
    expect(stageIndex('CLIENT_MEETING')).toBe(0);
    expect(stageIndex('STRATEGY_REPORT')).toBe(3);
    expect(stageIndex('FINAL_OUTCOME')).toBe(7);
  });

  it('渲染当前阶段摘要（阶段序号 + 进度 + 主责）', () => {
    render(wrap({ children: <MatterRoom detail={makeCase()} onChanged={() => undefined} /> }));
    expect(screen.getByText('当前阶段 · 04')).toBeTruthy();
    expect(screen.getAllByText(/73%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/主责：主办律师/).length).toBeGreaterThan(0);
  });

  it('程序树状态：当前阶段之前的显示已封版，当前显示进行中，之后显示未到达', () => {
    render(wrap({ children: <MatterRoom detail={makeCase()} onChanged={() => undefined} /> }));
    // 04 策略分析报告 = 当前
    expect(screen.getByText('进行中 73%')).toBeTruthy();
    // 01-03 已封版（3 个）
    expect(screen.getAllByText('已封版')).toHaveLength(3);
    // 05-08 未到达（4 个）
    expect(screen.getAllByText('未到达')).toHaveLength(4);
  });

  it('点击"推进到下一阶段"调用 updateCase 传下一阶段（05 客户服务方案）', () => {
    const onChanged = vi.fn();
    const mocked = vi.mocked(updateCase);
    mocked.mockResolvedValue(makeCase() as never);
    render(wrap({ children: <MatterRoom detail={makeCase()} onChanged={onChanged} /> }));
    fireEvent.click(screen.getByText('推进到下一阶段'));
    fireEvent.click(screen.getByText('OK'));
    expect(mocked).toHaveBeenCalledWith(1, {
      caseNo: '(2026)赣01民初5678号',
      title: '宏远科技股权回购争议',
      stage: 'CLIENT_PLAN',
    });
  });
});
