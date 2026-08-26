/**
 * 局放监测面板（设备列表：超声 / 地电波峰值 · 按峰值降序）.
 */
import { DatavPanel, DatavPanelBadge, datavTheme, type ZoomInfo } from '@lieshoucloud/ui';
import type { DeviceHealth } from '../../../../types/iot';

/** 超声峰值超标阈值（dBuv） */
const ULTRASONIC_OVER = 30;
/** 地电波峰值超标阈值（dBmv） */
const TEV_OVER = 40;

interface PdPanelProps {
  /** 有局放数据的设备（按峰值降序） */
  pdList: DeviceHealth[];
  pdOver: DeviceHealth[];
  onZoom: (info: ZoomInfo) => void;
  openDeviceDetail: (deviceId: number) => void;
}

export default function PdPanel({ pdList, pdOver, onZoom, openDeviceDetail }: PdPanelProps) {
  return (
    <DatavPanel
      title="局放监测"
      zoomKey="pd"
      onZoom={onZoom}
      extra={
        <DatavPanelBadge tone={pdOver.length > 0 ? 'red' : 'green'} dot={pdOver.length > 0}>
          {pdOver.length > 0 ? `${pdOver.length} 台超标` : '无超标'}
        </DatavPanelBadge>
      }
    >
      {pdList.length === 0 ? (
        <div style={{ textAlign: 'center', color: datavTheme.TXT.muted, padding: 20, fontSize: 16 }}>
          暂无局放数据
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {/* 表头 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 76px 76px',
              gap: '0 6px',
              fontSize: datavTheme.FONT.muted,
              color: datavTheme.TXT.muted,
              borderBottom: '1px solid rgba(30,91,138,0.4)',
              padding: '0 8px 4px',
              flexShrink: 0,
            }}
          >
            <span>设备</span>
            <span style={{ textAlign: 'right' }}>超声 dBuv</span>
            <span style={{ textAlign: 'right' }}>地电波 dBmv</span>
          </div>
          {/* 数据行（可滚动） */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {pdList.map((h, i) => {
              const us = h.ultrasonicPeak ?? null;
              const tev = h.tevPeak ?? null;
              const usOver = us !== null && us > ULTRASONIC_OVER;
              const tevOver = tev !== null && tev > TEV_OVER;
              return (
                <div
                  key={h.deviceId}
                  onClick={() => openDeviceDetail(h.deviceId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 76px 76px',
                    gap: '0 6px',
                    fontSize: datavTheme.FONT.label,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    color: datavTheme.TXT.secondary,
                    borderBottom: '1px solid rgba(30,91,138,0.12)',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.name}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                      color: usOver ? datavTheme.STATUS.alert : datavTheme.STATUS.info,
                    }}
                  >
                    {us ?? '—'}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                      color: tevOver ? datavTheme.STATUS.alert : datavTheme.STATUS.info,
                    }}
                  >
                    {tev ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DatavPanel>
  );
}
