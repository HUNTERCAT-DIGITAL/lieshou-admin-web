/**
 * 平台功能进度页（2026-09 · 已完成功能与未完成规划）.
 *
 * 展示平台能力完成情况：总览统计 + 已完成功能（完成度/状态）+ 未完成/规划清单。
 * 内容源：docs/featuresContent.ts（维护数据即更新页面）。
 */
import { Button, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { FEATURE_DONE, FEATURE_TODO } from '../docs/featuresContent';

const STATUS_COLOR: Record<string, string> = {
  生产运行: 'green',
  部分场景待完善: 'orange',
};

const TODO_COLOR: Record<string, string> = {
  高: 'red',
  中: 'orange',
  低: 'default',
};

export default function FeaturesPage() {
  const navigate = useNavigate();

  const done = FEATURE_DONE.length;
  const todoHigh = FEATURE_TODO.filter((t) => t.priority === '高').length;
  const overall = Math.round(FEATURE_DONE.reduce((s, f) => s + f.percent, 0) / Math.max(FEATURE_DONE.length, 1));

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 28px 60px', background: '#fff', minHeight: '100vh' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 8 }} onClick={() => navigate('/home')}>
        返回系统
      </Button>
      <Typography.Title level={3} style={{ color: '#02429B', marginTop: 0 }}>
        <RocketOutlined style={{ marginRight: 8 }} />
        平台功能进度
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        电网监控物联网平台功能完成情况一览（持续更新 · 最后统计 {new Date().toLocaleDateString('zh-CN')}）
      </Typography.Paragraph>

      {/* 总览统计 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已完成功能" value={done} suffix="项" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="总体完成度" value={overall} suffix="%" valueStyle={{ color: '#02429B' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="规划/待办" value={FEATURE_TODO.length} suffix="项" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="高优先级待办" value={todoHigh} suffix="项" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      {/* 已完成功能 */}
      <Typography.Title level={5} style={{ marginBottom: 12 }}>
        ✅ 已完成功能（{done} 项 · 生产运行）
      </Typography.Title>
      <Row gutter={[12, 12]}>
        {FEATURE_DONE.map((f) => (
          <Col xs={24} lg={12} key={f.name}>
            <Card size="small" style={{ height: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text strong>{f.name}</Typography.Text>
                <Space size={6}>
                  <Tag color={STATUS_COLOR[f.status] ?? 'blue'} style={{ margin: 0 }}>
                    {f.status}
                  </Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {f.launched}
                  </Typography.Text>
                </Space>
              </Space>
              <Progress percent={f.percent} size="small" strokeColor={f.percent >= 95 ? '#52c41a' : '#1677ff'} />
              <Typography.Paragraph
                type="secondary"
                style={{ fontSize: 12, marginBottom: 0, lineHeight: 1.7 }}
              >
                {f.summary}
              </Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 未完成 / 规划 */}
      <Typography.Title level={5} style={{ margin: 28, marginBottom: 12 }}>
        📌 未完成 / 规划中（{FEATURE_TODO.length} 项）
      </Typography.Title>
      <Table
        size="small"
        rowKey="name"
        dataSource={FEATURE_TODO}
        pagination={false}
        columns={[
          { title: '功能', dataIndex: 'name', width: 200 },
          { title: '优先级', dataIndex: 'priority', width: 80, render: (v: string) => <Tag color={TODO_COLOR[v]}>{v}</Tag> },
          {
            title: '状态',
            dataIndex: 'status',
            width: 90,
            render: (v: string) => <Tag color={v === '进行中' ? 'blue' : v === '规划中' ? 'orange' : 'default'}>{v}</Tag>,
          },
          { title: '说明', dataIndex: 'note', render: (v: string) => <Typography.Text style={{ fontSize: 12 }}>{v}</Typography.Text> },
        ]}
      />
    </div>
  );
}
