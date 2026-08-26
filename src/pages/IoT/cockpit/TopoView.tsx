/**
 * 中央电网拓扑主视图（驾驶舱视觉中心）.
 *
 * MiniTopo 放大渲染 + 状态图例 + 连线/设备计数；点击节点打开设备详情。
 */
import { DatavPanel, DatavPanelBadge, datavTheme, type ZoomInfo } from '@lieshoucloud/ui';
import MiniTopo from './MiniTopo';
import type { IotDevice, IotTopo } from '@lieshoucloud/types/business/iot';

export interface TopoViewProps {
  devices: IotDevice[];
  topo: IotTopo | null;
  onSelect: (d: IotDevice) => void;
  onZoom: (info: ZoomInfo) => void;
  zoomKey?: string;
}

export default function TopoView({ devices, topo, onSelect, onZoom, zoomKey = 'topo' }: TopoViewProps) {
  return (
    <DatavPanel
      title="电网拓扑（全站主视图）"
      zoomKey={zoomKey}
      onZoom={onZoom}
      extra={
        <DatavPanelBadge tone="cyan">
          {topo?.links.length ?? 0} 条连线 · {devices.length} 台设备
        </DatavPanelBadge>
      }
    >
      <div style={{ position: 'relative', height: 'calc(100% - 26px)', minHeight: 180 }}>
        <MiniTopo devices={devices} topo={topo} onSelect={onSelect} />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          fontSize: datavTheme.FONT.body,
          color: '#8fc1e3',
          marginTop: 2,
        }}
      >
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#52c41a', marginRight: 4 }} />在线</span>
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fa8c16', marginRight: 4 }} />预警</span>
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', marginRight: 4 }} />告警</span>
        <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#5a7f9f', marginRight: 4 }} />离线</span>
      </div>
    </DatavPanel>
  );
}
