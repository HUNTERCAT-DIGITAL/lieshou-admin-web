import {
  AlertOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  LogoutOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  App,
  Avatar,
  Button,
  Card,
  Collapse,
  Descriptions,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../hooks/useApiError';
import { useAuthStore } from '../stores/auth';
import { getEdition } from '../config/editions';

const { Title, Paragraph } = Typography;

export default function Welcome() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const dutyConsole = getEdition().dutyConsole;
  const [me, setMe] = useState(user);
  const [loading, setLoading] = useState(false);

  const fetchFresh = async () => {
    setLoading(true);
    try {
      const u = await fetchMe();
      setMe(u);
      messageApi.success('已刷新');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMe(user);
  }, [user]);

  const onLogout = () => {
    logout();
    messageApi.success('已退出登录');
    navigate('/login', { replace: true });
  };

  return (
    <PageContainer
      title="欢迎"
      extra={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() => void fetchFresh()}
          loading={loading}
        >
          刷新 /me
        </Button>,
        <Button
          key="logout"
          danger
          icon={<LogoutOutlined />}
          onClick={onLogout}
          data-testid="logout-button"
        >
          退出登录
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card loading={loading}>
          <Space size="middle">
            <Avatar size={48} icon={<UserOutlined />} style={{ background: getEdition().primaryColor }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {me?.username ?? '(unknown)'}
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                <Tag color="blue">UID {me?.userId}</Tag>
                {me?.tenantCode && <Tag color="geekblue">租户 {me.tenantCode}</Tag>}
                {me?.roles?.map((r) => (
                  <Tag key={r} color="green">
                    {r}
                  </Tag>
                ))}
              </Paragraph>
            </div>
          </Space>
        </Card>

        <Card title="快捷入口">
          <Space wrap>
            {dutyConsole ? (
              <>
                <Button type="primary" icon={<RadarChartOutlined />} onClick={() => navigate('/iot/cockpit')}>
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
              </>
            ) : (
              <>
                <Button type="primary" onClick={() => navigate('/customer/list')}>
                  CRM 客户管理
                </Button>
                <Button onClick={() => navigate('/user/list')}>用户列表</Button>
                <Button onClick={() => navigate('/profile')}>个人中心</Button>
              </>
            )}
          </Space>
        </Card>

        {!dutyConsole && (
        <Collapse
          items={[
            {
              key: 'jwt',
              label: '调试信息（JWT）',
              children: (
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Access Token">
                    <code style={{ fontSize: 11, wordBreak: 'break-all' }}>
                      {accessToken ? `${accessToken.slice(0, 32)}…` : '—'}
                    </code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Issuer">lieshoucloud-dev</Descriptions.Item>
                  <Descriptions.Item label="Expires In">1800 s</Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />
        )}

        {loading && <Spin />}
      </Space>
    </PageContainer>
  );
}
