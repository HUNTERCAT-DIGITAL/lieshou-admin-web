import { useEffect, useRef, useState } from 'react';
import { App, Button, Popconfirm, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from '../../services/contact';
import { listCustomers } from '../../services/crm';
import type { Contact } from '@lieshoucloud/types/business/contact';

/** 新建/编辑表单值 */
interface FormValues {
  customerId: number;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  primary?: boolean;
  remark?: string;
}

export default function ContactList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: number }[]>([]);

  /** 客户下拉（新建/编辑时必选所属客户；表格过滤用） */
  useEffect(() => {
    listCustomers()
      .then((cs) => setCustomerOptions(cs.map((c) => ({ label: `${c.name}（#${c.id}）`, value: c.id }))))
      .catch(() => {});
  }, []);

  const reloadAll = () => actionRef.current?.reload();

  const columns: ProColumns<Contact>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      title: '姓名 / 关键字',
      dataIndex: 'keyword',
      width: 200,
      render: (_, row) => row.name,
    },
    {
      title: '所属客户',
      dataIndex: 'customerId',
      width: 200,
      valueType: 'select',
      fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
      render: (_, row) =>
        customerOptions.find((o) => o.value === row.customerId)?.label ?? `#${row.customerId}`,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      width: 130,
      search: false,
      render: (_, row) => row.phone ?? '—',
    },
    {
      title: '职位',
      dataIndex: 'position',
      width: 120,
      search: false,
      render: (_, row) => row.position ?? '—',
    },
    {
      title: '主联系人',
      dataIndex: 'primary',
      width: 90,
      search: false,
      render: (_, row) =>
        row.primary ? <Tag color="gold">主</Tag> : <span style={{ color: '#999' }}>—</span>,
    },
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
      width: 160,
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
          title="确定删除该联系人？"
          description={`${row.name} 删除后将从列表移除（软删）`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteContact(row.id);
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
        name: String(values.name),
        phone: values.phone ? String(values.phone) : undefined,
        email: values.email ? String(values.email) : undefined,
        position: values.position ? String(values.position) : undefined,
        primary: values.primary ?? false,
        remark: values.remark ? String(values.remark) : undefined,
      };
      if (editing) {
        await updateContact(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createContact(payload);
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
      title="联系人管理"
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
          新建联系人
        </Button>,
      ]}
    >
      <ProTable<Contact>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const customerId = params.customerId as number | undefined;
            const data = await listContacts(customerId, keyword);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="联系人列表（租户内数据，跨租户不可见）"
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
        title={editing ? `编辑联系人：${editing.name}` : '新建联系人'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                customerId: editing.customerId,
                name: editing.name,
                phone: editing.phone ?? undefined,
                email: editing.email ?? undefined,
                position: editing.position ?? undefined,
                primary: editing.primary,
                remark: editing.remark ?? undefined,
              }
            : { primary: false }
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
          placeholder="选择客户（先建客户再挂联系人）"
        />
        <ProFormText
          name="name"
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { max: 64, message: '最长 64 字' },
          ]}
          placeholder="联系人姓名"
        />
        <ProFormText name="phone" label="电话" placeholder="13800000000" />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          placeholder="contact@example.com"
        />
        <ProFormText name="position" label="职位" placeholder="如：采购经理" />
        <ProFormSwitch name="primary" label="主联系人" />
        <ProFormTextArea name="remark" label="备注" placeholder="备注信息" />
      </ModalForm>
    </PageContainer>
  );
}
