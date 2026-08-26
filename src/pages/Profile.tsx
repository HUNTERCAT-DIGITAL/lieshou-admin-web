/**
 * 个人中心（Phase 9 · Admin 体验打磨）.
 *
 * 展示当前登录用户信息（/auth/me）：用户名、UID、租户、角色；支持手动刷新。
 */
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Descriptions, Space, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from '../hooks/useApiError';
import { useAuthStore } from '../stores/auth';
import { RoleTag } from '@lieshoucloud/ui';
import { getEdition } from '../config/editions';
import type { CurrentUser } from '../types/auth';

const { Text } = Typography;

export default function Profile() {
  const handleError = useApiError();
  const cached = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  // 法律版（layer/legalmind）：单租户场景，前端不体现「租户」概念（ADR-0035 配置层）
  const hideTenant = getEdition().showLegal === true;
  const [me, setMe] = useState<CurrentUser | null>(cached);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMe(await fetchMe());
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [fetchMe, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageContainer
      title="个人中心"
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
      <ProCard bordered style={{ maxWidth: 720 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle">
            <Avatar size={56} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {me?.username ?? '(unknown)'}
              </Typography.Title>
              {!hideTenant && (
                <Text type="secondary">
                  {me?.tenantCode ? `租户：${me.tenantCode}` : '未绑定租户'}
                </Text>
              )}
            </div>
          </Space>

          <Descriptions
            column={1}
            bordered
            size="small"
            items={[
              { key: 'userId', label: '用户 ID', children: me?.userId ?? '—' },
              { key: 'username', label: '用户名', children: me?.username ?? '—' },
              ...(hideTenant
                ? []
                : [
                    { key: 'tenantId', label: '租户 ID', children: me?.tenantId ?? '—' },
                    { key: 'tenantCode', label: '租户编码', children: me?.tenantCode ?? '—' },
                  ]),
              {
                key: 'roles',
                label: '角色',
                children: (me?.roles ?? []).map((r) => <RoleTag key={r} role={r} />),
              },
            ]}
          />
        </Space>
      </ProCard>
    </PageContainer>
  );
}
