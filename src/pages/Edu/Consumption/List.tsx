import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import dayjs from 'dayjs';

import { useApiError } from '../../../hooks/useApiError';
import { createConsumption, listConsumptions } from '../../../services/supply';
import { listSupplyOrders } from '../../../services/supply';
import { formatMoney, type ConsumptionRecord } from '../../../types/supply';

/** 概览统计（客户端聚合） */
interface ConsumptionStats {
  total: number;
  /** 累计消课课时 */
  lessons: number;
}

/** 新建消课表单值 */
interface FormValues {
  supplyOrderId: number;
  consumedAt: string;
  lessonCount: number;
  remark?: string;
}

export default function ConsumptionList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<ConsumptionStats>({ total: 0, lessons: 0 });

  /** 刷新概览统计 */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listConsumptions();
      setStats({
        total: data.length,
        lessons: data.reduce((acc, c) => acc + c.lessonCount, 0),
      });
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

  const columns: ProColumns<ConsumptionRecord>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端统一 keyword（合作伙伴/课程名模糊）
      title: '合作伙伴 / 关键字',
      dataIndex: 'keyword',
      width: 150,
      render: (_, row) => row.partnerName ?? '—',
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      width: 160,
      search: false,
      ellipsis: true,
      render: (_, row) => row.courseName ?? '—',
    },
    {
      title: '供应单',
      dataIndex: 'supplyOrderId',
      width: 90,
      search: false,
      render: (_, row) => `#${row.supplyOrderId}`,
    },
    {
      title: '消课日期',
      dataIndex: 'consumedAt',
      width: 110,
      search: false,
    },
    {
      title: '课时',
      dataIndex: 'lessonCount',
      width: 80,
      search: false,
      render: (_, row) => `${row.lessonCount} 节`,
    },
    {
      title: '单课时价',
      dataIndex: 'unitPrice',
      width: 100,
      search: false,
      render: (_, row) => `¥${formatMoney(row.unitPrice)}`,
    },
    {
      title: '核销金额',
      dataIndex: 'writeoff',
      width: 100,
      search: false,
      render: (_, row) => `¥${formatMoney(row.unitPrice * row.lessonCount)}`,
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
  ];

  const onFinish = async (values: FormValues) => {
    try {
      await createConsumption({
        supplyOrderId: Number(values.supplyOrderId),
        consumedAt: dayjs(values.consumedAt).format('YYYY-MM-DD'),
        lessonCount: Number(values.lessonCount),
        remark: values.remark ? String(values.remark) : undefined,
      });
      messageApi.success('消课已记录（供应单余额已扣减）');
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
      title="消课明细"
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
          记消课
        </Button>,
      ]}
    >
      {/* 消课概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '消课记录数', value: stats.total }} />
        <StatisticCard statistic={{ title: '累计消课课时', value: stats.lessons, suffix: '节' }} />
      </ProCard>

      <ProTable<ConsumptionRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword = params.keyword as string | undefined;
            const data = await listConsumptions(keyword);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="消课台账（租户内数据；审计流水不可删除；结算核销按单课时价快照）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 记消课 */}
      <ModalForm<FormValues>
        key="create-consumption"
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="记消课"
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '记消课', resetText: '取消' },
        }}
      >
        <ProFormSelect
          name="supplyOrderId"
          label="供应单"
          rules={[{ required: true, message: '请选择供应单' }]}
          request={async () => {
            try {
              const orders = await listSupplyOrders();
              return orders
                .filter((o) => o.status === 'ACTIVE')
                .map((o) => {
                  const remain = Math.max(o.lessonCount - (o.consumedLessons ?? 0), 0);
                  return {
                    label: `#${o.id} ${o.partnerName ?? '—'} · ${o.courseName ?? '课程'} · 余 ${remain} 节`,
                    value: o.id,
                    disabled: remain <= 0,
                  };
                });
            } catch {
              return [];
            }
          }}
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          placeholder="选择有效（ACTIVE）供应单"
          extra="快照（单价/名称）由服务端从供应单取；余额不足会被后端拒绝（409）"
        />
        <ProFormDatePicker
          name="consumedAt"
          label="消课日期"
          rules={[{ required: true, message: '请选择消课日期' }]}
          fieldProps={{ format: 'YYYY-MM-DD' }}
        />
        <ProFormDigit
          name="lessonCount"
          label="本次课时"
          rules={[{ required: true, message: '请输入本次课时' }]}
          min={1}
          max={10000}
          fieldProps={{ precision: 0 }}
          placeholder="如 2"
          extra="余额归零时供应单自动完成"
        />
        <ProFormTextArea name="remark" label="备注" placeholder="考勤 / 点名结果备注" />
      </ModalForm>
    </PageContainer>
  );
}
