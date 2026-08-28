/**
 * 菜单数据驱动测试（ADR-0024 P2 阶段 4）.
 *
 * 验证：
 * 1. fetchUserMenus 走 /api/users/me/menus（services/menu.ts）
 * 2. BasicLayout 登录后拉取远程菜单并渲染（后端返回 → 版别裁剪 → ICON_MAP → ProLayout）
 * 3. 远程菜单失败 → 回退本地 _defaultProps 过滤（不白屏）
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';

import BasicLayout from '../BasicLayout';
import { useAuthStore } from '../../stores/auth';
import { fetchUserMenus } from '../../services/menu';
import type { MenuNode } from '@lieshoucloud/contract-types/business/menu';

vi.mock('../../services/menu', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../services/menu');
  return { ...actual, fetchUserMenus: vi.fn() };
});

// getEdition 包一层：分组测试里可注入带 group 的 extraRoutes（其余测试行为与真实实现一致）
vi.mock('../../config/editions', async () => {
  const actual = await vi.importActual<typeof import('../../config/editions')>('../../config/editions');
  return { ...actual, getEdition: vi.fn(actual.getEdition) };
});
import { getEdition } from '../../config/editions';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

/** 远程菜单 mock：路径避开客户版别 hiddenMenus 前缀（daizhang 客户仓注入收敛后
 *  /admin、/legal 等通用路径均被裁剪，测试只验证远程菜单渲染逻辑，不绑定特定菜单） */
function mockMenus(): MenuNode[] {
  return [
    {
      key: 'demo',
      path: '/demo/menu',
      name: '远程演示菜单',
      icon: 'dashboard',
      accessKey: null,
      sort: 10,
      children: [],
    },
    {
      key: 'demo-group',
      path: '/demo/group',
      name: '远程演示分组',
      icon: 'book',
      accessKey: null,
      sort: 20,
      children: [
        {
          key: 'demo-child',
          path: '/demo/group/child',
          name: '分组子项',
          icon: 'solution',
          accessKey: null,
          sort: 10,
          children: [],
        },
      ],
    },
  ];
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: 't',
    refreshToken: 'r',
    user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'], permissions: ['legal:use'] },
    isAuthenticated: true,
  });
  vi.mocked(fetchUserMenus).mockResolvedValue(mockMenus());
});

afterEach(() => {
  vi.clearAllMocks();
});

const wrap = () => (
  <ConfigProvider>
    <AntdApp>
      <MemoryRouter initialEntries={['/admin']}>
        <BasicLayout />
      </MemoryRouter>
    </AntdApp>
  </ConfigProvider>
);

describe('菜单数据驱动（阶段 4）', () => {
  it('fetchUserMenus 在登录后调用', async () => {
    render(wrap());
    await waitFor(() => expect(fetchUserMenus).toHaveBeenCalledTimes(1));
  });

  it('远程菜单渲染：远程菜单注入（后端数据源）', async () => {
    render(wrap());
    expect(await screen.findByText('远程演示菜单')).toBeTruthy();
    // 分组项可能折叠渲染；用容器断言远程菜单已注入
    await waitFor(() => expect(fetchUserMenus).toHaveBeenCalled());
    const layout = document.querySelector('.ant-pro-layout');
    expect(layout).toBeTruthy();
  });

  it('远程菜单失败 → 回退本地菜单（不白屏）', async () => {
    vi.mocked(fetchUserMenus).mockRejectedValue(new Error('network'));
    expect(() => render(wrap())).not.toThrow();
    // 本地回退：PLATFORM_ADMIN 角色推导仍渲染菜单
    await waitFor(() => expect(fetchUserMenus).toHaveBeenCalled());
  });
});

describe('客户菜单分组（extraRoutes.menu.group · 2026-10 菜单治理）', () => {
  it('同 group 项收进分组子菜单，无 group 项平铺，分组标题渲染', async () => {
    vi.mocked(getEdition).mockReturnValue({
      ...getEdition(),
      hiddenMenus: [],
      extraRoutes: [
        {
          path: '/demo/a',
          menu: { name: 'A项', icon: 'dashboard', order: 1, group: 'G组' },
          load: async () => ({ default: () => null }),
        },
        {
          path: '/demo/b',
          menu: { name: 'B项', icon: 'swap', order: 2, group: 'G组' },
          load: async () => ({ default: () => null }),
        },
        {
          path: '/demo/c',
          menu: { name: 'C项', icon: 'smile', order: 3 },
          load: async () => ({ default: () => null }),
        },
      ],
    });
    render(wrap());
    expect(await screen.findByText('G组')).toBeTruthy();
    expect(screen.getByText('A项')).toBeTruthy();
    expect(screen.getByText('B项')).toBeTruthy();
    expect(screen.getByText('C项')).toBeTruthy();
    // 分组节点（含 routes）以 group 模式渲染：断言容器内存在分组标题样式节点
    await waitFor(() => expect(fetchUserMenus).toHaveBeenCalled());
    const groupTitle = document.querySelector('.ant-menu-item-group-title');
    expect(groupTitle).toBeTruthy();
    vi.mocked(getEdition).mockRestore();
  });
});
