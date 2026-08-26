/**
 * 行业版门户渲染测试（ADR-0035 · 按 VITE_EDITION 分发）.
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Portal from '../Portal';

afterEach(() => {
  vi.unstubAllEnvs();
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Portal 行业版分发（VITE_EDITION）', () => {
  it('layer → 法律版门户（办案流程时间线结构）', () => {
    vi.stubEnv('VITE_EDITION', 'layer');
    render(<Portal />, { wrapper: wrap });
    // 品牌出现于导航栏 + Hero
    expect(screen.getAllByText('猎手云 Pro · 法律版').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('办案全流程数字化')).toBeInTheDocument();
    expect(screen.getByText('律所核心能力')).toBeInTheDocument();
    expect(screen.getByText('案件管理')).toBeInTheDocument();
    // 法律版数据统计条
    expect(screen.getByText('办案环节在线')).toBeInTheDocument();
    expect(screen.getByText('全程留痕')).toBeInTheDocument();
    // 法律版关闭自助注册 → 无「免费注册体验」
    expect(screen.queryByText(/免费注册体验/)).not.toBeInTheDocument();
  });

  it('zhiye → 智野教育门户（供应链协同三步 · B2B2C）', () => {
    vi.stubEnv('VITE_EDITION', 'zhiye');
    render(<Portal />, { wrapper: wrap });
    expect(screen.getAllByText('智野教育 · 青少年科技教育').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('供应链协同三步')).toBeInTheDocument();
    expect(screen.getByText('01 上游供应')).toBeInTheDocument();
    expect(screen.getByText('智野教育核心能力')).toBeInTheDocument();
    expect(screen.getByText('合作伙伴')).toBeInTheDocument();
    // 教育版数据统计条
    expect(screen.getByText('供应链路环节')).toBeInTheDocument();
    expect(screen.getByText('供应对账')).toBeInTheDocument();
  });

  it('jmzz → 制造版门户（车间生产链路结构）', () => {
    vi.stubEnv('VITE_EDITION', 'jmzz');
    render(<Portal />, { wrapper: wrap });
    expect(screen.getAllByText('猎手云 Pro · 制造版').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('车间生产全链路在线')).toBeInTheDocument();
    expect(screen.getByText('制造版核心能力')).toBeInTheDocument();
    expect(screen.getByText('物料管理')).toBeInTheDocument();
    // 制造版数据统计条
    expect(screen.getByText('车间环节在线')).toBeInTheDocument();
    expect(screen.getByText('批次追溯')).toBeInTheDocument();
  });
});
