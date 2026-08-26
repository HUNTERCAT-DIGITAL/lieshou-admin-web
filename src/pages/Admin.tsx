/**
 * 管理首页 · 数据看板（Phase 9 · BI 雏形 · 2026-08-25 分版）.
 *
 * - 非 dwjk（通用/法律/教育/制造版）：租户/用户/客户/进销存/财务/审批看板
 * - dwjk（物联网云平台）：精简工作台——用户数 + 物联网概况 + 监控快捷入口
 *   （客户/进销存/财务/审批与电网监控无关，不展示也不请求）
 *
 * 数据：dwjk 只请求 countUsers + iot；非 dwjk 走全量概览。
 */
import {
  AccountBookOutlined,
  AlertOutlined,
  ApiOutlined,
  ApartmentOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ClusterOutlined,
  ContactsOutlined,
  DashboardOutlined,
  DollarOutlined,
  FallOutlined,
  HddOutlined,
  MailOutlined,
  MessageOutlined,
  PlusOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  RiseOutlined,
  SendOutlined,
  ShopOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Avatar, Button, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROLE_PLATFORM_ADMIN } from '../access';
import BarChart from '../components/charts/BarChart';
import { RoleTag } from '@lieshoucloud/ui';
import { useApiError } from '../hooks/useApiError';
import { getEdition } from '../config/editions';
import LegalMindDashboard from './Legal/LegalMindDashboard';
import { listCustomers } from '../services/crm';
import { getApprovalCounts } from '../services/approval';
import { getLedgerSummary } from '../services/finance';
import { listProducts } from '../services/inventory';
import { countIotDevices, listIotProducts } from '../services/iot';
import { countUsers } from '../services/user';
import { listTenants } from '../services/tenant';
import { getCustomerSuccessSummary } from '../services/customerSuccess';
import type { CustomerSuccessSummary } from '@lieshoucloud/types/business/customerSuccess';
import { useAuthStore } from '../stores/auth';
import {
  aggregateFunnel,
  aggregateStatus,
  FUNNEL_ORDER,
  getCustomerCreatedSeries,
  seriesTotal,
} from '../utils/analytics';
import { STATUS_META } from '@lieshoucloud/types/business/customer';

const { Title, Text } = Typography;

/** 概览统计 */
interface Overview {
  tenants: number | null;
  users: number;
  customers: number;
  products: number;
  stockValue: number;
  lowStock: number;
  monthIncome: number;
  monthExpense: number;
  approvalInbox: number;
  iotProducts: number;
  iotDevices: number;
  iotOnline: number;
}

const LOW_STOCK_THRESHOLD = 5;

/** dwjk 精简工作台（只看用户 + 物联网监控） */
function DwjkDashboard({ overview, loading }: { overview: Overview; loading: boolean }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <ProCard bordered>
        <Space size="middle">
          <Avatar size={56} icon={<UserOutlined />} style={{ background: '#1677ff' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user?.username ?? '访客'}，欢迎回来
            </Title>
            <Text type="secondary">
              {/* dwjk 单租户：不显示租户编码标签；角色显示中文名（如 值班员） */}
              {(user?.roles ?? []).map((r) => (
                <RoleTag key={r} role={r} />
              ))}
            </Text>
          </div>
        </Space>
      </ProCard>

      <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
        <StatisticCard
          statistic={{
            title: '设备总数',
            value: overview.iotDevices,
            prefix: <HddOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: '在线设备',
            value: overview.iotOnline,
            prefix: <ApiOutlined />,
            valueStyle: { color: '#52c41a' },
          }}
        />
        <StatisticCard
          statistic={{
            title: '设备在线率',
            value:
              overview.iotDevices > 0
                ? `${Math.round((overview.iotOnline / overview.iotDevices) * 100)}%`
                : '—',
            prefix: <ThunderboltOutlined />,
            valueStyle: {
              color:
                overview.iotDevices > 0 && overview.iotOnline / overview.iotDevices < 0.9
                  ? '#fa8c16'
                  : '#1677ff',
            },
          }}
        />
      </ProCard>

      <ProCard title="监控快捷入口" bordered>
        <Space wrap size={[12, 12]}>
          <Button
            type="primary"
            icon={<RadarChartOutlined />}
            onClick={() => navigate('/iot/cockpit')}
          >
            监控驾驶舱
          </Button>
          <Button icon={<DashboardOutlined />} onClick={() => navigate('/iot/overview')}>
            监控总览
          </Button>
          <Button icon={<ApartmentOutlined />} onClick={() => navigate('/iot/topo')}>
            电网拓扑
          </Button>
          <Button icon={<AlertOutlined />} onClick={() => navigate('/iot/alerts')}>
            告警中心
          </Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/profile')}>
            个人中心
          </Button>
        </Space>
        {loading && <div style={{ marginTop: 12 }}>加载中…</div>}
      </ProCard>
    </Space>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const handleError = useApiError();
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles ?? [];
  const isPlatformAdmin = roles.includes(ROLE_PLATFORM_ADMIN);
  const dutyConsole = getEdition().dutyConsole;
  const showLegalWorkbench = getEdition().showLegal === true && !dutyConsole;

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview>({
    tenants: null,
    users: 0,
    customers: 0,
    products: 0,
    stockValue: 0,
    lowStock: 0,
    monthIncome: 0,
    monthExpense: 0,
    approvalInbox: 0,
    iotProducts: 0,
    iotDevices: 0,
    iotOnline: 0,
  });
  const [statusDist, setStatusDist] = useState(aggregateStatus([]));
  const [funnel, setFunnel] = useState(aggregateFunnel([]));
  const [series, setSeries] = useState(getCustomerCreatedSeries(user?.tenantCode ?? 'default'));
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof listCustomers>>>([]);
  const [success, setSuccess] = useState<CustomerSuccessSummary>({
    totalLetters: 0,
    draftLetters: 0,
    sentLetters: 0,
    completedLetters: 0,
    totalResponses: 0,
    openResponses: 0,
    resolvedResponses: 0,
    negativeResponses: 0,
    weekResponses: 0,
    followUpOverdue: 0,
    followUpDueToday: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [users] = await Promise.all([countUsers()]);
      const tenants = isPlatformAdmin ? (await listTenants()).length : null;

      // 值班员控制台：跳过 CRM/进销存/财务/审批概览（与行业版核心业务无关）
      let customerList: Awaited<ReturnType<typeof listCustomers>> = [];
      let products: Awaited<ReturnType<typeof listProducts>> = [];
      let monthIncome = 0;
      let monthExpense = 0;
      let approvalInbox = 0;
      if (!dutyConsole) {
        const [cl, pl] = await Promise.all([listCustomers(), listProducts()]);
        customerList = cl;
        products = pl;
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const ledger = await getLedgerSummary({ from: monthStart, to: today });
        monthIncome = ledger.income;
        monthExpense = ledger.expense;
        approvalInbox = (await getApprovalCounts()).inbox;
        setStatusDist(aggregateStatus(customerList));
        setFunnel(aggregateFunnel(customerList));
        setSeries(getCustomerCreatedSeries(user?.tenantCode ?? 'default'));
        const sorted = [...customerList].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setRecent(sorted.slice(0, 5));
        // 客户成功中心概览（工作台第 4 卡）：失败静默降级，不阻塞看板
        try {
          setSuccess(await getCustomerSuccessSummary());
        } catch {
          // crm 不可达时保持零值
        }
      }

      // 物联网概况（值班员控制台版）
      let iotProducts = 0;
      let iotDevices = 0;
      let iotOnline = 0;
      if (dutyConsole) {
        try {
          const [iotProductList, iotCounts] = await Promise.all([
            listIotProducts(),
            countIotDevices(),
          ]);
          iotProducts = iotProductList.length;
          iotDevices = iotCounts.total;
          iotOnline = iotCounts.online;
        } catch {
          // iot 服务不可达时静默降级
        }
      }

      setOverview({
        tenants,
        users,
        customers: customerList.length,
        products: products.length,
        stockValue: products.reduce((sum, p) => sum + (p.price ?? 0) * p.stockQuantity, 0),
        lowStock: products.filter((p) => p.stockQuantity <= LOW_STOCK_THRESHOLD).length,
        monthIncome,
        monthExpense,
        approvalInbox,
        iotProducts,
        iotDevices,
        iotOnline,
      });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [handleError, isPlatformAdmin, dutyConsole, user?.tenantCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const total7d = seriesTotal(series, 7);
  const total30d = seriesTotal(series, 30);

  // 法律版（layer/legalmind）：今日作战台（LegalMind Unity TODAY COMMAND）
  if (showLegalWorkbench) {
    return <LegalMindDashboard />;
  }

  // 值班员控制台：精简工作台（只展示行业版核心看板）
  if (dutyConsole) {
    return (
      <PageContainer
        title="数据看板"
        extra={[
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => void load()}
            loading={loading}
          >
            刷新
          </Button>,
        ]}
      >
        <DwjkDashboard overview={overview} loading={loading} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="数据看板"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => void load()}
          loading={loading}
        >
          刷新
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 欢迎条 */}
        <ProCard bordered>
          <Space size="middle">
            <Avatar size={56} icon={<UserOutlined />} style={{ background: '#1677ff' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {user?.username ?? '访客'}，欢迎回来
              </Title>
              <Text type="secondary">
                {user?.tenantCode && <Tag color="geekblue">租户 {user.tenantCode}</Tag>}
                {roles.map((r) => (
                  <RoleTag key={r} role={r} />
                ))}
              </Text>
            </div>
          </Space>
        </ProCard>

        {/* 概览统计 */}
        <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          {isPlatformAdmin && overview.tenants !== null && (
            <StatisticCard
              statistic={{
                title: '租户总数',
                value: overview.tenants,
                prefix: <ClusterOutlined />,
              }}
            />
          )}
          <StatisticCard
            statistic={{
              title: isPlatformAdmin ? '平台用户数' : '本租户用户',
              value: overview.users,
              prefix: <TeamOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: isPlatformAdmin ? '租户客户总数' : '本租户客户',
              value: overview.customers,
              prefix: <ContactsOutlined />,
            }}
          />
        </ProCard>

        {/* 业务经营统计（进销存 + 财务） */}
        <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          <StatisticCard
            statistic={{
              title: '商品数',
              value: overview.products,
              prefix: <ShopOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: '库存总值（¥）',
              value: overview.stockValue.toFixed(0),
              prefix: <DollarOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: '低库存预警（≤' + LOW_STOCK_THRESHOLD + '）',
              value: overview.lowStock,
              prefix: <WarningOutlined />,
              valueStyle: { color: overview.lowStock > 0 ? '#f5222d' : '#52c41a' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '本月收入（¥）',
              value: overview.monthIncome.toFixed(0),
              prefix: <RiseOutlined />,
              valueStyle: { color: '#52c41a' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '本月支出（¥）',
              value: overview.monthExpense.toFixed(0),
              prefix: <FallOutlined />,
              valueStyle: { color: '#f5222d' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '本月结余（¥）',
              value: (overview.monthIncome - overview.monthExpense).toFixed(0),
              prefix: <AccountBookOutlined />,
              valueStyle: {
                color: overview.monthIncome - overview.monthExpense >= 0 ? '#1677ff' : '#f5222d',
              },
            }}
          />
          <StatisticCard
            statistic={{
              title: '待我审批',
              value: overview.approvalInbox,
              prefix: <AuditOutlined />,
              valueStyle: {
                color: overview.approvalInbox > 0 ? '#fa8c16' : '#52c41a',
              },
            }}
          />
        </ProCard>

        {/* 客户成功中心（工作台第 4 卡 · 售后闭环概览） */}
        <ProCard
          title="客户成功中心"
          bordered
          extra={
            <Button icon={<ContactsOutlined />} onClick={() => navigate('/customer/success')}>
              进入客户成功中心
            </Button>
          }
        >
          {loading ? (
            <div style={{ padding: 24 }}>加载中…</div>
          ) : (
            <ProCard split="vertical" bodyStyle={{ padding: '12px 0' }}>
              <StatisticCard
                statistic={{
                  title: '待发送联系函',
                  value: success.draftLetters,
                  prefix: <MailOutlined />,
                  valueStyle: { color: '#fa8c16' },
                }}
              />
              <StatisticCard
                statistic={{
                  title: '已发送待响应',
                  value: success.sentLetters,
                  prefix: <SendOutlined />,
                  valueStyle: { color: '#1677ff' },
                }}
              />
              <StatisticCard
                statistic={{
                  title: '待跟进响应',
                  value: success.openResponses,
                  prefix: <MessageOutlined />,
                  valueStyle: { color: '#faad14' },
                }}
              />
              <StatisticCard
                statistic={{
                  title: '已逾期跟进',
                  value: success.followUpOverdue,
                  prefix: <ClockCircleOutlined />,
                  valueStyle: { color: success.followUpOverdue > 0 ? '#f5222d' : '#52c41a' },
                }}
                hoverable
                onClick={() => navigate('/customer/success?tab=responses&followUp=overdue')}
              />
              <StatisticCard
                statistic={{
                  title: '今日到期跟进',
                  value: success.followUpDueToday,
                  prefix: <WarningOutlined />,
                  valueStyle: { color: success.followUpDueToday > 0 ? '#fa8c16' : '#52c41a' },
                }}
                hoverable
                onClick={() => navigate('/customer/success?tab=responses&followUp=dueToday')}
              />
              <StatisticCard
                statistic={{
                  title: '消极响应',
                  value: success.negativeResponses,
                  prefix: <AlertOutlined />,
                  valueStyle: { color: success.negativeResponses > 0 ? '#f5222d' : '#52c41a' },
                }}
              />
              <StatisticCard
                statistic={{
                  title: '近 7 天响应',
                  value: success.weekResponses,
                  prefix: <RiseOutlined />,
                  valueStyle: { color: '#52c41a' },
                }}
              />
              <StatisticCard
                statistic={{
                  title: '响应闭环率',
                  value:
                    success.totalResponses > 0
                      ? `${Math.round((success.resolvedResponses / success.totalResponses) * 100)}%`
                      : '—',
                  prefix: <CheckCircleOutlined />,
                }}
              />
            </ProCard>
          )}
        </ProCard>

        <ProCard gutter={16} wrap>
          {/* 30 天客户创建趋势 */}
          <ProCard
            title="30 天客户创建趋势"
            colSpan={{ xs: 24, lg: 14 }}
            loading={loading}
            extra={
              <Space size="small">
                <Tag color="blue">近 7 天 {total7d} 条</Tag>
                <Tag color="geekblue">近 30 天 {total30d} 条</Tag>
              </Space>
            }
          >
            <BarChart data={series} />
          </ProCard>

          {/* 状态分布 + 漏斗 */}
          <ProCard title="客户状态分布" colSpan={{ xs: 24, lg: 10 }} loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {statusDist.map((b) => (
                <div key={b.status}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>
                      <Tag color={STATUS_META[b.status].color} style={{ marginRight: 8 }}>
                        {STATUS_META[b.status].text}
                      </Tag>
                    </Text>
                    <Text type="secondary">
                      {b.count} 条 · {b.pct}%
                    </Text>
                  </Space>
                  <div
                    style={{
                      background: '#f5f5f5',
                      borderRadius: 4,
                      height: 8,
                      marginTop: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${b.pct}%`,
                        height: '100%',
                        background: STATUS_META[b.status].color,
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              ))}
            </Space>
          </ProCard>
        </ProCard>

        <ProCard gutter={16} wrap>
          {/* 跟进漏斗 */}
          <ProCard title="客户生命周期漏斗" colSpan={{ xs: 24, lg: 14 }} loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {funnel.map((b, i) => {
                const prev = i > 0 ? funnel[i - 1] : null;
                const widthPct = Math.max(20, b.pct);
                const conversion =
                  prev && prev.count > 0 ? Math.round((b.count / prev.count) * 100) : null;
                return (
                  <div key={b.status}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong>
                        {FUNNEL_ORDER.indexOf(b.status) + 1}. {STATUS_META[b.status].text}
                      </Text>
                      <Text type="secondary">
                        {b.count} 条 · {b.pct}%
                        {conversion !== null && prev && (
                          <Tag
                            color={conversion >= 50 ? 'green' : 'orange'}
                            style={{ marginLeft: 8 }}
                          >
                            转化率 {conversion}%
                          </Tag>
                        )}
                      </Text>
                    </Space>
                    <div
                      style={{
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: 6,
                        height: 36,
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          background: `${STATUS_META[b.status].color}22`,
                          borderLeft: `4px solid ${STATUS_META[b.status].color}`,
                          transition: 'width 0.4s',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </Space>
          </ProCard>

          {/* 快捷入口 + 最近客户 */}
          <ProCard title="快捷入口" colSpan={{ xs: 24, lg: 10 }}>
            <Space wrap size={[12, 12]}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/customer/list')}
              >
                CRM 客户管理
              </Button>
              {isPlatformAdmin && (
                <Button icon={<ClusterOutlined />} onClick={() => navigate('/tenant/list')}>
                  租户管理
                </Button>
              )}
              <Button icon={<TeamOutlined />} onClick={() => navigate('/user/list')}>
                用户管理
              </Button>
              <Button icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                个人中心
              </Button>
            </Space>
            {recent.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
                  最近客户
                </Title>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  {recent.map((c) => (
                    <Space key={c.id} style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{c.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <Tag color={STATUS_META[c.status].color}>{STATUS_META[c.status].text}</Tag>
                        {c.createdAt}
                      </Text>
                    </Space>
                  ))}
                </Space>
              </>
            )}
          </ProCard>
        </ProCard>
      </Space>
    </PageContainer>
  );
}
