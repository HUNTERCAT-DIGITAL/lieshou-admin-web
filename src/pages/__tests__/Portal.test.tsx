/**
 * Portal 门户页单测（Phase 9 · 覆盖率）.
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../../stores/auth';
import type * as Editions from '../../config/editions';
import { getEdition } from '../../config/editions';

// boot edition（@lieshoucloud/boot）会注入专属门户（BootPortal：异步 lazy + 独立文案），
// generic 断言不适用；此处 mock editions 强制 GenericPortal（无 portal 槽位）。
vi.mock('../../config/editions', async () => {
  const actual = await vi.importActual<typeof Editions>(
    '../../config/editions',
  );
  return {
    ...actual,
    getEdition: () => ({
      // 纯 generic 配置（剥离 boot edition 覆盖），generic 门户断言稳定
      ...actual.EDITIONS.generic,
      brandName: 'LieShouCloud',
      portal: undefined,
    }),
  };
});

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
    expect(screen.getAllByText(getEdition().brandName).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/开源的数字化平台/).length).toBeGreaterThan(0);
    expect(screen.getByText('平台核心能力')).toBeInTheDocument();
    expect(screen.getAllByText('覆盖行业').length).toBeGreaterThan(0);
    expect(screen.getAllByText('关于我们').length).toBeGreaterThan(0);
    // 能力卡
    expect(screen.getByText('多租户')).toBeInTheDocument();
    expect(screen.getByText('完整认证')).toBeInTheDocument();
    expect(screen.getByText('权限体系')).toBeInTheDocument();
    expect(screen.getByText('业务模块')).toBeInTheDocument();
    // 已上线 / 规划中 标签
    expect(screen.getAllByText('已上线').length).toBeGreaterThan(0);
    expect(screen.getAllByText('已上线').length).toBeGreaterThanOrEqual(4);
    // CTA
    expect(screen.getAllByText(/免费注册体验/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('已有账号登录').length).toBeGreaterThan(0);
    // Footer（品牌出现多次 + 用 getAllByText）
    expect(screen.getAllByText(/猎手猫数字科技/).length).toBeGreaterThan(0);
  });

  it('渲染：数据统计条 + 平台流程（丰富化结构）', () => {
    render(<Portal />, { wrapper: wrap });
    // 数据统计条
    expect(screen.getByText('开源组件仓')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('Apache-2.0')).toBeInTheDocument();
    // 平台流程 4 步
    expect(screen.getAllByText('平台流程').length).toBeGreaterThan(0);
    expect(screen.getByText('一键部署')).toBeInTheDocument();
    expect(screen.getByText('一键开租户')).toBeInTheDocument();
    expect(screen.getByText('团队使用')).toBeInTheDocument();
    expect(screen.getByText('数据增长')).toBeInTheDocument();
  });

  it('渲染：FAQ 折叠面板', () => {
    render(<Portal />, { wrapper: wrap });
    expect(screen.getByText('常见问题')).toBeInTheDocument();
    expect(screen.getByText(getEdition().faq?.[0]?.q ?? 'LieShouCloud 是什么？')).toBeInTheDocument();
    expect(screen.getByText('如何体验？')).toBeInTheDocument();
  });

  it('渲染：行业版入口导航（layer 法律版）', () => {
    render(<Portal />, { wrapper: wrap });
    expect(screen.getByText('行业版入口')).toBeInTheDocument();
    expect(screen.getByText('法律行业版')).toBeInTheDocument();
  });

  it('未登录：CTA 注册按钮可点击', () => {
    render(<Portal />, { wrapper: wrap });
    const ctaBtns = screen.getAllByText(/免费注册体验/);
    expect(ctaBtns.length).toBeGreaterThan(0);
  });
});
