/**
 * 右上角通知铃铛（2026-09-01 · 通用站内通知）.
 *
 * 数据源：/api/iot/notifications（iot-service 通知模块）；未读角标轮询刷新；
 * 点击通知跳转 link 并标记已读；支持全部已读。
 * 通用组件（不依赖客户包），后端通知模块就绪即可用。
 */
import { useEffect, useState } from 'react';
import { Badge, Button, Drawer, Empty, List, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '@lieshoucloud/contract-api';

interface NotifItem {
  id: number;
  type: string;
  title: string;
  content?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function fmt(t?: string): string {
  if (!t) return '';
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = () => {
    request<{ count: number }>({ method: 'GET', path: '/api/iot/notifications/unread-count' })
      .then((r) => setCount(r.count ?? 0))
      .catch(() => {
        /* 通知服务未就绪静默 */
      });
  };

  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 30_000);
    return () => clearInterval(t);
  }, []);

  const openList = () => {
    setOpen(true);
    setLoading(true);
    request<NotifItem[]>({ method: 'GET', path: '/api/iot/notifications' })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const onOpenItem = (n: NotifItem) => {
    if (!n.read) {
      request({ method: 'PATCH', path: `/api/iot/notifications/${n.id}/read` })
        .catch(() => {
          /* ignore */
        })
        .finally(() => refreshCount());
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = () => {
    request({ method: 'PATCH', path: '/api/iot/notifications/read-all' })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        setItems((list) => list.map((x) => ({ ...x, read: true })));
        refreshCount();
      });
  };

  return (
    <>
      <Badge count={count} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 16 }} />}
          onClick={openList}
          aria-label="通知"
        />
      </Badge>
      <Drawer
        title="通知"
        open={open}
        onClose={() => setOpen(false)}
        width={360}
        extra={
          count > 0 && (
            <Button size="small" type="link" onClick={markAll}>
              全部已读
            </Button>
          )
        }
      >
        <List
          loading={loading}
          dataSource={items}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" /> }}
          renderItem={(n) => (
            <List.Item
              onClick={() => onOpenItem(n)}
              style={{ cursor: n.link ? 'pointer' : 'default', paddingLeft: 8, paddingRight: 8 }}
            >
              <List.Item.Meta
                title={
                  <span>
                    {!n.read && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#ff4d4f',
                          marginRight: 6,
                        }}
                      />
                    )}
                    <Typography.Text strong={!n.read}>{n.title}</Typography.Text>
                  </span>
                }
                description={
                  <>
                    <div>{n.content ?? ''}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {fmt(n.createdAt)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}
