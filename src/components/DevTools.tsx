/**
 * 开发者工具（悬浮 · 调试面板）.
 *
 * 右下角低调悬浮按钮，点击展开抽屉，Tab 分四类开发者关心的信息：
 *   - 环境：版别 / API 地址 / 构建模式 / 版本 / UA / 当前路由
 *   - 会话：当前用户 / 角色 / 租户 / JWT 载荷与剩余有效期
 *   - 请求：api.ts 插桩的实时请求日志（方法 / 路径 / 状态 / 耗时 / 错误）
 *   - 存储：localStorage / sessionStorage 键值（敏感值脱敏）
 * 支持一键「复制诊断信息」，方便反馈问题时携带上下文。
 *
 * 显示开关：默认显示；localStorage `lieshoucloud:devtools=off` 关闭，
 * URL 加 `?devtools=1` 强制显示（生产环境应急排查）。
 */
import {
  BugOutlined,
  ClearOutlined,
  CopyOutlined,
  EnvironmentOutlined,
  HddOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { App, Button, Descriptions, Drawer, Empty, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '../stores/auth';
import {
  clearDevLogs,
  collectEnvSnapshot,
  decodeJwtPayload,
  getDevLogs,
  maskSecret,
  subscribeDevLogs,
  type DevRequestLog,
} from '../utils/devtools';

const TOGGLE_KEY = 'lieshoucloud:devtools';

function isForcedOpen(): boolean {
  return new URLSearchParams(window.location.search).get('devtools') === '1';
}

function isEnabled(): boolean {
  return isForcedOpen() || localStorage.getItem(TOGGLE_KEY) !== 'off';
}

/** 剩余有效期（秒 → 人类可读） */
function formatRemain(exp: number | undefined, nowSec: number): string {
  if (!exp) return '-';
  const remain = exp - nowSec;
  if (remain <= 0) return '已过期';
  if (remain < 3600) return `${Math.floor(remain / 60)} 分钟`;
  return `${Math.floor(remain / 3600)} 小时 ${Math.floor((remain % 3600) / 60)} 分`;
}

export default function DevTools(): React.JSX.Element | null {
  const { message: messageApi } = App.useApp();
  const [open, setOpen] = useState(false);
  const [, forceTick] = useState(0);

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  // 请求日志订阅（api.ts pushDevLog → 刷新）
  useEffect(() => subscribeDevLogs(() => forceTick((n) => n + 1)), []);
  useEffect(() => {
    if (!isEnabled()) return;
  }, []);

  const env = useMemo(collectEnvSnapshot, [open]);
  const logs = useMemo(getDevLogs, [open, forceTick]);
  const jwt = useMemo(() => decodeJwtPayload(accessToken), [accessToken, open]);
  const nowSec = Math.floor(Date.now() / 1000);

  if (!isEnabled()) return null;

  const copyDiagnostics = async () => {
    const session = {
      username: user?.username ?? '(未登录)',
      userId: user?.userId,
      roles: user?.roles ?? [],
      tenantCode: user?.tenantCode,
      tenantName: user?.tenantName,
      tenantEdition: user?.tenantEdition,
      accessToken: maskSecret(accessToken),
      tokenExp: jwt?.exp ? new Date(Number(jwt.exp) * 1000).toLocaleString('zh-CN') : '-',
    };
    const storage = {
      localStorage: Object.fromEntries(
        Object.keys(localStorage).map((k) => [k, maskSecret(localStorage.getItem(k))]),
      ),
      sessionStorage: Object.fromEntries(
        Object.keys(sessionStorage).map((k) => [k, maskSecret(sessionStorage.getItem(k))]),
      ),
    };
    const text = JSON.stringify({ env, session, jwt, storage, lastRequests: logs.slice(-20) }, null, 2);
    await navigator.clipboard.writeText(text);
    messageApi.success('诊断信息已复制到剪贴板');
  };

  const requestColumns: ColumnsType<DevRequestLog> = [
    {
      title: '时间',
      dataIndex: 'at',
      width: 90,
      render: (v: string) => <Typography.Text type="secondary">{v}</Typography.Text>,
    },
    {
      title: '方法',
      dataIndex: 'method',
      width: 70,
      render: (v: string) => <Tag color={v === 'GET' ? 'blue' : v === 'POST' ? 'green' : 'orange'}>{v}</Tag>,
    },
    { title: '路径', dataIndex: 'path', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
      render: (v: number) => (
        <Tag color={v === 0 ? 'red' : v < 300 ? 'green' : v < 500 ? 'orange' : 'red'}>{v || 'ERR'}</Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      width: 80,
      sorter: (a, b) => a.durationMs - b.durationMs,
      render: (v: number) => `${v}ms`,
    },
    {
      title: '错误',
      dataIndex: 'error',
      ellipsis: true,
      render: (v?: string) =>
        v ? <Typography.Text type="danger">{v}</Typography.Text> : <Typography.Text type="secondary">-</Typography.Text>,
    },
  ];

  const storageEntries = useMemo(
    () => [
      ...Object.keys(localStorage).map((k) => ({ area: 'localStorage', key: k, value: maskSecret(localStorage.getItem(k)) })),
      ...Object.keys(sessionStorage).map((k) => ({ area: 'sessionStorage', key: k, value: maskSecret(sessionStorage.getItem(k)) })),
    ],
    [open],
  );

  return (
    <>
      {/* 悬浮按钮：右下角，低调半透明 */}
      <Button
        shape="circle"
        size="small"
        icon={<BugOutlined />}
        title="开发者工具"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 12,
          bottom: 12,
          zIndex: 1000,
          opacity: 0.55,
        }}
      />
      <Drawer
        title="开发者工具"
        width={760}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button size="small" icon={<CopyOutlined />} onClick={copyDiagnostics}>
              复制诊断信息
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'env',
              label: (
                <span>
                  <EnvironmentOutlined /> 环境
                </span>
              ),
              children: (
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="版别 (VITE_EDITION)">{env.edition}</Descriptions.Item>
                  <Descriptions.Item label="API 地址">{env.apiBase || '(同源)'}</Descriptions.Item>
                  <Descriptions.Item label="构建模式">
                    {env.mode} {env.isDev && <Tag color="green">dev</Tag>}
                    {env.isProd && <Tag color="blue">prod</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="应用版本">{env.appVersion}</Descriptions.Item>
                  <Descriptions.Item label="当前路由">{env.pathname}</Descriptions.Item>
                  <Descriptions.Item label="UA">{env.userAgent}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'session',
              label: (
                <span>
                  <TeamOutlined /> 会话
                </span>
              ),
              children: (
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="用户名">{user?.username ?? '(未登录)'}</Descriptions.Item>
                  <Descriptions.Item label="用户 ID">{user?.userId ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="角色">
                    {(user?.roles ?? []).map((r) => (
                      <Tag key={r} color="geekblue">{r}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="租户">
                    {user?.tenantName ?? '-'}（{user?.tenantCode ?? '-'}）
                  </Descriptions.Item>
                  <Descriptions.Item label="版别 (tenantEdition)">{user?.tenantEdition ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Token">{maskSecret(accessToken)}</Descriptions.Item>
                  <Descriptions.Item label="Refresh Token">{maskSecret(refreshToken)}</Descriptions.Item>
                  <Descriptions.Item label="Token 有效期">
                    {jwt?.exp
                      ? `${new Date(Number(jwt.exp) * 1000).toLocaleString('zh-CN')}（剩余 ${formatRemain(Number(jwt.exp), nowSec)}）`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="JWT 载荷">
                    <pre style={{ margin: 0, fontSize: 12, maxHeight: 200, overflow: 'auto' }}>
                      {JSON.stringify(jwt ?? {}, null, 2)}
                    </pre>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'requests',
              label: (
                <span>
                  <SendOutlined /> 请求 ({logs.length})
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button size="small" icon={<ClearOutlined />} onClick={() => { clearDevLogs(); forceTick((n) => n + 1); }}>
                    清空日志
                  </Button>
                  {logs.length === 0 ? (
                    <Empty description="暂无请求记录（进行页面操作后自动采集）" />
                  ) : (
                    <Table<DevRequestLog>
                      size="small"
                      rowKey="id"
                      columns={requestColumns}
                      dataSource={logs}
                      pagination={false}
                      scroll={{ y: 420 }}
                    />
                  )}
                </Space>
              ),
            },
            {
              key: 'storage',
              label: (
                <span>
                  <HddOutlined /> 存储
                </span>
              ),
              children: (
                <Table
                  size="small"
                  rowKey={(r) => `${r.area}:${r.key}`}
                  pagination={false}
                  scroll={{ y: 420 }}
                  columns={[
                    { title: '区域', dataIndex: 'area', width: 130 },
                    { title: '键', dataIndex: 'key' },
                    { title: '值（脱敏）', dataIndex: 'value', ellipsis: true },
                  ]}
                  dataSource={storageEntries}
                  locale={{ emptyText: '无存储数据' }}
                />
              ),
            },
          ]}
        />
        <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          提示：URL 加 <Typography.Text code>?devtools=1</Typography.Text> 可强制显示；localStorage{' '}
          <Typography.Text code>{TOGGLE_KEY}=off</Typography.Text> 可关闭本工具。
        </Typography.Paragraph>
      </Drawer>
    </>
  );
}
