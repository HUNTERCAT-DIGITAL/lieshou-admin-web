/**
 * 物联网 · 规则配置页（ADR-0040 · Phase 2）.
 *
 * 规则 CRUD + 启停（属性阈值 / 事件触发 → COMMAND / WEBHOOK / NOTIFY 动作）。
 */
import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { useRef } from 'react';

import { useApiError } from '../../hooks/useApiError';
import {
  createIotRule,
  deleteIotRule,
  getIotProductDetail,
  listIotProducts,
  listIotRules,
  setIotRuleEnabled,
  updateIotRule,
} from '../../services/iot';
import {
  IOT_ACTION_META,
  IOT_OPERATOR_META,
  IOT_SEVERITY_META,
  IOT_TRIGGER_META,
  parseRuleActions,
  type IotProduct,
  type IotRule,
  type RuleAction,
} from '@lieshoucloud/types/business/iot';

interface RuleFormValues {
  name: string;
  enabled: boolean;
  severity: 'WARN' | 'CRITICAL';
  triggerType: 'PROPERTY' | 'EVENT';
  productId: number;
  propertyKey?: string;
  operator?: string;
  threshold?: string;
  windowSec?: number;
  eventKey?: string;
  /** 多条件组合（每条 key/operator/threshold；PROPERTY 触发） */
  conditions?: { key: string; operator: string; threshold: string }[];
  /** 条件组合逻辑：AND / OR */
  conditionLogic?: 'AND' | 'OR';
  actions: RuleAction[];
  description?: string;
}

/** 动作类型选项（COMMAND 命令下发已按需求屏蔽——无数据下发场景；历史规则中的 COMMAND 仍可展示） */
const ACTION_TYPE_OPTIONS = Object.entries(IOT_ACTION_META)
  .filter(([value]) => value !== 'COMMAND')
  .map(([value, label]) => ({
    value,
    label,
  }));

/** 动作摘要（列表页展示） */
export function ruleActionSummary(actions: RuleAction[]): string {
  return (
    actions
      .map((a) => {
        switch (a.type) {
          case 'COMMAND':
            return `下发命令 ${a.command ?? ''}`;
          case 'WEBHOOK':
            return `Webhook ${a.url ?? ''}`;
          case 'NOTIFY':
            return `通知：${a.message ?? ''}`;
          default:
            return a.type;
        }
      })
      .join('；') || '—'
  );
}

/** 条件解析：conditionsJson 优先，否则回退单条件（存量规则兼容）。 */
export function parseRuleConditions(
  r: Pick<IotRule, 'conditionsJson' | 'propertyKey' | 'operator' | 'threshold'>,
): { key: string; operator: string; threshold: string }[] {
  if (r.conditionsJson) {
    try {
      const parsed = JSON.parse(r.conditionsJson) as {
        key: string;
        operator: string;
        threshold: string;
      }[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      /* fallthrough → 回退单条件 */
    }
  }
  if (r.propertyKey && r.operator && r.threshold) {
    return [{ key: r.propertyKey, operator: r.operator, threshold: r.threshold }];
  }
  return [{ key: '', operator: 'GT', threshold: '' }];
}

/** 条件摘要（列表页展示；多条件组合显示 AND/OR 连接） */
export function ruleConditionSummary(r: IotRule): string {
  if (r.triggerType === 'EVENT') return `事件 ${r.eventKey ?? ''}`;
  const conditions = parseRuleConditions(r);
  const fmt = (c: { key: string; operator: string; threshold: string }) =>
    `${c.key} ${IOT_OPERATOR_META[c.operator] ?? c.operator ?? '?'} ${c.threshold ?? '?'}`;
  if (conditions.length > 1) {
    const logic = r.conditionLogic === 'OR' ? '任一' : '同时';
    return conditions.map(fmt).join(` ${logic} `);
  }
  return conditions[0]?.key ? fmt(conditions[0]) : '—';
}

export default function IotRules() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IotRule | null>(null);
  const [products, setProducts] = useState<IotProduct[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<{ label: string; value: string }[]>([]);
  const [commandOptions, setCommandOptions] = useState<{ label: string; value: string }[]>([]);

  const reload = () => actionRef.current?.reload();

  const loadProducts = () => {
    listIotProducts().then(setProducts).catch(handleError);
  };
  useEffect(loadProducts, []);

  const onProductChange = (productId?: number) => {
    if (!productId) {
      setPropertyOptions([]);
      setCommandOptions([]);
      return;
    }
    getIotProductDetail(productId)
      .then((d) => {
        setPropertyOptions(
          d.properties.map((p) => ({ label: `${p.label}（${p.name}）`, value: p.name })),
        );
        setCommandOptions(
          d.commands.map((c) => ({ label: `${c.label}（${c.name}）`, value: c.name })),
        );
      })
      .catch(handleError);
  };

  // 编辑模式：预载产品属性/命令选项（否则属性/命令下拉为空）
  useEffect(() => {
    if (editing) onProductChange(editing.productId);
  }, [editing]);

  const columns: ProColumns<IotRule>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '规则名称', dataIndex: 'name', width: 160 },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      search: false,
      render: (_, r) => (
        <Switch
          size="small"
          checked={r.enabled}
          onChange={async (checked) => {
            try {
              await setIotRuleEnabled(r.id, checked);
              messageApi.success(checked ? '已启用' : '已停用');
              reload();
            } catch (e) {
              handleError(e);
            }
          }}
        />
      ),
    },
    {
      title: '级别',
      dataIndex: 'severity',
      width: 90,
      search: false,
      render: (_, r) => {
        const sev = (r.severity ?? 'WARN') as 'WARN' | 'CRITICAL';
        const meta = IOT_SEVERITY_META[sev] ?? IOT_SEVERITY_META.WARN;
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '触发',
      dataIndex: 'triggerType',
      width: 110,
      search: false,
      render: (_, r) =>
        r.triggerType === 'PROPERTY' ? (
          <Tag color="blue">{IOT_TRIGGER_META.PROPERTY}</Tag>
        ) : (
          <Tag color="purple">{IOT_TRIGGER_META.EVENT}</Tag>
        ),
    },
    {
      title: '产品',
      dataIndex: 'productId',
      width: 130,
      search: false,
      render: (_, r) => products.find((p) => p.id === r.productId)?.name ?? `#${r.productId}`,
    },
    {
      title: '条件',
      dataIndex: 'condition',
      width: 150,
      search: false,
      render: (_, r) => <Typography.Text code>{ruleConditionSummary(r)}</Typography.Text>,
    },
    {
      title: '动作',
      dataIndex: 'actions',
      search: false,
      ellipsis: true,
      render: (_, r) => ruleActionSummary(parseRuleActions(r.actionsJson)),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      render: (_, row) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="del"
          title="确定删除该规则？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteIotRule(row.id);
              messageApi.success('已删除');
              reload();
            } catch (e) {
              handleError(e);
            }
          }}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const toActionsJson = (actions: RuleAction[]): string => JSON.stringify(actions ?? []);

  const onFinish = async (values: RuleFormValues) => {
    try {
      const payload = {
        name: String(values.name),
        enabled: values.enabled !== false,
        severity: values.severity ?? 'WARN',
        triggerType: values.triggerType,
        productId: Number(values.productId),
        // 多条件：conditionsJson 始终写入；第一条同时回填单条件字段（后端兜底 + 兼容旧版）
        conditionsJson:
          values.conditions && values.conditions.length > 0
            ? JSON.stringify(values.conditions)
            : undefined,
        conditionLogic: values.conditionLogic ?? 'AND',
        propertyKey: values.conditions?.[0]?.key ?? values.propertyKey,
        operator: values.conditions?.[0]?.operator ?? values.operator,
        threshold: values.conditions?.[0]?.threshold ?? values.threshold,
        windowSec: values.windowSec ?? 0,
        eventKey: values.eventKey,
        actionsJson: toActionsJson(values.actions ?? []),
        description: values.description,
      };
      if (editing) {
        await updateIotRule(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createIotRule(payload);
        messageApi.success('已创建');
      }
      setModalOpen(false);
      setEditing(null);
      reload();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="规则配置"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reload}>
          刷新
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          新建规则
        </Button>,
      ]}
    >
      <ProTable<IotRule>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          try {
            const data = await listIotRules();
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={false}
        dateFormatter="string"
        headerTitle="规则列表（属性上报 / 事件发生时求值，命中后执行动作）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建 / 编辑规则 */}
      <ModalForm<RuleFormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑规则：${editing.name}` : '新建规则'}
        width={640}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                enabled: editing.enabled,
                severity: (editing.severity ?? 'WARN') as 'WARN' | 'CRITICAL',
                triggerType: editing.triggerType,
                productId: editing.productId,
                conditions: parseRuleConditions(editing),
                conditionLogic: (editing.conditionLogic ?? 'AND') as 'AND' | 'OR',
                propertyKey: editing.propertyKey ?? undefined,
                operator: editing.operator ?? undefined,
                threshold: editing.threshold ?? undefined,
                windowSec: editing.windowSec ?? 0,
                eventKey: editing.eventKey ?? undefined,
                actions: parseRuleActions(editing.actionsJson),
                description: editing.description ?? undefined,
              }
            : {
                enabled: true,
                severity: 'WARN',
                triggerType: 'PROPERTY',
                conditions: [{ key: '', operator: 'GT', threshold: '' }],
                conditionLogic: 'AND',
                actions: [{ type: 'NOTIFY' }],
              }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
          placeholder="如：温度过高告警"
        />
        <Form.Item name="enabled" label="启用" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="severity" label="级别" rules={[{ required: true, message: '请选择级别' }]}>
          <Radio.Group>
            <Radio.Button value="WARN">预警 WARN</Radio.Button>
            <Radio.Button value="CRITICAL">告警 CRITICAL</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="triggerType"
          label="触发类型"
          rules={[{ required: true, message: '请选择触发类型' }]}
        >
          <Radio.Group>
            <Radio.Button value="PROPERTY">属性阈值</Radio.Button>
            <Radio.Button value="EVENT">事件触发</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <ProFormSelect
          name="productId"
          label="作用产品"
          rules={[{ required: true, message: '请选择产品' }]}
          options={products.map((p) => ({ label: p.name, value: p.id }))}
          fieldProps={{ onChange: (v?: number) => onProductChange(v) }}
          placeholder="选择产品后加载其属性/命令定义"
        />

        {/* 属性阈值条件（多条件组合 · AND/OR） */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.triggerType !== cur.triggerType}>
          {({ getFieldValue }) =>
            getFieldValue('triggerType') === 'PROPERTY' ? (
              <Form.Item label="触发条件" required style={{ marginBottom: 4 }}>
                <Form.Item name="conditionLogic" style={{ marginBottom: 8 }}>
                  <Radio.Group size="small" optionType="button">
                    <Radio.Button value="AND">同时满足（AND）</Radio.Button>
                    <Radio.Button value="OR">任一满足（OR）</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.List name="conditions">
                  {(fields, { add, remove }) => (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} align="baseline" size={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: '请选择属性' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              style={{ width: 170 }}
                              placeholder="属性"
                              options={propertyOptions}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'operator']}
                            rules={[{ required: true, message: '请选择操作符' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              style={{ width: 80 }}
                              options={Object.entries(IOT_OPERATOR_META).map(([value, label]) => ({
                                value,
                                label,
                              }))}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'threshold']}
                            rules={[{ required: true, message: '请输入阈值' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input style={{ width: 110 }} placeholder="阈值" />
                          </Form.Item>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          )}
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add({ operator: 'GT' })}
                        icon={<PlusOutlined />}
                        block
                      >
                        添加条件
                      </Button>
                    </Space>
                  )}
                </Form.List>
                <Form.Item name="windowSec" label="持续秒数（0=立即）" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} style={{ width: 140 }} />
                </Form.Item>
              </Form.Item>
            ) : (
              <Form.Item
                name="eventKey"
                label="事件 Key"
                rules={[{ required: true, message: '请输入事件 Key' }]}
                style={{ maxWidth: 320 }}
              >
                <Input placeholder="如：alarm" />
              </Form.Item>
            )
          }
        </Form.Item>

        {/* 动作列表 */}
        <Form.Item label="动作" required style={{ marginBottom: 4 }}>
          <Form.List name="actions">
            {(fields, { add, remove }) => (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" size={8} style={{ width: '100%' }}>
                    <Form.Item
                      name={[field.name, 'type']}
                      rules={[{ required: true, message: '请选择动作类型' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select style={{ width: 130 }} options={ACTION_TYPE_OPTIONS} />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, cur) =>
                        prev.actions?.[field.name]?.type !== cur.actions?.[field.name]?.type
                      }
                    >
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['actions', field.name, 'type']);
                        if (type === 'COMMAND') {
                          return (
                            <>
                              <Form.Item
                                name={[field.name, 'command']}
                                rules={[{ required: true, message: '请选择命令' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  style={{ width: 160 }}
                                  placeholder="命令"
                                  options={commandOptions}
                                />
                              </Form.Item>
                              <Form.Item name={[field.name, 'params']} style={{ marginBottom: 0 }}>
                                <Input
                                  style={{ width: 200 }}
                                  placeholder={'参数JSON 如{"threshold":30}'}
                                />
                              </Form.Item>
                            </>
                          );
                        }
                        if (type === 'WEBHOOK') {
                          return (
                            <Form.Item
                              name={[field.name, 'url']}
                              rules={[{ required: true, message: '请输入回调地址' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                style={{ width: 320 }}
                                placeholder="https://example.com/hook"
                              />
                            </Form.Item>
                          );
                        }
                        if (type === 'NOTIFY') {
                          return (
                            <Form.Item
                              name={[field.name, 'message']}
                              rules={[{ required: true, message: '请输入通知内容' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input style={{ width: 320 }} placeholder="通知内容，如：温度过高" />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ type: 'NOTIFY' })}
                  block
                  icon={<PlusOutlined />}
                >
                  添加动作
                </Button>
              </Space>
            )}
          </Form.List>
        </Form.Item>
        <ProFormTextArea name="description" label="描述" placeholder="选填" />
      </ModalForm>
    </PageContainer>
  );
}
