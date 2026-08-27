/**
 * 管理首页 · 数据看板（开源版 · 2026-08-27 开源数据源重构）.
 *
 * - 数据全部来自开源服务：user（租户/用户/审计/通知）+ approval（审批）
 * - 闭源商业模块（CRM/进销存/财务）不再请求（开源交付包未部署）
 * - dwjk（物联网云平台）：精简工作台——只看用户数（兼容既有版别）
 *
 * 布局：统计卡片（租户/用户/审批待办/我发起/审计/未读通知）
 *      + 审批类型分布（环形图）+ 最近审计动态
 */
import {
  AuditOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Button, List, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DatavDvRing, type DvRingDatum } from '@lieshoucloud/ui';
import { ROLE_PLATFORM_ADMIN } from '../access';
import { useApiError } from '../hooks/useApiError';
import { getEdition } from '../config/editions';
import { getApprovalCounts, listApprovals } from '../services/approval';
import { APPROVAL_TYPE_META, type ApprovalType } from '@lieshoucloud/contract-types/business/approval';
import { countAuditLogs, listAuditLogs } from '../services/audit';
import { unreadNotificationCount } from '../services/notification';
import { countUsers } from '../services/user';
import { listTenants } from '../services/tenant';
import type { AuditLog } from '@lieshoucloud/contract-types/business/audit';
import { useAuthStore } from '../stores/auth';

const { Text } = Typography;

/** 概览统计（全部来自开源服务） */
interface Overview {
  tenants: number | null;
  users: number;
  approvalInbox: number;
  approvalMine: number;
  auditCount: number;
  unread: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const handleError = useApiError();
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles ?? [];
  const isPlatformAdmin = roles.includes(ROLE_PLATFORM_ADMIN);
  const dutyConsole = getEdition().dutyConsole;

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview>({
    tenants: null,
    users: 0,
    approvalInbox: 0,
    approvalMine: 0,
    auditCount: 0,
    unread: 0,
  });
  const [approvalTypeDist, setApprovalTypeDist] = useState<DvRingDatum[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const users = await countUsers();
      const tenants = isPlatformAdmin ? (await listTenants()).length : null;
      const counts = await getApprovalCounts();
      const auditCount = await countAuditLogs();
      const unread = await unreadNotificationCount();

      setOverview({
        tenants,
        users,
        approvalInbox: counts.inbox,
        approvalMine: counts.mine,
        auditCount,
        unread,
      });

      if (!dutyConsole) {
        // 审批类型分布（环形图）
        const approvals = await listApprovals({});
        const byType = new Map<string, number>();
        for (const a of approvals) {
          byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
        }
        setApprovalTypeDist(
          [...byType.entries()].map(([t, value]) => ({
            name: APPROVAL_TYPE_META[t as ApprovalType]?.text ?? t,
            value,
            color: APPROVAL_TYPE_META[t as ApprovalType]?.color,
          })),
        );
        // 最近审计动态
        setRecentAudits(await listAuditLogs({ limit: 8 }));
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [handleError, isPlatformAdmin, dutyConsole]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageContainer
      title="数据看板"
      subTitle="开源版：租户 / 用户 / 审批 / 审计 / 通知 全景"
      extra={
        <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      }
    >
      {/* ===== 第一行：平台规模 ===== */}
      <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
        <StatisticCard
          statistic={{ title: '租户数', value: overview.tenants ?? '-', icon: <ClusterOutlined /> }}
        />
        <StatisticCard
          statistic={{ title: '用户数', value: overview.users, icon: <TeamOutlined /> }}
        />
        <StatisticCard
          statistic={{
            title: '审批待办',
            value: overview.approvalInbox,
            icon: <BellOutlined />,
            suffix: '条',
          }}
          onClick={() => navigate('/approval/list')}
        />
      </ProCard>

      {/* ===== 第二行：业务动态 ===== */}
      {!dutyConsole && (
        <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          <StatisticCard
            statistic={{
              title: '我发起的审批',
              value: overview.approvalMine,
              icon: <SendOutlined />,
              suffix: '条',
            }}
            onClick={() => navigate('/approval/list')}
          />
          <StatisticCard
            statistic={{
              title: '审计日志',
              value: overview.auditCount,
              icon: <AuditOutlined />,
              suffix: '条',
            }}
            onClick={() => navigate('/audit/list')}
          />
          <StatisticCard
            statistic={{
              title: '未读通知',
              value: overview.unread,
              icon: <BellOutlined />,
              suffix: '条',
            }}
            onClick={() => navigate('/notification')}
          />
        </ProCard>
      )}

      {/* ===== 第三行：审批分布 + 最近审计 ===== */}
      {!dutyConsole && (
        <ProCard gutter={16} wrap>
          <ProCard title="审批类型分布" colSpan={{ xs: 24, lg: 10 }} loading={loading}>
            {approvalTypeDist.length > 0 ? (
              <DatavDvRing data={approvalTypeDist} type="ring" height={200} />
            ) : (
              <Text type="secondary">暂无审批数据</Text>
            )}
          </ProCard>
          <ProCard title="最近审计动态" colSpan={{ xs: 24, lg: 14 }} loading={loading}>
            <List
              size="small"
              dataSource={recentAudits}
              locale={{ emptyText: '暂无审计记录' }}
              renderItem={(l) => (
                <List.Item>
                  <Space>
                    <Tag>{l.action}</Tag>
                    <Text>{l.resourceType}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      #{l.resourceId ?? '-'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(l.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </ProCard>
        </ProCard>
      )}

      {/* ===== 快捷入口 ===== */}
      <ProCard gutter={16} wrap style={{ marginTop: 16 }}>
        <Space size="middle" wrap>
          <Button icon={<FileSearchOutlined />} onClick={() => navigate('/audit/list')}>
            审计日志
          </Button>
          <Button icon={<CheckCircleOutlined />} onClick={() => navigate('/approval/list')}>
            审批中心
          </Button>
          <Button icon={<BellOutlined />} onClick={() => navigate('/notification')}>
            通知中心
          </Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/profile')}>
            个人中心
          </Button>
        </Space>
      </ProCard>
    </PageContainer>
  );
}
