/**
 * 自绘 SVG 折线图（设备遥测曲线 · 2026-08-24）.
 *
 * 零第三方依赖；支持 hover 十字线 + 数值 Tooltip；**多序列对比**（多台设备/
 * 多节点温度同图，看谁最热）——单序列 `data` 兼容旧调用（内部包成一条线）。
 */
import { Tooltip } from 'antd';
import { useMemo, useState } from 'react';

import { useElementSize } from '@lieshoucloud/ui';

export interface LinePoint {
  /** 时间戳（毫秒） */
  ts: number;
  /** x 轴标签（HH:mm:ss） */
  label: string;
  /** 数值 */
  value: number;
}

/** 一条折线序列（多设备对比时用） */
export interface LineSeries {
  name: string;
  points: LinePoint[];
  /** 折线颜色（缺省按调色板轮询） */
  color?: string;
}

interface LineChartProps {
  /** 单序列（兼容旧调用） */
  data?: LinePoint[];
  /** 多序列对比 */
  series?: LineSeries[];
  width?: number;
  height?: number;
  /** y 轴单位标签（如 ℃ / V / W） */
  yLabel?: string;
  /** 单序列时的折线颜色 */
  stroke?: string;
  /** 响应式：容器宽度自适应（大屏自适应），忽略 width prop */
  responsive?: boolean;
  /** 高度随父容器自适应（需父容器有确定高度；与 responsive 同开） */
  responsiveHeight?: boolean;
}

const PAD_L = 56;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 30;

const PALETTE = ['#1677ff', '#fa8c16', '#52c41a', '#f5222d', '#722ed1', '#13c2c2'];

export default function LineChart({
  data,
  series,
  width = 560,
  height = 180,
  yLabel = '',
  stroke = '#1677ff',
  responsive = false,
  responsiveHeight = false,
}: LineChartProps) {
  const [hoverTs, setHoverTs] = useState<number | null>(null);
  const [wrapRef, { width: wrapW, height: wrapH }] = useElementSize<HTMLDivElement>();
  const w = responsive && wrapW > 0 ? Math.max(wrapW, 120) : width;
  const h = responsiveHeight && wrapH > 0 ? Math.max(wrapH, 40) : height;

  const seriesList: LineSeries[] = useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, i) => ({ ...s, color: s.color ?? PALETTE[i % PALETTE.length] }));
    }
    return data && data.length > 0 ? [{ name: '默认', points: data, color: stroke }] : [];
  }, [series, data, stroke]);

  const { innerH, seriesPoints, minY, maxY, ticks, globalMinT, globalMaxT } = useMemo(() => {
    const iw = w - PAD_L - PAD_R;
    const ih = h - PAD_T - PAD_B;
    if (seriesList.length === 0) {
      return { innerH: ih, seriesPoints: [], minY: 0, maxY: 1, ticks: [], globalMinT: 0, globalMaxT: 1 };
    }
    // 全局时间轴 + y 范围（所有序列合并）
    let minT = Infinity;
    let maxT = -Infinity;
    let mn = Infinity;
    let mx = -Infinity;
    for (const s of seriesList) {
      for (const p of s.points) {
        if (p.ts < minT) minT = p.ts;
        if (p.ts > maxT) maxT = p.ts;
        if (p.value < mn) mn = p.value;
        if (p.value > mx) mx = p.value;
      }
    }
    const tSpan = maxT - minT || 1;
    let y0 = mn;
    let y1 = mx;
    if (y1 - y0 < 1e-9) {
      const pad = Math.abs(y0) * 0.1 + 1;
      y0 -= pad;
      y1 += pad;
    } else {
      const pad = (y1 - y0) * 0.1;
      y0 -= pad;
      y1 += pad;
    }

    const toXY = (p: LinePoint) => ({
      ...p,
      x: PAD_L + ((p.ts - minT) / tSpan) * iw,
      y: PAD_T + (1 - (p.value - y0) / (y1 - y0)) * ih,
    });

    const pts = seriesList.map((s) => ({ ...s, points: s.points.map(toXY) }));

    // x 轴刻度：全局时间轴 3 等分标签
    const tk = [0, 0.5, 1].map((f) => {
      const t = minT + f * tSpan;
      const d = new Date(t);
      const p = (n: number) => String(n).padStart(2, '0');
      return {
        x: PAD_L + f * iw,
        label: `${p(d.getHours())}:${p(d.getMinutes())}`,
      };
    });

    return { innerH: ih, seriesPoints: pts, minY: y0, maxY: y1, ticks: tk, globalMinT: minT, globalMaxT: maxT };
  }, [seriesList, w, h]);

  if (seriesList.length === 0) return null;

  // hover：在全局 x 位置上找每条序列最近的点
  const hovered = useMemo(() => {
    if (hoverTs === null || seriesPoints.length === 0) return null;
    const iw = w - PAD_L - PAD_R;
    const tSpan = globalMaxT - globalMinT || 1;
    const hx = PAD_L + ((hoverTs - globalMinT) / tSpan) * iw;
    const rows = seriesPoints.map((s) => {
      let best = s.points[0];
      let bestD = Infinity;
      for (const p of s.points) {
        const d = Math.abs(p.ts - hoverTs);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      return { name: s.name, color: s.color ?? '#1677ff', p: best, hx };
    });
    return rows;
  }, [hoverTs, seriesPoints, w, globalMinT, globalMaxT]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: responsive ? '100%' : w,
        height: responsiveHeight ? '100%' : h,
        minHeight: responsiveHeight ? 40 : undefined,
        cursor: 'crosshair',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        setHoverTs(globalMinT + ratio * (globalMaxT - globalMinT));
      }}
      onMouseLeave={() => setHoverTs(null)}
    >
      <svg width={w} height={h}>
        {/* 网格线（4 条水平基准线） */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = PAD_T + (i / 4) * innerH;
          const v = maxY - (i / 4) * (maxY - minY);
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={w - PAD_R} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={14} fill="#999">
                {v.toFixed(v < 10 ? 1 : 0)}
                {i === 0 && yLabel ? ` ${yLabel}` : ''}
              </text>
            </g>
          );
        })}
        {/* 多序列折线 */}
        {seriesPoints.map((s) => {
          const color = s.color ?? '#1677ff';
          const pathD = s.points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(' ');
          return (
            <g key={s.name}>
              <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
              {s.points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={hovered ? 2 : 2.5} fill={color} stroke="#fff" strokeWidth={1} />
              ))}
            </g>
          );
        })}
        {/* hover 十字线 */}
        {hovered && hovered[0] && (
          <g>
            <line
              x1={hovered[0].hx}
              y1={PAD_T}
              x2={hovered[0].hx}
              y2={PAD_T + innerH}
              stroke="#999"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          </g>
        )}
        {/* x 轴刻度 */}
        {ticks.map((t, i) => (
          <text key={i} x={t.x} y={h - 6} textAnchor="middle" fontSize={14} fill="#999">
            {t.label}
          </text>
        ))}
      </svg>
      {/* hover Tooltip：所有序列在该时刻的值 */}
      {hovered && (
        <Tooltip
          title={
            <div>
              {hovered.map((r) => (
                <div key={r.name}>
                  <span style={{ color: r.color }}>●</span> {r.name}：{r.p.value}
                  {yLabel ? ` ${yLabel}` : ''}
                </div>
              ))}
            </div>
          }
          open
        >
          <div
            style={{
              position: 'absolute',
              left: hovered[0].hx,
              top: 6,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          />
        </Tooltip>
      )}
      {/* 图例 */}
      {seriesPoints.length > 1 && (
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {seriesPoints.map((s) => (
            <span key={s.name} style={{ fontSize: 14, color: '#8fc1e3', whiteSpace: 'nowrap' }}>
              <span style={{ color: s.color }}>●</span> {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 设备时序记录 → 折线数据点（仅数值属性；非法值/坏时间戳丢弃，保持上报顺序）。
 */
export function toLinePoints(records: Array<{ valueStr: string; reportedAt: string }>): LinePoint[] {
  const points: LinePoint[] = [];
  for (const r of records) {
    const value = Number(r.valueStr);
    if (!Number.isFinite(value)) continue;
    const ts = Date.parse(r.reportedAt);
    if (Number.isNaN(ts)) continue;
    points.push({
      ts,
      label: new Date(ts).toLocaleTimeString('zh-CN', { hour12: false }),
      value,
    });
  }
  return points;
}
