/**
 * 财务 · 记账本页（Phase 9）.
 *
 * 收支汇总卡（收入/支出/结余）+ 流水列表 + 记一笔 / 编辑 / 删除。
 */
import { useRef, useState } from 'react';
import { App, Button, Popconfirm, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import dayjs, { type Dayjs } from 'dayjs';

import { useApiError } from '../../hooks/useApiError';
import {
  createLedger,
  deleteLedger,
  getLedgerSummary,
  getMonthlySummary,
  listLedger,
  updateLedger,
} from '../../services/finance';
import {
  LEDGER_CATEGORIES,
  LEDGER_TYPE_META,
  type LedgerEntry,
  type LedgerSummary,
  type LedgerType,
  type MonthlySummary,
} from '@lieshoucloud/contract-types/business/finance';

const TYPE_OPTIONS = (Object.keys(LEDGER_TYPE_META) as LedgerType[]).map((t) => ({
  label: LEDGER_TYPE_META[t].text,
  value: t,
}));

interface FormValues {
  type: LedgerType;
  amount: number;
  category?: string;
  occurredAt: Dayjs;
  remark?: string;
}

export default function FinanceList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [summary, setSummary] = useState<LedgerSummary>({
    income: 0,
    expense: 0,
    balance: 0,
    count: 0,
  });
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);

  const refreshSummary = async () => {
    try {
      const [s, m] = await Promise.all([getLedgerSummary(), getMonthlySummary(6)]);
      setSummary(s);
      setMonthly(m);
    } catch {
      // 汇总失败不阻塞表格
    }
  };

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshSummary();
  };

  const columns: ProColumns<LedgerEntry>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(LEDGER_TYPE_META) as LedgerType[]).map((t) => [
          t,
          { text: LEDGER_TYPE_META[t].text },
        ]),
      ),
      render: (_, row) => (
        <Tag color={LEDGER_TYPE_META[row.type].color}>{LEDGER_TYPE_META[row.type].text}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      search: false,
      render: (_, row) => (
        <Typography.Text strong style={{ color: row.type === 'INCOME' ? '#52c41a' : '#f5222d' }}>
          {row.type === 'INCOME' ? '+' : '-'}¥ {row.amount.toFixed(2)}
        </Typography.Text>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 110,
      search: false,
      render: (_, r) => r.category ?? '—',
    },
    {
      title: '发生日期',
      dataIndex: 'occurredAt',
      valueType: 'date',
      width: 120,
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
      render: (_, r) => r.remark ?? '—',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
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
        <Popconfirm
          key="del"
          title="确定删除这笔记录？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteLedger(row.id);
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
      ],
    },
  ];

  const onFinish = async (values: FormValues) => {
    try {
      const payload = {
        type: values.type as LedgerType,
        amount: Number(values.amount),
        category: values.category ? String(values.category) : undefined,
        occurredAt: values.occurredAt.format('YYYY-MM-DD'),
        remark: values.remark ? String(values.remark) : undefined,
      };
      if (editing) {
        await updateLedger(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createLedger(payload);
        messageApi.success('已记一笔');
      }
      setModalOpen(false);
      setEditing(null);
      reloadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="记账本"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadAll}>
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
          记一笔
        </Button>,
      ]}
    >
      {/* 收支汇总 */}
      <ProCard
        split="vertical"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        bordered
      >
        <StatisticCard
          statistic={{
            title: '总收入',
            value: summary.income,
            prefix: '¥',
            valueStyle: { color: '#52c41a' },
          }}
        />
        <StatisticCard
          statistic={{
            title: '总支出',
            value: summary.expense,
            prefix: '¥',
            valueStyle: { color: '#f5222d' },
          }}
        />
        <StatisticCard
          statistic={{
            title: '结余',
            value: summary.balance,
            prefix: '¥',
            valueStyle: { color: summary.balance >= 0 ? '#1677ff' : '#f5222d' },
          }}
        />
        <StatisticCard statistic={{ title: '记录数', value: summary.count }} />
      </ProCard>

      {/* 月度收支报表（最近 6 个月，双柱对比） */}
      <ProCard
        title="月度收支"
        style={{ marginBottom: 16 }}
        bordered
        extra={<Tag color="blue">最近 6 个月</Tag>}
      >
        {monthly.length === 0 ? (
          <Typography.Text type="secondary">暂无月度数据（记几笔后这里会出现趋势）</Typography.Text>
        ) : (
          <MonthlyBars data={monthly} />
        )}
      </ProCard>

      <ProTable<LedgerEntry>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const data = await listLedger({
              type: params.type as LedgerType | undefined,
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
        headerTitle="收支流水（租户内数据）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 记一笔 / 编辑 */}
      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑记录 #${editing.id}` : '记一笔'}
        width={460}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                type: editing.type,
                amount: editing.amount,
                category: editing.category ?? undefined,
                occurredAt: dayjs(editing.occurredAt),
                remark: editing.remark ?? undefined,
              }
            : { type: 'INCOME', occurredAt: dayjs() }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormSelect
          name="type"
          label="类型"
          options={TYPE_OPTIONS}
          rules={[{ required: true, message: '请选择类型' }]}
        />
        <ProFormText
          name="amount"
          label="金额（元）"
          rules={[{ required: true, message: '请输入金额' }]}
          fieldProps={{ type: 'number', min: 0.01, step: 0.01 }}
          placeholder="12800"
          transform={(v) => Number(v)}
        />
        <ProFormSelect
          name="category"
          label="分类"
          options={LEDGER_CATEGORIES.map((c) => ({ label: c, value: c }))}
          allowClear
          placeholder="选择分类"
        />
        <ProFormDatePicker
          name="occurredAt"
          label="发生日期"
          rules={[{ required: true, message: '请选择日期' }]}
          fieldProps={{ style: { width: '100%' } }}
        />
        <ProFormTextArea name="remark" label="备注" placeholder="选填" />
      </ModalForm>
    </PageContainer>
  );
}

/**
 * 月度收支双柱图（自绘 CSS，无图表依赖）.
 * 每根柱由收入(绿) + 支出(红) 两段组成，柱顶标注当月结余。
 */
function MonthlyBars({ data }: { data: MonthlySummary[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  // 倒序 → 时间正序（后端 newest first）
  const asc = [...data].reverse();
  return (
    <div
      style={{ display: 'flex', gap: 12, alignItems: 'flex-end', minHeight: 160, paddingTop: 8 }}
    >
      {asc.map((d) => {
        const incomeH = (d.income / max) * 120;
        const expenseH = (d.expense / max) * 120;
        const totalH = incomeH + expenseH;
        return (
          <div key={d.month} style={{ flex: 1, textAlign: 'center' }}>
            <Typography.Text
              style={{ fontSize: 11, color: d.balance >= 0 ? '#1677ff' : '#f5222d' }}
            >
              {d.balance >= 0 ? '+' : ''}
              {Number(d.balance).toFixed(0)}
            </Typography.Text>
            <div
              style={{
                height: 130,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <div
                style={{
                  height: incomeH,
                  width: 22,
                  background: '#52c41a',
                  borderRadius: '3px 3px 0 0',
                }}
                title={`${d.month} 收入 ¥${Number(d.income).toFixed(2)}`}
              />
              <div
                style={{
                  height: expenseH,
                  width: 22,
                  background: '#f5222d',
                  borderRadius: totalH === expenseH ? 3 : 0,
                }}
                title={`${d.month} 支出 ¥${Number(d.expense).toFixed(2)}`}
              />
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {d.month.slice(5)}
            </Typography.Text>
          </div>
        );
      })}
    </div>
  );
}
