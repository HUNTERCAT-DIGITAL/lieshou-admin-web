import { useRef, useState } from 'react';
import { App, Button, Popconfirm, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import { createRole, deleteRole, listRoles, updateRole } from '../../services/role';
import { ROLE_SCOPE_META, type Role } from '../../types/role';

interface FormValues {
  code?: string;
  name: string;
  scope: Role['scope'];
  description?: string;
}

export default function RoleList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const columns: ProColumns<Role>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    { title: '角色编码', dataIndex: 'code', width: 160 },
    { title: '角色名称', dataIndex: 'name', width: 140 },
    {
      title: '范围',
      dataIndex: 'scope',
      width: 90,
      render: (_, row) => (
        <Tag color={ROLE_SCOPE_META[row.scope].color}>{ROLE_SCOPE_META[row.scope].text}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'system',
      width: 90,
      search: false,
      render: (_, row) => (row.system ? <Tag color="red">系统内置</Tag> : <Tag>自定义</Tag>),
    },
    { title: '描述', dataIndex: 'description', search: false, ellipsis: true },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      render: (_, row) =>
        row.system ? (
          <Tooltip title="系统内置角色不可修改">
            <Button type="link" disabled icon={<EditOutlined />}>
              只读
            </Button>
          </Tooltip>
        ) : (
          [
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
              title="确定删除该角色？"
              description={`${row.code} 删除后用户将不再拥有此角色`}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                try {
                  await deleteRole(row.id);
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
          ]
        ),
    },
  ];

  const onFinish = async (values: FormValues) => {
    try {
      if (editing) {
        await updateRole(editing.id, {
          name: values.name,
          scope: values.scope,
          description: values.description,
        });
        messageApi.success('已保存');
      } else {
        await createRole({
          code: String(values.code),
          name: values.name,
          scope: values.scope,
          description: values.description,
        });
        messageApi.success('角色已创建');
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
      title="角色管理"
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
          新建角色
        </Button>,
      ]}
    >
      <ProTable<Role>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          try {
            const data = await listRoles();
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={false}
        search={false}
        headerTitle="角色定义（系统内置只读）"
        options={{ setting: { draggable: true, checkable: true } }}
      />

      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑角色：${editing.code}` : '新建角色'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? { name: editing.name, scope: editing.scope, description: editing.description }
            : { scope: 'TENANT' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        {!editing && (
          <ProFormText
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              {
                pattern: /^[A-Z][A-Z0-9_]{1,31}$/,
                message: '大写字母开头，2-32 位大写/数字/下划线',
              },
            ]}
            placeholder="如：FINANCE"
          />
        )}
        <ProFormText
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
          placeholder="如：财务"
        />
        <ProFormSelect
          name="scope"
          label="范围"
          options={[
            { label: '平台（跨租户运营）', value: 'PLATFORM' },
            { label: '租户（租户内）', value: 'TENANT' },
          ]}
          rules={[{ required: true, message: '请选择范围' }]}
        />
        <ProFormTextArea name="description" label="描述" placeholder="角色职责说明（可选）" />
      </ModalForm>
    </PageContainer>
  );
}
