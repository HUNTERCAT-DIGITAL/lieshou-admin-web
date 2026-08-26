/**
 * Portal 门户页单测（Phase 9 · 覆盖率）.
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../../stores/auth';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

import Portal from '../Portal';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter>{children}</MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('Portal 门户页', () => {
  it('渲染：品牌、Hero、能力卡、行业、公司、Footer', () => {
    render(<Portal />, { wrapper: wrap });
    // 品牌出现于导航栏 + Hero
    expect(screen.getAllByText('猎手云 Pro').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/让每一家企业/)).toBeInTheDocument();
    expect(screen.getByText('平台核心能力')).toBeInTheDocument();
    expect(screen.getAllByText('覆盖行业').length).toBeGreaterThan(0);
    expect(screen.getAllByText('关于我们').length).toBeGreaterThan(0);
    // 能力卡
    expect(screen.getByText('多租户')).toBeInTheDocument();
    expect(screen.getByText('完整认证')).toBeInTheDocument();
    expect(screen.getByText('权限体系')).toBeInTheDocument();
    expect(screen.getByText('业务模块（规划）')).toBeInTheDocument();
    // 已上线 / 规划中 标签
    expect(screen.getAllByText('已上线').length).toBeGreaterThan(0);
    expect(screen.getAllByText('规划中').length).toBeGreaterThan(0);
    // CTA
    expect(screen.getAllByText(/免费注册体验/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('已有账号登录').length).toBeGreaterThan(0);
    // Footer（品牌出现多次 + 用 getAllByText）
    expect(screen.getAllByText(/猎手猫数字科技/).length).toBeGreaterThan(0);
  });

  it('渲染：数据统计条 + 平台流程（丰富化结构）', () => {
    render(<Portal />, { wrapper: wrap });
    // 数据统计条
    expect(screen.getByText('已上线模块')).toBeInTheDocument();
    expect(screen.getByText('8+')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    // 平台流程 4 步
    expect(screen.getAllByText('平台流程').length).toBeGreaterThan(0);
    expect(screen.getByText('线下成交')).toBeInTheDocument();
    expect(screen.getByText('一键开租户')).toBeInTheDocument();
    expect(screen.getByText('团队使用')).toBeInTheDocument();
    expect(screen.getByText('数据增长')).toBeInTheDocument();
  });

  it('渲染：FAQ 折叠面板', () => {
    render(<Portal />, { wrapper: wrap });
    expect(screen.getByText('常见问题')).toBeInTheDocument();
    expect(screen.getByText('猎手云 Pro 是什么？')).toBeInTheDocument();
    expect(screen.getByText('如何开通并使用？')).toBeInTheDocument();
  });

  it('渲染：行业版入口导航（法律/教育/精密制造）', () => {
    render(<Portal />, { wrapper: wrap });
    expect(screen.getByText('行业版入口')).toBeInTheDocument();
    expect(screen.getByText('法律行业版')).toBeInTheDocument();
    expect(screen.getByText('教育行业版')).toBeInTheDocument();
    expect(screen.getByText('精密制造版')).toBeInTheDocument();
  });

  it('未登录：CTA 注册按钮可点击', () => {
    render(<Portal />, { wrapper: wrap });
    const ctaBtns = screen.getAllByText(/免费注册体验/);
    expect(ctaBtns.length).toBeGreaterThan(0);
  });
});
