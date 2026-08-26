/**
 * 烟雾测试：_defaultProps 模块加载不抛错 + 版别菜单差异（ADR-0035 配置层）.
 *
 * 重要回归点：
 * 1. 之前图标用纯字符串，ProLayout 的 getIcon 会静默丢弃——任何菜单项没有 icon 必须 fail。
 * 2. 法律版（layer/legalmind · showLegal）菜单置顶「今日作战台」+ 隐藏通用「欢迎」页；
 *    通用版保持 欢迎/工作台 原顺序（登录后直进今日作战台，2026-08-25 客户反馈）。
 */
import { describe, expect, it, vi } from 'vitest';

import type { ProLayoutProps } from '@ant-design/pro-components';

interface MenuRoute {
  path?: string;
  name?: string;
  icon?: unknown;
  redirect?: string;
  routes?: MenuRoute[];
}

function flatten(routes: MenuRoute[]): MenuRoute[] {
  const out: MenuRoute[] = [];
  routes.forEach((r) => {
    out.push(r);
    (r.routes ?? []).forEach((c) => out.push(c));
  });
  return out;
}

/** 以指定版别动态加载 _defaultProps（模块级 getEdition() 在导入时求值） */
async function loadProps(edition: 'generic' | 'legalmind'): Promise<ProLayoutProps> {
  vi.stubEnv('VITE_EDITION', edition);
  vi.resetModules();
  const mod = await import('../_defaultProps');
  vi.unstubAllEnvs();
  return mod.default;
}

describe('_defaultProps smoke', () => {
  it('模块加载成功（图标导入正确）', async () => {
    const props = await loadProps('generic');
    expect(props).toBeDefined();
    expect(props.route?.routes).toBeDefined();
  });

  it('每个有 name 的菜单项 icon 都是 ReactNode（@ant-design/icons JSX）', async () => {
    const props = await loadProps('generic');
    const flat = flatten(props.route?.routes ?? []);
    expect(flat.length).toBeGreaterThan(0);
    // 只检查有 name 的项（redirect 子项无 name 无 icon）
    const named = flat.filter((r) => r.name);
    expect(named.length).toBeGreaterThan(0);
    named.forEach((r) => {
      expect(typeof r.icon).not.toBe('string');
      // icon 必须是 React 元素（有 type 字段的 object 或函数组件）
      expect(r.icon).toBeDefined();
    });
  });

  it('通用版（generic）：菜单含 欢迎 + 工作台（不显示今日作战台）', async () => {
    const names = flatten((await loadProps('generic')).route?.routes ?? []).map((r) => r.name);
    expect(names).toContain('欢迎');
    expect(names).toContain('工作台');
    expect(names).not.toContain('今日作战台');
  });

  it('法律版（legalmind · showLegal）：菜单置顶 今日作战台 + 隐藏通用欢迎页', async () => {
    const flat = flatten((await loadProps('legalmind')).route?.routes ?? []);
    const names = flat.map((r) => r.name);
    expect(flat[0]).toMatchObject({ path: '/admin', name: '今日作战台' });
    expect(names).toContain('今日作战台');
    expect(names).not.toContain('欢迎');
    expect(names).not.toContain('工作台');
  });
});
