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
import { listCustomers } from '../../services/crm';
import { createMember, deleteMember, listMembers, updateMember } from '../../services/member';
import {
  MEMBER_LEVEL_META,
  MEMBER_STATUS_META,
  type Member,
  type MemberLevel,
  type MemberStatus,
} from '@lieshoucloud/contract-types/business/member';

const LEVEL_OPTIONS = (Object.keys(MEMBER_LEVEL_META) as MemberLevel[]).map((l) => ({
  label: MEMBER_LEVEL_META[l].text,
  value: l,
}));
const STATUS_OPTIONS = (Object.keys(MEMBER_STATUS_META) as MemberStatus[]).map((s) => ({
  label: MEMBER_STATUS_META[s].text,
  value: s,
}));

/** 新建/编辑表单值 */
interface FormValues {
  customerId: number;
  memberNo: string;
  level: MemberLevel;
  points?: number;
  balance?: number;
  expiresAt?: string;
  status: MemberStatus;
  remark?: string;
}

export default function MemberList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    listCustomers()
      .then((cs) =>
        setCustomerOptions(cs.map((c) => ({ label: `${c.name}（#${c.id}）`, value: c.id }))),
      )
      .catch(() => {});
  }, []);

  const reloadAll = () => actionRef.current?.reload();

  const columns: ProColumns<Member>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: '会员号 / 关键字',
      dataIndex: 'keyword',
      width: 180,
      render: (_, row) => row.memberNo,
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
      title: '等级',
      dataIndex: 'level',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(MEMBER_LEVEL_META) as MemberLevel[]).map((l) => [
          l,
          { text: MEMBER_LEVEL_META[l].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={MEMBER_LEVEL_META[row.level]} />,
    },
    {
      title: '积分',
      dataIndex: 'points',
      width: 90,
      search: false,
      render: (_, row) => row.points.toLocaleString(),
    },
    {
      title: '储值余额',
      dataIndex: 'balance',
      width: 120,
      search: false,
      render: (_, row) => `¥${Number(row.balance).toLocaleString()}`,
    },
    {
      title: '有效期至',
      dataIndex: 'expiresAt',
      width: 110,
      search: false,
      render: (_, row) => row.expiresAt ?? '长期',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(MEMBER_STATUS_META) as MemberStatus[]).map((s) => [
          s,
          { text: MEMBER_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={MEMBER_STATUS_META[row.status]} />,
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
          title="确定删除该会员？"
          description={`${row.memberNo} 删除后将从列表移除（软删）`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteMember(row.id);
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
        memberNo: String(values.memberNo),
        level: values.level as MemberLevel,
        points: values.points ?? 0,
        balance: values.balance ?? 0,
        expiresAt: values.expiresAt,
        status: values.status as MemberStatus,
        remark: values.remark ? String(values.remark) : undefined,
      };
      if (editing) {
        await updateMember(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createMember(payload);
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
      title="会员管理"
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
          新建会员
        </Button>,
      ]}
    >
      <ProTable<Member>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.memberNo as string | undefined);
            const customerId = params.customerId as number | undefined;
            const level = params.level as MemberLevel | undefined;
            const status = params.status as MemberStatus | undefined;
            const data = await listMembers(customerId, level, status, keyword);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="会员列表（租户内数据，跨租户不可见）"
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
        title={editing ? `编辑会员：${editing.memberNo}` : '新建会员'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                customerId: editing.customerId,
                memberNo: editing.memberNo,
                level: editing.level,
                points: editing.points,
                balance: editing.balance,
                expiresAt: editing.expiresAt ?? undefined,
                status: editing.status,
                remark: editing.remark ?? undefined,
              }
            : { level: 'NORMAL', status: 'ACTIVE', points: 0, balance: 0 }
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
          name="memberNo"
          label="会员号"
          rules={[
            { required: true, message: '请输入会员号' },
            { max: 64, message: '最长 64 字' },
          ]}
          placeholder="如：VIP-2026-0001（租户内唯一）"
        />
        <ProFormSelect
          name="level"
          label="会员等级"
          options={LEVEL_OPTIONS}
          rules={[{ required: true, message: '请选择会员等级' }]}
        />
        <ProFormDigit
          name="points"
          label="积分"
          min={0}
          fieldProps={{ precision: 0 }}
          placeholder="0"
        />
        <ProFormDigit
          name="balance"
          label="储值余额（元）"
          min={0}
          fieldProps={{ precision: 2 }}
          placeholder="0.00"
        />
        <ProFormDatePicker name="expiresAt" label="有效期至" placeholder="不填 = 长期有效" />
        <ProFormSelect
          name="status"
          label="会员状态"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择会员状态' }]}
        />
        <ProFormTextArea name="remark" label="备注" placeholder="会员备注信息" />
      </ModalForm>
    </PageContainer>
  );
}
