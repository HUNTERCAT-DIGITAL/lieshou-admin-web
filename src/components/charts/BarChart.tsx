/**
 * 简单自绘 SVG 柱状图（Phase 9 · BI 看板雏形）.
 *
 * 无第三方图表库依赖（避免拉 ~500KB 的 @ant-design/charts）。
 * 30 天数据 + hover Tooltip，足够 BI 雏形展示。
 */
import { Tooltip } from 'antd';
import { useMemo } from 'react';

import type { DailyBucket } from '../../utils/analytics';
import { seriesExtent } from '../../utils/analytics';

interface BarChartProps {
  data: DailyBucket[];
  width?: number;
  height?: number;
  /** 单条柱颜色（默认品牌色） */
  fill?: string;
}

const BAR_GAP = 2;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 18;

/** 单个柱子（不可交互） */
function Bar({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={2} />;
}

export default function BarChart({
  data,
  width = 560,
  height = 180,
  fill = '#1677ff',
}: BarChartProps) {
  const { max } = useMemo(() => seriesExtent(data), [data]);
  const innerW = width - PAD_X * 2;
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const slotW = data.length > 0 ? innerW / data.length : 0;
  const barW = Math.max(2, slotW - BAR_GAP);

  // x 轴刻度：显示首 / 中 / 末共 3 个标签
  const tickIdx = data.length > 0 ? [0, Math.floor(data.length / 2), data.length - 1] : [];
  const ticks = tickIdx.map((i) => ({
    x: PAD_X + i * slotW + slotW / 2,
    label: data[i] ? data[i].date.slice(5) : '', // MM-DD
  }));

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
        role="img"
        aria-label="30 天客户创建趋势"
      >
        {data.map((b, i) => {
          const h = (b.count / max) * innerH;
          const x = PAD_X + i * slotW + (slotW - barW) / 2;
          const y = PAD_TOP + (innerH - h);
          return (
            <Tooltip key={b.date} title={`${b.date}：${b.count} 条`} mouseEnterDelay={0}>
              <g>
                {/* 透明的 hover 命中区（更宽更好命中） */}
                <rect
                  x={PAD_X + i * slotW}
                  y={PAD_TOP}
                  width={slotW}
                  height={innerH}
                  fill="transparent"
                />
                <Bar x={x} y={y} w={barW} h={h} fill={fill} />
              </g>
            </Tooltip>
          );
        })}
        {/* x 轴 */}
        <line
          x1={PAD_X}
          x2={width - PAD_X}
          y1={PAD_TOP + innerH + 0.5}
          y2={PAD_TOP + innerH + 0.5}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {ticks.map((t) => (
          <text
            key={t.label + t.x}
            x={t.x}
            y={height - 4}
            textAnchor="middle"
            fontSize={11}
            fill="#9ca3af"
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
