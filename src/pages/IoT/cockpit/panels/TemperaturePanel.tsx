/**
 * 线缆温度节点列表面板（全设备节点温度 + 电池，按温度降序 · 预警/告警着色）.
 */
import { DatavPanel, DatavPanelBadge, datavTheme, type ZoomInfo } from '@lieshoucloud/ui';
import {
  TEMPERATURE_LEVEL_COLOR,
  temperatureLevel,
  type TemperatureLevel,
} from '../../../../types/iot';
import type { NodeTemperatureRow } from '../hooks/useCockpitData';

interface TemperaturePanelProps {
  /** 全设备节点列表（按温度降序） */
  nodeList: NodeTemperatureRow[];
  onZoom: (info: ZoomInfo) => void;
  openDeviceDetail: (deviceId: number) => void;
}

export default function TemperaturePanel({ nodeList, onZoom, openDeviceDetail }: TemperaturePanelProps) {
  // 分级统计（badge 汇总）
  const dist = nodeList.reduce(
    (acc, r) => {
      if (r.temperature === null || r.temperature === undefined) {
        acc.none += 1;
        return acc;
      }
      acc[temperatureLevel(r.temperature)] += 1;
      return acc;
    },
    { ok: 0, warn: 0, alert: 0, none: 0 },
  );
  const warnAlert = dist.warn + dist.alert;

  return (
    <DatavPanel
      title="线缆温度节点列表"
      zoomKey="temp"
      onZoom={onZoom}
      extra={
        <DatavPanelBadge tone={dist.alert > 0 ? 'red' : dist.warn > 0 ? 'orange' : 'green'} dot={warnAlert > 0}>
          {dist.alert > 0 ? `${dist.alert} 个告警` : dist.warn > 0 ? `${dist.warn} 个预警` : `${dist.ok} 个正常`}
        </DatavPanelBadge>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* 汇总条 */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            fontSize: datavTheme.FONT.label,
            color: datavTheme.TXT.secondary,
            padding: '0 4px 4px',
            flexShrink: 0,
          }}
        >
          <span>
            节点总数 <b style={{ color: datavTheme.TXT.bright, marginLeft: 3 }}>{nodeList.length}</b>
          </span>
          <span>
            <span style={{ color: datavTheme.STATUS.data }}>●</span> 正常{' '}
            <b style={{ color: datavTheme.TXT.bright, marginLeft: 3 }}>{dist.ok}</b>
          </span>
          <span>
            <span style={{ color: datavTheme.STATUS.warn }}>●</span> 预警{' '}
            <b style={{ color: datavTheme.TXT.bright, marginLeft: 3 }}>{dist.warn}</b>
          </span>
          <span>
            <span style={{ color: datavTheme.STATUS.alert }}>●</span> 告警{' '}
            <b style={{ color: datavTheme.TXT.bright, marginLeft: 3 }}>{dist.alert}</b>
          </span>
        </div>

        {/* 表头 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 64px 72px 72px',
            gap: '0 8px',
            fontSize: datavTheme.FONT.muted,
            color: datavTheme.TXT.muted,
            borderBottom: '1px solid rgba(30,91,138,0.4)',
            padding: '0 8px 4px',
            flexShrink: 0,
          }}
        >
          <span>设备</span>
          <span>节点</span>
          <span style={{ textAlign: 'right' }}>温度 ℃</span>
          <span style={{ textAlign: 'right' }}>电池 V</span>
        </div>

        {/* 数据行（按温度降序 · 可滚动） */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {nodeList.length === 0 ? (
            <div style={{ textAlign: 'center', color: datavTheme.TXT.muted, padding: 24, fontSize: 15 }}>
              暂无节点上报数据
            </div>
          ) : (
            nodeList.map((r, i) => {
              const lv: TemperatureLevel =
                r.temperature === null || r.temperature === undefined ? 'ok' : temperatureLevel(r.temperature);
              const hasTemp = r.temperature !== null && r.temperature !== undefined;
              return (
                <div
                  key={`${r.deviceId}-${r.nodeId}`}
                  onClick={() => openDeviceDetail(r.deviceId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 64px 72px 72px',
                    gap: '0 8px',
                    fontSize: datavTheme.FONT.label,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    color: datavTheme.TXT.secondary,
                    borderBottom: '1px solid rgba(30,91,138,0.12)',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.deviceName}
                  </span>
                  <span style={{ color: datavTheme.TXT.muted }}>节点 {r.nodeId}</span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      color: hasTemp ? TEMPERATURE_LEVEL_COLOR[lv] : datavTheme.TXT.muted,
                      textShadow: hasTemp ? `0 0 10px ${TEMPERATURE_LEVEL_COLOR[lv]}44` : undefined,
                    }}
                  >
                    {hasTemp ? r.temperature : '—'}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: r.battery !== null && r.battery !== undefined && r.battery < 3.0 ? datavTheme.STATUS.warn : datavTheme.TXT.secondary,
                    }}
                  >
                    {r.battery !== null && r.battery !== undefined ? r.battery : '—'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DatavPanel>
  );
}
