import { useEffect, useRef, useState } from 'react';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDatePicker,
  ProFormDigit,
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
  createContract,
  deleteContract,
  listContracts,
  updateContract,
} from '../../services/contract';
import { listCustomers } from '../../services/crm';
import {
  CONTRACT_STATUS_META,
  type Contract,
  type ContractStatus,
} from '@lieshoucloud/contract-types/business/contract';

const STATUS_OPTIONS = (Object.keys(CONTRACT_STATUS_META) as ContractStatus[]).map((s) => ({
  label: CONTRACT_STATUS_META[s].text,
  value: s,
}));

/** 新建/编辑表单值 */
interface FormValues {
  customerId: number;
  contractNo: string;
  title: string;
  amount?: number;
  signedAt?: string;
  startDate?: string;
  endDate?: string;
  status: ContractStatus;
  remark?: string;
}

export default function ContractList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    listCustomers()
      .then((cs) =>
        setCustomerOptions(cs.map((c) => ({ label: `${c.name}（#${c.id}）`, value: c.id }))),
      )
      .catch(() => {});
  }, []);

  const reloadAll = () => actionRef.current?.reload();

  const columns: ProColumns<Contract>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: '合同编号 / 关键字',
      dataIndex: 'keyword',
      width: 190,
      render: (_, row) => row.contractNo,
    },
    {
      title: '合同标题',
      dataIndex: 'title',
      width: 190,
      search: false,
      ellipsis: true,
    },
    {
      title: '所属客户',
      dataIndex: 'customerId',
      width: 190,
      valueType: 'select',
      fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
      render: (_, row) =>
        customerOptions.find((o) => o.value === row.customerId)?.label ?? `#${row.customerId}`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      search: false,
      render: (_, row) => (row.amount !== null && row.amount !== undefined ? `¥${Number(row.amount).toLocaleString()}` : '—'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(CONTRACT_STATUS_META) as ContractStatus[]).map((s) => [
          s,
          { text: CONTRACT_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={CONTRACT_STATUS_META[row.status]} />,
    },
    {
      title: '签约日期',
      dataIndex: 'signedAt',
      width: 110,
      search: false,
      render: (_, row) => row.signedAt ?? '—',
    },
    {
      title: '有效期',
      dataIndex: 'period',
      width: 200,
      search: false,
      render: (_, row) =>
        row.startDate || row.endDate ? `${row.startDate ?? '?'} ~ ${row.endDate ?? '?'}` : '—',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
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
      title: '操作',
      valueType: 'option',
      width: 130,
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
          title="确定删除该合同？"
          description={`${row.contractNo} 删除后将从列表移除（软删）`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteContract(row.id);
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
        customerId: values.customerId,
        contractNo: String(values.contractNo),
        title: String(values.title),
        amount: values.amount,
        signedAt: values.signedAt,
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status as ContractStatus,
        remark: values.remark ? String(values.remark) : undefined,
      };
      if (editing) {
        await updateContract(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createContract(payload);
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
      title="合同管理"
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
          新建合同
        </Button>,
      ]}
    >
      <ProTable<Contract>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.contractNo as string | undefined);
            const customerId = params.customerId as number | undefined;
            const status = params.status as ContractStatus | undefined;
            const data = await listContracts(customerId, status, keyword);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="合同列表（租户内数据，跨租户不可见）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑合同：${editing.contractNo}` : '新建合同'}
        width={520}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                customerId: editing.customerId,
                contractNo: editing.contractNo,
                title: editing.title,
                amount: editing.amount ?? undefined,
                signedAt: editing.signedAt ?? undefined,
                startDate: editing.startDate ?? undefined,
                endDate: editing.endDate ?? undefined,
                status: editing.status,
                remark: editing.remark ?? undefined,
              }
            : { status: 'DRAFT' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormSelect
          name="customerId"
          label="所属客户"
          options={customerOptions}
          rules={[{ required: true, message: '请选择所属客户' }]}
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          placeholder="选择客户"
        />
        <ProFormText
          name="contractNo"
          label="合同编号"
          rules={[
            { required: true, message: '请输入合同编号' },
            { max: 64, message: '最长 64 字' },
          ]}
          placeholder="如：HT-2026-0001（租户内唯一）"
        />
        <ProFormText
          name="title"
          label="合同标题"
          rules={[
            { required: true, message: '请输入合同标题' },
            { max: 128, message: '最长 128 字' },
          ]}
          placeholder="如：年度服务合同 2026"
        />
        <ProFormDigit
          name="amount"
          label="合同金额（元）"
          min={0}
          fieldProps={{ precision: 2 }}
          placeholder="120000.00"
        />
        <ProFormDatePicker name="signedAt" label="签约日期" placeholder="选择签约日期" />
        <ProFormDatePicker name="startDate" label="生效起始日期" placeholder="选择起始日期" />
        <ProFormDatePicker name="endDate" label="生效截止日期" placeholder="选择截止日期" />
        <ProFormSelect
          name="status"
          label="合同状态"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择合同状态' }]}
        />
        <ProFormTextArea name="remark" label="备注" placeholder="合同备注信息" />
      </ModalForm>
    </PageContainer>
  );
}
