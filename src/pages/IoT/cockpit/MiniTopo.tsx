/**
 * 电网拓扑图（ECharts graph · 2026-08-25 替代自绘 SVG）.
 *
 * - 节点：设备（颜色按状态/温度分级），带设备名标签，告警节点放大+光晕
 * - 连线：拓扑 links（青色细线）
 * - 点击节点 → 设备详情（ECharts click 事件）
 * - 背景：电路板网格 + 中心光晕（CSS）
 * - 坐标复用 Topo 页 mergePositions（0-100 % → 像素）
 */
import { useMemo } from 'react';
import { EChart, datavTheme, useElementSize } from '@lieshoucloud/ui';
import { temperatureLevel, type IotDevice, type IotTopo } from '../../../types/iot';
import { mergePositions } from '../Topo';

interface MiniTopoProps {
  devices: IotDevice[];
  topo: IotTopo | null;
  onSelect?: (d: IotDevice) => void;
}

/** 节点颜色：离线灰 / 在线绿 / 温度预警橙 / 告警红 */
function nodeColor(d: IotDevice): string {
  if (d.status !== 'ONLINE') return '#5a7f9f';
  const t = d.maxTemperature;
  if (t !== null && t !== undefined && Number.isFinite(t)) {
    if (temperatureLevel(t) === 'alert') return '#ff4d4f';
    if (temperatureLevel(t) === 'warn') return '#fa8c16';
  }
  return '#52c41a';
}

export default function MiniTopo({ devices, topo, onSelect }: MiniTopoProps) {
  const [wrapRef, { width: w, height: h }] = useElementSize<HTMLDivElement>();
  const measured = w > 0 && h > 0;

  const pos = useMemo(
    () => mergePositions(devices, topo?.nodes ?? []),
    [devices, topo],
  );

  const option = useMemo(() => {
    if (!measured) return { series: [] };
    const nodes = devices.map((d) => {
      const p = pos[d.id];
      if (!p) return null;
      const c = nodeColor(d);
      const isAlert = c === '#ff4d4f' || c === '#fa8c16';
      return {
        id: String(d.id),
        name: d.name,
        x: (p.x / 100) * w,
        y: (p.y / 100) * h,
        symbolSize: isAlert ? 30 : 22,
        itemStyle: {
          color: c,
          borderColor: 'rgba(230,244,255,0.7)',
          borderWidth: 2,
          shadowColor: c,
          shadowBlur: isAlert ? 16 : 8,
        },
        label: {
          show: true,
          position: 'bottom',
          distance: 4,
          fontSize: datavTheme.FONT.label,
          color: '#8fc1e3',
          formatter: '{b}',
        },
        // 告警节点脉冲呼吸（graph 节点 symbolSize 动画简化：用 tooltip 提示状态）
        emphasis: {
          itemStyle: { shadowBlur: 24, borderColor: '#e6f4ff' },
        },
      };
    }).filter((n): n is NonNullable<typeof n> => n !== null);

    const links = (topo?.links ?? [])
      .map((l) => ({ source: String(l.source), target: String(l.target) }))
      .filter(
        (l) =>
          nodes.some((n) => n.id === l.source) && nodes.some((n) => n.id === l.target),
      );

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(9,30,60,0.92)',
        borderColor: '#1e5b8a',
        textStyle: { color: '#e6f4ff', fontSize: 13 },
        formatter: (p: { data?: { name?: string } }) => p.data?.name ?? '',
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: true, // 支持缩放拖拽（大拓扑巡检）
          data: nodes,
          links,
          lineStyle: { color: 'rgba(0,188,235,0.4)', width: 1.5, curveness: 0.1 },
          label: { show: false },
          emphasis: { focus: 'adjacency' },
          animationDuration: 800,
          animationEasingUpdate: 'cubicOut',
        },
      ],
    };
  }, [devices, topo, pos, measured, w, h]);

  const clickHandler = useMemo(
    () => ({
      click: (params: unknown) => {
        const p = params as { dataIndex?: number };
        const idx = p.dataIndex;
        if (idx === undefined || idx < 0 || idx >= devices.length) return;
        onSelect?.(devices[idx]);
      },
    }),
    [devices, onSelect],
  );

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 140,
        userSelect: 'none',
        background:
          'radial-gradient(circle at 50% 42%, rgba(0,188,235,0.10) 0%, rgba(9,30,60,0) 70%)',
      }}
    >
      {/* 告警节点呼吸脉冲动画定义 */}
      <style>{`
        @keyframes cockpit-pulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
      {/* 背景电路板网格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,188,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,188,235,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />
      {/* 中心光晕 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(0,188,235,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', inset: 0 }}>
        <EChart option={option} onEvents={clickHandler} />
      </div>
      {/* 告警/预警节点呼吸脉冲（叠加层，不动 ECharts） */}
      {devices.map((d) => {
        const p = pos[d.id];
        if (!p) return null;
        const c = nodeColor(d);
        if (c !== '#ff4d4f' && c !== '#fa8c16') return null;
        return (
          <div
            key={`pulse-${d.id}`}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: 44,
              height: 44,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${c}`,
                animation: `cockpit-pulse 2s ease-out infinite`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                border: `1px solid ${c}`,
                animation: `cockpit-pulse 2s ease-out 1s infinite`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
