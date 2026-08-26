/**
 * 设备详情弹窗（驾驶舱点温度排行/离线设备/拓扑节点触发）.
 *
 * health 即时数据 + detail 补安装地址/照片/设备 Key；MetricCard 为内部小网格卡片。
 */
import { Button, Modal, Tag } from 'antd';
import {
  TEMPERATURE_LEVEL_COLOR,
  temperatureLevel,
  type DeviceDetail,
  type DeviceHealth,
} from '@lieshoucloud/types/business/iot';

interface DeviceModalProps {
  detailDev: DeviceHealth | null;
  detailExtra: DeviceDetail | null;
  onClose: () => void;
  onGoDevices: () => void;
}

export default function DeviceModal({ detailDev, detailExtra, onClose, onGoDevices }: DeviceModalProps) {
  const dev = detailDev;
  return (
    <Modal
      open={!!dev}
      title={
        <span>
          {dev?.name}
          <Tag
            style={{ marginLeft: 8 }}
            color={dev?.status === 'ONLINE' ? 'green' : 'default'}
          >
            {dev?.status === 'ONLINE' ? '在线' : '离线'}
          </Tag>
        </span>
      }
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          关闭
        </Button>,
        <Button key="go" type="primary" onClick={onGoDevices}>
          前往设备管理
        </Button>,
      ]}
      destroyOnClose
    >
      {dev && (
        <div>
          {/* 指标网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            <MetricCard
              label="最高温度"
              value={dev.maxTemperature !== null && dev.maxTemperature !== undefined ? `${dev.maxTemperature}℃` : '—'}
              color={
                dev.maxTemperature !== null && dev.maxTemperature !== undefined
                  ? TEMPERATURE_LEVEL_COLOR[temperatureLevel(dev.maxTemperature)]
                  : undefined
              }
            />
            <MetricCard label="最热节点" value={dev.hottestNodeKey ?? '—'} />
            <MetricCard label="信号强度" value={dev.signalStrength !== null && dev.signalStrength !== undefined ? String(dev.signalStrength) : '—'} />
            <MetricCard label="最低电池" value={dev.battery !== null && dev.battery !== undefined ? `${dev.battery}V` : '—'} />
            <MetricCard label="超声波峰值" value={dev.ultrasonicPeak !== null && dev.ultrasonicPeak !== undefined ? `${dev.ultrasonicPeak}dBuv` : '—'} />
            <MetricCard label="地电波峰值" value={dev.tevPeak !== null && dev.tevPeak !== undefined ? `${dev.tevPeak}dBmv` : '—'} />
            <MetricCard
              label="环境"
              value={
                dev.environmentTemp !== null && dev.environmentTemp !== undefined || dev.humidity !== null && dev.humidity !== undefined
                  ? `${dev.environmentTemp ?? '—'}℃ / ${dev.humidity ?? '—'}%`
                  : '—'
              }
            />
            <MetricCard
              label="未确认告警"
              value={dev.pendingAlerts ? String(dev.pendingAlerts) : '无'}
              color={dev.pendingAlerts ? '#ff4d4f' : undefined}
            />
            <MetricCard label="设备 Key" value={detailExtra?.device.deviceKey ?? '—'} />
          </div>
          {/* 安装信息 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: '#8fc1e3' }}>
            {detailExtra?.device.photoUrl ? (
              <img
                src={detailExtra.device.photoUrl}
                alt="设备照片"
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #1e5b8a' }}
              />
            ) : null}
            <div style={{ lineHeight: 1.9 }}>
              <div>
                安装地址：{detailExtra?.device.installAddress || '未填写'}
              </div>
              <div style={{ color: '#5a7f9f', fontSize: 12 }}>
                {detailExtra?.device.lastOnlineAt
                  ? `最近在线 ${new Date(detailExtra.device.lastOnlineAt).toLocaleString('zh-CN', { hour12: false })}`
                  : '从未在线'}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** 设备详情指标卡（弹窗内小网格） */
function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        border: '1px solid rgba(30,91,138,0.5)',
        borderRadius: 6,
        padding: '6px 10px',
        background: 'rgba(9,30,60,0.4)',
      }}
    >
      <div style={{ fontSize: 11, color: '#5a7f9f', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: color ?? '#e6f4ff' }}>{value}</div>
    </div>
  );
}
