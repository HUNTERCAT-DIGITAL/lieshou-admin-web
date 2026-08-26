/**
 * 通知中心：我的站内通知列表（未读优先）· 标记已读 / 全部已读。
 */
import { Button, Empty, List, Space, Tag, Typography } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
  type NotificationItem,
} from '../../services/notification';

const PAGE_SIZE = 20;

const TYPE_META: Record<string, { text: string; color: string }> = {
  SYSTEM: { text: '系统', color: 'default' },
  APPROVAL: { text: '审批', color: 'blue' },
  AUDIT: { text: '审计', color: 'cyan' },
};

export default function NotificationList() {
  const handleError = useApiError();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const [list, count] = await Promise.all([
          listNotifications({ page: p, size: PAGE_SIZE }),
          unreadNotificationCount(),
        ]);
        setItems(list);
        setUnread(count);
        setPage(p);
      } catch (e) {
        handleError(e);
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  const onRead = useCallback(
    async (n: NotificationItem) => {
      if (n.readAt) return;
      try {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
        );
        setUnread((u) => Math.max(0, u - 1));
      } catch (e) {
        handleError(e);
      }
    },
    [handleError],
  );

  const onReadAll = useCallback(async () => {
    try {
      const updated = await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })),
      );
      setUnread((u) => Math.max(0, u - updated));
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  return (
    <PageContainer
      title="通知中心"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load(page)}>
            刷新
          </Button>
          <Button type="primary" icon={<CheckOutlined />} onClick={onReadAll} disabled={unread === 0}>
            全部已读{unread > 0 ? `（${unread}）` : ''}
          </Button>
        </Space>
      }
    >
      <ProCard>
        <List
          loading={loading}
          dataSource={items}
          locale={{ emptyText: <Empty description="暂无通知" /> }}
          renderItem={(n) => (
            <List.Item
              onClick={() => void onRead(n)}
              style={{ cursor: n.readAt ? 'default' : 'pointer' }}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Typography.Text strong={!n.readAt}>{n.title}</Typography.Text>
                    {!n.readAt && <Tag color="red">未读</Tag>}
                    <Tag color={TYPE_META[n.type]?.color ?? 'default'}>
                      {TYPE_META[n.type]?.text ?? n.type}
                    </Tag>
                  </Space>
                }
                description={
                  <Typography.Text type="secondary">
                    {dayjs(n.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    {n.content ? ` · ${n.content}` : ''}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      </ProCard>
    </PageContainer>
  );
}
