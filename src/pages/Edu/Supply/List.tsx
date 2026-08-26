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
  ProFormDatePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
  type ProFormInstance,
} from '@ant-design/pro-components';

import dayjs from 'dayjs';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../../hooks/useApiError';
import {
  cancelSupplyOrder,
  completeSupplyOrder,
  createSupplyOrder,
  deleteSupplyOrder,
  listSupplyOrders,
} from '../../../services/supply';
import { listCustomers } from '../../../services/crm';
import { listProducts } from '../../../services/inventory';
import {
  SUPPLY_STATUS_META,
  formatMoney,
  type CreateSupplyOrderRequest,
  type SupplyOrder,
  type SupplyOrderStatus,
} from '@lieshoucloud/types/business/supply';

/** 概览统计（总数 + 各状态，客户端聚合） */
interface SupplyStats {
  total: number;
  ACTIVE: number;
  COMPLETED: number;
  CANCELLED: number;
}

/** 新建供应单表单值 */
interface FormValues {
  partnerCustomerId?: number;
  courseId?: number;
  lessonCount: number;
  unitPrice: number;
  validUntil?: string;
  remark?: string;
}

export default function SupplyList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  /** 新建表单实例（课程选择联动预填课时包数据用） */
  const formRef = useRef<ProFormInstance<FormValues> | undefined>(undefined);
  /** 课程下拉数据源缓存（onChange 联动查课时包数据） */
  const productsRef = useRef<
    { id: number; lessonCount?: number | null; lessonPrice?: number | null }[]
  >([]);
  const [stats, setStats] = useState<SupplyStats>({
    total: 0,
    ACTIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });
  /** 选中合作伙伴/课程名快照（表单 onChange 记录，创建时回传后端） */
  const [partnerName, setPartnerName] = useState<string | undefined>(undefined);
  const [courseName, setCourseName] = useState<string | undefined>(undefined);

  /** 刷新概览统计（全量拉一次在客户端聚合；起步数据量小） */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listSupplyOrders();
      const s: SupplyStats = { total: data.length, ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
      for (const o of data) s[o.status] += 1;
      setStats(s);
    } catch {
      // 统计失败不阻塞页面（表格自身有错误处理）
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshStats();
  };

  const columns: ProColumns<SupplyOrder>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端统一 keyword（合作伙伴/课程名模糊），搜索框映射到 keyword
      title: '合作伙伴 / 关键字',
      dataIndex: 'keyword',
      width: 160,
      render: (_, row) => row.partnerName ?? '—',
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      width: 170,
      search: false,
      ellipsis: true,
      render: (_, row) => row.courseName ?? '—',
    },
    {
      title: '课时数',
      dataIndex: 'lessonCount',
      width: 80,
      search: false,
      render: (_, row) => `${row.lessonCount} 节`,
    },
    {
      title: '已消课',
      dataIndex: 'consumedLessons',
      width: 80,
      search: false,
      render: (_, row) => `${row.consumedLessons ?? 0} 节`,
    },
    {
      title: '剩余',
      dataIndex: 'remain',
      width: 80,
      search: false,
      render: (_, row) => `${Math.max(row.lessonCount - (row.consumedLessons ?? 0), 0)} 节`,
    },
    {
      title: '单课时价',
      dataIndex: 'unitPrice',
      width: 100,
      search: false,
      render: (_, row) => `¥${formatMoney(row.unitPrice)}`,
    },
    {
      title: '总金额',
      dataIndex: 'amount',
      width: 110,
      search: false,
      render: (_, row) => `¥${formatMoney(row.amount)}`,
    },
    {
      title: '有效期',
      dataIndex: 'validUntil',
      width: 110,
      search: false,
      render: (_, row) => row.validUntil ?? '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(SUPPLY_STATUS_META) as SupplyOrderStatus[]).map((s) => [
          s,
          { text: SUPPLY_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={SUPPLY_STATUS_META[row.status]} />,
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
      width: 140,
      render: (_, row) => {
        if (row.status === 'ACTIVE') {
          return [
            <Button
              key="complete"
              type="link"
              icon={<CheckOutlined />}
              onClick={async () => {
                try {
                  await completeSupplyOrder(row.id);
                  messageApi.success('已完成');
                  reloadAll();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              完成
            </Button>,
            <Popconfirm
              key="cancel"
              title="确定取消该供应单？"
              description="已有消课记录的供应单不可取消（后端会拒绝）"
              okText="取消供应单"
              cancelText="返回"
              onConfirm={async () => {
                try {
                  await cancelSupplyOrder(row.id);
                  messageApi.success('已取消');
                  reloadAll();
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              <Button type="link" danger icon={<CloseOutlined />}>
                取消
              </Button>
            </Popconfirm>,
          ];
        }
        return [
          <Popconfirm
            key="del"
            title="确定删除该供应单？"
            okText="删除"
            cancelText="返回"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await deleteSupplyOrder(row.id);
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
      const body: CreateSupplyOrderRequest = {
        partnerCustomerId: values.partnerCustomerId ? Number(values.partnerCustomerId) : undefined,
        partnerName,
        courseId: values.courseId ? Number(values.courseId) : undefined,
        courseName,
        lessonCount: Number(values.lessonCount),
        unitPrice: Number(values.unitPrice),
        validUntil: values.validUntil ? dayjs(values.validUntil).format('YYYY-MM-DD') : undefined,
        remark: values.remark ? String(values.remark) : undefined,
      };
      await createSupplyOrder(body);
      messageApi.success('供应单已创建（金额由服务端计算）');
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
      title="供应单"
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
          新建供应单
        </Button>,
      ]}
    >
      {/* 供应单概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '供应单总数', value: stats.total }} />
        <StatisticCard
          statistic={{
            title: '有效',
            value: stats.ACTIVE,
            valueStyle: { color: SUPPLY_STATUS_META.ACTIVE.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已完成',
            value: stats.COMPLETED,
            valueStyle: { color: SUPPLY_STATUS_META.COMPLETED.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已取消',
            value: stats.CANCELLED,
            valueStyle: { color: SUPPLY_STATUS_META.CANCELLED.color },
          }}
        />
      </ProCard>

      <ProTable<SupplyOrder>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword = params.keyword as string | undefined;
            const status = params.status as SupplyOrderStatus | undefined;
            const data = await listSupplyOrders(keyword, status);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="供应单台账（租户内数据；金额由服务端按 课时 × 单课时价 计算；有消课记录不可取消）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建供应单 */}
      <ModalForm<FormValues>
        key="create-supply"
        formRef={formRef}
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="新建供应单"
        width={520}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '创建供应单', resetText: '取消' },
        }}
      >
        <ProFormSelect
          name="partnerCustomerId"
          label="合作伙伴"
          request={async () => {
            try {
              const customers = await listCustomers();
              return customers.map((c) => ({ label: c.name, value: c.id }));
            } catch {
              return [];
            }
          }}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
            onChange: (_v, opt) =>
              setPartnerName(
                Array.isArray(opt)
                  ? undefined
                  : ((opt as { label?: string } | null)?.label ?? undefined),
              ),
          }}
          allowClear
          placeholder="选择合作伙伴机构（可选）"
        />
        <ProFormSelect
          name="courseId"
          label="课程产品"
          request={async () => {
            try {
              const products = await listProducts();
              productsRef.current = products;
              return products.map((p) => ({
                label: p.name + (p.lessonCount ? `（${p.lessonCount} 课时）` : ''),
                value: p.id,
              }));
            } catch {
              return [];
            }
          }}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
            onChange: (v, opt) => {
              setCourseName(
                Array.isArray(opt)
                  ? undefined
                  : ((opt as { label?: string } | null)?.label ?? undefined),
              );
              // 课程联动：选中课时包课程时自动带出课时数 / 单课时价（可改）
              const preset = productsRef.current.find((p) => p.id === v);
              if (preset) {
                formRef.current?.setFieldsValue({
                  lessonCount: preset.lessonCount ?? undefined,
                  unitPrice: preset.lessonPrice ?? undefined,
                });
              }
            },
          }}
          allowClear
          placeholder="选择课程产品（可选）"
          extra="选择课时包课程将自动带出课时数与单课时价（可修改）"
        />
        <ProFormDigit
          name="lessonCount"
          label="采购课时数"
          rules={[{ required: true, message: '请输入采购课时数' }]}
          min={1}
          max={1000000}
          fieldProps={{ precision: 0 }}
          placeholder="如 24"
        />
        <ProFormMoney
          name="unitPrice"
          label="单课时价（元）"
          rules={[{ required: true, message: '请输入单课时价' }]}
          min={0}
          placeholder="如 128"
        />
        <ProFormDatePicker
          name="validUntil"
          label="有效期至"
          fieldProps={{ format: 'YYYY-MM-DD' }}
          placeholder="可选"
          extra="总金额由服务端按 课时 × 单课时价 计算"
        />
        <ProFormTextArea name="remark" label="备注" placeholder="如：秋季学期 24 课时包" />
      </ModalForm>
    </PageContainer>
  );
}
