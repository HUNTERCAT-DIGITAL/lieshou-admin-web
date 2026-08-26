/**
 * 质量关口与治理（QUALITY · RISK · AUDIT 治理台 · 愿景附录九）.
 *
 * 治理事项 + 不可变审计事件流 + 治理规则 + 六项底层能力（V36 6/6 ACTIVE）+
 * 数据密级 L1-L5 + 不可逾越的职业边界。合规：审计事件 append-only 不可改删。
 */
import {
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import {
  appendAuditEvent,
  createGovernanceItem,
  createGovernanceRule,
  deleteGovernanceItem,
  deleteGovernanceRule,
  governanceSummary,
  transitionGovernanceItem,
  updateGovernanceRule,
} from '../../services/legal';
import {
  GOV_CATEGORY_META,
  GOV_CATEGORY_OPTIONS,
  GOV_SEVERITY_META,
  GOV_STATUS_META,
  type GovernanceItem,
  type GovernanceRule,
  type GovernanceSummary,
} from '../../types/legal';

const { Paragraph, Text } = Typography;

export default function GovernanceCenter() {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [itemModal, setItemModal] = useState(false);
  const [ruleModal, setRuleModal] = useState(false);
  const [auditModal, setAuditModal] = useState(false);
  const [itemForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [auditForm] = Form.useForm();

  const load = useCallback(async () => {
    try {
      setSummary(await governanceSummary());
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const transition = async (i: GovernanceItem, target: 'IN_PROGRESS' | 'DONE') => {
    try {
      await transitionGovernanceItem(i.id, target);
      message.success(target === 'DONE' ? '已办结' : '已开始处理');
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const removeItem = async (i: GovernanceItem) => {
    try {
      await deleteGovernanceItem(i.id);
      message.success('已删除');
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitItem = async () => {
    const v = await itemForm.validateFields();
    try {
      await createGovernanceItem(v);
      message.success('已新增治理事项');
      setItemModal(false);
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitRule = async () => {
    const v = await ruleForm.validateFields();
    try {
      await createGovernanceRule({ ...v, enabled: String(v.enabled ?? true) });
      message.success('已新建规则');
      setRuleModal(false);
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const toggleRule = async (r: GovernanceRule) => {
    try {
      await updateGovernanceRule(r.id, { enabled: String(!r.enabled) });
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const submitAudit = async () => {
    const v = await auditForm.validateFields();
    try {
      await appendAuditEvent(v);
      message.success('已追加审计事件');
      setAuditModal(false);
      await load();
    } catch (e) {
      handleError(e);
    }
  };

  const items = summary?.items ?? [];
  const auditEvents = summary?.auditEvents ?? [];
  const rules = summary?.rules ?? [];
  const dataAccess = summary?.dataAccess ?? { approved: 0, pending: 0, blocked: 0 };

  return (
    <PageContainer
      title="质量关口与治理"
      subTitle="QUALITY · RISK · AUDIT · ALL SYSTEMS NORMAL"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => void load()}>
          刷新
        </Button>,
        <Button
          key="audit"
          icon={<SafetyCertificateOutlined />}
          onClick={() => setAuditModal(true)}
        >
          追加审计事件
        </Button>,
        <Button
          key="item"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setItemModal(true)}
        >
          新建治理事项
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 治理台概览 */}
        <ProCard split="vertical" bordered>
          <Statistic
            title="待处理治理事项"
            value={summary?.openCount ?? 0}
            suffix="项"
            valueStyle={{ color: (summary?.openCount ?? 0) > 0 ? '#fa8c16' : '#52c41a' }}
          />
          <Statistic
            title="敏感数据已核验"
            value={dataAccess.approved}
            suffix="次"
            valueStyle={{ color: '#52c41a' }}
          />
          <Statistic
            title="敏感数据待审批"
            value={dataAccess.pending}
            valueStyle={{ color: dataAccess.pending > 0 ? '#fa8c16' : undefined }}
          />
          <Statistic
            title="发布内容已阻断"
            value={dataAccess.blocked}
            valueStyle={{ color: dataAccess.blocked > 0 ? '#ff4d4f' : undefined }}
          />
        </ProCard>

        {/* 治理事项 */}
        <ProCard
          title="治理事项（QUALITY · RISK）"
          bordered
          extra={
            <Button size="small" icon={<PlusOutlined />} onClick={() => setItemModal(true)}>
              新建
            </Button>
          }
        >
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {items.length === 0 && <Text type="secondary">暂无治理事项</Text>}
            {items.map((i) => (
              <div
                key={i.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  background: i.status === 'DONE' ? '#f6ffed' : undefined,
                }}
              >
                <Tag
                  color={GOV_SEVERITY_META[i.severity].color}
                  style={{ width: 36, textAlign: 'center' }}
                >
                  {GOV_SEVERITY_META[i.severity].text}
                </Tag>
                <Tag
                  color={GOV_CATEGORY_META[i.category].color}
                  style={{ width: 84, textAlign: 'center' }}
                >
                  {GOV_CATEGORY_META[i.category].text}
                </Tag>
                <Text style={{ flex: 1 }} delete={i.status === 'DONE'}>
                  {i.title}
                </Text>
                {i.note && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {i.note}
                  </Text>
                )}
                <Tag color={GOV_STATUS_META[i.status].color}>{GOV_STATUS_META[i.status].text}</Tag>
                {i.status === 'PENDING' && (
                  <Button size="small" onClick={() => void transition(i, 'IN_PROGRESS')}>
                    处理中
                  </Button>
                )}
                {i.status !== 'DONE' && (
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<CheckCircleOutlined />}
                    onClick={() => void transition(i, 'DONE')}
                  >
                    办结
                  </Button>
                )}
                <Popconfirm title={`删除事项「${i.title}」？`} onConfirm={() => void removeItem(i)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ))}
          </Space>
        </ProCard>

        {/* 六项底层能力 + 密级与边界 */}
        <ProCard gutter={12} bordered>
          <ProCard title="TRUSTED BACKBONE · V36 六项底层能力（6/6 ACTIVE）" colSpan="55%">
            <Space wrap size="middle">
              {(summary?.backbone ?? []).map((b) => (
                <ProCard key={b.no} size="small" bordered style={{ width: 240 }}>
                  <Space>
                    <Tag color="green">{b.no}</Tag>
                    <Text strong>{b.name}</Text>
                  </Space>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {b.point}
                    </Text>
                  </div>
                  <Tag color="blue" style={{ marginTop: 4 }}>
                    {b.tag}
                  </Tag>
                </ProCard>
              ))}
            </Space>
          </ProCard>
          <ProCard title="数据密级与职业边界" colSpan="45%">
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {(summary?.dataClasses ?? []).map((d) => (
                <div key={d.level} style={{ display: 'flex', gap: 8 }}>
                  <Tag
                    color={
                      d.level === 'L5'
                        ? 'red'
                        : d.level === 'L4'
                          ? 'volcano'
                          : d.level === 'L3'
                            ? 'cyan'
                            : d.level === 'L2'
                              ? 'blue'
                              : 'default'
                    }
                  >
                    {d.level}
                  </Tag>
                  <Text style={{ width: 80 }}>{d.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {d.desc}
                  </Text>
                </div>
              ))}
              <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                不可逾越的职业边界：
              </Paragraph>
              {(summary?.boundaries ?? []).map((b, i) => (
                <Text key={i} type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {i + 1}. {b}
                </Text>
              ))}
            </Space>
          </ProCard>
        </ProCard>

        {/* 不可变审计 + 治理规则 */}
        <ProCard gutter={12} bordered>
          <ProCard
            title="不可变审计（IMMUTABLE AUDIT · 实时事件流）"
            colSpan="55%"
            extra={
              <Button size="small" icon={<PlusOutlined />} onClick={() => setAuditModal(true)}>
                追加
              </Button>
            }
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {auditEvents.length === 0 && <Text type="secondary">暂无审计事件</Text>}
              {auditEvents.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, width: 56 }}>
                    {e.occurredAt?.slice(11, 19) ?? '--:--:--'}
                  </Text>
                  <Tag style={{ width: 84, textAlign: 'center' }}>{e.eventType}</Tag>
                  <Text style={{ flex: 1, fontSize: 13 }}>{e.content}</Text>
                  {e.actor && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {e.actor}
                    </Text>
                  )}
                  <Tag
                    color={
                      e.eventStatus === 'PASSED' ||
                      e.eventStatus === 'SENT' ||
                      e.eventStatus === 'SIGNED' ||
                      e.eventStatus === 'APPROVED'
                        ? 'green'
                        : e.eventStatus === 'BLOCKED'
                          ? 'red'
                          : 'orange'
                    }
                  >
                    {e.eventStatus}
                  </Tag>
                </div>
              ))}
            </Space>
          </ProCard>
          <ProCard
            title="治理规则"
            colSpan="45%"
            extra={
              <Button size="small" icon={<PlusOutlined />} onClick={() => setRuleModal(true)}>
                新建规则
              </Button>
            }
          >
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {rules.length === 0 && <Text type="secondary">暂无规则</Text>}
              {rules.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={r.enabled} onChange={() => void toggleRule(r)} />
                  <Text style={{ flex: 1 }}>{r.name}</Text>
                  {r.description && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {r.description}
                    </Text>
                  )}
                  <Popconfirm
                    title={`删除规则「${r.name}」？`}
                    onConfirm={() =>
                      void deleteGovernanceRule(r.id).then(() => {
                        message.success('已删除');
                        void load();
                      })
                    }
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              ))}
            </Space>
          </ProCard>
        </ProCard>

        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          合规：AI 输出需人工复核；审计事件
          append-only（不可修改/删除）；敏感数据调用与发布内容全程留痕。
        </Paragraph>
      </Space>

      {/* 事项 Modal */}
      <Modal
        title="新建治理事项"
        open={itemModal}
        onOk={() => void submitItem()}
        onCancel={() => setItemModal(false)}
        destroyOnClose
      >
        <Form
          form={itemForm}
          layout="vertical"
          initialValues={{ category: 'COMPLIANCE', severity: 'MEDIUM' }}
        >
          <Form.Item
            name="title"
            label="事项"
            rules={[{ required: true, message: '请输入事项内容' }]}
          >
            <Input maxLength={200} placeholder="如：某股权纠纷案利益冲突结果" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="category" label="分类">
              <Select style={{ width: 180 }} options={GOV_CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item name="severity" label="严重级别">
              <Select
                style={{ width: 140 }}
                options={(['HIGH', 'MEDIUM', 'LOW'] as const).map((s) => ({
                  value: s,
                  label: GOV_SEVERITY_META[s].text,
                }))}
              />
            </Form.Item>
          </Space>
          <Form.Item name="note" label="备注">
            <Input.TextArea maxLength={500} rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则 Modal */}
      <Modal
        title="新建治理规则"
        open={ruleModal}
        onOk={() => void submitRule()}
        onCancel={() => setRuleModal(false)}
        destroyOnClose
      >
        <Form form={ruleForm} layout="vertical" initialValues={{ enabled: true }}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input maxLength={100} placeholder="如：外发前人工复核" />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea maxLength={500} rows={2} placeholder="如：L4 材料外发前必须人工复核" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审计 Modal */}
      <Modal
        title="追加审计事件（append-only）"
        open={auditModal}
        onOk={() => void submitAudit()}
        onCancel={() => setAuditModal(false)}
        destroyOnClose
      >
        <Form form={auditForm} layout="vertical">
          <Form.Item
            name="eventType"
            label="事件类型"
            rules={[{ required: true, message: '请输入事件类型' }]}
          >
            <Select
              options={[
                'AI_CALL',
                'REVIEW',
                'CUSTOMER_MSG',
                'CONTENT_CHECK',
                'PERMISSION_REQUEST',
                'DATA_ACCESS',
              ].map((t) => ({ value: t, label: t }))}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input maxLength={300} placeholder="如：张律师 · L4 材料已脱敏" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="eventStatus" label="状态" rules={[{ required: true }]}>
              <Select
                style={{ width: 160 }}
                options={['PASSED', 'SIGNED', 'SENT', 'BLOCKED', 'PENDING', 'APPROVED'].map(
                  (s) => ({ value: s, label: s }),
                )}
              />
            </Form.Item>
            <Form.Item name="actor" label="操作人">
              <Input maxLength={64} placeholder="如：张律师" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </PageContainer>
  );
}
