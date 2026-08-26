/**
 * 质量关口与治理（GovernanceCenter）单测.
 *
 * 验证：治理台概览（待处理/敏感数据）、治理事项（分类/严重级别/状态）、
 * 六项底层能力 6 卡、数据密级 + 职业边界、不可变审计流、治理规则、合规声明。
 */
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GovernanceCenter from './GovernanceCenter';
import { governanceSummary } from '../../services/legal';

vi.mock('../../services/legal', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/legal');
  return { ...actual, governanceSummary: vi.fn() };
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
  vi.mocked(governanceSummary).mockResolvedValue({
    items: [
      {
        id: 1,
        tenantId: 1,
        title: '某股权纠纷案利益冲突结果',
        category: 'CONFLICT',
        severity: 'HIGH',
        status: 'PENDING',
        createdAt: '2026-08-25T00:00:00Z',
      },
      {
        id: 2,
        tenantId: 1,
        title: '发布内容含承诺用语',
        category: 'CONTENT',
        severity: 'MEDIUM',
        status: 'DONE',
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    openCount: 4,
    dataAccess: { approved: 23, pending: 2, blocked: 1 },
    auditEvents: [
      {
        id: 1,
        tenantId: 1,
        eventType: 'AI_CALL',
        content: '张律师 · L4 材料已脱敏',
        eventStatus: 'PASSED',
        actor: '张律师',
        occurredAt: '2026-08-25T23:06:18Z',
      },
      {
        id: 2,
        tenantId: 1,
        eventType: 'CONTENT_CHECK',
        content: '苏总监 · 检测结果承诺用语',
        eventStatus: 'BLOCKED',
        actor: '苏总监',
        occurredAt: '2026-08-25T22:16:49Z',
      },
    ],
    rules: [
      {
        id: 1,
        tenantId: 1,
        name: '外发前人工复核',
        description: 'L4 材料外发前必须人工复核',
        enabled: true,
        createdAt: '2026-08-25T00:00:00Z',
      },
    ],
    backbone: [
      {
        no: '01',
        name: '身份与授权',
        point: '可信身份—组织成员—案件职责三层分离',
        tag: 'SIWC · RBAC/ABAC',
      },
      {
        no: '02',
        name: '阶段状态机',
        point: '乐观锁、前置条件与不可变流转事件',
        tag: 'NO SILENT REWRITE',
      },
      {
        no: '03',
        name: '双外部空间',
        point: '客户正式版本与外部协作洁净空间独立',
        tag: 'AUDIENCE BOUND',
      },
      {
        no: '04',
        name: '六类专业流程',
        point: '策略/检索/文书/材料/沟通/工时分别建模',
        tag: 'DOMAIN SPECIFIC',
      },
      {
        no: '05',
        name: 'AI 治理网关',
        point: '模型注册、密级路由、引用核验、人工处置',
        tag: 'HUMAN IN CONTROL',
      },
      { no: '06', name: '验证与连续性', point: '权限矩阵、攻击测试、多端回归', tag: '120K+ CASES' },
    ],
    dataClasses: [
      { level: 'L1', name: '公开内容', desc: '可用于合规公开传播' },
      { level: 'L4', name: '客户秘密', desc: '私有模型优先/外发前人工复核' },
      { level: 'L5', name: '高度敏感', desc: '禁止外部模型' },
    ],
    boundaries: [
      'AI 不作最终法律判断：所有法律意见、策略与对外文本必须由有权律师复核确认',
      '运营人员不进入专业区：不可查看案件策略、证据分析、客户底线与文书草稿',
      '客户只看审核后内容：内部策略、风险研判、AI 内部分析及修改过程不可见',
      '未确认风险揭示不得签约：服务边界、第三方费用与不确定性必须清晰展示并留痕',
    ],
    allSystemsNormal: true,
  } as never);
});

describe('质量关口与治理', () => {
  it('治理台概览：待处理 / 敏感数据统计', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText('待处理治理事项')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('敏感数据已核验')).toBeTruthy();
    expect(screen.getByText('23')).toBeTruthy();
    expect(screen.getByText('敏感数据待审批')).toBeTruthy();
    expect(screen.getByText('发布内容已阻断')).toBeTruthy();
  });

  it('治理事项：分类/严重级别/状态 Tag', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText('某股权纠纷案利益冲突结果')).toBeTruthy();
    expect(screen.getByText('利益冲突')).toBeTruthy();
    expect(screen.getByText('内容审查')).toBeTruthy();
    expect(screen.getByText('待处理')).toBeTruthy();
    expect(screen.getByText('已完成')).toBeTruthy();
    expect(screen.getAllByText('高').length).toBeGreaterThan(0);
  });

  it('六项底层能力：6 卡 ACTIVE', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText(/V36 六项底层能力/)).toBeTruthy();
    expect(screen.getByText('身份与授权')).toBeTruthy();
    expect(screen.getByText('AI 治理网关')).toBeTruthy();
    expect(screen.getByText('SIWC · RBAC/ABAC')).toBeTruthy();
  });

  it('数据密级与职业边界', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText('数据密级与职业边界')).toBeTruthy();
    expect(screen.getByText('L4')).toBeTruthy();
    expect(screen.getByText('L5')).toBeTruthy();
    expect(screen.getByText('禁止外部模型')).toBeTruthy();
    expect(screen.getByText(/AI 不作最终法律判断/)).toBeTruthy();
  });

  it('不可变审计流 + 治理规则', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText('不可变审计（IMMUTABLE AUDIT · 实时事件流）')).toBeTruthy();
    expect(screen.getByText(/L4 材料已脱敏/)).toBeTruthy();
    expect(screen.getByText('PASSED')).toBeTruthy();
    expect(screen.getByText('BLOCKED')).toBeTruthy();
    expect(screen.getByText('治理规则')).toBeTruthy();
    expect(screen.getByText('外发前人工复核')).toBeTruthy();
  });

  it('合规声明展示', async () => {
    render(wrap({ children: <GovernanceCenter /> }));
    expect(await screen.findByText(/审计事件 append-only/)).toBeTruthy();
  });
});
