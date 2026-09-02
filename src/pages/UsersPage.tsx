/**
 * 用户管理（平台视图 · 系统设置内 · 2026-09）
 *
 * 平台管理员（PLATFORM_ADMIN）在「系统设置 → 用户管理」查看/维护**全部租户**的用户：
 *   - 列表跨租户：GET /api/users 不带租户头 → 返回全平台用户（含 tenantId）
 *   - 所属租户列：结合 GET /api/tenants（PLATFORM_ADMIN）映射租户名/code
 *   - 搜索：租户下拉 + 账号/姓名关键字（前端过滤；后端暂未分页）
 *   - 新增：可指定目标租户（tenantCode）与初始密码；未设密码走验证码激活
 *   - 编辑：姓名/手机号/角色/状态/重置密码（密码留空不改）
 *
 * 非平台超管（TENANT_ADMIN 等）进入：租户 API 403 → 隐藏租户列/筛选，
 * 仅能维护本租户（若 listUsers 无租户头亦 403，展示权限提示）。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { App, Alert, Form, Input, Modal, Select, Tag, Typography } from 'antd';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useAuthStore } from '@lieshoucloud/core-web';
import { createUser, listRoles, listTenants, listUsers, updateUser } from '@lieshoucloud/core-web';
import { STATUS_META } from '@lieshoucloud/contract-types/business/user';
import type { Role } from '@lieshoucloud/contract-types/business/role';
import type { Tenant } from '@lieshoucloud/contract-types/business/tenant';
import type { User } from '@lieshoucloud/contract-types/business/user';

const ROLE_COLOR: Record<string, string> = {
  PLATFORM_ADMIN: 'red',
  TENANT_ADMIN: 'purple',
  DUTY_OFFICER: 'blue',
  USER: 'default',
};

function errMsg(e: unknown): string {
  const m = (e as { message?: unknown })?.message;
  return typeof m === 'string' && m ? m : '请求失败';
}

/** 搜索表单值（ProTable request params 透传） */
interface SearchParams {
  username?: string;
  displayName?: string;
  tenantId?: number;
}

/** 新增弹窗表单值 */
interface CreateValues {
  tenantId?: number;
  username: string;
  displayName: string;
  phone?: string;
  password?: string;
}

export default function UsersPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const currentUser = useAuthStore((s) => s.user);
  const isPlatform = (currentUser?.roles ?? []).includes('PLATFORM_ADMIN');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const createForm = Form.useForm<CreateValues>()[0];

  const reload = () => actionRef.current?.reload();

  // 租户/角色字典（mount 拉一次；403 → 空数组，页面按平台/租户模式降级）
  useEffect(() => {
    void Promise.allSettled([listTenants(), listRoles()]).then(([t, r]) => {
      if (t.status === 'fulfilled') setTenants(t.value);
      if (r.status === 'fulfilled') setRoles(r.value);
    });
  }, []);

  const tenantMap = useMemo(() => {
    const m = new Map<number, Tenant>();
    for (const t of tenants) m.set(t.id, t);
    return m;
  }, [tenants]);

  /** 租户下拉项（新增/搜索共用） */
  const tenantOptions = useMemo(
    () =>
      tenants.map((t) => ({
        label: `${t.name}（${t.code}）`,
        value: t.id,
      })),
    [tenants],
  );

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        label: `${r.name}（${r.code}）`,
        value: r.code,
      })),
    [roles],
  );

  const tenantCell = (tenantId: number | undefined) => {
    const t = tenantId !== null && tenantId !== undefined ? tenantMap.get(tenantId) : undefined;
    return t ? (
      <span>
        {t.name} <Typography.Text type="secondary">({t.code})</Typography.Text>
      </span>
    ) : (
      <Typography.Text type="secondary">租户 #{tenantId ?? '-'}</Typography.Text>
    );
  };

  const columns: ProColumns<User>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '账号', dataIndex: 'username', width: 130 },
    { title: '姓名', dataIndex: 'displayName', width: 110 },
    ...(tenantOptions.length > 0
      ? [
          {
            title: '所属租户',
            dataIndex: 'tenantId',
            width: 180,
            valueType: 'select' as const,
            fieldProps: { options: tenantOptions, allowClear: true, placeholder: '全部租户' },
            render: (_: unknown, r: User) => tenantCell(r.tenantId),
          },
        ]
      : []),
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      search: false,
      render: (_, r) => r.phone ?? <Typography.Text type="secondary">未设置</Typography.Text>,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 180,
      search: false,
      render: (_, r) =>
        (r.roles ?? []).map((code) => (
          <Tag key={code} color={ROLE_COLOR[code] ?? 'default'}>
            {code}
          </Tag>
        )),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
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
    <PageContainer
      title="用户管理"
      subTitle={isPlatform ? '平台全部租户用户（仅平台管理员可见）' : undefined}
    >
      {!isPlatform && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前角色不是平台管理员"
          description="平台视角需要 PLATFORM_ADMIN 角色；租户管理员仅能维护本租户用户（部分接口可能返回 403）。"
        />
      )}
      {loadError && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }} message={loadError} closable />
      )}
      <ProTable<User, SearchParams>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        options={false}
        request={async (params) => {
          try {
            const users = await listUsers();
            const q = params as SearchParams;
            const data = users.filter((u) => {
              if (q.tenantId !== null && q.tenantId !== undefined && u.tenantId !== q.tenantId) return false;
              if (q.username && !u.username.toLowerCase().includes(q.username.toLowerCase()))
                return false;
              if (q.displayName && !u.displayName.includes(q.displayName.trim())) return false;
              return true;
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            setLoadError(errMsg(e));
            return { data: [], success: false };
          }
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
            onClick={() => {
              setCreateError(null);
              createForm.resetFields();
              // 平台超管默认落在当前登录租户（存在时），避免误建到其它租户
              if (currentUser?.tenantId !== null && currentUser?.tenantId !== undefined && tenantMap.has(currentUser.tenantId)) {
                createForm.setFieldsValue({ tenantId: currentUser.tenantId });
              }
              setCreateOpen(true);
            }}
          >
            + 新增用户
          </button>,
        ]}
        pagination={{ pageSize: 10 }}
      />

      {/* 编辑（跨租户：姓名/手机号/角色/状态/重置密码，密码留空不改） */}
      <ModalForm<User & { password?: string }>
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
            ...(values.password ? { password: values.password } : {}),
          });
          message.success('已保存');
          reload();
          return true;
        }}
      >
        <ProFormText name="username" label="账号" disabled />
        {editing && (
          <Form.Item label="所属租户">
            <Typography.Text>{tenantCell(editing.tenantId)}</Typography.Text>
          </Form.Item>
        )}
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
          options={roleOptions}
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={Object.entries(STATUS_META).map(([value, m]) => ({ label: m.text, value }))}
          rules={[{ required: true }]}
        />
        <ProFormText.Password
          name="password"
          label="重置密码"
          placeholder="留空则不修改密码"
          rules={[{ min: 6, message: '密码至少 6 位（建议字母+数字）' }]}
          fieldProps={{ autoComplete: 'new-password' }}
        />
      </ModalForm>

      {/* 新增（平台超管可选目标租户；密码可选，不设则首次登录验证码激活） */}
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
            const values = await createForm.validateFields();
            setCreating(true);
            const targetTenant =
              values.tenantId !== null && values.tenantId !== undefined ? tenantMap.get(values.tenantId) : undefined;
            const created = await createUser({
              username: values.username.trim(),
              displayName: values.displayName.trim(),
              phone: values.phone || undefined,
              ...(values.password ? { password: values.password } : {}),
              // 平台超管指定目标租户；未选（非平台场景）由服务端默认租户决定
              ...(targetTenant ? { tenantCode: targetTenant.code } : {}),
            });
            message.success(
              `已创建 ${created.username}${values.password ? '（含初始密码）' : '（未设密码，首次登录用手机验证码激活）'}`,
            );
            setCreateOpen(false);
            createForm.resetFields();
            reload();
          } catch (err) {
            const hasFieldErr = !!(
              err &&
              typeof err === 'object' &&
              'errorFields' in err
            );
            if (!hasFieldErr) {
              setCreateError(errMsg(err) || '创建失败，请检查填写内容');
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
          {isPlatform && tenantOptions.length > 0 && (
            <Form.Item
              name="tenantId"
              label="所属租户"
              rules={[{ required: true, message: '请选择目标租户' }]}
            >
              <Select placeholder="选择目标租户" options={tenantOptions} />
            </Form.Item>
          )}
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="账号" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}
          >
            <Input placeholder="选填，用于登录验证码/告警短信" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="password"
            label="初始密码"
            rules={[{ min: 6, message: '密码至少 6 位（建议字母+数字）' }]}
            extra="选填；不设置则用户首次登录用手机验证码激活"
          >
            <Input.Password placeholder="选填" autoComplete="new-password" />
          </Form.Item>
          {createError && (
            <p style={{ color: '#cf1322', marginBottom: 0 }}>创建失败：{createError}</p>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
}
