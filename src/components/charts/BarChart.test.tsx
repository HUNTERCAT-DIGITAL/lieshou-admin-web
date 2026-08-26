/**
 * BarChart 自绘 SVG 组件单测（Phase 9 · BI 看板）.
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { describe, expect, it } from 'vitest';

import BarChart from './BarChart';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>{children}</AntdApp>
  </ConfigProvider>
);

describe('BarChart', () => {
  it('渲染 SVG + 30 根柱（rect）', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, '0')}`,
      count: i % 7,
    }));
    const { container } = render(<BarChart data={data} />, { wrapper: wrap });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    // rect 数：每根柱一个 + 1 个透明 hover 命中区 = 60
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(30);
  });

  it('空数据：仍然渲染 SVG', () => {
    const { container } = render(<BarChart data={[]} />, { wrapper: wrap });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('可访问性：svg 带 aria-label', () => {
    render(<BarChart data={[{ date: '2026-01-01', count: 1 }]} />, { wrapper: wrap });
    expect(screen.getByRole('img', { name: '30 天客户创建趋势' })).toBeInTheDocument();
  });
});
