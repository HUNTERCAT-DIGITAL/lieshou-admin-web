import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Popconfirm, Space, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../hooks/useApiError';
import {
  caseStatusCounts,
  countCases,
  createCase,
  deleteCase,
  listCases,
  updateCase,
} from '../../services/legal';
import {
  CASE_PRIORITY_META,
  CASE_STAGE_META,
  CASE_STATUS_META,
  CASE_TYPE_META,
  type CasePriority,
  type CaseStage,
  type CaseStatus,
  type CaseType,
  type CreateCaseRequest,
  type LegalCase,
} from '@lieshoucloud/types/business/legal';

const STATUS_OPTIONS = (Object.keys(CASE_STATUS_META) as CaseStatus[]).map((s) => ({
  label: CASE_STATUS_META[s].text,
  value: s,
}));

const TYPE_OPTIONS = (Object.keys(CASE_TYPE_META) as CaseType[]).map((t) => ({
  label: CASE_TYPE_META[t],
  value: t,
}));

const STAGE_OPTIONS = (Object.keys(CASE_STAGE_META) as CaseStage[]).map((st) => ({
  label: CASE_STAGE_META[st].text,
  value: st,
}));

const PRIORITY_OPTIONS = (Object.keys(CASE_PRIORITY_META) as CasePriority[]).map((pr) => ({
  label: CASE_PRIORITY_META[pr].text,
  value: pr,
}));

/** 新建/编辑表单值 */
interface FormValues {
  caseNo: string;
  title: string;
  caseType: CaseType;
  stage?: CaseStage;
  stageProgress?: number;
  priority?: CasePriority;
  party?: string;
  oppositeParty?: string;
  court?: string;
  responsibleLawyer?: string;
  coLawyer?: string;
  amount?: number;
  filedAt?: string;
  closedAt?: string;
  remark?: string;
}

/** 状态机可前进的目标（用于"推进状态"操作提示） */
const NEXT_STATUS: Partial<Record<CaseStatus, CaseStatus>> = {
  INTAKE: 'FILED',
  FILED: 'IN_TRIAL',
  IN_TRIAL: 'CLOSED',
  CLOSED: 'ARCHIVED',
};

export default function CaseList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const handleError = useApiError();
  const [stats, setStats] = useState<(Record<CaseStatus, number> & { total: number }) | null>(
    null,
  );

  const loadStats = useCallback(async () => {
    try {
      const [total, byStatus] = await Promise.all([countCases(), caseStatusCounts()]);
      setStats({ total, ...byStatus });
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const columns: ProColumns<LegalCase>[] = [
    { title: 'MAT 编号', dataIndex: 'matterNo', width: 130, ellipsis: true, render: (_, r) => r.matterNo ?? '-' },
    {
      title: '阶段',
      dataIndex: 'stage',
      width: 140,
      valueType: 'select',
      valueEnum: Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.label])),
      render: (_, r) => <StatusTag meta={CASE_STAGE_META[r.stage]} />,
    },
    {
      title: '进度',
      dataIndex: 'stageProgress',
      width: 90,
      search: false,
      render: (_, r) => `${r.stageProgress}%`,
    },
    {
      title: '关注',
      dataIndex: 'priority',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(PRIORITY_OPTIONS.map((o) => [o.value, o.label])),
      render: (_, r) => <StatusTag meta={CASE_PRIORITY_META[r.priority]} />,
    },
    { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true, search: false },
    { title: '案件标题', dataIndex: 'title', ellipsis: true, search: true },
    {
      title: '类型',
      dataIndex: 'caseType',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label])),
      render: (_, r) => CASE_TYPE_META[r.caseType] ?? r.caseType,
    },
    { title: '我方当事人', dataIndex: 'party', width: 120, ellipsis: true, search: false },
    { title: '对方当事人', dataIndex: 'oppositeParty', width: 120, ellipsis: true, search: false },
    { title: '承办律师', dataIndex: 'responsibleLawyer', width: 100, search: true },
    { title: '受理法院', dataIndex: 'court', width: 160, ellipsis: true, search: false },
    {
      title: '标的额(元)',
      dataIndex: 'amount',
      width: 110,
      search: false,
      render: (_, r) =>
        typeof r.amount === 'number' ? `¥${r.amount.toLocaleString()}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label])),
      render: (_, r) => <StatusTag meta={CASE_STATUS_META[r.status]} />,
    },
    { title: '立案日期', dataIndex: 'filedAt', width: 110, search: false, render: (_, r) => r.filedAt ?? '-' },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        <Tooltip key="detail" title="查看详情与时间线">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/legal/cases/${record.id}`)}
          >
            详情
          </Button>
        </Tooltip>,
        <ModalForm<FormValues>
          key="edit"
          title="编辑案件"
          width={560}
          trigger={<Button type="link" size="small" icon={<EditOutlined />} />}
          initialValues={{
            caseNo: record.caseNo,
            title: record.title,
            caseType: record.caseType,
            stage: record.stage,
            stageProgress: record.stageProgress,
            priority: record.priority,
            party: record.party ?? undefined,
            oppositeParty: record.oppositeParty ?? undefined,
            court: record.court ?? undefined,
            responsibleLawyer: record.responsibleLawyer ?? undefined,
            coLawyer: record.coLawyer ?? undefined,
            amount: record.amount ?? undefined,
            filedAt: record.filedAt ?? undefined,
            closedAt: record.closedAt ?? undefined,
            remark: record.remark ?? undefined,
          }}
          onFinish={async (values) => {
            try {
              await updateCase(record.id, values);
              message.success('已更新');
              actionRef.current?.reload();
              await loadStats();
              return true;
            } catch (e) {
              handleError(e);
              return false;
            }
          }}
        >
          <CaseFormFields />
        </ModalForm>,
        NEXT_STATUS[record.status] ? (
          <Popconfirm
            key="advance"
            title={`推进状态到「${
              CASE_STATUS_META[NEXT_STATUS[record.status] as CaseStatus].text
            }」？`}
            onConfirm={async () => {
              try {
                await updateCase(record.id, {
                  caseNo: record.caseNo,
                  title: record.title,
                  status: NEXT_STATUS[record.status],
                });
                message.success('状态已推进');
                actionRef.current?.reload();
                await loadStats();
              } catch (e) {
                handleError(e);
              }
            }}
          >
            <Button type="link" size="small">
              推进
            </Button>
          </Popconfirm>
        ) : null,
        <Popconfirm
          key="delete"
          title="确认删除该案件？"
          onConfirm={async () => {
            try {
              await deleteCase(record.id);
              message.success('已删除');
              actionRef.current?.reload();
              await loadStats();
            } catch (e) {
              handleError(e);
            }
          }}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title="案件管理">
      {stats && (
        <StatisticCard.Group style={{ marginBottom: 16 }}>
          <StatisticCard statistic={{ title: '案件总数', value: stats.total, suffix: '件' }} />
          <StatisticCard statistic={{ title: '待立案', value: stats.INTAKE, suffix: '件' }} />
          <StatisticCard statistic={{ title: '已立案', value: stats.FILED, suffix: '件' }} />
          <StatisticCard statistic={{ title: '审理中', value: stats.IN_TRIAL, suffix: '件' }} />
          <StatisticCard statistic={{ title: '已结案', value: stats.CLOSED, suffix: '件' }} />
          <StatisticCard statistic={{ title: '已归档', value: stats.ARCHIVED, suffix: '件' }} />
        </StatisticCard.Group>
      )}
      <ProTable<LegalCase>
        actionRef={actionRef}
        rowKey="id"
        headerTitle="案件列表"
        columns={columns}
        scroll={{ x: 1500 }}
        options={{ setting: true, reload: false }}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => {
              actionRef.current?.reload();
              void loadStats();
            }}
          />,
          <ModalForm<FormValues>
            key="create"
            title="新建案件"
            width={560}
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                新建案件
              </Button>
            }
            modalProps={{ destroyOnClose: true }}
            onFinish={async (values) => {
              try {
                await createCase(values as CreateCaseRequest);
                message.success('已创建');
                actionRef.current?.reload();
                await loadStats();
                return true;
              } catch (e) {
                handleError(e);
                return false;
              }
            }}
          >
            <CaseFormFields />
          </ModalForm>,
        ]}
        request={async (params) => {
          try {
            const page = params.current ?? 1;
            const size = params.pageSize ?? 20;
            const data = await listCases(
              {
                keyword: (params.keyword as string) || undefined,
                status: (params.status as CaseStatus) || undefined,
                caseType: (params.caseType as CaseType) || undefined,
                stage: (params.stage as CaseStage) || undefined,
                priority: (params.priority as CasePriority) || undefined,
                lawyer: (params.responsibleLawyer as string) || undefined,
              },
              page,
              size,
            );
            return { data: data.items, success: true, total: data.total };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </PageContainer>
  );
}

/** 案件表单字段（新建/编辑共用） */
function CaseFormFields() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormText
        name="caseNo"
        label="案号"
        rules={[{ required: true, message: '请输入案号' }]}
        placeholder="如：(2026)赣01民初1234号"
      />
      <ProFormText
        name="title"
        label="案件标题"
        rules={[{ required: true, message: '请输入案件标题' }]}
        placeholder="如：王某某诉李某某民间借贷纠纷"
      />
      <ProFormSelect
        name="caseType"
        label="案件类型"
        initialValue="CIVIL"
        options={TYPE_OPTIONS}
      />
      <ProFormSelect name="stage" label="办理阶段" initialValue="CLIENT_MEETING" options={STAGE_OPTIONS} />
      <Space.Compact style={{ width: '100%' }}>
        <ProFormSelect name="priority" label="关注度" initialValue="MEDIUM" options={PRIORITY_OPTIONS} />
        <ProFormDigit
          name="stageProgress"
          label="阶段进度(%)"
          min={0}
          max={100}
          fieldProps={{ precision: 0 }}
          initialValue={0}
        />
      </Space.Compact>
      <Space.Compact style={{ width: '100%' }}>
        <ProFormText name="party" label="我方当事人" placeholder="赵某" />
        <ProFormText name="oppositeParty" label="对方当事人" placeholder="钱某" />
      </Space.Compact>
      <Space.Compact style={{ width: '100%' }}>
        <ProFormText name="responsibleLawyer" label="承办律师" placeholder="张律师" />
        <ProFormText name="coLawyer" label="协办律师" placeholder="李律师" />
      </Space.Compact>
      <ProFormText name="court" label="受理法院" placeholder="南昌市中级人民法院" />
      <Space.Compact style={{ width: '100%' }}>
        <ProFormDigit name="amount" label="标的额(元)" min={0} fieldProps={{ precision: 2 }} />
        <ProFormDatePicker name="filedAt" label="立案日期" />
      </Space.Compact>
      <ProFormTextArea name="remark" label="备注" placeholder="案件背景、重点提示等" />
    </Space>
  );
}
