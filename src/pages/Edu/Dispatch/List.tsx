import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Popconfirm, Select, Tooltip } from 'antd';
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
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import type { Dayjs } from 'dayjs';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../../hooks/useApiError';
import {
  cancelDispatch,
  completeDispatch,
  createDispatch,
  deleteDispatch,
  listDispatches,
} from '../../../services/dispatch';
import { listCustomers } from '../../../services/crm';
import { listProducts } from '../../../services/inventory';
import { listTeachers } from '../../../services/teacher';
import { STATUS_META, formatSlot, type DispatchRecord, type DispatchStatus } from '@lieshoucloud/types/business/dispatch';

/** 概览统计（总数 + 各状态，客户端聚合） */
interface DispatchStats {
  total: number;
  DISPATCHED: number;
  COMPLETED: number;
  CANCELLED: number;
}

/** 新建派遣表单值 */
interface FormValues {
  teacherId: number;
  partnerCustomerId?: number;
  courseId?: number;
  /** DateTimeRangePicker 值：[开始, 结束] */
  slot: [Dayjs, Dayjs];
  lessonCount?: number;
  remark?: string;
}

export default function DispatchList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<DispatchStats>({
    total: 0,
    DISPATCHED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });
  /** 工具栏师资筛选（异步加载；follow IoT Devices 页模式） */
  const [teacherFilter, setTeacherFilter] = useState<number | undefined>(undefined);
  const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: number }[]>([]);

  /** 刷新概览统计（全量拉一次在客户端聚合；起步数据量小） */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listDispatches();
      const s: DispatchStats = { total: data.length, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
      for (const d of data) s[d.status] += 1;
      setStats(s);
    } catch {
      // 统计失败不阻塞页面（表格自身有错误处理）
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  /** 加载工具栏师资选项（含被筛选师资的已删/停用兜底——后端不返回，前端直接回显 #id） */
  useEffect(() => {
    listTeachers()
      .then((teachers) =>
        setTeacherOptions(teachers.map((t) => ({ label: t.name, value: t.id }))),
      )
      .catch(() => {
        /* 筛选器失败不阻塞页面 */
      });
  }, []);

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshStats();
  };

  const columns: ProColumns<DispatchRecord>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端统一 keyword（师资/合作伙伴/课程名模糊），搜索框映射到 keyword
      title: '师资 / 关键字',
      dataIndex: 'keyword',
      width: 140,
      render: (_, row) => row.teacherName,
    },
    {
      title: '合作伙伴',
      dataIndex: 'partnerName',
      width: 170,
      search: false,
      ellipsis: true,
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
      title: '派遣时段',
      dataIndex: 'slot',
      width: 210,
      search: false,
      render: (_, row) => formatSlot(row.slotStart, row.slotEnd),
    },
    {
      title: '课时',
      dataIndex: 'lessonCount',
      width: 70,
      search: false,
      render: (_, row) => `${row.lessonCount} 节`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(STATUS_META) as DispatchStatus[]).map((s) => [
          s,
          { text: STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={STATUS_META[row.status]} />,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
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
      width: 170,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, row) => {
        if (row.status === 'DISPATCHED') {
          return [
            <Button
              key="complete"
              type="link"
              icon={<CheckOutlined />}
              onClick={async () => {
                try {
                  await completeDispatch(row.id);
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
              title="确定取消该派遣？"
              description={`${row.teacherName} 的本次派遣将取消（师资产能释放）`}
              okText="取消派遣"
              cancelText="返回"
              onConfirm={async () => {
                try {
                  await cancelDispatch(row.id);
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
            title="确定删除该派遣记录？"
            okText="删除"
            cancelText="返回"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await deleteDispatch(row.id);
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
      const [start, end] = values.slot;
      if (!start || !end) {
        messageApi.warning('请选择完整的派遣时段');
        return false;
      }
      await createDispatch({
        teacherId: Number(values.teacherId),
        partnerCustomerId: values.partnerCustomerId ? Number(values.partnerCustomerId) : undefined,
        courseId: values.courseId ? Number(values.courseId) : undefined,
        slotStart: start.toISOString(),
        slotEnd: end.toISOString(),
        lessonCount: values.lessonCount ? Number(values.lessonCount) : undefined,
        remark: values.remark ? String(values.remark) : undefined,
      });
      messageApi.success('派遣已创建（教师状态联动为派遣中）');
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
      title="师资派遣"
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
          新建派遣
        </Button>,
      ]}
    >
      {/* 派遣概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '派遣总数', value: stats.total }} />
        <StatisticCard
          statistic={{
            title: '进行中',
            value: stats.DISPATCHED,
            valueStyle: { color: STATUS_META.DISPATCHED.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已完成',
            value: stats.COMPLETED,
            valueStyle: { color: STATUS_META.COMPLETED.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已取消',
            value: stats.CANCELLED,
            valueStyle: { color: STATUS_META.CANCELLED.color },
          }}
        />
      </ProCard>

      <ProTable<DispatchRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword = params.keyword as string | undefined;
            const status = params.status as DispatchStatus | undefined;
            const data = await listDispatches(keyword, status, teacherFilter);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="派遣台账（租户内数据；时段重叠 / 周产能超限会被后端拒绝）"
        toolBarRender={() => [
          <Select
            key="teacher-filter"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="按师资筛选"
            style={{ width: 180 }}
            value={teacherFilter}
            onChange={(v) => {
              setTeacherFilter(v as number | undefined);
              actionRef.current?.reload();
            }}
            options={teacherOptions}
          />,
        ]}
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建派遣 */}
      <ModalForm<FormValues>
        key="create-dispatch"
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="新建派遣"
        width={560}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '创建派遣', resetText: '取消' },
        }}
      >
        <ProFormSelect
          name="teacherId"
          label="派遣师资"
          rules={[{ required: true, message: '请选择师资' }]}
          request={async () => {
            try {
              const teachers = await listTeachers();
              return teachers
                .filter((t) => t.status !== 'DISABLED')
                .map((t) => ({
                  label: `${t.name}${t.subject ? `（${t.subject}）` : ''} · ${t.status === 'DISPATCHING' ? '派遣中' : '可用'}`,
                  value: t.id,
                }));
            } catch {
              return [];
            }
          }}
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          placeholder="选择师资（停用教师不可选）"
          extra="创建后教师状态联动为「派遣中」；时段重叠或超周产能会被后端拒绝"
        />
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
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          allowClear
          placeholder="选择合作伙伴机构（可选）"
        />
        <ProFormSelect
          name="courseId"
          label="课程产品"
          request={async () => {
            try {
              const products = await listProducts();
              return products.map((p) => ({
                label: p.name + (p.lessonCount ? `（${p.lessonCount} 课时）` : ''),
                value: p.id,
              }));
            } catch {
              return [];
            }
          }}
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          allowClear
          placeholder="选择课程产品（可选）"
        />
        <ProFormDateTimeRangePicker
          name="slot"
          label="派遣时段"
          rules={[{ required: true, message: '请选择派遣时段' }]}
          fieldProps={{ format: 'YYYY-MM-DD HH:mm' }}
        />
        <ProFormDigit
          name="lessonCount"
          label="课时数"
          min={1}
          max={1000}
          fieldProps={{ precision: 0 }}
          placeholder="默认 1 节"
        />
        <ProFormTextArea name="remark" label="备注" placeholder="排期 / 授课内容备注" />
      </ModalForm>
    </PageContainer>
  );
}
