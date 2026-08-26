import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Dropdown, Popconfirm, Space, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProCard,
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
import { getEdition } from '../../config/editions';
import {
  createCustomer,
  deleteCustomer,
  importCustomers,
  listCustomers,
  updateCustomer,
} from '../../services/crm';
import { listUsers } from '../../services/user';
import { STATUS_META, type Customer, type CustomerStatus } from '@lieshoucloud/types/business/customer';
import { runBatch } from '../../utils/batch';
import { CUSTOMER_TEMPLATE } from '../../utils/csv';
import ImportModal from '../../components/ImportModal';

const STATUS_OPTIONS = (Object.keys(STATUS_META) as CustomerStatus[]).map((s) => ({
  label: STATUS_META[s].text,
  value: s,
}));

/** 概览统计（总 + 各状态） */
interface CustomerStats {
  total: number;
  NEW: number;
  FOLLOWING: number;
  CONVERTED: number;
  LOST: number;
}

/** 新建/编辑表单值（ModalForm 泛型） */
interface FormValues {
  name: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
  address?: string;
  ownerId?: number;
  status: CustomerStatus;
  remark?: string;
  // 教育版（zhiye · 合作伙伴）扩展字段
  licenseNo?: string;
  licenseAttach?: string;
  region?: string;
  contractPeriod?: string;
  settleCycle?: string;
}

/** 教育供应商模式（zhiye · B2B2C）：CRM 客户即合作伙伴，展示资质/协议字段 */
const eduSupplier = getEdition().eduSupplier === true;

export default function CustomerList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    NEW: 0,
    FOLLOWING: 0,
    CONVERTED: 0,
    LOST: 0,
  });
  const [userMap, setUserMap] = useState<Map<number, string>>(new Map());

  /** 刷新概览统计（全量拉一次在客户端聚合；起步数据量小） */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listCustomers();
      const s: CustomerStats = { total: data.length, NEW: 0, FOLLOWING: 0, CONVERTED: 0, LOST: 0 };
      for (const c of data) s[c.status] += 1;
      setStats(s);
    } catch {
      // 统计失败不阻塞页面（表格自身有错误处理）
    }
  }, []);

  /** 拉租户用户用于「负责人」下拉 + 表格显示名（user-service 已按租户过滤） */
  useEffect(() => {
    listUsers()
      .then((users) => setUserMap(new Map(users.map((u) => [u.id, u.displayName]))))
      .catch(() => {});
    void refreshStats();
  }, [refreshStats]);

  /** 负责人选择项（按显示名排序） */
  const ownerOptions = useCallback(() => {
    const entries = [...userMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    return entries.map(([id, name]) => ({ label: `${name}（#${id}）`, value: id }));
  }, [userMap]);

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshStats();
  };

  /** 批量软删（并行执行、部分失败不中断） */
  const batchDelete = async (keys: React.Key[]) => {
    setBatchBusy(true);
    const ids = keys.map(Number).filter(Number.isFinite);
    const { ok, fail } = await runBatch(ids, (id) => deleteCustomer(id));
    if (ok > 0) messageApi.success(`已删除 ${ok} 条${fail ? `（${fail} 失败）` : ''}`);
    if (fail > 0) handleError(new Error(`${fail} 条删除失败`));
    setSelectedRowKeys([]);
    reloadAll();
    setBatchBusy(false);
  };

  /** 批量改状态 */
  const batchUpdateStatus = async (keys: React.Key[], status: CustomerStatus) => {
    setBatchBusy(true);
    const ids = keys.map(Number).filter(Number.isFinite);
    const { ok, fail } = await runBatch(ids, (id) => updateCustomer(id, { status }));
    if (ok > 0)
      messageApi.success(
        `已更新 ${ok} 条为「${STATUS_META[status].text}」${fail ? `（${fail} 失败）` : ''}`,
      );
    if (fail > 0) handleError(new Error(`${fail} 条更新失败`));
    setSelectedRowKeys([]);
    reloadAll();
    setBatchBusy(false);
  };

  const columns: ProColumns<Customer>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端只支持统一 keyword（名称/联系人/电话模糊），搜索框映射到 keyword
      title: '客户名称 / 关键字',
      dataIndex: 'keyword',
      width: 220,
      render: (_, row) => row.name,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 110,
      search: false,
      render: (_, row) => row.contactName ?? '—',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 130,
      search: false,
      render: (_, row) => row.contactPhone ?? '—',
    },
    {
      title: '跟进状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(STATUS_META) as CustomerStatus[]).map((s) => [
          s,
          { text: STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={STATUS_META[row.status]} />,
    },
    {
      title: '负责人',
      dataIndex: 'ownerId',
      width: 130,
      search: false,
      render: (_, row) => (row.ownerId && userMap.get(row.ownerId)) ?? row.ownerId ?? '—',
    },
    // 教育版（zhiye · 合作伙伴）列：仅 eduSupplier 版别渲染
    ...(eduSupplier
      ? [
          {
            title: '合作区域',
            dataIndex: 'region',
            width: 120,
            search: false,
            render: (_: unknown, r: Customer) => r.region ?? '—',
          },
          {
            title: '结算周期',
            dataIndex: 'settleCycle',
            width: 90,
            search: false,
            render: (_: unknown, r: Customer) => r.settleCycle ?? '—',
          },
        ]
      : []),
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      search: false,
      ellipsis: true,
      render: (_, row) => row.email ?? '—',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 180,
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
      width: 170,
      render: (_, row) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/customer/detail/${row.id}`)}
        >
          详情
        </Button>,
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
          title="确定删除该客户？"
          description={`${row.name} 删除后将从列表移除（软删）`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteCustomer(row.id);
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
        name: String(values.name),
        contactName: values.contactName ? String(values.contactName) : undefined,
        contactPhone: values.contactPhone ? String(values.contactPhone) : undefined,
        email: values.email ? String(values.email) : undefined,
        address: values.address ? String(values.address) : undefined,
        ownerId: values.ownerId,
        status: values.status as CustomerStatus,
        remark: values.remark ? String(values.remark) : undefined,
        // 教育版（zhiye · 合作伙伴）扩展字段
        licenseNo: values.licenseNo ? String(values.licenseNo) : undefined,
        licenseAttach: values.licenseAttach ? String(values.licenseAttach) : undefined,
        region: values.region ? String(values.region) : undefined,
        contractPeriod: values.contractPeriod ? String(values.contractPeriod) : undefined,
        settleCycle: values.settleCycle ? String(values.settleCycle) : undefined,
      };
      if (editing) {
        await updateCustomer(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createCustomer(payload);
        messageApi.success('已创建');
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
      title="客户管理"
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
          新建客户
        </Button>,
      ]}
    >
      {/* 客户概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '客户总数', value: stats.total }} />
        <StatisticCard
          statistic={{
            title: '新客户',
            value: stats.NEW,
            valueStyle: { color: STATUS_META.NEW.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '跟进中',
            value: stats.FOLLOWING,
            valueStyle: { color: STATUS_META.FOLLOWING.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已转化',
            value: stats.CONVERTED,
            valueStyle: { color: STATUS_META.CONVERTED.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '已流失',
            value: stats.LOST,
            valueStyle: { color: STATUS_META.LOST.color },
          }}
        />
      </ProCard>

      <ProTable<Customer>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const status = params.status as CustomerStatus | undefined;
            const data = await listCustomers(keyword, status);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="客户列表（租户内数据，跨租户不可见）"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
        options={{ setting: { draggable: true, checkable: true } }}
        toolBarRender={() => [
          <Space.Compact key="batch" size="small">
            <Popconfirm
              key="del"
              title={`确定批量删除 ${selectedRowKeys.length} 条客户？`}
              description="删除后将从列表移除（软删），请谨慎操作。"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              disabled={selectedRowKeys.length === 0}
              onConfirm={() => void batchDelete(selectedRowKeys)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                loading={batchBusy}
              >
                批量删除{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
              </Button>
            </Popconfirm>
            <Dropdown
              key="status"
              menu={{
                items: (Object.keys(STATUS_META) as CustomerStatus[]).map((s) => ({
                  key: s,
                  label: `改为「${STATUS_META[s].text}」`,
                  disabled: selectedRowKeys.length === 0 || batchBusy,
                  onClick: () => void batchUpdateStatus(selectedRowKeys, s),
                })),
              }}
              disabled={selectedRowKeys.length === 0 || batchBusy}
            >
              <Button icon={<EditOutlined />} disabled={selectedRowKeys.length === 0}>
                批量改状态
              </Button>
            </Dropdown>
          </Space.Compact>,
          <Button key="import" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            CSV 导入
          </Button>,
        ]}
        cardBordered
      />

      {/* CSV 导入 */}
      <ImportModal
        open={importOpen}
        title="CSV 导入客户"
        template={CUSTOMER_TEMPLATE}
        onImport={(file) => importCustomers(file)}
        onClose={() => setImportOpen(false)}
      />

      {/* 新建 / 编辑 */}
      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑客户：${editing.name}` : '新建客户'}
        width={540}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                contactName: editing.contactName ?? undefined,
                contactPhone: editing.contactPhone ?? undefined,
                email: editing.email ?? undefined,
                address: editing.address ?? undefined,
                ownerId: editing.ownerId ?? undefined,
                status: editing.status,
                remark: editing.remark ?? undefined,
                // 教育版（zhiye · 合作伙伴）扩展字段
                licenseNo: editing.licenseNo ?? undefined,
                licenseAttach: editing.licenseAttach ?? undefined,
                region: editing.region ?? undefined,
                contractPeriod: editing.contractPeriod ?? undefined,
                settleCycle: editing.settleCycle ?? undefined,
              }
            : { status: 'NEW' }
        }
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '保存', resetText: '取消' },
        }}
      >
        <ProFormText
          name="name"
          label="客户名称"
          rules={[
            { required: true, message: '请输入客户名称' },
            { max: 128, message: '最长 128 字' },
          ]}
          placeholder="公司 / 个人名称"
        />
        <ProFormText name="contactName" label="联系人" placeholder="如：王经理" />
        <ProFormText name="contactPhone" label="联系电话" placeholder="13800000000" />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          placeholder="contact@example.com"
        />
        <ProFormText name="address" label="地址" placeholder="所在地区 / 地址" />
        <ProFormSelect
          name="ownerId"
          label="负责人"
          options={ownerOptions()}
          placeholder="选择负责跟进的人（租户内用户）"
          allowClear
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
        />
        <ProFormSelect
          name="status"
          label="跟进状态"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择跟进状态' }]}
        />
        <ProFormTextArea name="remark" label="备注" placeholder="跟进记录 / 备注信息" />
        {/* 教育版（zhiye · 合作伙伴）扩展字段：仅 eduSupplier 版别渲染 */}
        {eduSupplier && (
          <>
            <ProFormText
              name="licenseNo"
              label="办学许可证号"
              rules={[{ max: 64, message: '最长 64 字' }]}
              placeholder="教民 + 许可证编号"
            />
            <ProFormText
              name="licenseAttach"
              label="办学资质附件"
              rules={[{ max: 255, message: '最长 255 字' }]}
              placeholder="资质证书 URL / 文件名"
            />
            <ProFormText
              name="region"
              label="合作区域"
              rules={[{ max: 128, message: '最长 128 字' }]}
              placeholder="如：江西省南昌市"
            />
            <ProFormText
              name="contractPeriod"
              label="合作协议期"
              rules={[{ max: 64, message: '最长 64 字' }]}
              placeholder="如：2026-09-01 ~ 2027-08-31"
            />
            <ProFormSelect
              name="settleCycle"
              label="结算周期"
              options={[
                { label: '月结', value: '月' },
                { label: '季结', value: '季' },
                { label: '学期结', value: '学期' },
              ]}
              placeholder="选择与合作伙伴的结算周期"
              allowClear
            />
          </>
        )}
      </ModalForm>
    </PageContainer>
  );
}
