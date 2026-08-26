/**
 * 组织赋能驾驶舱（ENABLEMENT · 愿景附录三 · 管理合伙人组织视角）.
 *
 * 组织今日（支持信号 + 待安排）+ 组织看板 + 团队成长与负荷 + 律时建议/管理帮助
 * + 职业里程碑。合规：组织信息均由相关成员确认；管理决策参考受控隐藏。
 */
import {
  CheckCircleOutlined,
  CrownOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import {
  completeOrgAction,
  createMilestone,
  createOrgAction,
  createTeamMember,
  deleteTeamMember,
  enablementSummary,
  updateOrgSignal,
  updateTeamMember,
} from '../../services/legal';
import {
  ORG_ACTION_META,
  ORG_BOARD_META,
  ORG_SIGNAL_META,
  type EnablementSummary,
  type OrgAction,
  type OrgSignal,
  type OrgSignalType,
  type TeamMember,
} from '@lieshoucloud/types/business/legal';

const { Paragraph, Text } = Typography;

const SIGNAL_ORDER: OrgSignalType[] = [
  'LOAD',
  'REVIEW_BACKLOG',
  'GROWTH_OPPORTUNITY',
  'CLIENT_SUPPORT',
];

export default function EnablementCenter() {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [summary, setSummary] = useState<EnablementSummary | null>(null);
  const [memberModal, setMemberModal] = useState<{ open: boolean; editing?: TeamMember }>({
    open: false,
  });
  const [actionModal, setActionModal] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [memberForm] = Form.useForm();
  const [actionForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();

  const load = useCallback(async () => {
    try {
      setSummary(await enablementSummary());
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const completeAction = async (a: OrgAction) => {
    try {
      await completeOrgAction(a.id);
      message.success('已标记完成');
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const disposeSignal = async (s: OrgSignal, status: string) => {
    try {
      await updateOrgSignal(s.id, { status });
      message.success(status === 'DONE' ? '已处置' : '已开始处理');
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitMember = async () => {
    const v = await memberForm.validateFields();
    const body: Record<string, string> = {
      name: v.name,
      role: v.role,
      loadPercent: String(v.loadPercent ?? 70),
      growthScore: String(v.growthScore ?? 80),
      growthDelta: String(v.growthDelta ?? 0),
      opportunity: v.opportunity,
    };
    try {
      if (memberModal.editing) {
        await updateTeamMember(memberModal.editing.id, body);
        message.success('已保存成员');
      } else {
        await createTeamMember(body);
        message.success('已新增成员');
      }
      setMemberModal({ open: false });
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitAction = async () => {
    const v = await actionForm.validateFields();
    try {
      await createOrgAction(v);
      message.success('已新增安排');
      setActionModal(false);
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitMilestone = async () => {
    const v = await milestoneForm.validateFields();
    const body: Record<string, string> = {
      goal: v.goal,
      readiness: String(v.readiness ?? 0),
      advice: v.advice,
    };
    try {
      await createMilestone(body);
      message.success('已新增里程碑');
      setMilestoneModal(false);
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const signals = summary?.signals ?? [];
  const boards = summary?.boards ?? [];
  const members = summary?.members ?? [];
  const actions = summary?.actions ?? [];
  const milestones = summary?.milestones ?? [];

  return (
    <PageContainer
      title="组织赋能驾驶舱"
      subTitle="ENABLEMENT · 管理合伙人组织视角 · 先调负荷，再配机会"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => void load()}>
          刷新
        </Button>,
        <Button key="milestone" icon={<CrownOutlined />} onClick={() => setMilestoneModal(true)}>
          新增里程碑
        </Button>,
        <Button
          key="action"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setActionModal(true)}
        >
          新增安排
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 组织今日 */}
        <ProCard split="vertical" bordered>
          <Statistic
            title="今日支持信号"
            value={summary?.pendingSignals ?? 0}
            suffix="项"
            valueStyle={{ color: (summary?.pendingSignals ?? 0) > 0 ? '#fa8c16' : '#52c41a' }}
          />
          <Statistic title="待安排事项" value={summary?.pendingActions ?? 0} suffix="项" />
          <Statistic
            title="今日建议"
            value={
              actions.find((a) => a.actionType === 'SUGGESTION' && a.status === 'PENDING')?.title ??
              '全部已完成'
            }
            valueStyle={{ fontSize: 16 }}
          />
          <Statistic
            title="底层能力"
            value={summary?.backboneActive ?? 6}
            suffix="/ 6 ACTIVE"
            valueStyle={{ color: '#52c41a' }}
          />
        </ProCard>

        {/* 支持信号 */}
        <ProCard title="今日 · 团队支持信号（TEAM SUPPORT）" bordered>
          <Space wrap size="middle">
            {SIGNAL_ORDER.map((t) => {
              const s = signals.find((x) => x.signalType === t);
              const meta = ORG_SIGNAL_META[t];
              return (
                <ProCard
                  key={t}
                  size="small"
                  bordered
                  style={{ width: 260, borderColor: s?.status === 'DONE' ? '#d9f7be' : undefined }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      <Text>{meta.icon}</Text>
                      <Text strong>{meta.text}</Text>
                      <Tag color={meta.color}>{s?.countValue ?? 0}</Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {s?.label ?? '暂无信号'}
                    </Text>
                    {s?.disposition && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        处置：{s.disposition}
                      </Text>
                    )}
                    {s && s.status !== 'DONE' && (
                      <Space>
                        <Button size="small" onClick={() => void disposeSignal(s, 'IN_PROGRESS')}>
                          处理中
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          ghost
                          onClick={() => void disposeSignal(s, 'DONE')}
                        >
                          完成处置
                        </Button>
                      </Space>
                    )}
                    {s?.status === 'DONE' && <Tag color="success">已处置</Tag>}
                  </Space>
                </ProCard>
              );
            })}
          </Space>
        </ProCard>

        {/* 组织看板 + 职业里程碑 */}
        <ProCard gutter={12} bordered>
          <ProCard title="组织看板" colSpan="60%">
            <Space wrap size="middle">
              {boards.map((b) => (
                <ProCard key={b.id} size="small" bordered style={{ width: 200 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {ORG_BOARD_META[b.boardKey]?.text ?? b.boardKey}
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {b.metricValue}
                    </Text>
                    <Text type="secondary" style={{ marginLeft: 6 }}>
                      {b.metricLabel}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {b.detail}
                  </Text>
                </ProCard>
              ))}
            </Space>
          </ProCard>
          <ProCard title="职业里程碑准备度" colSpan="40%">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {milestones.length === 0 && <Text type="secondary">暂无里程碑</Text>}
              {milestones.map((m) => (
                <div key={m.id}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>{m.goal}</Text>
                    <Text strong>{m.readiness}%</Text>
                  </Space>
                  <Progress percent={m.readiness} size="small" />
                  {m.advice && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {m.advice}
                    </Text>
                  )}
                </div>
              ))}
            </Space>
          </ProCard>
        </ProCard>

        {/* 团队成长与负荷 */}
        <ProCard
          title="团队成长与工作负荷（TEAM GROWTH MAP）"
          bordered
          extra={
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setMemberModal({ open: true })}
            >
              新增成员
            </Button>
          }
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {members.length === 0 && <Text type="secondary">暂无成员数据</Text>}
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text strong style={{ width: 72 }}>
                  {m.name}
                </Text>
                <Tag style={{ width: 90, textAlign: 'center' }}>{m.role}</Tag>
                <div style={{ flex: 1 }}>
                  <Space style={{ width: '100%' }}>
                    <Text type="secondary" style={{ width: 60 }}>
                      负荷
                    </Text>
                    <Progress
                      percent={m.loadPercent}
                      size="small"
                      strokeColor={
                        m.loadPercent >= 90
                          ? '#ff4d4f'
                          : m.loadPercent >= 80
                            ? '#fa8c16'
                            : '#1677ff'
                      }
                      style={{ flex: 1 }}
                    />
                  </Space>
                </div>
                <Tag
                  color={m.loadPercent >= 90 ? 'red' : m.loadPercent >= 80 ? 'orange' : 'green'}
                  style={{ width: 70, textAlign: 'center' }}
                >
                  {m.loadPercent}%
                </Tag>
                <Text strong style={{ width: 80, textAlign: 'right' }}>
                  {m.growthScore}
                  {m.growthDelta > 0 && <Text type="success"> ↑+{m.growthDelta}</Text>}
                </Text>
                {m.opportunity && (
                  <Text type="secondary" style={{ flex: 1 }}>
                    {m.opportunity}
                  </Text>
                )}
                <Button
                  size="small"
                  onClick={() => {
                    memberForm.setFieldsValue({
                      name: m.name,
                      role: m.role,
                      loadPercent: m.loadPercent,
                      growthScore: m.growthScore,
                      growthDelta: m.growthDelta,
                      opportunity: m.opportunity ?? undefined,
                    });
                    setMemberModal({ open: true, editing: m });
                  }}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    void deleteTeamMember(m.id)
                      .then(() => {
                        message.success('已删除');
                        void load();
                      })
                      .catch(handleError);
                  }}
                >
                  删除
                </Button>
              </div>
            ))}
          </Space>
        </ProCard>

        {/* 律时建议安排 + 管理帮助 */}
        <ProCard
          title="律时建议安排与管理帮助（MANAGER ASSISTANCE）"
          bordered
          extra={
            <Button size="small" icon={<PlusOutlined />} onClick={() => setActionModal(true)}>
              新增
            </Button>
          }
        >
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {actions.length === 0 && <Text type="secondary">暂无建议/帮助事项</Text>}
            {actions.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  background: a.status === 'DONE' ? '#f6ffed' : undefined,
                }}
              >
                <Tag
                  color={ORG_ACTION_META[a.actionType].color}
                  style={{ width: 70, textAlign: 'center' }}
                >
                  {ORG_ACTION_META[a.actionType].text}
                </Tag>
                <Text style={{ flex: 1 }} delete={a.status === 'DONE'}>
                  {a.title}
                </Text>
                {a.detail && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {a.detail}
                  </Text>
                )}
                {a.owner && <Tag>{a.owner}</Tag>}
                {a.status === 'PENDING' ? (
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<CheckCircleOutlined />}
                    onClick={() => void completeAction(a)}
                  >
                    完成
                  </Button>
                ) : (
                  <Tag color="success">已完成</Tag>
                )}
              </div>
            ))}
          </Space>
        </ProCard>

        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          合规：以上组织信息均由相关成员确认；查看原始工作记录需先核对管理职责和事项范围；
          管理决策参考受控隐藏（仅管理合伙人、人力资源负责人及本人在规定周期、规定目的下可见）。
        </Paragraph>
      </Space>

      {/* 成员 Modal */}
      <Modal
        title={memberModal.editing ? `编辑成员 · ${memberModal.editing.name}` : '新增成员'}
        open={memberModal.open}
        onOk={() => void submitMember()}
        onCancel={() => setMemberModal({ open: false })}
        destroyOnClose
      >
        <Form
          form={memberForm}
          layout="vertical"
          initialValues={{ loadPercent: 70, growthScore: 80, growthDelta: 0 }}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input maxLength={64} placeholder="如：林助理" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请输入角色' }]}>
            <Select
              options={['案源律师', '主办律师', '协办律师', '助理律师', '法律秘书'].map((r) => ({
                value: r,
                label: r,
              }))}
            />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="loadPercent" label="负荷 %">
              <InputNumber min={0} max={100} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="growthScore" label="成长评分">
              <InputNumber min={0} max={100} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="growthDelta" label="↑变化">
              <InputNumber style={{ width: 100 }} />
            </Form.Item>
          </Space>
          <Form.Item name="opportunity" label="成长机会">
            <Input maxLength={200} placeholder="如：安排策略表达共创" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 安排 Modal */}
      <Modal
        title="新增建议/帮助"
        open={actionModal}
        onOk={() => void submitAction()}
        onCancel={() => setActionModal(false)}
        destroyOnClose
      >
        <Form form={actionForm} layout="vertical" initialValues={{ actionType: 'SUGGESTION' }}>
          <Form.Item name="actionType" label="类型" rules={[{ required: true }]}>
            <Select
              options={(Object.keys(ORG_ACTION_META) as (keyof typeof ORG_ACTION_META)[]).map(
                (t) => ({
                  value: t,
                  label: ORG_ACTION_META[t].text,
                }),
              )}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="内容"
            rules={[{ required: true, message: '请输入安排内容' }]}
          >
            <Input maxLength={200} placeholder="如：先调负荷，再配机会" />
          </Form.Item>
          <Form.Item name="detail" label="说明">
            <Input.TextArea maxLength={500} rows={2} />
          </Form.Item>
          <Form.Item name="owner" label="负责人">
            <Input maxLength={64} placeholder="如：管理合伙人" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 里程碑 Modal */}
      <Modal
        title="新增职业里程碑"
        open={milestoneModal}
        onOk={() => void submitMilestone()}
        onCancel={() => setMilestoneModal(false)}
        destroyOnClose
      >
        <Form form={milestoneForm} layout="vertical" initialValues={{ readiness: 0 }}>
          <Form.Item name="goal" label="目标" rules={[{ required: true, message: '请输入目标' }]}>
            <Input maxLength={64} placeholder="如：主办律师" />
          </Form.Item>
          <Form.Item name="readiness" label="准备度 %" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="advice" label="建议">
            <Input maxLength={300} placeholder="如：配置共同主办机会" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
