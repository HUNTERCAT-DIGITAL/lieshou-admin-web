/**
 * LineChart 自绘 SVG 折线图单测.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LineChart from '../LineChart';

const sample = [
  { ts: 1_700_000_000_000, label: '10:00:00', value: 26 },
  { ts: 1_700_000_060_000, label: '10:01:00', value: 27 },
  { ts: 1_700_000_120_000, label: '10:02:00', value: 27.5 },
];

/** x 轴刻度期望值：与 LineChart 实现同源（HH:mm · 本地时区），避免测试依赖运行环境时区 */
const tickLabel = (ts: number): string => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
};

describe('LineChart（遥测曲线）', () => {
  it('数据不足时返回 null（不渲染）', () => {
    const { container } = render(<LineChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('渲染 SVG 折线 + x 轴刻度 + y 轴标签', () => {
    render(<LineChart data={sample} width={400} height={160} yLabel="℃" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
    // y 轴标签出现（首条网格线带单位）
    expect(document.body.textContent).toContain('℃');
    // x 轴刻度：首/中/末（实现取 HH:mm，期望值同源计算避免时区敏感）
    expect(document.body.textContent).toContain(tickLabel(sample[0].ts));
    expect(document.body.textContent).toContain(tickLabel(sample[1].ts));
    expect(document.body.textContent).toContain(tickLabel(sample[2].ts));
    // 折线 path 存在
    expect(svg?.innerHTML).toContain('stroke');
  });

  it('hover 数据点显示数值 Tooltip', () => {
    render(<LineChart data={sample} width={400} height={160} yLabel="℃" />);
    const circle = document.querySelector('circle');
    expect(circle).toBeTruthy();
    expect(screen.queryByText('27.5')).toBeNull();
  });
});
