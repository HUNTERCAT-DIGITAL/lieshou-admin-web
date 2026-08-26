/**
 * 专业成长中心（PROFESSIONAL GROWTH · 六维能力成长画像）.
 *
 * 基于实际工作数据实时计算：成长指数 + 六维画像 + 成长教练建议。
 * 合规：成长数据由本人共同确认；AI 只负责分析与建议，不评价人格，
 * 不单独作出薪酬/晋升或其他不利决定（底部声明）。
 */
import { BulbOutlined, CheckCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Progress, Space, Statistic, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import { growthSummary } from '../../services/legal';
import type { GrowthSummary } from '@lieshoucloud/types/business/legal';

const { Paragraph, Text } = Typography;

const DIM_COLORS: Record<string, string> = {
  case_execution: '#1677ff',
  professional: '#722ed1',
  work_discipline: '#13c2c2',
  client_value: '#52c41a',
  team_contribution: '#fa8c16',
  proactivity: '#eb2f96',
};

export default function GrowthCenter() {
  const handleError = useApiError();
  const [summary, setSummary] = useState<GrowthSummary | null>(null);

  const load = useCallback(async () => {
    try {
      setSummary(await growthSummary());
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const dims = summary?.dimensions ?? [];

  return (
    <PageContainer
      title="专业成长"
      subTitle="YOUR PROFESSIONAL GROWTH · 六维能力成长画像（实时生成）"
      extra={
        <Button type="primary" icon={<RiseOutlined />} onClick={() => void load()}>
          刷新画像
        </Button>
      }
    >
      {/* 本月成长概览 */}
      <ProCard split="vertical" gutter={12} style={{ marginBottom: 12 }}>
        <ProCard colSpan="30%">
          <Statistic
            title="本月成长指数"
            value={summary?.growthIndex ?? 0}
            precision={1}
            suffix="分"
            prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a', fontSize: 40 }}
          />
          <Text type="secondary">六维能力平均 · 实时计算</Text>
        </ProCard>
        <ProCard colSpan="70%">
          <Space size="large" wrap>
            <Statistic title="本月新增工作证据" value={summary?.monthEvidence ?? 0} suffix="条" />
            <Statistic title="待确认事项" value={summary?.pendingConfirm ?? 0} suffix="项" />
            <Statistic
              title="成长重点"
              value={summary?.focus ?? '—'}
              valueStyle={{ fontSize: 20 }}
            />
          </Space>
        </ProCard>
      </ProCard>

      {/* 六维能力成长画像 */}
      <ProCard title="SIX-DIMENSION GROWTH PROFILE 六维能力成长画像" style={{ marginBottom: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={18}>
          {dims.map((d) => (
            <div key={d.key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 2,
                }}
              >
                <Text strong>{d.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {d.basis}
                </Text>
              </div>
              <Progress
                percent={Math.round(d.score)}
                strokeColor={DIM_COLORS[d.key] ?? '#1677ff'}
                format={(p) => `${p} 分`}
              />
            </div>
          ))}
        </Space>
      </ProCard>

      {/* 成长教练 */}
      {summary?.coach && (
        <ProCard
          title={
            <>
              <BulbOutlined style={{ color: '#faad14', marginRight: 6 }} />
              LÜSHI · GROWTH COACH 成长教练
            </>
          }
        >
          <Tag color="gold">本周关键成长点：{summary.coach.focus}</Tag>
          <Paragraph style={{ marginTop: 8, fontSize: 14 }}>{summary.coach.advice}</Paragraph>
          <Space direction="vertical" size={4}>
            {summary.coach.steps.map((s, i) => (
              <Text key={i}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                {s}
              </Text>
            ))}
          </Space>
        </ProCard>
      )}

      {/* 合规声明 */}
      <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
        合规：成长数据由您共同确认；AI
        负责分析与建议，不评价人格，也不单独作出薪酬、晋升或其他不利决定。
      </Paragraph>
    </PageContainer>
  );
}
