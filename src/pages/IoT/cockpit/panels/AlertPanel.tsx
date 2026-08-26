/**
 * 告警占比面板（单主题：预警/严重 饼图 + 总数）.
 */
import { DatavPanel, DatavPanelBadge, DatavDvRing, datavTheme, type ZoomInfo } from '@lieshoucloud/ui';
import type { IotAlert } from '@lieshoucloud/types/business/iot';

interface AlertPanelProps {
  alerts7d: IotAlert[];
  sevDist: { warn: number; critical: number; total: number };
  onZoom: (info: ZoomInfo) => void;
}

export default function AlertPanel({ alerts7d, sevDist, onZoom }: AlertPanelProps) {
  return (
    <DatavPanel
      title="告警占比"
      zoomKey="alerts"
      onZoom={onZoom}
      extra={
        <DatavPanelBadge tone={alerts7d.length > 0 ? 'orange' : 'neutral'}>
          近7天 {alerts7d.length} 条
        </DatavPanelBadge>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, height: '100%', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, height: '100%', maxWidth: 300 }}>
          <DatavDvRing
            data={[
              { name: '预警', value: sevDist.warn, color: datavTheme.STATUS.warn },
              { name: '严重', value: sevDist.critical, color: datavTheme.STATUS.alert },
            ]}
            fill
            type="pie"
            radius="80%"
          />
        </div>
        <div style={{ fontSize: 15, color: datavTheme.TXT.secondary, flexShrink: 0, lineHeight: 2.1 }}>
          <div><span style={{ color: datavTheme.STATUS.warn }}>●</span> 预警 <b style={{ color: datavTheme.TXT.bright, marginLeft: 4, fontSize: 20 }}>{sevDist.warn}</b></div>
          <div><span style={{ color: datavTheme.STATUS.alert }}>●</span> 严重 <b style={{ color: datavTheme.TXT.bright, marginLeft: 4, fontSize: 20 }}>{sevDist.critical}</b></div>
          <div style={{ color: datavTheme.TXT.muted, fontSize: 13 }}>合计 {sevDist.total} 条</div>
        </div>
      </div>
    </DatavPanel>
  );
}
