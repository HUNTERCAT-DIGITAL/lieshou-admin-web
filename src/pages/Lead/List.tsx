import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Drawer, Form, Input, Popconfirm, Segmented, Space, Timeline } from 'antd';
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  UndoOutlined,
  UploadOutlined,
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

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../hooks/useApiError';
import {
  addFollowUp,
  assignLead,
  convertLead,
  createLead,
  deleteLead,
  importLeads,
  listFollowUps,
  listLeads,
  releaseLead,
  updateLead,
} from '../../services/lead';
import { listUsers } from '../../services/user';
import { useAuthStore } from '../../stores/auth';
import {
  FOLLOW_UP_TYPE_META,
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
  type FollowUpType,
  type Lead,
  type LeadFollowUp,
  type LeadSource,
  type LeadStatus,
} from '@lieshoucloud/types/business/lead';
import { LEAD_TEMPLATE } from '../../utils/csv';
import ImportModal from '../../components/ImportModal';

const SOURCE_OPTIONS = (Object.keys(LEAD_SOURCE_META) as LeadSource[]).map((s) => ({
  label: LEAD_SOURCE_META[s],
  value: s,
}));

const FOLLOW_UP_OPTIONS = (Object.keys(FOLLOW_UP_TYPE_META) as FollowUpType[]).map((t) => ({
  label: FOLLOW_UP_TYPE_META[t],
  value: t,
}));

/** 新建/编辑表单值 */
interface FormValues {
  name: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
  source?: LeadSource;
  remark?: string;
}

/** 跟进表单值 */
interface FollowUpValues {
  type: FollowUpType;
  content: string;
  nextFollowUpAt?: string;
}

const OWNER_FILTERS = [
  { label: '全部', value: 0 },
  { label: '线索池（未认领）', value: -1 },
  { label: '我认领的', value: -2 }, // 前端用 -2 表示"我"，请求时替换为实际 userId
];

export default function LeadList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const myUserId = useAuthStore((s) => s.user?.userId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [userMap, setUserMap] = useState<Map<number, string>>(new Map());
  const [ownerFilter, setOwnerFilter] = useState<number>(0);

  // 跟进 Drawer
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<LeadFollowUp[]>([]);
  const [followUpForm] = Form.useForm<FollowUpValues>();

  // 拉租户用户用于「认领人」显示名（user-service 已按租户过滤）
  useEffect(() => {
    listUsers()
      .then((users) => setUserMap(new Map(users.map((u) => [u.id, u.displayName]))))
      .catch(() => {});
  }, []);

  const effectiveOwner = ownerFilter === -2 ? (myUserId ?? 0) : ownerFilter;

  const reload = useCallback(() => actionRef.current?.reload(), []);

  /** 打开跟进时间线 */
  const openFollowUp = async (lead: Lead) => {
    setFollowUpLead(lead);
    setFollowUpOpen(true);
    followUpForm.resetFields();
    try {
      setTimeline(await listFollowUps(lead.id));
    } catch (e) {
      handleError(e);
    }
  };

  const submitFollowUp = async () => {
    if (!followUpLead) return;
    const values = await followUpForm.validateFields();
    try {
      await addFollowUp(followUpLead.id, values);
      messageApi.success('跟进已记录');
      followUpForm.resetFields();
      setTimeline(await listFollowUps(followUpLead.id));
      reload();
    } catch (e) {
      handleError(e);
    }
  };

  const run = async (action: () => Promise<unknown>, okMsg: string) => {
    try {
      await action();
      messageApi.success(okMsg);
      reload();
    } catch (e) {
      handleError(e);
    }
  };

  const columns: ProColumns<Lead>[] = [
    {
      title: '线索名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, row) => (row.convertedCustomerId ? `${row.name} ✓` : row.name),
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 100,
      render: (_, r) => r.contactName ?? '—',
    },
    {
      title: '电话',
      dataIndex: 'contactPhone',
      width: 130,
      render: (_, r) => r.contactPhone ?? '—',
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 90,
      valueType: 'select',
      valueEnum: LEAD_SOURCE_META,
      render: (_, r) => LEAD_SOURCE_META[r.source] ?? r.source,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: LEAD_STATUS_META,
      render: (_, r) => <StatusTag meta={LEAD_STATUS_META[r.status]} />,
    },
    {
      title: '认领人',
      dataIndex: 'ownerId',
      width: 100,
      render: (_, r) =>
        r.ownerId ? (
          (userMap.get(r.ownerId) ?? `#${r.ownerId}`)
        ) : (
          <span style={{ color: '#999' }}>线索池</span>
        ),
    },
    {
      title: '最后跟进',
      dataIndex: 'lastFollowUpAt',
      width: 160,
      valueType: 'dateTime',
      render: (_, r) => (r.lastFollowUpAt ? new Date(r.lastFollowUpAt).toLocaleString() : '—'),
    },
    {
      title: '操作',
      width: 260,
      valueType: 'option',
      render: (_, row) => {
        const isPool = !row.ownerId;
        const isMine = row.ownerId === myUserId;
        const finished = row.status === 'CONVERTED' || row.status === 'LOST';
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<MessageOutlined />}
              disabled={finished}
              onClick={() => openFollowUp(row)}
            >
              跟进
            </Button>
            {isPool && !finished && (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => run(() => assignLead(row.id), '已认领')}
              >
                认领
              </Button>
            )}
            {isMine && row.status === 'NEW' && (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => run(() => convertLead(row.id), '已转化')}
              >
                转化
              </Button>
            )}
            {isMine && !finished && (
              <Popconfirm
                title="释放回线索池？"
                onConfirm={() => run(() => releaseLead(row.id), '已释放回池')}
              >
                <Button type="link" size="small" icon={<UndoOutlined />}>
                  释放
                </Button>
              </Popconfirm>
            )}
            {!finished && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(row);
                  setModalOpen(true);
                }}
              >
                编辑
              </Button>
            )}
            {!finished && (
              <Popconfirm
                title="确认删除线索？"
                onConfirm={() => run(() => deleteLead(row.id), '已删除')}
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title="线索管理" subTitle="线索池 · 公海回收（认领后 7 天无跟进自动回池）">
      <ProTable<Lead>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={
          <Space>
            <Segmented
              options={OWNER_FILTERS}
              value={ownerFilter}
              onChange={(v) => setOwnerFilter(v as number)}
            />
            <span style={{ color: '#999', fontSize: 12 }}>
              {ownerFilter === -1
                ? '仅显示未认领线索'
                : ownerFilter === -2
                  ? '仅显示我认领的线索'
                  : '全部线索'}
            </span>
          </Space>
        }
        toolBarRender={() => [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button key="import" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            导入
          </Button>,
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            新建线索
          </Button>,
        ]}
        request={async (params) => {
          try {
            const data = await listLeads(
              (params.keyword as string) ?? '',
              (params.status as LeadStatus) ?? undefined,
              effectiveOwner,
            );
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false };
          }
        }}
        columns={columns}
        search={{
          filterType: 'light',
          optionRender: false,
        }}
        pagination={{ pageSize: 20 }}
      />

      {/* 新建 / 编辑 */}
      <ModalForm<FormValues>
        title={editing ? '编辑线索' : '新建线索（进入线索池）'}
        open={modalOpen}
        initialValues={editing ?? { source: 'MANUAL' }}
        modalProps={{ destroyOnClose: true, onCancel: () => setModalOpen(false) }}
        onFinish={async (values) => {
          try {
            if (editing) {
              await updateLead(editing.id, values);
              messageApi.success('已更新');
            } else {
              await createLead(values);
              messageApi.success('已创建');
            }
            setModalOpen(false);
            reload();
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        }}
      >
        <ProFormText name="name" label="线索名称" rules={[{ required: true }]} />
        <ProFormText name="contactName" label="联系人" />
        <ProFormText name="contactPhone" label="联系电话" />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '邮箱格式不正确' }]}
        />
        <ProFormSelect name="source" label="来源" options={SOURCE_OPTIONS} />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>

      {/* CSV 导入 */}
      <ImportModal
        open={importOpen}
        title="CSV 导入线索"
        template={LEAD_TEMPLATE}
        onImport={(file) => importLeads(file)}
        onClose={() => setImportOpen(false)}
      />

      {/* 跟进时间线 */}
      <Drawer
        title={`跟进记录 · ${followUpLead?.name ?? ''}`}
        open={followUpOpen}
        width={480}
        onClose={() => setFollowUpOpen(false)}
      >
        <Form form={followUpForm} layout="vertical">
          <Form.Item name="type" label="跟进方式" initialValue="NOTE">
            <ProFormSelect
              name="type"
              options={FOLLOW_UP_OPTIONS}
              rules={[{ required: true }]}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="跟进内容"
            rules={[{ required: true, message: '请填写跟进内容' }]}
          >
            <Input.TextArea rows={3} placeholder="电话/拜访/微信沟通要点…" />
          </Form.Item>
          <Form.Item name="nextFollowUpAt" label="下次跟进时间">
            <Input type="datetime-local" />
          </Form.Item>
          <Button type="primary" onClick={submitFollowUp} block>
            记录跟进
          </Button>
        </Form>

        <div style={{ marginTop: 24 }}>
          <Timeline
            items={timeline.map((f) => ({
              color:
                f.type === 'PHONE'
                  ? 'blue'
                  : f.type === 'VISIT'
                    ? 'green'
                    : f.type === 'WECHAT'
                      ? 'cyan'
                      : 'gray',
              children: (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {FOLLOW_UP_TYPE_META[f.type]} · {new Date(f.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 4 }}>{f.content}</div>
                  {f.nextFollowUpAt && (
                    <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
                      下次跟进：{new Date(f.nextFollowUpAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
          {timeline.length === 0 && (
            <div style={{ color: '#999', textAlign: 'center' }}>暂无跟进记录</div>
          )}
        </div>
      </Drawer>
    </PageContainer>
  );
}
