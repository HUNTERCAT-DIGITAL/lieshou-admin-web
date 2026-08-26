/**
 * 物联网 · 告警中心（ADR-0040 · 2026-08-24）.
 *
 * 规则引擎命中落库的告警列表 + 值班确认闭环（PENDING → ACKNOWLEDGED）。
 */
import { useRef, useState } from 'react';
import { App, Button, Space, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import { ackIotAlert, listIotAlerts, listIotDevices } from '../../services/iot';
import { IOT_ALERT_STATUS_META, IOT_SEVERITY_META, type IotAlert } from '@lieshoucloud/types/business/iot';

/** 设备名映射（告警实体只有 deviceId，列表展示需设备名） */
function useDeviceNameMap() {
  const [map, setMap] = useState<Map<number, string>>(new Map());
  const loaded = useRef(false);
  const handleError = useApiError();
  if (!loaded.current) {
    loaded.current = true;
    listIotDevices()
      .then((devs) => setMap(new Map(devs.map((d) => [d.id, d.name]))))
      .catch(handleError);
  }
  return map;
}

export default function IotAlerts() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const deviceNames = useDeviceNameMap();

  const [ackTarget, setAckTarget] = useState<IotAlert | null>(null);
  const [ackOpen, setAckOpen] = useState(false);

  const reload = () => actionRef.current?.reload();

  const columns: ProColumns<IotAlert>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    {
      title: '时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '设备',
      dataIndex: 'deviceId',
      width: 150,
      search: false,
      render: (_, r) => deviceNames.get(r.deviceId) ?? `#${r.deviceId}`,
    },
    {
      title: '规则',
      dataIndex: 'ruleName',
      width: 150,
      ellipsis: true,
      render: (_, r) => r.ruleName ?? '—',
    },
    {
      title: '级别',
      dataIndex: 'severity',
      width: 90,
      valueEnum: {
        WARN: { text: '预警' },
        CRITICAL: { text: '告警' },
      },
      render: (_, r) => {
        const meta = IOT_SEVERITY_META[r.severity];
        return (
          <Space size={4}>
            <Tag color={meta.color}>{meta.text}</Tag>
            {r.escalated && <Tag color="volcano">升级</Tag>}
            {(r.repeatCount ?? 1) > 1 && <Tag>×{r.repeatCount}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '指标',
      dataIndex: 'propertyKey',
      width: 150,
      search: false,
      render: (_, r) =>
        r.propertyKey ? (
          <Typography.Text code>
            {r.propertyKey}={r.actualValue ?? '—'}
            {r.threshold ? ` 阈值${r.threshold}` : ''}
          </Typography.Text>
        ) : r.triggerType === 'EVENT' ? (
          '事件触发'
        ) : (
          '—'
        ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      search: false,
      ellipsis: true,
      render: (_, r) => r.message ?? '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: {
        PENDING: { text: '未确认' },
        ACKNOWLEDGED: { text: '已确认' },
      },
      render: (_, r) => {
        const meta = IOT_ALERT_STATUS_META[r.status];
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, row) =>
        row.status === 'PENDING' ? (
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setAckTarget(row);
              setAckOpen(true);
            }}
          >
            确认
          </Button>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.ackedBy ?? '—'}
            {row.ackedAt ? ` · ${new Date(row.ackedAt).toLocaleString('zh-CN')}` : ''}
          </Typography.Text>
        ),
    },
  ];

  const onAck = async (values: { remark?: string }) => {
    if (!ackTarget) return;
    try {
      await ackIotAlert(ackTarget.id, values.remark);
      messageApi.success('已确认');
      setAckOpen(false);
      setAckTarget(null);
      reload();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="告警中心"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reload}>
          刷新
        </Button>,
      ]}
    >
      <ProTable<IotAlert>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const data = await listIotAlerts({
              status: (params.status as string | undefined) ?? '',
              severity: (params.severity as string | undefined) ?? '',
              keyword: (params.keyword as string | undefined) ?? undefined,
              days: 7,
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="告警列表（近 7 天 · 规则引擎命中自动落库）"
        toolBarRender={() => [
          <Typography.Text key="hint" type="secondary" style={{ fontSize: 12 }}>
            告警由规则配置中的「站内通知」动作产生
          </Typography.Text>,
        ]}
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 确认告警 */}
      <ModalForm<{ remark?: string }>
        open={ackOpen}
        onOpenChange={(open) => {
          setAckOpen(open);
          if (!open) setAckTarget(null);
        }}
        title={`确认告警：${ackTarget ? (deviceNames.get(ackTarget.deviceId) ?? `#${ackTarget.deviceId}`) : ''}`}
        width={440}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onAck}
        submitter={{ searchConfig: { submitText: '确认已处理', resetText: '取消' } }}
      >
        {ackTarget && (
          <div style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">
              {ackTarget.ruleName ?? ''}
              {ackTarget.propertyKey ? ` · ${ackTarget.propertyKey}=${ackTarget.actualValue}` : ''}
            </Typography.Text>
          </div>
        )}
        <ProFormTextArea
          name="remark"
          label="处理备注（选填）"
          placeholder="如：已派人现场检查 / 误报 / 已复位"
        />
      </ModalForm>
    </PageContainer>
  );
}
