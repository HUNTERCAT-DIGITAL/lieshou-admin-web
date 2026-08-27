import { useRef } from 'react';
import { Tag } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import { listAuditLogs } from '../../services/audit';
import {
  AUDIT_ACTION_TEXT,
  AUDIT_OUTCOME_TEXT,
  AUDIT_RESOURCE_TEXT,
  type AuditLog,
} from '@lieshoucloud/contract-types/business/audit';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  DENIED: 'orange',
  LOGIN: 'geekblue',
  READ: 'default',
};

const OUTCOME_COLOR: Record<string, string> = {
  SUCCESS: 'green',
  DENIED: 'orange',
  ERROR: 'red',
};

/**
 * 审计日志页（append-only 只读 · DATA_SECURITY §7）.
 *
 * 数据源 user-service /api/audit-logs（平台操作：用户/租户/角色）；
 * 客户操作审计存于 crm-service（后续合并到统一查询）。
 */
export default function AuditList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const handleError = useApiError();

  const columns: ProColumns<AuditLog>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      search: false,
      render: (_, row) => new Date(row.createdAt).toLocaleString('zh-CN', { hour12: false }),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(AUDIT_ACTION_TEXT).map(([k, v]) => [k, { text: v }]),
      ),
      render: (_, row) => (
        <Tag color={ACTION_COLOR[row.action]}>{AUDIT_ACTION_TEXT[row.action]}</Tag>
      ),
    },
    {
      title: '对象',
      dataIndex: 'resourceType',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(AUDIT_RESOURCE_TEXT).map(([k, v]) => [k, { text: v }]),
      ),
      render: (_, row) => AUDIT_RESOURCE_TEXT[row.resourceType] ?? row.resourceType,
    },
    { title: '对象ID', dataIndex: 'resourceId', width: 80, search: false },
    { title: '操作者', dataIndex: 'userId', width: 90, search: false },
    {
      title: '结果',
      dataIndex: 'outcome',
      width: 80,
      search: false,
      render: (_, row) => (
        <Tag color={OUTCOME_COLOR[row.outcome]}>{AUDIT_OUTCOME_TEXT[row.outcome]}</Tag>
      ),
    },
    { title: '详情', dataIndex: 'detail', search: false, ellipsis: true },
    { title: '来源IP', dataIndex: 'sourceIp', width: 120, search: false },
    { title: 'RequestId', dataIndex: 'requestId', width: 150, search: false },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <span>
            <HistoryOutlined style={{ marginRight: 8 }} /> 审计日志
          </span>
        ),
        subTitle: '用户/租户/角色操作记录（append-only，不可删除）',
      }}
    >
      <ProTable<AuditLog>
        headerTitle="操作审计"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ labelWidth: 'auto' }}
        options={{ setting: { draggable: true, checkable: true } }}
        request={async (params) => {
          try {
            const { action, resourceType, current, pageSize } = params as {
              action?: AuditLog['action'];
              resourceType?: string;
              current: number;
              pageSize: number;
            };
            const data = await listAuditLogs({ action, resourceType, limit: pageSize });
            // 前端分页（后端暂不分页，limit=pageSize 拉最新一页）
            const start = (current - 1) * pageSize;
            const rows = data.slice(start, start + pageSize);
            return { data: rows, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false };
          }
        }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        dateFormatter={false}
      />
    </PageContainer>
  );
}
