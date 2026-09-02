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
import NotificationDetailModal, { type NotificationDetail } from './NotificationDetailModal';
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
  // 环境无通知模块（端点不存在/报错）→ 隐藏铃铛（hook 调用保持无条件、顺序稳定）
  const [unavailable, setUnavailable] = useState(false);
  // 数据源：legal（智法云枢 legal 服务）优先，iot 兜底（其他客户环境）
  const [legalMode, setLegalMode] = useState<boolean | null>(null);

  const legalBase = '/api/legal/notifications';
  const listPath = legalMode ? `${legalBase}/mine` : '/api/iot/notifications';
  const countPath = legalMode ? `${legalBase}/mine/unread-count` : '/api/iot/notifications/unread-count';
  const readAllPath = legalMode ? `${legalBase}/read-all` : '/api/iot/notifications/read-all';

  const refreshCount = () => {
    if (legalMode === null) {
      // 首次：探测 legal 通知服务（存在则用；404/500 → 回退 iot）
      request<{ count: number }>({ method: 'GET', path: `${legalBase}/mine/unread-count` })
        .then((r) => {
          setLegalMode(true);
          setCount(r.count ?? 0);
        })
        .catch(() => {
          setLegalMode(false);
          request<{ count: number }>({ method: 'GET', path: '/api/iot/notifications/unread-count' })
            .then((r) => setCount(r.count ?? 0))
            .catch(() => setUnavailable(true));
        });
      return;
    }
    request<{ count: number }>({ method: 'GET', path: countPath })
      .then((r) => setCount(r.count ?? 0))
      .catch(() => {
        /* 忽略单次轮询失败 */
      });
  };

  useEffect(() => {
    if (unavailable) return; // 已确认不可用：停止轮询
    refreshCount();
    const t = setInterval(refreshCount, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailable, legalMode]);

  const openList = () => {
    setOpen(true);
    setLoading(true);
    request<NotifItem[]>({ method: 'GET', path: listPath })
      .then((list) => setItems(list.map((n) => ({ ...n, read: n.read, content: n.content ?? '' }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const [detail, setDetail] = useState<NotificationDetail | null>(null);

  // 点击通知：legal 模式直接标记已读；iot 模式弹详情
  const onOpenItem = (n: NotifItem) => {
    if (legalMode) {
      request({ method: 'POST', path: `${legalBase}/${n.id}/read` })
        .catch(() => undefined)
        .finally(() => {
          setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
          refreshCount();
        });
      return;
    }
    setDetail({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
    });
  };

  const markAll = () => {
    request({ method: legalMode ? 'POST' : 'PATCH', path: readAllPath })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        setItems((list) => list.map((x) => ({ ...x, read: true })));
        refreshCount();
      });
  };

  // 环境无通知服务 → 不渲染铃铛（所有 hook 已在顶部调用完毕）
  if (unavailable) return null;

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
          <>
            <Button size="small" type="link" onClick={() => navigate(legalMode ? '/notifications' : '/settings?tab=notifications')}>
              查看全部
            </Button>
            {count > 0 && (
              <Button size="small" type="link" onClick={markAll}>
                全部已读
              </Button>
            )}
          </>
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
      {/* 通知详情对话框（全局复用） */}
      <NotificationDetailModal
        notification={detail}
        onClose={() => setDetail(null)}
        onChanged={() => {
          refreshCount();
          openList();
        }}
      />
    </>
  );
}
