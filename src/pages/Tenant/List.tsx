import { useRef, useState } from 'react';
import { App, Button, Input, Modal, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
import { StatusTag } from '@lieshoucloud/ui';
import {
  createInvite,
  createTenant,
  deleteTenant,
  listInvites,
  listTenants,
  revokeInvite,
  updateTenant,
} from '../../services/tenant';
import { TENANT_STATUS_META, type Tenant, type TenantInvite } from '@lieshoucloud/types/business/tenant';
import { filterByKeywordAndStatus } from '../../utils/list-filter';

/** 关键字模糊匹配范围（后端暂无搜索 API） */
const TENANT_SEARCH_FIELDS = ['name', 'code'];

const STATUS_OPTIONS = (Object.keys(TENANT_STATUS_META) as Tenant['status'][]).map((s) => ({
  label: TENANT_STATUS_META[s].text,
  value: s,
}));

/** 新建/编辑表单值 */
interface FormValues {
  name: string;
  code?: string;
  status: Tenant['status'];
}

export default function TenantList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [inviteTenant, setInviteTenant] = useState<Tenant | null>(null);

  const toggleStatus = async (row: Tenant) => {
    try {
      const next: Tenant['status'] = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await updateTenant(row.id, { status: next });
      messageApi.success(next === 'ACTIVE' ? '已启用' : '已停用');
      actionRef.current?.reload();
    } catch (e) {
      handleError(e);
    }
  };

  const columns: ProColumns<Tenant>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 关键字模糊匹配 name / code（后端无搜索 API，前端过滤）
      title: '企业名称 / 关键字',
      dataIndex: 'keyword',
      width: 240,
      render: (_, row) => row.name,
    },
    { title: '租户编码', dataIndex: 'code', width: 120, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(TENANT_STATUS_META) as Tenant['status'][]).map((s) => [
          s,
          { text: TENANT_STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={TENANT_STATUS_META[row.status]} />,
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
      width: 240,
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
        <Button
          key="invite"
          type="link"
          icon={<LinkOutlined />}
          onClick={() => setInviteTenant(row)}
        >
          邀请
        </Button>,
        <Button key="toggle" type="link" onClick={() => toggleStatus(row)}>
          {row.status === 'ACTIVE' ? '停用' : '启用'}
        </Button>,
        <Popconfirm
          key="del"
          title="确定删除该租户？"
          description="仅无用户的租户可删除；有用户的租户请用「停用」"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteTenant(row.id);
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
        await updateTenant(editing.id, { name: values.name, status: values.status });
        messageApi.success('已保存');
      } else {
        await createTenant({ name: values.name, code: String(values.code) });
        messageApi.success('租户已开通');
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
      title="租户管理"
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
          开通租户
        </Button>,
      ]}
    >
      <ProTable<Tenant>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const all = await listTenants();
            const filtered = filterByKeywordAndStatus(
              all,
              {
                keyword: params.keyword as string | undefined,
                status: params.status as string | undefined,
              },
              TENANT_SEARCH_FIELDS,
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
        headerTitle="租户列表"
        options={{ setting: { draggable: true, checkable: true } }}
      />

      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑租户：${editing.code}` : '开通租户'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing ? { name: editing.name, status: editing.status } : { status: 'ACTIVE' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="企业名称"
          rules={[{ required: true, message: '请输入企业名称' }]}
          placeholder="如：深圳市智野教育科技有限公司"
        />
        {!editing && (
          <ProFormText
            name="code"
            label="租户编码"
            rules={[
              { required: true, message: '请输入租户编码' },
              {
                pattern: /^[a-z][a-z0-9-]{2,63}$/,
                message: '小写字母开头，3-64 位小写字母/数字/连字符',
              },
            ]}
            placeholder="如：huntercat（登录用，创建后不可改）"
          />
        )}
        {editing && (
          <ProFormSelect
            name="status"
            label="状态"
            options={STATUS_OPTIONS}
            rules={[{ required: true, message: '请选择状态' }]}
          />
        )}
      </ModalForm>

      <InviteModal
        tenant={inviteTenant}
        onClose={() => setInviteTenant(null)}
        onApiError={handleError}
      />
    </PageContainer>
  );
}

/** 邀请码管理 Modal：生成 / 复制 / 列表 / 撤销（ADR-0023 P2） */
function InviteModal({
  tenant,
  onClose,
  onApiError,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onApiError: (e: unknown) => void;
}) {
  const { message: messageApi } = App.useApp();
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(7);
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const load = async (tenantId: number) => {
    try {
      setInvites(await listInvites(tenantId));
    } catch (e) {
      onApiError(e);
    }
  };

  const generate = async () => {
    if (!tenant) return;
    setGenerating(true);
    try {
      const inv = await createInvite(tenant.id, { role, expiresInDays });
      setLastCode(inv.code);
      messageApi.success('邀请码已生成');
      await load(tenant.id);
    } catch (e) {
      onApiError(e);
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      messageApi.success('已复制邀请码');
    } catch {
      messageApi.error('复制失败，请手动复制');
    }
  };

  return (
    <Modal
      title={`邀请注册：${tenant?.name ?? ''}`}
      open={!!tenant}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      afterOpenChange={(open) => {
        if (open && tenant) load(tenant.id);
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <Select
            value={role}
            onChange={setRole}
            options={[
              { label: '角色：普通用户', value: 'USER' },
              { label: '角色：管理员', value: 'ADMIN' },
            ]}
            style={{ width: 160 }}
          />
          <Select
            value={expiresInDays}
            onChange={setExpiresInDays}
            options={[
              { label: '有效期：7 天', value: 7 },
              { label: '有效期：30 天', value: 30 },
              { label: '有效期：永久', value: 0 },
            ]}
            style={{ width: 140 }}
          />
          <Button type="primary" onClick={generate} loading={generating}>
            生成邀请码
          </Button>
        </Space>

        {lastCode && (
          <Space.Compact style={{ width: '100%' }}>
            <Input value={lastCode} readOnly data-testid="invite-code" />
            <Button onClick={() => copy(lastCode)}>复制</Button>
          </Space.Compact>
        )}

        <Typography.Text type="secondary">
          把邀请码发给受邀人，其在注册页填写邀请码即可自动加入本租户。
        </Typography.Text>

        <div>
          <Typography.Text strong>历史邀请码</Typography.Text>
          <div style={{ marginTop: 8, maxHeight: 260, overflowY: 'auto' }}>
            {invites.map((inv) => (
              <Space
                key={inv.id}
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Space>
                  <Typography.Text code>{inv.code}</Typography.Text>
                  <Tag color={inv.role === 'ADMIN' ? 'orange' : 'blue'}>{inv.role}</Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    已用 {inv.usedCount}
                    {inv.maxUses ? `/${inv.maxUses}` : ''}
                  </Typography.Text>
                  {inv.revokedAt && <Tag color="red">已撤销</Tag>}
                </Space>
                <Space>
                  <Button size="small" onClick={() => copy(inv.code)}>
                    复制
                  </Button>
                  {!inv.revokedAt && tenant && (
                    <Popconfirm
                      title="撤销该邀请码？"
                      onConfirm={async () => {
                        try {
                          await revokeInvite(tenant.id, inv.id);
                          messageApi.success('已撤销');
                          await load(tenant.id);
                        } catch (e) {
                          onApiError(e);
                        }
                      }}
                    >
                      <Button size="small" danger>
                        撤销
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Space>
            ))}
            {invites.length === 0 && <Typography.Text type="secondary">暂无邀请码</Typography.Text>}
          </div>
        </div>
      </Space>
    </Modal>
  );
}
