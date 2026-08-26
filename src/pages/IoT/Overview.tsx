/**
 * 物联网 · 监控总览（ADR-0040 · 2026-08-24）.
 *
 * 值班 3 秒判断「有没有事」：统计卡 + 全站最高温度 + 离线/告警设备红名单。
 * 进入页面拉一次 + 30s 轮询（失败静默）。
 */
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ApiOutlined,
  CloudServerOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../../hooks/useApiError';
import { getIotOverview } from '../../services/iot';
import {
  IOT_SEVERITY_META,
  TEMPERATURE_LEVEL_COLOR,
  temperatureLevel,
  type IotOverview,
} from '../../types/iot';

export default function IotOverviewPage() {
  const navigate = useNavigate();
  const handleError = useApiError();

  const [overview, setOverview] = useState<IotOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      setOverview(await getIotOverview());
      setLastRefresh(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // 首拉 + 30s 轮询（失败静默，不打扰）
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void getIotOverview()
        .then(setOverview)
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const d = overview?.deviceCount;
  const hot = overview?.maxTemperature;

  return (
    <PageContainer
      title="监控总览"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => void load()}
        >
          刷新
        </Button>,
        <Button
          key="devices"
          type="primary"
          icon={<CloudServerOutlined />}
          onClick={() => navigate('/iot/devices')}
        >
          设备列表
        </Button>,
      ]}
    >
      {/* 统计卡 */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={8} md={5}>
          <Card size="small">
            <Statistic title="设备总数" value={d?.total ?? 0} suffix="台" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small">
            <Statistic
              title="在线"
              value={d?.online ?? 0}
              valueStyle={{ color: '#52c41a' }}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small">
            <Statistic
              title="离线"
              value={d?.offline ?? 0}
              valueStyle={{ color: d && d.offline > 0 ? '#ff4d4f' : undefined }}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small">
            <Statistic
              title="今日告警"
              value={overview?.alertsToday ?? 0}
              valueStyle={{ color: overview && overview.alertsToday > 0 ? '#fa8c16' : undefined }}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="待确认"
              value={overview?.pendingAlerts ?? 0}
              valueStyle={{ color: overview && overview.pendingAlerts > 0 ? '#ff4d4f' : undefined }}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      {/* 全站最高温度 */}
      <Card size="small" style={{ marginTop: 12 }} title="全站最高节点温度">
        {hot && hot.value !== null ? (
          <Space size="large" align="center">
            <Statistic
              title={hot.name ? `设备：${hot.name}` : '设备'}
              value={hot.value}
              precision={1}
              suffix="℃"
              valueStyle={{
                fontSize: 28,
                color: TEMPERATURE_LEVEL_COLOR[temperatureLevel(hot.value)],
              }}
            />
            <Typography.Text type="secondary">
              <ThunderboltOutlined /> 节点温度超 70℃ 触发告警（阈值可在规则配置中调整）
            </Typography.Text>
          </Space>
        ) : (
          <Empty description="暂无节点温度数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 异常设备 */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                未确认告警
                <Tag color={overview && overview.alertDevices.length > 0 ? 'red' : 'default'}>
                  {overview?.alertDevices.length ?? 0}
                </Tag>
              </Space>
            }
          >
            {!overview || overview.alertDevices.length === 0 ? (
              <Empty description="暂无未确认告警" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={overview.alertDevices}
                renderItem={(a) => {
                  const sev = IOT_SEVERITY_META[a.severity];
                  return (
                    <List.Item
                      style={{ cursor: 'pointer', paddingLeft: 8, paddingRight: 8 }}
                      onClick={() => navigate('/iot/alerts')}
                    >
                      <List.Item.Meta
                        title={
                          <Space size={6}>
                            <Tag color={sev.color}>{sev.text}</Tag>
                            <Typography.Text strong>{a.name}</Typography.Text>
                          </Space>
                        }
                        description={
                          <Space size={8} wrap>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                              {a.ruleName}
                            </Typography.Text>
                            {a.propertyKey && a.actualValue !== null && (
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {a.propertyKey}={a.actualValue}
                                {a.threshold ? `（阈值${a.threshold}）` : ''}
                              </Typography.Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <ApiOutlined style={{ color: '#fa8c16' }} />
                离线设备
                <Tag color={overview && overview.offlineDevices.length > 0 ? 'orange' : 'default'}>
                  {overview?.offlineDevices.length ?? 0}
                </Tag>
              </Space>
            }
          >
            {!overview || overview.offlineDevices.length === 0 ? (
              <Empty description="全部设备在线" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={overview.offlineDevices}
                renderItem={(dev) => (
                  <List.Item
                    style={{ cursor: 'pointer', paddingLeft: 8, paddingRight: 8 }}
                    onClick={() => navigate(`/iot/devices`)}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={6}>
                          <Tag color="default">离线</Tag>
                          <Typography.Text strong>{dev.name}</Typography.Text>
                        </Space>
                      }
                      description={
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {dev.deviceKey}
                          {dev.lastOfflineAt
                            ? ` · ${new Date(dev.lastOfflineAt).toLocaleString('zh-CN')}`
                            : ''}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {lastRefresh && (
        <Alert
          style={{ marginTop: 12 }}
          type="info"
          showIcon
          message={`最近刷新：${lastRefresh}（每 30 秒自动刷新）`}
        />
      )}
    </PageContainer>
  );
}
