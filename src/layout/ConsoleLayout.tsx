/**
 * 管理后台 · 控制台主框架壳（ProLayout mix · 侧栏 + 顶栏 + 内容区）.
 *
 * 职责（端通用层 · 客户无关）：
 *  - 菜单渲染：从 edition.extraRoutes 中带 menu 声明的项生成侧栏菜单
 *    （name/icon/order/group + hiddenMenus 裁剪），客户经 extraRoutes 注入。
 *  - 顶栏：品牌名 + 值班员 + 退出登录。
 *  - 内容区：<Outlet />（嵌套路由渲染，行业页面自带 PageContainer）。
 *
 * 无菜单版别（generic 骨架）不进入本壳，由 App.tsx 条件渲染。
 */
import {
  AlertOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  ControlOutlined,
  DashboardOutlined,
  FundOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-components';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Dropdown, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@lieshoucloud/core-web';
import type { EditionConfig, EditionExtraRoute } from '@lieshoucloud/contract-types';

import { getEdition } from '../config/editions';

/** 菜单图标：string 名称 → antd 图标（未知名称兜底默认图标） */
const ICON_MAP: Record<string, ReactNode> = {
  dashboard: <DashboardOutlined />,
  workbench: <DashboardOutlined />,
  home: <HomeOutlined />,
  alert: <AlertOutlined />,
  overview: <FundOutlined />,
  topo: <ApartmentOutlined />,
  device: <ThunderboltOutlined />,
  devices: <ThunderboltOutlined />,
  product: <AppstoreOutlined />,
  products: <AppstoreOutlined />,
  rule: <ControlOutlined />,
  rules: <ControlOutlined />,
  ops: <ToolOutlined />,
  cockpit: <FundProjectionScreenOutlined />,
  menu: <MenuOutlined />,
};

function iconOf(name?: string): ReactNode {
  return (name && ICON_MAP[name]) || <AppstoreOutlined />;
}

/** 单个路由 → 菜单项（MenuDataItem） */
function toMenuItem(r: EditionExtraRoute): MenuDataItem {
  return {
    path: r.path,
    name: r.menu?.name ?? r.title ?? r.path,
    icon: iconOf(r.menu?.icon),
  };
}

/** extraRoutes（带 menu 声明）→ ProLayout 菜单树（group 分组 + order 排序 + hiddenMenus 裁剪） */
export function buildMenuItems(edition: EditionConfig): MenuDataItem[] {
  const routes = (edition.extraRoutes ?? []).filter((r) => r.menu);
  const hidden = new Set(edition.hiddenMenus ?? []);

  // 裁剪：隐藏非本客户业务菜单
  const visible = routes.filter((r) => !hidden.has(r.path));

  // group 分组：同 group 收进子菜单；无 group 平铺
  const groups = new Map<string, EditionExtraRoute[]>();
  const flat: EditionExtraRoute[] = [];
  for (const r of visible) {
    const g = r.menu?.group;
    if (g) {
      const list = groups.get(g) ?? [];
      list.push(r);
      groups.set(g, list);
    } else {
      flat.push(r);
    }
  }

  const byOrder = (a: EditionExtraRoute, b: EditionExtraRoute) =>
    (a.menu?.order ?? 99) - (b.menu?.order ?? 99);

  const items: MenuDataItem[] = [
    ...flat.sort(byOrder).map(toMenuItem),
    ...[...groups.entries()]
      .sort((a, b) => (a[1][0]?.menu?.order ?? 99) - (b[1][0]?.menu?.order ?? 99))
      .map(([name, list]) => ({
        name,
        icon: <MenuOutlined />,
        children: list.sort(byOrder).map(toMenuItem),
      })),
  ];
  return items;
}

/** 是否启用控制台壳：有客户菜单声明（或值班员控制台模式） */
export function shouldUseConsole(edition: EditionConfig): boolean {
  return edition.dutyConsole === true || (edition.extraRoutes ?? []).some((r) => r.menu);
}

export default function ConsoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const edition = getEdition();
  const menuItems = useMemo(() => buildMenuItems(edition), [edition]);

  return (
    <ProLayout
      title={edition.brandName}
      logo={false}
      layout="mix"
      fixSiderbar
      fixedHeader
      route={{ path: '/', routes: menuItems }}
      location={{ pathname: location.pathname }}
      menuItemRender={(item, dom) => {
        if (item.path) {
          return <a onClick={() => navigate(item.path as string)}>{dom}</a>;
        }
        return dom;
      }}
      avatarProps={{
        icon: <Avatar size="small">{user?.username?.slice(0, 1)?.toUpperCase() ?? '值'}</Avatar>,
        title: <Typography.Text>{user?.username ?? '值班员'}</Typography.Text>,
        render: (_props, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => logout(),
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      actionsRender={() => []}
    >
      <Outlet />
    </ProLayout>
  );
}
