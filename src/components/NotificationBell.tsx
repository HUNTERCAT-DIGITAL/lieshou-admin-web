/**
 * 顶栏通知铃铛：未读 Badge + 最近通知下拉 + 全部已读 / 查看全部。
 * 轮询 30s 刷新未读数（与审批待办红点节奏一致）。
 */
import { Badge, Button, Dropdown, Empty, Space, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../hooks/useApiError';
import {
  listNotifications,
  markAllNotificationsRead,
  unreadNotificationCount,
  type NotificationItem,
} from '../services/notification';

const POLL_MS = 30_000;
const PREVIEW_SIZE = 5;

export default function NotificationBell() {
  const navigate = useNavigate();
  const handleError = useApiError();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [count, list] = await Promise.all([
        unreadNotificationCount(),
        listNotifications({ page: 0, size: PREVIEW_SIZE }),
      ]);
      setUnread(count);
      setRecent(list);
    } catch {
      // 通知服务不可达时静默降级（不阻塞主界面）
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const onMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setRecent((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomRight"
      dropdownRender={() => (
        <div
          style={{
            width: 320,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            padding: 12,
          }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
            <Typography.Text strong>通知</Typography.Text>
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={onMarkAllRead}>
              全部已读
            </Button>
          </Space>
          <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}>
            {recent.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '8px 4px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setOpen(false);
                    navigate('/notification');
                  }}
                >
                  <div style={{ fontWeight: n.readAt ? 400 : 600 }}>
                    {n.title}
                    {!n.readAt && (
                      <span style={{ color: '#ff4d4f', marginLeft: 6, fontSize: 12 }}>未读</span>
                    )}
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(n.createdAt).format('MM-DD HH:mm')}
                  </Typography.Text>
                </div>
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Button type="link" size="small" onClick={() => navigate('/notification')}>
              查看全部通知
            </Button>
          </div>
        </div>
      )}
    >
      <Badge count={unread} size="small" overflowCount={99} offset={[-2, 4]}>
        <Button type="text" icon={<BellOutlined />} aria-label="通知" data-testid="notification-bell" />
      </Badge>
    </Dropdown>
  );
}
