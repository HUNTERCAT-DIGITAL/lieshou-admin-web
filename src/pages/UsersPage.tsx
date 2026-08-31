/**
 * 用户管理（管理员 · 2026-09）
 *
 * 管理员维护租户内账号——重点是「手机号」：
 * 告警短信按账号手机号逐个发送（规则命中 → 拉租户账号 → 发短信），
 * 此处统一维护值班员/管理员的接收号码。
 */
import { useRef, useState } from 'react';
import { App, Form, Input, Modal, Tag, Typography } from 'antd';
import { PageContainer, ProTable, ModalForm, ProFormText, ProFormSelect, type ActionType, type ProColumns } from '@ant-design/pro-components';

import { createUser, listRoles, listUsers, updateUser } from '@lieshoucloud/core-web';
import { STATUS_META } from '@lieshoucloud/contract-types/business/user';
import type { Role } from '@lieshoucloud/contract-types/business/role';
import type { User } from '@lieshoucloud/contract-types/business/user';

const ROLE_COLOR: Record<string, string> = {
  PLATFORM_ADMIN: 'red',
  TENANT_ADMIN: 'purple',
  DUTY_OFFICER: 'blue',
  USER: 'default',
};

export default function UsersPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createForm = Form.useForm()[0];

  const reload = () => actionRef.current?.reload();

  const columns: ProColumns<User>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '账号', dataIndex: 'username', width: 140 },
    { title: '姓名', dataIndex: 'displayName', width: 120 },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 140,
      render: (_, r) => r.phone ?? <Typography.Text type="secondary">未设置</Typography.Text>,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      search: false,
      render: (_, r) =>
        (r.roles ?? []).map((code) => (
          <Tag key={code} color={ROLE_COLOR[code] ?? 'default'}>{code}</Tag>
        )),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      search: false,
      render: (_, r) => {
        const m = STATUS_META[r.status];
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 90,
      render: (_, row) => [
        <a
          key="edit"
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <PageContainer title="用户管理">
      <ProTable<User>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={async () => {
          const users = await listUsers();
          const rs = await listRoles();
          setRoles(rs);
          return { data: users, success: true };
        }}
        toolBarRender={() => [
          <button
            key="add"
            type="button"
            style={{
              height: 32,
              padding: '0 16px',
              borderRadius: 6,
              border: '1px solid #d9d9d9',
              background: '#1677ff',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={() => setCreateOpen(true)}
          >
            + 新增用户
          </button>,
        ]}
        pagination={{ pageSize: 10 }}
      />
      <ModalForm<User>
        title="编辑账号"
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={editing ?? undefined}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (!editing) return true;
          await updateUser(editing.id, {
            displayName: values.displayName,
            phone: values.phone || undefined,
            status: values.status,
            roles: values.roles ?? [],
          });
          message.success('已保存');
          reload();
          return true;
        }}
      >
        <ProFormText name="username" label="账号" disabled />
        <ProFormText
          name="displayName"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        />
        <ProFormText
          name="phone"
          label="手机号"
          rules={[{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}
          fieldProps={{ maxLength: 11 }}
        />
        <ProFormSelect
          name="roles"
          label="角色"
          mode="multiple"
          options={roles.map((r) => ({ label: r.name ?? r.code, value: r.code }))}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={Object.entries(STATUS_META).map(([value, m]) => ({ label: m.text, value }))}
          rules={[{ required: true }]}
        />
      </ModalForm>
      <Modal
        title="新增用户"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          setCreateError(null);
          createForm.resetFields();
        }}
        onOk={async () => {
          setCreateError(null);
          try {
            // 字段校验:账号/姓名/手机号必填,手机号 11 位(Form.Item 红字提示)
            const values = await createForm.validateFields();
            setCreating(true);
            const created = await createUser({
              username: values.username,
              displayName: values.displayName,
              phone: values.phone || undefined,
            });
            message.success(
              `已创建 ${created.username}（未设密码，用户首次登录用手机验证码激活）`,
            );
            setCreateOpen(false);
            createForm.resetFields();
            reload();
          } catch (err) {
            // validateFields 校验错误(errorFields)→ Form.Item 已红字;仅 API 错误在此显示
            const hasFieldErr = !!(
              err &&
              typeof err === 'object' &&
              'errorFields' in err
            );
            if (!hasFieldErr) {
              const e = err as { message?: unknown };
              setCreateError(
                typeof e?.message === 'string' && e.message
                  ? e.message
                  : '创建失败，请检查填写内容',
              );
            }
          } finally {
            setCreating(false);
          }
        }}
        confirmLoading={creating}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="账号" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}
          >
            <Input placeholder="手机号" maxLength={11} />
          </Form.Item>
          {createError && (
            <p style={{ color: '#cf1322', marginBottom: 0 }}>创建失败：{createError}</p>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
}
