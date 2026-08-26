import { useRef, useState } from 'react';
import { App, Button, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import { StatusTag, RoleTag } from '@lieshoucloud/ui';
import { createUser, deleteUser, listUsers, updateUser } from '../../services/user';
import { STATUS_META, type User } from '@lieshoucloud/types/business/user';
import { filterByKeywordAndStatus } from '../../utils/list-filter';
import { runBatch } from '../../utils/batch';

/** 关键字模糊匹配范围（后端暂无搜索 API） */
const USER_SEARCH_FIELDS = ['username', 'displayName', 'email', 'phone'];

const STATUS_OPTIONS = (Object.keys(STATUS_META) as User['status'][]).map((s) => ({
  label: STATUS_META[s].text,
  value: s,
}));

const ROLES_OPTIONS = ['USER', 'ADMIN'].map((r) => ({
  label: r,
  value: r,
}));

/** 新建/编辑表单值（ModalForm 泛型） */
interface FormValues {
  username?: string;
  displayName: string;
  email?: string;
  phone?: string;
  status: User['status'];
  roles: string[];
  password?: string;
}

export default function UserList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);

  /** 批量删除用户 */
  const batchDelete = async (keys: React.Key[]) => {
    setBatchBusy(true);
    const ids = keys.map(Number).filter(Number.isFinite);
    const { ok, fail } = await runBatch(ids, (id) => deleteUser(id));
    if (ok > 0) messageApi.success(`已删除 ${ok} 个用户${fail ? `（${fail} 失败）` : ''}`);
    if (fail > 0) handleError(new Error(`${fail} 个删除失败`));
    setSelectedRowKeys([]);
    actionRef.current?.reload();
    setBatchBusy(false);
  };

  const columns: ProColumns<User>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 关键字模糊匹配 username / displayName / email / phone（后端无搜索 API，前端过滤）
      title: '用户名 / 关键字',
      dataIndex: 'keyword',
      width: 160,
      render: (_, row) => row.username,
    },
    { title: '显示名', dataIndex: 'displayName', width: 140, search: false },
    { title: '邮箱', dataIndex: 'email', width: 180, search: false },
    { title: '手机', dataIndex: 'phone', width: 130, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(STATUS_META) as User['status'][]).map((s) => [
          s,
          { text: STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={STATUS_META[row.status]} />,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 140,
      search: false,
      render: (_, row) => row.roles.map((r) => <RoleTag key={r} role={r} />),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
      render: (_, row) => row.lastLoginAt ?? '—',
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
          title="确定删除该用户？"
          description={`${row.username}（${row.displayName}）删除后不可恢复`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteUser(row.id);
              messageApi.success('已删除');
              actionRef.current?.reload();
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
      if (editing) {
        await updateUser(editing.id, {
          displayName: String(values.displayName),
          email: values.email ? String(values.email) : undefined,
          phone: values.phone ? String(values.phone) : undefined,
          status: values.status as User['status'],
          roles: (values.roles as string[]) ?? [],
          password: values.password ? String(values.password) : undefined,
        });
        messageApi.success('已保存');
      } else {
        await createUser({
          username: String(values.username),
          displayName: String(values.displayName),
          password: String(values.password),
          email: values.email ? String(values.email) : undefined,
          phone: values.phone ? String(values.phone) : undefined,
        });
        messageApi.success('已创建');
      }
      setModalOpen(false);
      setEditing(null);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="用户列表"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>
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
          新建用户
        </Button>,
      ]}
    >
      <ProTable<User>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const all = await listUsers();
            const filtered = filterByKeywordAndStatus(
              all,
              {
                keyword: params.keyword as string | undefined,
                status: params.status as string | undefined,
              },
              USER_SEARCH_FIELDS,
            );
            return { data: filtered, success: true, total: filtered.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="用户管理"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
        options={{ setting: { draggable: true, checkable: true } }}
        toolBarRender={() => [
          <Popconfirm
            key="batch-del"
            title={`确定批量删除 ${selectedRowKeys.length} 个用户？`}
            description="删除后不可恢复，请谨慎操作。"
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
          </Popconfirm>,
        ]}
      />

      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑用户：${editing.username}` : '新建用户'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                displayName: editing.displayName,
                email: editing.email ?? undefined,
                phone: editing.phone ?? undefined,
                status: editing.status,
                roles: editing.roles,
              }
            : { status: 'ACTIVE', roles: ['USER'] }
        }
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '保存', resetText: '取消' },
        }}
      >
        {!editing && (
          <ProFormText
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { pattern: /^[a-zA-Z0-9_]{3,64}$/, message: '3-64 位字母/数字/下划线' },
            ]}
            placeholder="登录名（创建后不可改）"
          />
        )}
        <ProFormText
          name="displayName"
          label="显示名"
          rules={[{ required: true, message: '请输入显示名' }]}
          placeholder="如：Future Wang"
        />
        {!editing && (
          <ProFormText.Password
            name="password"
            label="初始密码"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          />
        )}
        {editing && (
          <ProFormText.Password
            name="password"
            label="重置密码（可选）"
            placeholder="留空则不修改"
          />
        )}
        <ProFormText name="email" label="邮箱" placeholder="user@example.com" />
        <ProFormText name="phone" label="手机" placeholder="13800000000" />
        {editing && (
          <>
            <ProFormSelect
              name="status"
              label="状态"
              options={STATUS_OPTIONS}
              rules={[{ required: true, message: '请选择状态' }]}
            />
            <ProFormSelect
              name="roles"
              label="角色"
              mode="multiple"
              options={ROLES_OPTIONS}
              rules={[{ required: true, message: '至少选择一个角色' }]}
            />
          </>
        )}
      </ModalForm>
    </PageContainer>
  );
}
