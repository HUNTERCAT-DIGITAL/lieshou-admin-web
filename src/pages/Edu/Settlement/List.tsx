import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
  type ProFormInstance,
} from '@ant-design/pro-components';

import type { Dayjs } from 'dayjs';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../../hooks/useApiError';
import {
  approveSettlement,
  createSettlement,
  deleteSettlement,
  listSettlements,
  rejectSettlement,
} from '../../../services/supply';
import { listCustomers } from '../../../services/crm';
import {
  SETTLEMENT_STATUS_META,
  defaultSettlementPeriod,
  formatMoney,
  type Settlement,
  type SettlementStatus,
  type SettleCycle,
} from '@lieshoucloud/types/business/supply';

/** 概览统计（客户端聚合） */
interface SettlementStats {
  total: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
}

/** 新建结算单表单值 */
interface FormValues {
  partnerCustomerId?: number;
  period: [Dayjs, Dayjs];
  /** 智野分成比例（%，可空） */
  revenueShare?: number;
  remark?: string;
}

export default function SettlementList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<SettlementStats>({
    total: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  /** 选中合作伙伴名快照（表单 onChange 记录，创建时回传后端） */
  const [partnerName, setPartnerName] = useState<string | undefined>(undefined);
  /** 新建表单实例（合作伙伴结算周期/分成比例联动预填用） */
  const formRef = useRef<ProFormInstance<FormValues> | undefined>(undefined);
  /** 客户下拉数据源缓存（onChange 联动查 settle_cycle / revenue_share） */
  const customersRef = useRef<
    { id: number; settleCycle?: string | null; revenueShare?: number | null }[]
  >([]);
  /** 当前选中合作伙伴的结算周期（UI 提示用） */
  const [settleCycle, setSettleCycle] = useState<SettleCycle | null>(null);

  /** 刷新概览统计 */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listSettlements();
      const s: SettlementStats = { total: data.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
      for (const st of data) s[st.status] += 1;
      setStats(s);
    } catch {
      // 统计失败不阻塞页面
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshStats();
  };

  const columns: ProColumns<Settlement>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端统一 keyword（合作伙伴名模糊）
      title: '合作伙伴 / 关键字',
      dataIndex: 'keyword',
      width: 150,
      render: (_, row) => row.partnerName ?? '—',
    },
    {
      title: '结算周期',
      dataIndex: 'period',
      width: 190,
      search: false,
      render: (_, row) => `${row.periodStart} ~ ${row.periodEnd}`,
    },
    {
      title: '采购应付',
      dataIndex: 'purchasedAmount',
      width: 110,
      search: false,
      render: (_, row) => `¥${formatMoney(row.purchasedAmount)}`,
    },
    {
      title: '消耗核销',
      dataIndex: 'consumed',
      width: 150,
      search: false,
      render: (_, row) => `${row.consumedLessons} 节 · ¥${formatMoney(row.consumedAmount)}`,
    },
    {
      title: '应结金额',
      dataIndex: 'settleAmount',
      width: 120,
      search: false,
      render: (_, row) => `¥${formatMoney(row.settleAmount)}`,
    },
    {
      title: '分成比例',
      dataIndex: 'revenueShare',
      width: 90,
      search: false,
      render: (_, row) => (row.revenueShare !== null ? `${row.revenueShare}%` : '—'),
    },
    {
      title: '智野分成金额',
      dataIndex: 'shareAmount',
      width: 120,
      search: false,
      render: (_, row) => `¥${formatMoney(row.shareAmount)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(SETTLEMENT_STATUS_META) as SettlementStatus[]).map((s) => [
          s,
          { text: SETTLEMENT_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={SETTLEMENT_STATUS_META[row.status]} />,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 130,
      search: false,
      ellipsis: true,
      render: (_, row) =>
        row.remark ? (
          <Tooltip title={row.remark}>
            <span>{row.remark}</span>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 165,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, row) => {
        if (row.status !== 'PENDING') {
          return [];
        }
        return [
          <Button
            key="approve"
            type="link"
            icon={<CheckOutlined />}
            onClick={async () => {
              try {
                await approveSettlement(row.id);
                messageApi.success('已通过');
                reloadAll();
              } catch (e) {
                handleError(e);
              }
            }}
          >
            通过
          </Button>,
          <Popconfirm
            key="reject"
            title="确定驳回该结算单？"
            description="驳回后可按同一周期重新开单"
            okText="驳回"
            cancelText="返回"
            onConfirm={async () => {
              try {
                await rejectSettlement(row.id);
                messageApi.success('已驳回');
                reloadAll();
              } catch (e) {
                handleError(e);
              }
            }}
          >
            <Button type="link" danger icon={<CloseOutlined />}>
              驳回
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="del"
            title="确定删除该结算单？"
            okText="删除"
            cancelText="返回"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await deleteSettlement(row.id);
                messageApi.success('已删除');
                reloadAll();
              } catch (e) {
                handleError(e);
              }
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>,
        ];
      },
    },
  ];

  const onFinish = async (values: FormValues) => {
    try {
      const [start, end] = values.period;
      if (!start || !end) {
        messageApi.warning('请选择完整的结算周期');
        return false;
      }
      await createSettlement({
        partnerCustomerId: values.partnerCustomerId ? Number(values.partnerCustomerId) : undefined,
        partnerName,
        periodStart: start.format('YYYY-MM-DD'),
        periodEnd: end.format('YYYY-MM-DD'),
        revenueShare:
          values.revenueShare === undefined || values.revenueShare === null
            ? undefined
            : Number(values.revenueShare),
        remark: values.remark ? String(values.remark) : undefined,
      });
      messageApi.success('结算单已创建（金额由服务端聚合）');
      setModalOpen(false);
      reloadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="结算单"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadAll}>
          刷新
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          新建结算单
        </Button>,
      ]}
    >
      {/* 结算概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '结算单总数', value: stats.total }} />
        <StatisticCard
          statistic={{
            title: '待审批',
            value: stats.PENDING,
            valueStyle: { color: SETTLEMENT_STATUS_META.PENDING.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已通过',
            value: stats.APPROVED,
            valueStyle: { color: SETTLEMENT_STATUS_META.APPROVED.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已驳回',
            value: stats.REJECTED,
            valueStyle: { color: SETTLEMENT_STATUS_META.REJECTED.color },
          }}
        />
      </ProCard>

      <ProTable<Settlement>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword = params.keyword as string | undefined;
            const status = params.status as SettlementStatus | undefined;
            const data = await listSettlements(keyword, status);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="结算台账（租户内数据；应结金额 = 采购应付 − 消耗核销，由服务端按 合作伙伴 × 周期 聚合；同周期重复开单会被拒绝）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建结算单 */}
      <ModalForm<FormValues>
        key="create-settlement"
        formRef={formRef}
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="新建结算单"
        width={520}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '创建结算单', resetText: '取消' },
        }}
      >
        <ProFormSelect
          name="partnerCustomerId"
          label="合作伙伴"
          request={async () => {
            try {
              const customers = await listCustomers();
              customersRef.current = customers;
              return customers.map((c) => ({
                label: c.name + (c.settleCycle ? `（${c.settleCycle}结）` : ''),
                value: c.id,
              }));
            } catch {
              return [];
            }
          }}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
            onChange: (v, opt) => {
              setPartnerName(
                Array.isArray(opt)
                  ? undefined
                  : ((opt as { label?: string } | null)?.label ?? undefined),
              );
              // 结算周期联动：按合作伙伴 settle_cycle（月/季/学期）自动生成「上一完整周期」预填（可改）
              const c = customersRef.current.find((x) => x.id === v);
              const cycle = c?.settleCycle || null;
              setSettleCycle(cycle as SettleCycle | null);
              const period = defaultSettlementPeriod(cycle);
              if (period) {
                formRef.current?.setFieldsValue({ period });
              }
              // 分成比例联动：带出客户配置（可改）
              if (c?.revenueShare !== null && c?.revenueShare !== undefined) {
                formRef.current?.setFieldsValue({ revenueShare: c.revenueShare });
              }
            },
          }}
          allowClear
          placeholder="选择合作伙伴机构（可选）"
          extra="已配置结算周期（月/季/学期）的合作伙伴将自动生成上一完整周期，可修改"
        />
        <ProFormDateRangePicker
          name="period"
          label="结算周期"
          rules={[{ required: true, message: '请选择结算周期' }]}
          fieldProps={{ format: 'YYYY-MM-DD' }}
          extra={settleCycle ? `当前合作伙伴按「${settleCycle}结」自动生成，可修改` : undefined}
        />
        <ProFormDigit
          name="revenueShare"
          label="智野分成比例（%）"
          min={0}
          max={100}
          fieldProps={{ precision: 2 }}
          placeholder="如 60（空 = 未约定）"
          extra="结算时从合作伙伴档案带出，可修改；分成金额 = 应结金额 × 比例，由服务端计算"
        />
        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="如：9 月结算 · 秋季学期采购"
          extra="金额（采购应付 / 消耗核销 / 应结）由服务端按周期聚合，无需填写"
        />
      </ModalForm>
    </PageContainer>
  );
}
