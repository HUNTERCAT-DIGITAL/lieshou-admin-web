/**
 * 客户成功中心（售后闭环 · Phase 10）.
 *
 * 路径 `/customer/success`：
 * - Tab1 联系函：主动触达客户（续费提醒/服务通知/回访邀请/满意度调查），
 *   生命周期 草稿 → 已发送 → 客户已读 → 已闭环 / 已取消
 * - Tab2 客户响应：记录客户反馈（方式/情绪/内容）+ 下一步动作 + 下次跟进时间，响应深化闭环
 *
 * 数据：租户内（后端强制 X-Tenant-Id），客户/联系函为下拉引用；软删不可见。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { App, Button, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Tooltip, Typography } from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
  type ProFormInstance,
} from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';

import { useApiError } from '../../hooks/useApiError';
import { listCustomers } from '../../services/crm';
import {
  cancelLetter,
  completeLetter,
  createLetter,
  createResponse,
  createTemplate,
  deleteLetter,
  deleteResponse,
  deleteTemplate,
  getLetterTemplates,
  listLetters,
  listResponses,
  readLetter,
  resolveResponse,
  sendLetter,
  updateLetter,
  updateResponse,
  updateTemplate,
} from '../../services/customerSuccess';
import {
  FOLLOW_UP_FILTER_META,
  LETTER_STATUS_META,
  LETTER_TEMPLATE_LABELS,
  LETTER_TYPE_META,
  RESPONSE_STATUS_META,
  RESPONSE_TYPE_META,
  SENTIMENT_META,
  fillTemplatePlaceholder,
  followUpTone,
  isSystemTemplate,
  type ContactLetter,
  type CreateLetterRequest,
  type CreateResponseRequest,
  type CustomerResponse,
  type FollowUpFilter,
  type LetterStatus,
  type LetterTemplate,
  type LetterType,
  type ResponseSentiment,
  type ResponseStatus,
  type ResponseType,
  type UpdateResponseRequest,
} from '../../types/customerSuccess';

const { Text } = Typography;

/** 联系函新建/编辑表单值 */
interface LetterFormValues {
  customerId: number;
  type: LetterType;
  title: string;
  content?: string;
  /** 预置模板 key（仅新建时用于自动填充，不随请求提交） */
  templateKey?: string;
}

/** 响应新建/编辑表单值 */
interface ResponseFormValues {
  customerId: number;
  letterId?: number;
  type: ResponseType;
  sentiment: ResponseSentiment;
  content: string;
  followUpAction?: string;
  followUpAt?: string;
  status?: ResponseStatus;
}

/** 模板新建/编辑表单值 */
interface TemplateFormValues {
  templateKey: string;
  type: LetterType;
  title: string;
  content: string;
}

export default function CustomerSuccess() {
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const [searchParams] = useSearchParams();
  // 工作台跟进提醒跳转：?tab=responses&followUp=overdue|dueToday
  const initialTab = searchParams.get('tab') === 'responses' ? 'responses' : 'letters';
  const initialFollowUp = (searchParams.get('followUp') as FollowUpFilter | null) ?? null;
  const [customerMap, setCustomerMap] = useState<Map<number, string>>(new Map());

  /** 客户下拉选项（客户名 + 联系人） */
  const customerOptions = useMemo(
    () =>
      [...customerMap.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, name]) => ({ label: `${name}（#${id}）`, value: id })),
    [customerMap],
  );

  /** 拉租户客户用于「收函客户 / 响应客户」名称与下拉（客户列表轻量，一次性缓存） */
  useEffect(() => {
    listCustomers()
      .then((list) => setCustomerMap(new Map(list.map((c) => [c.id, c.name]))))
      .catch(() => {});
  }, []);

  return (
    <PageContainer title="客户成功中心">
      <Tabs
        defaultActiveKey={initialTab}
        items={[
          {
            key: 'letters',
            label: '联系函（主动触达）',
            children: (
              <LettersTable
                customerMap={customerMap}
                customerOptions={customerOptions}
                messageApi={messageApi}
                handleError={handleError}
              />
            ),
          },
          {
            key: 'responses',
            label: '客户响应（深化跟进）',
            children: (
              <ResponsesTable
                customerMap={customerMap}
                customerOptions={customerOptions}
                messageApi={messageApi}
                handleError={handleError}
                initialFollowUp={initialTab === 'responses' ? initialFollowUp : null}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
}

// ============================================================
// Tab1 · 联系函
// ============================================================

function LettersTable({
  customerMap,
  customerOptions,
  messageApi,
  handleError,
}: {
  customerMap: Map<number, string>;
  customerOptions: { label: string; value: number }[];
  messageApi: ReturnType<typeof App.useApp>['message'];
  handleError: (e: unknown) => void;
}) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactLetter | null>(null);
  const letterFormRef = useRef<ProFormInstance<LetterFormValues> | undefined>(undefined);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [tplManageOpen, setTplManageOpen] = useState(false);
  const [tplEditing, setTplEditing] = useState<LetterTemplate | null>(null);
  const [tplFormOpen, setTplFormOpen] = useState(false);

  /** 拉联系函模板（系统预置 + 租户自定义；新建选模板 + 模板管理共用） */
  useEffect(() => {
    getLetterTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  /** 模板变更后刷新（新建/编辑/删除） */
  const reloadTemplates = async () => {
    try {
      setTemplates(await getLetterTemplates());
    } catch {
      /* 失败静默（列表页已有下拉可不刷） */
    }
  };


  const reload = () => {
    actionRef.current?.reload();
  };

  const customerName = (id: number | undefined | null) =>
    id ? (customerMap.get(id) ?? `#${id}`) : '—';

  const columns: ProColumns<ContactLetter>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: '收函客户',
      dataIndex: 'customerId',
      valueType: 'select',
      fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
      width: 160,
      render: (_, row) => customerName(row.customerId),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(LETTER_TYPE_META) as LetterType[]).map((t) => [
          t,
          { text: LETTER_TYPE_META[t].text },
        ]),
      ),
      width: 110,
      render: (_, row) => (
        <Tag color={LETTER_TYPE_META[row.type].color}>{LETTER_TYPE_META[row.type].text}</Tag>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
      search: false,
      render: (_, row) =>
        row.content ? (
          <Tooltip title={row.content}>
            <Text>{row.title}</Text>
          </Tooltip>
        ) : (
          row.title
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(LETTER_STATUS_META) as LetterStatus[]).map((s) => [
          s,
          { text: LETTER_STATUS_META[s].text },
        ]),
      ),
      width: 100,
      render: (_, row) => (
        <Tag color={LETTER_STATUS_META[row.status].color}>
          {LETTER_STATUS_META[row.status].text}
        </Tag>
      ),
    },
    {
      title: '发送时间',
      dataIndex: 'sentAt',
      width: 160,
      search: false,
      render: (_, r) => r.sentAt ?? '—',
    },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, row) => {
        const actions: React.ReactNode[] = [];
        if (row.status === 'DRAFT') {
          actions.push(
            <Button
              key="send"
              type="link"
              icon={<SendOutlined />}
              onClick={async () => {
                try {
                  await sendLetter(row.id);
                  messageApi.success('已发送');
                  reload();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              发送
            </Button>,
          );
        }
        if (row.status === 'SENT') {
          actions.push(
            <Button
              key="read"
              type="link"
              icon={<EyeOutlined />}
              onClick={async () => {
                try {
                  await readLetter(row.id);
                  messageApi.success('已标记客户已读');
                  reload();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              标记已读
            </Button>,
          );
        }
        if (row.status === 'SENT' || row.status === 'READ') {
          actions.push(
            <Button
              key="complete"
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={async () => {
                try {
                  await completeLetter(row.id);
                  messageApi.success('已闭环');
                  reload();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              闭环
            </Button>,
          );
        }
        if (row.status === 'DRAFT') {
          actions.push(
            <Button
              key="edit"
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(row);
                setModalOpen(true);
              }}
            >
              编辑
            </Button>,
          );
        }
        if (row.status === 'DRAFT' || row.status === 'SENT' || row.status === 'READ') {
          actions.push(
            <Button
              key="cancel"
              type="link"
              danger
              onClick={async () => {
                try {
                  await cancelLetter(row.id);
                  messageApi.success('已取消');
                  reload();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              取消
            </Button>,
          );
        }
        actions.push(
          <Popconfirm
            key="del"
            title="确定删除该联系函？"
            description="删除后将从列表移除（软删）"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await deleteLetter(row.id);
                messageApi.success('已删除');
                reload();
              } catch (e) {
                handleError(e);
              }
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>,
        );
        return actions;
      },
    },
  ];

  const onFinish = async (values: LetterFormValues) => {
    try {
      if (editing) {
        await updateLetter(editing.id, {
          title: String(values.title),
          content: values.content ? String(values.content) : undefined,
        });
        messageApi.success('已保存');
      } else {
        const payload: CreateLetterRequest = {
          customerId: values.customerId,
          type: values.type,
          title: String(values.title),
          content: values.content ? String(values.content) : undefined,
        };
        await createLetter(payload);
        messageApi.success('已创建（草稿），发送走「发送」动作');
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
    <>
      <ProTable<ContactLetter>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const data = await listLetters({
              customerId: params.customerId as number | undefined,
              type: params.type as LetterType | undefined,
              status: params.status as LetterStatus | undefined,
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="联系函（主动触达 · 草稿 → 已发送 → 客户已读 → 已闭环）"
        toolBarRender={() => [
          <Button key="templates" icon={<FileTextOutlined />} onClick={() => setTplManageOpen(true)}>
            模板管理
          </Button>,
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
            新建联系函
          </Button>,
        ]}
        cardBordered
      />

      <ModalForm<LetterFormValues>
        formRef={letterFormRef}
        key={editing?.id ?? 'create-letter'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑联系函：${editing.title}` : '新建联系函'}
        width={560}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                customerId: editing.customerId,
                type: editing.type,
                title: editing.title,
                content: editing.content ?? '',
              }
            : { type: 'RENEWAL' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        {!editing && (
          <ProFormSelect
            name="templateKey"
            label="选择模板"
            options={templates.map((t) => ({
              label: isSystemTemplate(t)
                ? `【系统】${LETTER_TEMPLATE_LABELS[t.templateKey] ?? t.title}`
                : `【自定义】${t.title}`,
              value: t.templateKey,
            }))}
            placeholder="选模板自动填充标题与正文（可再编辑）"
            allowClear
            fieldProps={{
              onChange: (key?: string) => {
                const tpl = templates.find((t) => t.templateKey === key);
                const form = letterFormRef.current;
                if (!tpl || !form) return;
                const cid = form.getFieldValue('customerId') as number | undefined;
                const customerName = cid ? (customerMap.get(cid) ?? '') : undefined;
                form.setFieldValue('type', tpl.type);
                form.setFieldValue('title', tpl.title);
                form.setFieldValue('content', fillTemplatePlaceholder(tpl.content, customerName));
              },
            }}
          />
        )}
        <ProFormSelect
          name="customerId"
          label="收函客户"
          options={customerOptions}
          rules={[{ required: true, message: '请选择收函客户' }]}
          placeholder="选择客户（租户内）"
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          disabled={!!editing}
        />
        <ProFormSelect
          name="type"
          label="函件类型"
          options={(Object.keys(LETTER_TYPE_META) as LetterType[]).map((t) => ({
            label: LETTER_TYPE_META[t].text,
            value: t,
          }))}
          rules={[{ required: true, message: '请选择函件类型' }]}
        />
        <ProFormText
          name="title"
          label="函件标题"
          rules={[
            { required: true, message: '请输入函件标题' },
            { max: 255, message: '最长 255 字' },
          ]}
          placeholder="如：2026 年度服务续费提醒函"
        />
        <ProFormTextArea
          name="content"
          label="函件正文"
          rules={[{ max: 4000, message: '最长 4000 字' }]}
          placeholder="尊敬的客户：您的服务将于 2026-09-30 到期……"
          fieldProps={{ rows: 6 }}
        />
      </ModalForm>

      {/* 模板管理：系统预置只读 + 租户自定义 CRUD */}
      <Modal
        title="联系函模板管理"
        open={tplManageOpen}
        onCancel={() => setTplManageOpen(false)}
        footer={null}
        width={760}
      >
        <Space style={{ marginBottom: 12 }} wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setTplEditing(null);
              setTplFormOpen(true);
            }}
          >
            新建模板
          </Button>
          <Text type="secondary">系统模板只读；租户自定义模板可新建 / 编辑 / 删除，正文可用 {'{customer}'} 占位客户名</Text>
        </Space>
        <Table<LetterTemplate>
          rowKey="id"
          dataSource={templates}
          pagination={false}
          size="small"
          columns={[
            {
              title: '模板',
              dataIndex: 'title',
              render: (_, t) =>
                isSystemTemplate(t) ? (
                  <Tag color="blue">系统 · {LETTER_TEMPLATE_LABELS[t.templateKey] ?? t.title}</Tag>
                ) : (
                  t.title
                ),
            },
            {
              title: '类型',
              dataIndex: 'type',
              width: 110,
              render: (_, t) => (
                <Tag color={LETTER_TYPE_META[t.type].color}>{LETTER_TYPE_META[t.type].text}</Tag>
              ),
            },
            {
              title: '模板键',
              dataIndex: 'templateKey',
              width: 150,
              render: (_, t) => <Text code>{t.templateKey}</Text>,
            },
            {
              title: '操作',
              width: 150,
              render: (_, t) =>
                isSystemTemplate(t) ? (
                  <Text type="secondary">只读</Text>
                ) : (
                  <Space size={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setTplEditing(t);
                        setTplFormOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="删除该模板？"
                      description="删除后新建函件将不再可选"
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        try {
                          await deleteTemplate(t.id);
                          messageApi.success('已删除');
                          void reloadTemplates();
                        } catch (e) {
                          handleError(e);
                        }
                      }}
                    >
                      <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
            },
          ]}
        />
      </Modal>

      {/* 模板新建 / 编辑表单 */}
      <ModalForm<TemplateFormValues>
        key={tplEditing?.id ?? 'create-template'}
        open={tplFormOpen}
        onOpenChange={(open) => {
          setTplFormOpen(open);
          if (!open) setTplEditing(null);
        }}
        title={tplEditing ? `编辑模板：${tplEditing.title}` : '新建联系函模板'}
        width={560}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          tplEditing
            ? {
                templateKey: tplEditing.templateKey,
                type: tplEditing.type,
                title: tplEditing.title,
                content: tplEditing.content,
              }
            : { type: 'RENEWAL' }
        }
        onFinish={async (values) => {
          try {
            if (tplEditing) {
              await updateTemplate(tplEditing.id, {
                type: values.type,
                title: values.title,
                content: values.content,
              });
              messageApi.success('已保存');
            } else {
              await createTemplate({
                templateKey: values.templateKey.trim(),
                type: values.type,
                title: values.title.trim(),
                content: values.content.trim(),
              });
              messageApi.success('已创建');
            }
            setTplFormOpen(false);
            setTplEditing(null);
            void reloadTemplates();
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        }}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="templateKey"
          label="模板键"
          disabled={!!tplEditing}
          rules={[
            { required: true, message: '请输入模板键' },
            { pattern: /^[a-z0-9-]+$/, message: '仅小写字母 / 数字 / 连字符' },
          ]}
          placeholder="如 my-renewal（租户内唯一）"
        />
        <ProFormSelect
          name="type"
          label="函件类型"
          options={(Object.keys(LETTER_TYPE_META) as LetterType[]).map((t) => ({
            label: LETTER_TYPE_META[t].text,
            value: t,
          }))}
          rules={[{ required: true, message: '请选择函件类型' }]}
        />
        <ProFormText
          name="title"
          label="模板标题"
          rules={[
            { required: true, message: '请输入模板标题' },
            { max: 255, message: '最长 255 字' },
          ]}
          placeholder="如：2026 年度专属续费提醒"
        />
        <ProFormTextArea
          name="content"
          label="模板正文"
          rules={[
            { required: true, message: '请输入模板正文' },
            { max: 4000, message: '最长 4000 字' },
          ]}
          placeholder="可用 {customer} 占位客户名，选模板时自动替换"
          fieldProps={{ rows: 6 }}
        />
      </ModalForm>
    </>
  );
}

// ============================================================
// Tab2 · 客户响应（响应深化）
// ============================================================

function ResponsesTable({
  customerMap,
  customerOptions,
  messageApi,
  handleError,
  initialFollowUp,
}: {
  customerMap: Map<number, string>;
  customerOptions: { label: string; value: number }[];
  messageApi: ReturnType<typeof App.useApp>['message'];
  handleError: (e: unknown) => void;
  /** 工作台跟进提醒跳转预选（overdue / dueToday），null = 全部 */
  initialFollowUp?: FollowUpFilter | null;
}) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerResponse | null>(null);
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>(initialFollowUp ?? 'all');

  const reload = () => {
    actionRef.current?.reload();
  };

  const customerName = (id: number | undefined | null) =>
    id ? (customerMap.get(id) ?? `#${id}`) : '—';

  const columns: ProColumns<CustomerResponse>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: '客户',
      dataIndex: 'customerId',
      valueType: 'select',
      fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
      width: 150,
      render: (_, row) => customerName(row.customerId),
    },
    {
      title: '方式',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(RESPONSE_TYPE_META) as ResponseType[]).map((t) => [
          t,
          { text: RESPONSE_TYPE_META[t] },
        ]),
      ),
      width: 90,
      render: (_, row) => RESPONSE_TYPE_META[row.type],
    },
    {
      title: '情绪',
      dataIndex: 'sentiment',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(SENTIMENT_META) as ResponseSentiment[]).map((s) => [
          s,
          { text: SENTIMENT_META[s].text },
        ]),
      ),
      width: 90,
      render: (_, row) => (
        <Tag color={SENTIMENT_META[row.sentiment].color}>{SENTIMENT_META[row.sentiment].text}</Tag>
      ),
    },
    {
      title: '响应内容',
      dataIndex: 'content',
      width: 260,
      ellipsis: true,
      search: false,
      render: (_, row) => (
        <Tooltip title={row.content}>
          <Text>{row.content}</Text>
        </Tooltip>
      ),
    },
    {
      title: '下一步动作',
      dataIndex: 'followUpAction',
      width: 180,
      ellipsis: true,
      search: false,
      render: (_, row) => row.followUpAction ?? '—',
    },
    {
      title: '下次跟进',
      dataIndex: 'followUpAt',
      width: 180,
      search: false,
      render: (_, r) => {
        if (!r.followUpAt) return '—';
        const { tone } = followUpTone(r.followUpAt, r.status);
        const fmt = dayjs(r.followUpAt).format('YYYY-MM-DD HH:mm');
        if (tone === 'overdue') {
          return (
            <Tag color="red" icon={<ClockCircleOutlined />}>
              已逾期 {fmt}
            </Tag>
          );
        }
        if (tone === 'dueToday') {
          return (
            <Tag color="orange" icon={<AlertOutlined />}>
              今日到期 {fmt}
            </Tag>
          );
        }
        return fmt;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(RESPONSE_STATUS_META) as ResponseStatus[]).map((s) => [
          s,
          { text: RESPONSE_STATUS_META[s].text },
        ]),
      ),
      width: 90,
      render: (_, row) => (
        <Tag color={RESPONSE_STATUS_META[row.status].color}>
          {RESPONSE_STATUS_META[row.status].text}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 170,
      render: (_, row) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          编辑
        </Button>,
        ...(row.status !== 'RESOLVED'
          ? [
              <Button
                key="resolve"
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  try {
                    await resolveResponse(row.id);
                    messageApi.success('已闭环');
                    reload();
                  } catch (e) {
                    handleError(e);
                  }
                }}
              >
                闭环
              </Button>,
            ]
          : []),
        <Popconfirm
          key="del"
          title="确定删除该响应记录？"
          description="删除后将从列表移除（软删）"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteResponse(row.id);
              messageApi.success('已删除');
              reload();
            } catch (e) {
              handleError(e);
            }
          }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const onFinish = async (values: ResponseFormValues) => {
    try {
      const followUpAt = values.followUpAt ? dayjs(values.followUpAt).toISOString() : undefined;
      if (editing) {
        const payload: UpdateResponseRequest = {
          type: values.type,
          sentiment: values.sentiment,
          content: String(values.content),
          followUpAction: values.followUpAction ? String(values.followUpAction) : undefined,
          followUpAt,
          status: values.status,
        };
        await updateResponse(editing.id, payload);
        messageApi.success('已保存');
      } else {
        const payload: CreateResponseRequest = {
          customerId: values.customerId,
          letterId: values.letterId,
          type: values.type,
          sentiment: values.sentiment,
          content: String(values.content),
          followUpAction: values.followUpAction ? String(values.followUpAction) : undefined,
          followUpAt,
        };
        await createResponse(payload);
        messageApi.success('已记录，状态为待跟进');
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
    <>
      <ProTable<CustomerResponse>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const data = await listResponses({
              customerId: params.customerId as number | undefined,
              status: params.status as ResponseStatus | undefined,
              sentiment: params.sentiment as ResponseSentiment | undefined,
              followUpOverdue: followUpFilter === 'overdue' ? true : undefined,
              followUpDueToday: followUpFilter === 'dueToday' ? true : undefined,
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        params={{ followUpFilter }} // 筛选变化 → 触发 request 重跑
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="客户响应（响应深化 · 记录反馈 + 下一步动作 + 闭环）"
        toolBarRender={() => [
          <Select
            key="followUp"
            aria-label="跟进状态筛选"
            value={followUpFilter}
            onChange={setFollowUpFilter}
            options={(Object.keys(FOLLOW_UP_FILTER_META) as FollowUpFilter[]).map((f) => ({
              label: FOLLOW_UP_FILTER_META[f].text,
              value: f,
            }))}
            style={{ width: 130 }}
          />,
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
            记录响应
          </Button>,
        ]}
        cardBordered
      />

      <ModalForm<ResponseFormValues>
        key={editing?.id ?? 'create-response'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑响应（#${editing.id}）` : '记录客户响应'}
        width={560}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                customerId: editing.customerId,
                letterId: editing.letterId ?? undefined,
                type: editing.type,
                sentiment: editing.sentiment,
                content: editing.content,
                followUpAction: editing.followUpAction ?? '',
                followUpAt: editing.followUpAt ?? undefined,
                status: editing.status,
              }
            : { type: 'PHONE', sentiment: 'NEUTRAL', status: 'OPEN' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormSelect
          name="customerId"
          label="客户"
          options={customerOptions}
          rules={[{ required: true, message: '请选择客户' }]}
          placeholder="选择客户（租户内）"
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          disabled={!!editing}
        />
        <ProFormSelect
          name="letterId"
          label="关联联系函 ID"
          placeholder="可选：填联系函 ID 关联主动触达（见联系函 Tab）"
          allowClear
        />
        <ProFormSelect
          name="type"
          label="响应方式"
          options={(Object.keys(RESPONSE_TYPE_META) as ResponseType[]).map((t) => ({
            label: RESPONSE_TYPE_META[t],
            value: t,
          }))}
          rules={[{ required: true, message: '请选择响应方式' }]}
        />
        <ProFormSelect
          name="sentiment"
          label="响应情绪"
          options={(Object.keys(SENTIMENT_META) as ResponseSentiment[]).map((s) => ({
            label: SENTIMENT_META[s].text,
            value: s,
          }))}
          rules={[{ required: true, message: '请选择响应情绪' }]}
        />
        <ProFormTextArea
          name="content"
          label="响应内容"
          rules={[
            { required: true, message: '请输入响应内容' },
            { max: 2000, message: '最长 2000 字' },
          ]}
          placeholder="客户反馈 / 诉求 / 投诉内容"
          fieldProps={{ rows: 4 }}
        />
        <ProFormText
          name="followUpAction"
          label="下一步动作"
          rules={[{ max: 1000, message: '最长 1000 字' }]}
          placeholder="响应深化：如「下周三前补发上线通知并回访」"
        />
        <ProFormDateTimePicker name="followUpAt" label="下次跟进时间" width="md" />
        {editing && (
          <ProFormSelect
            name="status"
            label="处理状态"
            options={(Object.keys(RESPONSE_STATUS_META) as ResponseStatus[]).map((s) => ({
              label: RESPONSE_STATUS_META[s].text,
              value: s,
            }))}
            rules={[{ required: true, message: '请选择处理状态' }]}
          />
        )}
      </ModalForm>
    </>
  );
}
