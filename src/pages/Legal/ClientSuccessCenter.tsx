/**
 * 客户成功中心（CLIENT SUCCESS CENTER · 愿景附录四）.
 *
 * 客户组合与健康预警：组合健康度（HEALTH MODEL 四维）+ 生命周期漏斗 + 客户价值记录
 * + 客户组合表（健康分/关注状态）。
 * 合规：情绪稳定维度仅用于服务升级提示，不用于不利决策或自动拒绝服务（底部声明）。
 */
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import { usePaged } from '../../hooks/usePaged';
import {
  clientSuccessSummary,
  confirmClientValue,
  createClient,
  createClientValue,
  deleteClient,
  listClientValues,
  listClients,
  updateClient,
} from '../../services/legal';
import {
  CLIENT_STAGE_META,
  CLIENT_STAGE_OPTIONS,
  CLIENT_STATUS_META,
  CLIENT_STATUS_OPTIONS,
  CLIENT_VALUE_META,
  healthTone,
  type ClientRequest,
  type ClientSuccessSummary,
  type ClientValueRecord,
  type ClientValueType,
  type LegalClient,
} from '@lieshoucloud/types/business/legal';

const { Paragraph, Text } = Typography;

/** 漏斗顺序（愿景 CLIENT LIFECYCLE） */
const FUNNEL_ORDER: (keyof ClientSuccessSummary['funnel'])[] = [
  'VISITOR',
  'LEAD',
  'TRIAGE',
  'DIAGNOSIS',
  'PRODUCT',
  'ENGAGED',
  'SERVING',
  'CLOSED',
  'REPEAT',
  'REFERRAL',
];

const HEALTH_DIMS: {
  key: keyof ClientSuccessSummary['healthDimensions'];
  label: string;
  color: string;
}[] = [
  { key: 'response', label: '响应时效', color: '#1677ff' },
  { key: 'communication', label: '沟通频率', color: '#722ed1' },
  { key: 'todo', label: '待办完成', color: '#13c2c2' },
  { key: 'stability', label: '情绪稳定', color: '#fa8c16' },
];

export default function ClientSuccessCenter() {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [summary, setSummary] = useState<ClientSuccessSummary | null>(null);
  const [stage, setStage] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing?: LegalClient }>({ open: false });
  const [valuesOpen, setValuesOpen] = useState(false);
  const [valuesClient, setValuesClient] = useState<LegalClient | null>(null);
  const [values, setValues] = useState<ClientValueRecord[]>([]);
  const [form] = Form.useForm<ClientRequest>();
  const [valueForm] = Form.useForm<{ valueType: ClientValueType; description: string }>();

  const paged = usePaged<LegalClient>((page, size) =>
    listClients({ lifecycleStage: stage, status, keyword: keyword || undefined }, page, size),
  );

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await clientSuccessSummary());
    } catch {
      /* 静默 */
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const onFilter = () => paged.reload();

  const openCreate = () => {
    form.resetFields();
    setModal({ open: true });
  };

  const openEdit = (c: LegalClient) => {
    form.setFieldsValue({
      name: c.name,
      lifecycleStage: c.lifecycleStage,
      currentService: c.currentService ?? undefined,
      responseScore: c.responseScore ?? undefined,
      communicationScore: c.communicationScore ?? undefined,
      todoScore: c.todoScore ?? undefined,
      stabilityScore: c.stabilityScore ?? undefined,
      status: c.status,
      note: c.note ?? undefined,
    });
    setModal({ open: true, editing: c });
  };

  const submit = async () => {
    const body = await form.validateFields();
    try {
      if (modal.editing) {
        await updateClient(modal.editing.id, body);
        message.success('已保存客户档案');
      } else {
        await createClient(body);
        message.success('已新增客户');
      }
      setModal({ open: false });
      await paged.reload();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const remove = async (c: LegalClient) => {
    try {
      await deleteClient(c.id);
      message.success('已删除');
      await paged.reload();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const openValues = async (c: LegalClient) => {
    setValuesClient(c);
    setValuesOpen(true);
    valueForm.resetFields();
    try {
      setValues(await listClientValues(c.id));
    } catch (e) {
      handleError(e);
    }
  };

  const addValue = async () => {
    if (!valuesClient) return;
    const body = await valueForm.validateFields();
    try {
      await createClientValue(valuesClient.id, body);
      message.success('已新增价值记录（待确认）');
      valueForm.resetFields();
      setValues(await listClientValues(valuesClient.id));
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const confirmValue = async (v: ClientValueRecord) => {
    try {
      await confirmClientValue(v.id);
      message.success('已确认价值记录');
      if (valuesClient) setValues(await listClientValues(valuesClient.id));
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const funnel: ClientSuccessSummary['funnel'] = summary?.funnel ?? {
    VISITOR: 0,
    LEAD: 0,
    TRIAGE: 0,
    DIAGNOSIS: 0,
    PRODUCT: 0,
    ENGAGED: 0,
    SERVING: 0,
    CLOSED: 0,
    REPEAT: 0,
    REFERRAL: 0,
  };
  const funnelMax = Math.max(1, ...FUNNEL_ORDER.map((s) => funnel[s] ?? 0));

  const columns: ColumnsType<LegalClient> = useMemo(
    () => [
      {
        title: '客户',
        dataIndex: 'name',
        render: (_, c) => (
          <Space direction="vertical" size={0}>
            <Text strong>{c.name}</Text>
            {c.currentService && <Text type="secondary">{c.currentService}</Text>}
          </Space>
        ),
      },
      {
        title: '生命周期',
        dataIndex: 'lifecycleStage',
        width: 110,
        render: (s: LegalClient['lifecycleStage']) => (
          <Tag color={CLIENT_STAGE_META[s].color}>{CLIENT_STAGE_META[s].text}</Tag>
        ),
      },
      {
        title: '健康分',
        dataIndex: 'healthScore',
        width: 130,
        sorter: (a, b) => a.healthScore - b.healthScore,
        render: (v: number) => (
          <Progress
            percent={v}
            size="small"
            strokeColor={
              healthTone(v) === 'red'
                ? '#ff4d4f'
                : healthTone(v) === 'orange'
                  ? '#fa8c16'
                  : '#52c41a'
            }
            format={(p) => `${p} 分`}
          />
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (s: LegalClient['status']) => (
          <Tag color={CLIENT_STATUS_META[s].color}>{CLIENT_STATUS_META[s].text}</Tag>
        ),
      },
      {
        title: '动态',
        dataIndex: 'note',
        ellipsis: true,
        render: (n?: string | null) => n || <Text type="secondary">—</Text>,
      },
      {
        title: '操作',
        key: 'actions',
        width: 210,
        render: (_, c) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(c)}>
              编辑
            </Button>
            <Button size="small" icon={<CheckCircleOutlined />} onClick={() => void openValues(c)}>
              价值
            </Button>
            <Popconfirm title={`删除客户「${c.name}」？`} onConfirm={() => void remove(c)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer
      title="客户成功中心"
      subTitle="CLIENT SUCCESS CENTER · 客户分层 · 健康预警 · 价值记录"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => void paged.reload()}>
          刷新
        </Button>,
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建客户
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 01 组合健康度 + HEALTH MODEL 四维 */}
        <ProCard split="vertical" bordered>
          <Statistic
            title="组合健康度"
            value={summary?.portfolioHealth ?? 0}
            precision={1}
            suffix="分"
            prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
          />
          {HEALTH_DIMS.map((d) => (
            <Statistic
              key={d.key}
              title={d.label}
              value={summary?.healthDimensions?.[d.key] ?? 0}
              valueStyle={{ color: d.color }}
            />
          ))}
        </ProCard>

        {/* 02 生命周期漏斗 + 03 本周客户价值 */}
        <ProCard gutter={12} bordered>
          <ProCard title="客户生命周期漏斗（本月）" colSpan="55%">
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {FUNNEL_ORDER.map((s, i) => {
                const count = funnel[s] ?? 0;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text style={{ width: 88, fontSize: 12 }} type="secondary">
                      {i + 1} · {CLIENT_STAGE_META[s].text}
                    </Text>
                    <Progress
                      percent={Math.round((count / funnelMax) * 100)}
                      showInfo={false}
                      size="small"
                      strokeColor={CLIENT_STAGE_META[s].color}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <Text style={{ width: 40, textAlign: 'right' }}>{count}</Text>
                  </div>
                );
              })}
            </Space>
          </ProCard>
          <ProCard title="本周客户价值" colSpan="45%">
            <Statistic
              title="已确认价值记录"
              value={summary?.valueConfirmed ?? 0}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
            />
            <Space wrap style={{ margin: '8px 0 12px' }}>
              {(Object.keys(CLIENT_VALUE_META) as ClientValueType[]).map((t) => (
                <Tag key={t} color={CLIENT_VALUE_META[t].color}>
                  {CLIENT_VALUE_META[t].text} {summary?.valueConfirmedByType?.[t] ?? 0}
                </Tag>
              ))}
            </Space>
            <Paragraph type={summary && summary.valuePending > 0 ? 'warning' : 'secondary'}>
              {summary && summary.valuePending > 0
                ? `${summary.valuePending} 项价值记录等待核验（确认后计入本周价值）`
                : '本周价值记录均已确认'}
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              高关注 {summary?.highAttentionCount ?? 0} · 待跟进 {summary?.followUpCount ?? 0}
            </Paragraph>
          </ProCard>
        </ProCard>

        {/* 04 客户组合表 */}
        <ProCard title={`客户组合（共 ${paged.total} 位）`} bordered>
          <Space wrap style={{ marginBottom: 12 }}>
            <Select
              allowClear
              placeholder="生命周期"
              style={{ width: 140 }}
              options={CLIENT_STAGE_OPTIONS}
              onChange={(v) => {
                setStage(v);
                onFilter();
              }}
            />
            <Select
              allowClear
              placeholder="关注状态"
              style={{ width: 130 }}
              options={CLIENT_STATUS_OPTIONS}
              onChange={(v) => {
                setStatus(v);
                onFilter();
              }}
            />
            <Input.Search
              allowClear
              placeholder="搜索客户/服务"
              style={{ width: 220 }}
              onSearch={(v) => {
                setKeyword(v);
                onFilter();
              }}
            />
          </Space>
          <Table<LegalClient>
            rowKey="id"
            size="small"
            loading={paged.loading}
            columns={columns}
            dataSource={paged.items}
            pagination={{
              current: paged.page,
              pageSize: paged.size,
              total: paged.total,
              showSizeChanger: false,
              onChange: (p) => paged.goPage(p),
            }}
          />
        </ProCard>

        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          合规：情绪稳定维度仅用于服务升级提示，不用于不利决策或自动拒绝服务；价值记录需本人确认后才计入本周客户价值。
        </Paragraph>
      </Space>

      {/* 新建/编辑客户 */}
      <Modal
        title={modal.editing ? `编辑客户 · ${modal.editing.name}` : '新建客户'}
        open={modal.open}
        onOk={() => void submit()}
        onCancel={() => setModal({ open: false })}
        destroyOnClose
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ lifecycleStage: 'SERVING', status: 'HEALTHY' }}
        >
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input maxLength={200} placeholder="如：江西宏远科技有限公司" />
          </Form.Item>
          <Form.Item name="lifecycleStage" label="生命周期阶段" rules={[{ required: true }]}>
            <Select options={CLIENT_STAGE_OPTIONS} />
          </Form.Item>
          <Form.Item name="currentService" label="当前服务">
            <Input maxLength={200} placeholder="如：宏远科技股权回购争议" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="responseScore" label="响应时效">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="communicationScore" label="沟通频率">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="todoScore" label="待办完成">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="stabilityScore" label="情绪稳定">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
          </Space>
          <Form.Item name="status" label="关注状态">
            <Select options={CLIENT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="note" label="动态/备注">
            <Input.TextArea
              maxLength={500}
              rows={2}
              placeholder="如：今日 16:00 前审定策略分析报告 V2"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 客户价值记录 */}
      <Modal
        title={`客户价值记录 · ${valuesClient?.name ?? ''}`}
        open={valuesOpen}
        onCancel={() => setValuesOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {values.length === 0 && <Text type="secondary">暂无价值记录</Text>}
          {values.map((v) => (
            <div
              key={v.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: 8,
              }}
            >
              <Space direction="vertical" size={0}>
                <Tag color={CLIENT_VALUE_META[v.valueType].color}>
                  {CLIENT_VALUE_META[v.valueType].text}
                  {v.confirmed ? ' ✓' : ' · 待确认'}
                </Tag>
                <Text>{v.description}</Text>
              </Space>
              {!v.confirmed && (
                <Button size="small" type="primary" ghost onClick={() => void confirmValue(v)}>
                  确认
                </Button>
              )}
            </div>
          ))}
          <Form form={valueForm} layout="inline">
            <Form.Item
              name="valueType"
              rules={[{ required: true, message: '选择类型' }]}
              style={{ width: 150 }}
            >
              <Select
                placeholder="价值类型"
                options={(Object.keys(CLIENT_VALUE_META) as ClientValueType[]).map((t) => ({
                  value: t,
                  label: CLIENT_VALUE_META[t].text,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="description"
              rules={[{ required: true, message: '填写内容' }]}
              style={{ flex: 1 }}
            >
              <Input maxLength={500} placeholder="如：回购通知送达日期风险提示" />
            </Form.Item>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => void addValue()}>
              新增
            </Button>
          </Form>
        </Space>
      </Modal>
    </PageContainer>
  );
}
