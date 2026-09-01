/**
 * 通知管理页（2026-09-01 · 系统设置内）.
 *
 * 管理员管理租户内全部通知：查看（接收人/类型/内容/状态）、筛选、标记已读、删除/清空。
 * 通知类型：TICKET 工单 / ALERT 告警（后续扩展）。
 */
import { useRef, useState } from 'react';
import { App, Button, Popconfirm, Tag } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';

import { useApiError } from '@lieshoucloud/ui';
import NotificationDetailModal, { type NotificationDetail } from '../components/NotificationDetailModal';
import { request } from '@lieshoucloud/contract-api';

/** 通知管理项（通用 iot 端点 · 上游直接调用避免客户包依赖） */
export interface NotificationAdminItem {
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
async function listAllNotifications(params?: { type?: string; read?: string; keyword?: string }) {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.read) qs.set('read', params.read);
  if (params?.keyword) qs.set('keyword', params.keyword);
  const q = qs.toString();
  return request<NotificationAdminItem[]>({
    method: 'GET',
    path: `/api/iot/notifications/admin${q ? `?${q}` : ''}`,
  });
}
async function deleteAllNotifications() {
  await request({ method: 'DELETE', path: '/api/iot/notifications' });
}
async function markNotificationReadAny(id: number) {
  await request({ method: 'PATCH', path: `/api/iot/notifications/${id}/read` });
}
function formatDateTime(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const TYPE_META: Record<string, { text: string; color: string }> = {
  TICKET: { text: '工单', color: 'blue' },
  ALERT: { text: '告警', color: 'red' },
};

export default function NotificationsPage() {
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [detail, setDetail] = useState<NotificationDetail | null>(null);

  const columns: ProColumns<NotificationAdminItem>[] = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      search: false,
      render: (_, r) => formatDateTime(r.createdAt),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      valueEnum: {
        TICKET: { text: '工单' },
        ALERT: { text: '告警' },
      },
      render: (_, r) => {
        const meta = TYPE_META[r.type] ?? { text: r.type, color: 'default' };
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '接收人',
      dataIndex: 'userName',
      width: 110,
      search: false,
      render: (_, r) => r.userName,
    },
    { title: '标题', dataIndex: 'title', width: 160, ellipsis: true },
    { title: '内容', dataIndex: 'content', ellipsis: true, search: false, render: (_, r) => r.content ?? '—' },
    {
      title: '状态',
      dataIndex: 'read',
      width: 90,
      search: false,
      valueEnum: {
        false: { text: '未读' },
        true: { text: '已读' },
      },
      render: (_, r) => (
        <Tag color={r.read ? 'default' : 'red'}>{r.read ? '已读' : '未读'}</Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 170,
      fixed: 'right',
      render: (_, r) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() =>
            setDetail({
              id: r.id,
              userId: r.userId,
              userName: r.userName,
              type: r.type,
              title: r.title,
              content: r.content,
              link: r.link,
              read: r.read,
              createdAt: r.createdAt,
            })
          }
        >
          详情
        </Button>,
        !r.read && (
          <Button
            key="read"
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={async () => {
              await markNotificationReadAny(r.id);
              messageApi.success('已标记已读');
              actionRef.current?.reload();
            }}
          >
            已读
          </Button>
        ),

      ],
    },
  ];

  return (
    <PageContainer
      title="通知管理"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => actionRef.current?.reload()}
        >
          刷新
        </Button>,
        <Popconfirm
          key="clear"
          title="清空租户内全部通知？"
          okText="清空"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            await deleteAllNotifications();
            messageApi.success('已清空全部通知');
            actionRef.current?.reload();
          }}
        >
          <Button danger icon={<DeleteOutlined />}>
            清空全部
          </Button>
        </Popconfirm>,
      ]}
    >
      <ProTable<NotificationAdminItem>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        onRow={(r) => ({
          onClick: () =>
            setDetail({
              id: r.id,
              userId: r.userId,
              userName: r.userName,
              type: r.type,
              title: r.title,
              content: r.content,
              link: r.link,
              read: r.read,
              createdAt: r.createdAt,
            }),
          style: { cursor: 'pointer' },
        })}
        request={async (params) => {
          try {
            const data = await listAllNotifications({
              type: (params.type as string | undefined) ?? '',
              read: (params.read as string | undefined) ?? '',
              keyword: (params.keyword as string | undefined) ?? '',
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="通知列表（租户内全部 · 接收人/类型/状态筛选）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
        scroll={{ x: 1000 }}
      />
      {/* 通知详情对话框（全局复用） */}
      <NotificationDetailModal
        notification={detail}
        onClose={() => setDetail(null)}
        onChanged={() => actionRef.current?.reload()}
      />
    </PageContainer>
  );
}
