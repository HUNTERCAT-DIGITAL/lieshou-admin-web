/**
 * 门户共享组件单测（ADR-0035 · PortalShell）.
 * 覆盖：PortalNav / FadeIn / SectionHeader / PortalStats / FeatureCard / PortalFaq / PortalCta。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { describe, expect, it, vi } from 'vitest';

import { EDITIONS } from '../../../config/editions';
import {
  FadeIn,
  FeatureCard,
  PortalCta,
  PortalFaq,
  PortalNav,
  PortalStats,
  SectionHeader,
} from '../PortalShell';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

const generic = EDITIONS.generic;

describe('PortalNav', () => {
  it('渲染品牌 + 锚点菜单 + 登录按钮；allowRegister=false 不渲染注册', () => {
    const onLogin = vi.fn();
    render(
      <PortalNav
        edition={generic}
        menu={[
          { key: 'capability', label: '核心能力' },
          { key: 'about', label: '关于我们' },
        ]}
        onLogin={onLogin}
      />,
      { wrapper: wrap },
    );
    // 品牌
    expect(screen.getAllByText('LieShouCloud').length).toBeGreaterThan(0);
    // 锚点菜单
    expect(screen.getByText('核心能力').closest('a')).toHaveAttribute('href', '#capability');
    expect(screen.getByText('关于我们').closest('a')).toHaveAttribute('href', '#about');
    // 登录按钮可点击
    fireEvent.click(screen.getByRole('button', { name: '登 录' }));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('allowRegister=true 渲染免费注册按钮', () => {
    render(
      <PortalNav
        edition={generic}
        menu={[{ key: 'capability', label: '核心能力' }]}
        onLogin={() => {}}
        onRegister={() => {}}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole('button', { name: '免费注册' })).toBeInTheDocument();
  });
});

describe('FadeIn', () => {
  it('无 IntersectionObserver 环境直接渲染子内容（jsdom 兜底）', () => {
    render(
      <FadeIn>
        <div>可见内容</div>
      </FadeIn>,
    );
    expect(screen.getByText('可见内容')).toBeInTheDocument();
  });
});

describe('SectionHeader', () => {
  it('渲染 eyebrow + 标题 + 副文案', () => {
    render(<SectionHeader eyebrow="EYEBROW" title="区块标题" desc="区块副文案" />);
    expect(screen.getByText('EYEBROW')).toBeInTheDocument();
    expect(screen.getByText('区块标题')).toBeInTheDocument();
    expect(screen.getByText('区块副文案')).toBeInTheDocument();
  });
});

describe('PortalStats', () => {
  it('渲染统计值 + 标签', () => {
    render(
      <PortalStats
        stats={[
          { label: '已上线模块', value: '8+' },
          { label: '覆盖行业', value: '6+' },
        ]}
        primaryColor="#1677ff"
      />,
    );
    expect(screen.getByText('8+')).toBeInTheDocument();
    expect(screen.getByText('已上线模块')).toBeInTheDocument();
    expect(screen.getByText('6+')).toBeInTheDocument();
    expect(screen.getByText('覆盖行业')).toBeInTheDocument();
  });
});

describe('FeatureCard', () => {
  it('渲染图标 + 标题 + 状态标签 + 描述', () => {
    render(
      <FeatureCard
        primaryColor="#1677ff"
        feature={{ title: '多租户', desc: '数据按租户隔离', done: true, icon: 'cluster' }}
      />,
    );
    expect(screen.getByText('多租户')).toBeInTheDocument();
    expect(screen.getByText('已上线')).toBeInTheDocument();
    expect(screen.getByText('数据按租户隔离')).toBeInTheDocument();
  });

  it('未知图标名回退默认图标（不抛错）', () => {
    render(
      <FeatureCard
        primaryColor="#1677ff"
        feature={{ title: '未知', desc: 'x', done: false, icon: 'not-exist' }}
      />,
    );
    expect(screen.getByText('未知')).toBeInTheDocument();
    expect(screen.getByText('规划中')).toBeInTheDocument();
  });
});

describe('PortalFaq', () => {
  it('渲染问题列表（折叠面板标签）', () => {
    render(
      <PortalFaq
        items={[
          { q: '问题一', a: '答案一' },
          { q: '问题二', a: '答案二' },
        ]}
      />,
    );
    expect(screen.getByText('问题一')).toBeInTheDocument();
    expect(screen.getByText('问题二')).toBeInTheDocument();
  });
});

describe('PortalCta', () => {
  it('渲染标题/描述 + 点击触发 onAction', () => {
    const onAction = vi.fn();
    render(
      <PortalCta
        cta={{ title: '立即开始', desc: '从今天开始', buttonText: '进入' }}
        primaryColor="#1677ff"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('立即开始')).toBeInTheDocument();
    expect(screen.getByText('从今天开始')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /进入/ }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
