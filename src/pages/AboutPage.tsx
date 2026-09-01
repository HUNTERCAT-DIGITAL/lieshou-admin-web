/**
 * 管理后台 · 关于页（2026-09-01 优化 · 管理系统风格全宽双列）.
 *
 * 左侧：系统信息（版本/技术栈/后端状态/操作）；右侧：近期更新时间线。
 */
import { useCallback, useState } from 'react';
import { Badge, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';

/**
 * 客户 changelog 动态导入：匹配客户包 industry/changelog（dwjk 等），无则空。
 * 消除对特定客户包的编译期硬依赖（2026-09 修复：原硬 import dwjk 破坏其他客户构建）。
 */
interface ChangelogEntry {
  version: string;
  date?: string;
  title?: string;
  type: string;
  items?: string[];
}
const CHANGELOG_MODULES = import.meta.glob('../packages/*/src/industry/changelog*', { eager: true }) as Record<
  string,
  { default?: { changelog?: ChangelogEntry[]; currentVersion?: string } }
>;
const changelogMod = Object.values(CHANGELOG_MODULES)[0]?.default;
const CHANGELOG: ChangelogEntry[] = changelogMod?.changelog ?? [];
const CURRENT_VERSION: string = changelogMod?.currentVersion ?? '1.0.0';

interface CheckState {
  loading: boolean;
  ok: boolean;
  message: string;
}

const TYPE_META: Record<string, { text: string; color: string }> = {
  feat: { text: '新功能', color: 'blue' },
  fix: { text: '修复', color: 'red' },
  improve: { text: '优化', color: 'green' },
  breaking: { text: '重要', color: 'orange' },
};

export default function AboutPage() {
  const edition = getEdition();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const [check, setCheck] = useState<CheckState>({ loading: false, ok: false, message: '' });

  const runCheck = useCallback(async () => {
    setCheck({ loading: true, ok: false, message: '' });
    try {
      const me = await fetchMe();
      setCheck({
        loading: false,
        ok: true,
        message: `后端连通正常（${me.username ?? '已登录'}）`,
      });
    } catch (err) {
      setCheck({
        loading: false,
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchMe]);

  const latest = CHANGELOG[0] ?? { version: CURRENT_VERSION, title: '—' };
  const recent = CHANGELOG.slice(0, 6);

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 16 }} align="center" size={12}>
        {edition.logo && (
          <img
            style={{ height: 40 }}
            src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${edition.logo.replace(/^\//, '')}`}
            alt={edition.brandName}
          />
        )}
        <Typography.Title level={4} style={{ margin: 0 }}>
          {edition.brandName}
        </Typography.Title>
        <Typography.Text type="secondary">{edition.slogan}</Typography.Text>
      </Space>

      <Row gutter={16}>
        {/* 左侧：系统信息 + 操作 */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" title="系统信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="当前版本">
                  <Space size={8}>
                    <Tag color="blue" style={{ fontSize: 14, padding: '2px 10px' }}>
                      v{CURRENT_VERSION}
                    </Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {latest?.date}
                    </Typography.Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="最新更新">
                  <Typography.Text style={{ fontSize: 13 }}>{latest?.title}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="技术栈">
                  Vite 6 + React 19 + Ant Design 5 · Java 21 + Spring Boot 3.5
                </Descriptions.Item>
                <Descriptions.Item label="登录用户">{user?.username || '未登录'}</Descriptions.Item>
                <Descriptions.Item label="后端状态">
                  <Space size={8}>
                    {check.loading ? (
                      <Tag icon={<ReloadOutlined spin />}>检查中…</Tag>
                    ) : check.ok ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        连通正常
                      </Tag>
                    ) : check.message ? (
                      <Tag color="error" icon={<CloseCircleOutlined />}>
                        异常
                      </Tag>
                    ) : (
                      <Badge status="default" text="未检测" />
                    )}
                    <Button size="small" onClick={runCheck} disabled={check.loading}>
                      检测连通性
                    </Button>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              {check.message && (
                <Typography.Paragraph
                  type={check.ok ? 'success' : 'danger'}
                  style={{ margin: '8px 0 0', fontSize: 12 }}
                >
                  {check.message}
                </Typography.Paragraph>
              )}
            </Card>

            <Card size="small">
              <Space>
                <Button type="primary" onClick={() => navigate('/changelog')}>
                  版本更新记录
                </Button>
                <Button
                  danger
                  onClick={() => {
                    logout();
                    navigate('/portal');
                  }}
                >
                  退出登录
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* 右侧：近期更新 */}
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title="近期更新"
            extra={
              <Button type="link" size="small" onClick={() => navigate('/changelog')}>
                查看全部
              </Button>
            }
          >
            <Timeline
              items={recent.map((e) => ({
                color: e.type === 'breaking' ? 'orange' : e.type === 'feat' ? 'blue' : 'green',
                children: (
                  <div style={{ marginBottom: 4 }}>
                    <Space size={8}>
                      <Typography.Text strong>v{e.version}</Typography.Text>
                      <Tag color={TYPE_META[e.type]?.color}>
                        {TYPE_META[e.type]?.text ?? e.type}
                      </Tag>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {e.date}
                      </Typography.Text>
                    </Space>
                    <div>
                      <Typography.Text style={{ fontSize: 13 }}>{e.title}</Typography.Text>
                    </div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                      {(e.items ?? []).slice(0, 3).map((it) => (
                        <li key={it}>
                          <Typography.Text style={{ fontSize: 12 }}>{it}</Typography.Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
