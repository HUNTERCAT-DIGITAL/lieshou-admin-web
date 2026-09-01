/**
 * 管理后台 · 关于页（2026-09-01 优化）.
 *
 * 品牌区 + 系统信息（版本取自 dwjk 交付包 changelog）+ 近期更新 + 后端连通性检查 + 退出登录。
 */
import { useCallback, useState } from 'react';
import { Badge, Button, Card, Descriptions, Space, Tag, Timeline, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';
import { CHANGELOG, CURRENT_VERSION } from '@lieshoucloud/dwjk/industry/changelog';

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

  const latest = CHANGELOG[0];
  const recent = CHANGELOG.slice(0, 4);

  return (
    <div className="about-page" style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {edition.logo && (
          <img
            style={{ height: 64, marginBottom: 8 }}
            src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${edition.logo.replace(/^\//, '')}`}
            alt={edition.brandName}
          />
        )}
        <Typography.Title level={3} style={{ margin: '4px 0 0' }}>
          {edition.brandName}
        </Typography.Title>
        <Typography.Text type="secondary">{edition.slogan}</Typography.Text>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* 系统信息 */}
        <Card size="small" title="系统信息">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="系统名称">{edition.brandName}</Descriptions.Item>
            <Descriptions.Item label="当前版本">
              <Space size={8}>
                <Tag color="blue" style={{ fontSize: 14, padding: '2px 10px' }}>
                  v{CURRENT_VERSION}
                </Tag>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {latest?.date} · {latest?.title}
                </Typography.Text>
              </Space>
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

        {/* 近期更新 */}
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
                <div>
                  <Space size={8}>
                    <Typography.Text strong>v{e.version}</Typography.Text>
                    <Tag color={TYPE_META[e.type]?.color}>{TYPE_META[e.type]?.text ?? e.type}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {e.date}
                    </Typography.Text>
                  </Space>
                  <div>
                    <Typography.Text style={{ fontSize: 13 }}>{e.title}</Typography.Text>
                  </div>
                </div>
              ),
            }))}
          />
        </Card>

        {/* 操作 */}
        <Card size="small">
          <Space>
            <Button onClick={() => navigate('/changelog')}>版本更新记录</Button>
            <Button
              type="primary"
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
    </div>
  );
}
