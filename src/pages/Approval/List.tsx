/**
 * 审批流 · 列表页（Phase 9 · ADR-0032）.
 *
 * 三个 Tab：待我审批（inbox，带角标）/ 我发起的（mine）/ 全部（all）。
 * 操作：发起（Modal）· 通过 / 驳回（仅审批人）· 撤销（仅发起人）。
 */
import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, Modal, Popconfirm, Tabs, Tag, Typography } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
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

import { useApiError } from '../../hooks/useApiError';
import { listUsers } from '../../services/user';
import {
  approveApproval,
  cancelApproval,
  createApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
} from '../../services/approval';
import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  type ApprovalRequest,
  type ApprovalStatus,
  type ApprovalType,
} from '@lieshoucloud/types/business/approval';
import { useAuthStore } from '../../stores/auth';

const TYPE_OPTIONS = (Object.keys(APPROVAL_TYPE_META) as ApprovalType[]).map((t) => ({
  label: APPROVAL_TYPE_META[t].text,
  value: t,
}));

type TabKey = 'inbox' | 'mine' | 'all';

interface CreateFormValues {
  type: ApprovalType;
  title: string;
  amount?: number;
  detail?: string;
  approverId: number;
}

export default function ApprovalList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi, modal: modalApi } = App.useApp();
  const handleError = useApiError();
  const currentUser = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<TabKey>('inbox');
  const [createOpen, setCreateOpen] = useState(false);
  const [counts, setCounts] = useState({ inbox: 0, mine: 0 });
  const [rejectTarget, setRejectTarget] = useState<ApprovalRequest | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [approvers, setApprovers] = useState<{ id: number; label: string }[]>([]);

  // 阶段 2 · 审批人下拉（ADR-0032）：租户用户列表（gateway 注入 X-Tenant-Id）
  useEffect(() => {
    void listUsers()
      .then((users) =>
        setApprovers(
          users.map((u) => ({
            id: u.id,
            label: `${u.displayName || u.username} (#${u.id})`,
          })),
        ),
      )
      .catch(() => setApprovers([]));
  }, []);

  const refreshCounts = async () => {
    try {
      setCounts(await getApprovalCounts());
    } catch {
      // 计数失败不阻塞列表
    }
  };

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshCounts();
  };

  const userId = currentUser?.userId;

  const columns: ProColumns<ApprovalRequest>[] = [
    { title: 'ID', dataIndex: 'id', width: 56, search: false },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(APPROVAL_TYPE_META) as ApprovalType[]).map((t) => [
          t,
          { text: APPROVAL_TYPE_META[t].text },
        ]),
      ),
      render: (_, row) => (
        <Tag color={APPROVAL_TYPE_META[row.type].color}>{APPROVAL_TYPE_META[row.type].text}</Tag>
      ),
    },
    { title: '标题', dataIndex: 'title', ellipsis: true, search: false },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      search: false,
      render: (_, row) => (row.amount !== null ? `¥ ${Number(row.amount).toFixed(2)}` : '—'),
    },
    { title: '发起人', dataIndex: 'requesterId', width: 80, search: false },
    { title: '审批人', dataIndex: 'approverId', width: 80, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 96,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(APPROVAL_STATUS_META) as ApprovalStatus[]).map((s) => [
          s,
          { text: APPROVAL_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => (
        <Tag color={APPROVAL_STATUS_META[row.status].color}>
          {APPROVAL_STATUS_META[row.status].text}
        </Tag>
      ),
    },
    {
      title: '意见',
      dataIndex: 'comment',
      width: 140,
      ellipsis: true,
      search: false,
      render: (_, row) => row.comment ?? '—',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 160,
      search: false,
      render: (_, row) => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, row) => {
        const isApprover = userId !== null && row.approverId === userId;
        const isRequester = userId !== null && row.requesterId === userId;
        if (row.status !== 'PENDING') {
          return <Typography.Text type="secondary">已处理</Typography.Text>;
        }
        return [
          isApprover ? (
            <Button
              key="approve"
              type="link"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => onDecide(row, 'approve')}
            >
              通过
            </Button>
          ) : null,
          isApprover ? (
            <Button
              key="reject"
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => onDecide(row, 'reject')}
            >
              驳回
            </Button>
          ) : null,
          isRequester ? (
            <Popconfirm
              key="cancel"
              title="确定撤销这条审批？"
              okText="撤销"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                try {
                  await cancelApproval(row.id);
                  messageApi.success('已撤销');
                  reloadAll();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              <Button type="link" icon={<StopOutlined />}>
                撤销
              </Button>
            </Popconfirm>
          ) : null,
          !isApprover && !isRequester ? (
            <Typography.Text key="hint" type="secondary">
              无权操作
            </Typography.Text>
          ) : null,
        ];
      },
    },
  ];

  /** 通过/驳回（驳回走受控 Modal 填意见） */
  const onDecide = (row: ApprovalRequest, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      modalApi.confirm({
        title: `通过审批 #${row.id}`,
        content: (
          <div>
            <Typography.Paragraph style={{ marginBottom: 4 }}>{row.title}</Typography.Paragraph>
            <Typography.Text type="secondary">确定通过这条审批？</Typography.Text>
          </div>
        ),
        okText: '通过',
        cancelText: '取消',
        onOk: async () => {
          try {
            await approveApproval(row.id);
            messageApi.success('已通过');
            reloadAll();
          } catch (e) {
            handleError(e);
          }
        },
      });
      return;
    }
    setRejectComment('');
    setRejectTarget(row);
  };

  const onRejectConfirm = async () => {
    if (!rejectTarget) return;
    if (!rejectComment.trim()) {
      messageApi.warning('请填写驳回意见');
      return;
    }
    try {
      await rejectApproval(rejectTarget.id, rejectComment.trim());
      messageApi.success('已驳回');
      setRejectTarget(null);
      reloadAll();
    } catch (e) {
      handleError(e);
    }
  };

  const onCreate = async (values: CreateFormValues) => {
    try {
      await createApproval({
        type: values.type,
        title: values.title.trim(),
        amount: values.amount ? Number(values.amount) : undefined,
        detail: values.detail ? values.detail.trim() : undefined,
        approverId: Number(values.approverId),
      });
      messageApi.success('已发起审批');
      setCreateOpen(false);
      reloadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="审批流"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadAll}>
          刷新
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          发起审批
        </Button>,
      ]}
    >
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
        items={[
          {
            key: 'inbox',
            label: `待我审批${counts.inbox > 0 ? ` (${counts.inbox})` : ''}`,
          },
          { key: 'mine', label: '我发起的' },
          { key: 'all', label: '全部' },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* 驳回意见 Modal */}
      <Modal
        title={rejectTarget ? `驳回审批 #${rejectTarget.id}` : ''}
        open={rejectTarget !== null}
        onOk={() => void onRejectConfirm()}
        onCancel={() => setRejectTarget(null)}
        okText="驳回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        width={440}
        destroyOnClose
      >
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          {rejectTarget?.title}
        </Typography.Paragraph>
        <Input.TextArea
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          placeholder="必填：说明驳回原因"
          rows={3}
          maxLength={500}
        />
      </Modal>

      <ProTable<ApprovalRequest>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const role = tab === 'all' ? 'all' : tab;
            const data = await listApprovals({
              role,
              status: params.status as ApprovalStatus | undefined,
              type: params.type as ApprovalType | undefined,
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
        headerTitle="审批请求（租户内数据）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 发起审批 */}
      <ModalForm<CreateFormValues>
        key="create-approval"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="发起审批"
        width={460}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={{ type: 'EXPENSE' }}
        onFinish={onCreate}
        submitter={{ searchConfig: { submitText: '提交', resetText: '取消' } }}
      >
        <ProFormSelect
          name="type"
          label="类型"
          options={TYPE_OPTIONS}
          rules={[{ required: true, message: '请选择类型' }]}
        />
        <ProFormText
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
          placeholder="如：报销 8 月差旅费"
        />
        <ProFormText
          name="amount"
          label="金额（元）"
          fieldProps={{ type: 'number', min: 0.01, step: 0.01 }}
          placeholder="选填，金额类单据填"
          transform={(v) => Number(v)}
        />
        <ProFormTextArea name="detail" label="详情" placeholder="选填，补充说明" />
        <ProFormSelect
          name="approverId"
          label="审批人"
          showSearch
          options={approvers}
          fieldProps={{ optionFilterProp: 'label', placeholder: '选择审批人（租户用户）' }}
          rules={[{ required: true, message: '请选择审批人' }]}
        />
      </ModalForm>
    </PageContainer>
  );
}
