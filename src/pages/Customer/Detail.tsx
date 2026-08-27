/**
 * 客户详情独立页（Phase 9 · URL 可直达）.
 *
 * 路径 `/customer/detail/:id`：
 * - 详情从抽屉改为独立页面（URL 可分享/刷新）
 * - 后端 404（不存在/跨租户/已软删）→ Result 404 + 返回列表
 * - 编辑/删除动作从抽屉搬到页面
 */
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { App, Button, Descriptions, Popconfirm, Result, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useApiError } from '../../hooks/useApiError';
import { getEdition } from '../../config/editions';
import { deleteCustomer, getCustomer, updateCustomer } from '../../services/crm';
import { listUsers } from '../../services/user';
import { STATUS_META, type Customer, type CustomerStatus } from '@lieshoucloud/contract-types/business/customer';

const { Text } = Typography;

/** 教育供应商模式（zhiye · B2B2C）：客户即合作伙伴，展示资质/协议字段 */
const eduSupplier = getEdition().eduSupplier === true;

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userMap, setUserMap] = useState<Map<number, string>>(new Map());

  const ownerName = useCallback(
    (oid: number | null | undefined): string => {
      if (oid === undefined || oid === null) return '—';
      return userMap.get(oid) ?? `#${oid}`;
    },
    [userMap],
  );

  const load = useCallback(async () => {
    if (!Number.isFinite(customerId) || customerId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const [data, users] = await Promise.all([getCustomer(customerId), listUsers()]);
      setCustomer(data);
      setUserMap(new Map(users.map((u) => [u.id, u.displayName])));
    } catch (e) {
      // 后端 404：不存在 / 跨租户 / 已软删
      const is404 =
        typeof e === 'object' &&
        e !== null &&
        'status' in e &&
        (e as { status: number }).status === 404;
      if (is404) {
        setNotFound(true);
      } else {
        handleError(e);
      }
    } finally {
      setLoading(false);
    }
  }, [customerId, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async () => {
    if (!customer) return;
    try {
      await deleteCustomer(customer.id);
      messageApi.success('已删除');
      navigate('/customer/list', { replace: true });
    } catch (e) {
      handleError(e);
    }
  };

  const onSave = async (values: Record<string, unknown>) => {
    if (!customer) return;
    const payload = {
      name: String(values.name),
      contactName: values.contactName ? String(values.contactName) : undefined,
      contactPhone: values.contactPhone ? String(values.contactPhone) : undefined,
      email: values.email ? String(values.email) : undefined,
      address: values.address ? String(values.address) : undefined,
      ownerId: values.ownerId as number | undefined,
      status: values.status as CustomerStatus,
      remark: values.remark ? String(values.remark) : undefined,
      // 教育版（zhiye · 合作伙伴）扩展字段
      licenseNo: values.licenseNo ? String(values.licenseNo) : undefined,
      licenseAttach: values.licenseAttach ? String(values.licenseAttach) : undefined,
      region: values.region ? String(values.region) : undefined,
      contractPeriod: values.contractPeriod ? String(values.contractPeriod) : undefined,
      settleCycle: values.settleCycle ? String(values.settleCycle) : undefined,
      revenueShare:
        values.revenueShare === undefined || values.revenueShare === ''
          ? undefined
          : Number(values.revenueShare),
    };
    try {
      const updated = await updateCustomer(customer.id, payload);
      setCustomer(updated);
      messageApi.success('已保存');
      setEditing(false);
    } catch (e) {
      handleError(e);
    }
  };

  // ===== 404 =====
  if (notFound) {
    return (
      <PageContainer title="客户详情">
        <Result
          status="404"
          title="客户不存在或已删除"
          subTitle="该客户可能已被软删、不存在，或不属于当前租户。"
          extra={
            <Button type="primary" onClick={() => navigate('/customer/list')}>
              返回客户列表
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={customer?.name ? `客户详情：${customer.name}` : '客户详情'}
      breadcrumb={{
        items: [
          { title: 'CRM 客户', path: '/customer/list' },
          { title: '客户列表', path: '/customer/list' },
          { title: customer?.name ?? '详情' },
        ],
      }}
      extra={
        customer
          ? [
              <Button
                key="back"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/customer/list')}
              >
                返回列表
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(!editing)}
              >
                {editing ? '取消编辑' : '编辑'}
              </Button>,
              <Popconfirm
                key="del"
                title="确定删除该客户？"
                description={`${customer.name} 删除后将从列表移除（软删）`}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => void onDelete()}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>,
            ]
          : [
              <Button key="back" onClick={() => navigate('/customer/list')}>
                返回列表
              </Button>,
            ]
      }
    >
      <ProCard loading={loading} bordered>
        {customer && !editing && (
          <Descriptions
            column={2}
            bordered
            size="small"
            items={[
              { key: 'name', label: '客户名称', children: customer.name },
              {
                key: 'status',
                label: '跟进状态',
                children: (
                  <Tag color={STATUS_META[customer.status].color}>
                    {STATUS_META[customer.status].text}
                  </Tag>
                ),
              },
              { key: 'contactName', label: '联系人', children: customer.contactName ?? '—' },
              { key: 'contactPhone', label: '联系电话', children: customer.contactPhone ?? '—' },
              { key: 'email', label: '邮箱', children: customer.email ?? '—', span: 2 },
              { key: 'address', label: '地址', children: customer.address ?? '—', span: 2 },
              { key: 'ownerId', label: '负责人', children: ownerName(customer.ownerId) },
              { key: 'createdBy', label: '创建人', children: ownerName(customer.createdBy) },
              { key: 'createdAt', label: '创建时间', children: customer.createdAt },
              { key: 'updatedAt', label: '更新时间', children: customer.updatedAt ?? '—' },
              { key: 'updatedBy', label: '最后更新人', children: ownerName(customer.updatedBy) },
              {
                key: 'remark',
                label: '备注',
                children: customer.remark ?? '—',
                span: 2,
              },
              // 教育版（zhiye · 合作伙伴）扩展字段：仅 eduSupplier 版别渲染
              ...(eduSupplier
                ? [
                    {
                      key: 'licenseNo',
                      label: '办学许可证号',
                      children: customer.licenseNo ?? '—',
                    },
                    {
                      key: 'licenseAttach',
                      label: '办学资质附件',
                      children: customer.licenseAttach ?? '—',
                    },
                    { key: 'region', label: '合作区域', children: customer.region ?? '—' },
                    {
                      key: 'contractPeriod',
                      label: '合作协议期',
                      children: customer.contractPeriod ?? '—',
                    },
                    {
                      key: 'revenueShare',
                      label: '智野分成比例',
                      children: customer.revenueShare !== null ? `${customer.revenueShare}%` : '—',
                    },
                    {
                      key: 'settleCycle',
                      label: '结算周期',
                      children: customer.settleCycle ?? '—',
                    },
                  ]
                : []),
            ]}
          />
        )}
        {customer && editing && (
          <EditForm
            customer={customer}
            ownerOptions={[...userMap.entries()]
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([uid, name]) => ({ label: `${name}（#${uid}）`, value: uid }))}
            onSubmit={onSave}
            onCancel={() => setEditing(false)}
          />
        )}
      </ProCard>
    </PageContainer>
  );
}

/** 简易行内编辑表单（避免搬 CustomerList 整段 ModalForm 代码；保持此页独立可读） */
function EditForm({
  customer,
  ownerOptions,
  onSubmit,
  onCancel,
}: {
  customer: Customer;
  ownerOptions: { label: string; value: number }[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({
    name: customer.name,
    contactName: customer.contactName ?? '',
    contactPhone: customer.contactPhone ?? '',
    email: customer.email ?? '',
    address: customer.address ?? '',
    ownerId: customer.ownerId ?? undefined,
    status: customer.status,
    remark: customer.remark ?? '',
    // 教育版（zhiye · 合作伙伴）扩展字段
    licenseNo: customer.licenseNo ?? '',
    licenseAttach: customer.licenseAttach ?? '',
    region: customer.region ?? '',
    contractPeriod: customer.contractPeriod ?? '',
    settleCycle: customer.settleCycle ?? '',
    revenueShare: customer.revenueShare ?? undefined,
  });

  const update = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  /** 分成比例输入值（Record 里可能是 number 或 ''） */
  const revenueShareValue = (values.revenueShare as number | undefined) ?? '';

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Field label="客户名称" required>
        <input
          data-testid="detail-name"
          value={String(values.name ?? '')}
          onChange={(e) => update('name', e.target.value)}
          style={inputStyle}
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="联系人">
          <input
            value={String(values.contactName ?? '')}
            onChange={(e) => update('contactName', e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="联系电话">
          <input
            value={String(values.contactPhone ?? '')}
            onChange={(e) => update('contactPhone', e.target.value)}
            style={inputStyle}
          />
        </Field>
      </div>
      <Field label="邮箱">
        <input
          value={String(values.email ?? '')}
          onChange={(e) => update('email', e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field label="地址">
        <input
          value={String(values.address ?? '')}
          onChange={(e) => update('address', e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field label="负责人">
        <select
          value={values.ownerId === undefined ? '' : String(values.ownerId)}
          onChange={(e) =>
            update('ownerId', e.target.value === '' ? undefined : Number(e.target.value))
          }
          style={inputStyle}
        >
          <option value="">未指定</option>
          {ownerOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="跟进状态" required>
        <select
          value={String(values.status)}
          onChange={(e) => update('status', e.target.value)}
          style={inputStyle}
        >
          {(['NEW', 'FOLLOWING', 'CONVERTED', 'LOST'] as CustomerStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].text}
            </option>
          ))}
        </select>
      </Field>
      <Field label="备注">
        <textarea
          value={String(values.remark ?? '')}
          onChange={(e) => update('remark', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </Field>
      {/* 教育版（zhiye · 合作伙伴）扩展字段：仅 eduSupplier 版别渲染 */}
      {eduSupplier && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="办学许可证号">
              <input
                value={String(values.licenseNo ?? '')}
                onChange={(e) => update('licenseNo', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="合作区域">
              <input
                value={String(values.region ?? '')}
                onChange={(e) => update('region', e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="办学资质附件">
            <input
              value={String(values.licenseAttach ?? '')}
              onChange={(e) => update('licenseAttach', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="合作协议期">
              <input
                value={String(values.contractPeriod ?? '')}
                onChange={(e) => update('contractPeriod', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="结算周期">
              <select
                value={String(values.settleCycle ?? '')}
                onChange={(e) => update('settleCycle', e.target.value)}
                style={inputStyle}
              >
                <option value="">未设置</option>
                <option value="月">月结</option>
                <option value="季">季结</option>
                <option value="学期">学期结</option>
              </select>
            </Field>
            <Field label="智野分成比例（%）">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={revenueShareValue}
                onChange={(e) =>
                  update('revenueShare', e.target.value === '' ? undefined : Number(e.target.value))
                }
                style={inputStyle}
                placeholder="如 60（智野按 60% 分成）"
              />
            </Field>
          </div>
        </>
      )}
      <Space>
        <Button type="primary" onClick={() => void onSubmit(values)} data-testid="detail-save">
          保存
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </Space>
    </Space>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <Text strong>
          {label}
          {required && <span style={{ color: '#cf1322' }}> *</span>}
        </Text>
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 11px',
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  fontSize: 14,
};
