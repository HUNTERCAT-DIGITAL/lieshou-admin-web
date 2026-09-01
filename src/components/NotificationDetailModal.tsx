/**
 * 通知详情对话框（2026-09-01 · 全局复用）.
 *
 * 铃铛抽屉 / 通知管理页点击通知 → 以对话框展示完整内容：
 * 类型/接收人/时间 + 全文 + 操作（标记已读 / 跳转 link / 删除）。
 */
import { App, Button, Descriptions, Modal, Popconfirm, Space, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { deleteNotification, markNotificationReadAny, markNotificationRead } from '@lieshoucloud/dwjk/api';
import { formatDateTime } from '@lieshoucloud/dwjk/industry/utils/time';

export interface NotificationDetail {
  id: number;
  userId?: number;
  userName?: string;
  type: string;
  title: string;
  content?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { text: string; color: string }> = {
  TICKET: { text: '工单', color: 'blue' },
  ALERT: { text: '告警', color: 'red' },
};

interface Props {
  notification: NotificationDetail | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 数据变更（标记已读/删除）后通知父级刷新 */
  onChanged: () => void;
}

export default function NotificationDetailModal({ notification: n, onClose, onChanged }: Props) {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();

  if (!n) return null;
  const meta = TYPE_META[n.type] ?? { text: n.type, color: 'default' };

  const markRead = async () => {
    try {
      // 管理项（有 userName）走 read-any；否则本人 read
      if (n.userName) await markNotificationReadAny(n.id);
      else await markNotificationRead(n.id);
      messageApi.success('已标记已读');
      onChanged();
      onClose();
    } catch {
      /* ignore */
    }
  };

  const remove = async () => {
    try {
      await deleteNotification(n.id);
      messageApi.success('已删除');
      onChanged();
      onClose();
    } catch {
      /* ignore */
    }
  };

  const goLink = () => {
    onClose();
    if (n.link) navigate(n.link);
  };

  return (
    <Modal
      open
      title="通知详情"
      width={480}
      onCancel={onClose}
      footer={
        <Space>
          {!n.read && (
            <Button icon={<CheckCircleOutlined />} onClick={() => void markRead()}>
              标记已读
            </Button>
          )}
          {n.link && (
            <Button type="primary" icon={<ExportOutlined />} onClick={goLink}>
              查看详情
            </Button>
          )}
          <Popconfirm
            title="确定删除该通知？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void remove()}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Space size={8} wrap>
            <Tag color={meta.color}>{meta.text}</Tag>
            <Typography.Text strong style={{ fontSize: 15 }}>
              {n.title}
            </Typography.Text>
          </Space>
        </div>
        <Descriptions column={1} size="small">
          {n.userName && <Descriptions.Item label="接收人">{n.userName}</Descriptions.Item>}
          <Descriptions.Item label="时间">{formatDateTime(n.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {n.read ? <Tag>已读</Tag> : <Tag color="red">未读</Tag>}
          </Descriptions.Item>
        </Descriptions>
        <div
          style={{
            background: '#fafafa',
            borderRadius: 8,
            padding: '10px 12px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Typography.Text>{n.content ?? '—'}</Typography.Text>
        </div>
      </Space>
    </Modal>
  );
}
