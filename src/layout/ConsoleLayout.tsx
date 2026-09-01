/**
 * 管理后台 · 控制台主框架壳（ProLayout mix · 侧栏 + 顶栏 + 内容区）.
 *
 * 职责（端通用层 · 客户无关）：
 *  - 菜单渲染：从 edition.extraRoutes 中带 menu 声明的项生成侧栏菜单
 *    （name/icon/order/group/roles 角色裁剪/hiddenMenus 裁剪 + badge 角标），客户经 extraRoutes 注入。
 *  - 角色裁剪：menu.roles 存在时，仅当 CurrentUser.roles 与其有交集才展示该菜单。
 *  - 角标：menu.badge 声明端点 + 计数字段，端内轮询并渲染到菜单项（如告警「待确认」数）。
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
  SettingOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BookOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-components';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Button, Dropdown, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { request } from '@lieshoucloud/contract-api';
import { useAuthStore } from '@lieshoucloud/core-web';
import type { EditionConfig, EditionExtraRoute } from '@lieshoucloud/contract-types';

import { getEdition } from '../config/editions';
import NotificationBell from '../components/NotificationBell';
import ProjectSwitcher from '../components/ProjectSwitcher';

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
  file: <FileTextOutlined />,
  team: <TeamOutlined />,
  clock: <ClockCircleOutlined />,
  book: <BookOutlined />,
  ai: <RobotOutlined />,
};

function iconOf(name?: string): ReactNode {
  return (name && ICON_MAP[name]) || <AppstoreOutlined />;
}

/** 单个路由 → 菜单项（MenuDataItem，含角标数字） */
function toMenuItem(r: EditionExtraRoute, badge?: number): MenuDataItem {
  return {
    path: r.path,
    name: r.menu?.name ?? r.title ?? r.path,
    icon: iconOf(r.menu?.icon),
    badge: badge != null && badge > 0 ? badge : undefined,
  };
}

/** extraRoutes（带 menu 声明）→ ProLayout 菜单树（group 分组 + order 排序 + 角色/hiddenMenus 裁剪 + badge） */
export function buildMenuItems(
  edition: EditionConfig,
  userRoles?: string[],
  badges?: Record<string, number>,
): MenuDataItem[] {
  const routes = (edition.extraRoutes ?? []).filter((r) => r.menu);
  const hidden = new Set(edition.hiddenMenus ?? []);

  // 裁剪：hiddenMenus + roles 角色过滤（menu.roles 存在时需与 userRoles 有交集；平台超管 PLATFORM_ADMIN 绕过）
  const visible = routes.filter((r) => {
    if (hidden.has(r.path)) return false;
    const roles = r.menu?.roles;
    if (roles && roles.length > 0) {
      const mine = userRoles ?? [];
      if (mine.includes('PLATFORM_ADMIN')) return true;
      return mine.some((role) => roles.includes(role));
    }
    return true;
  });

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
  const itemOf = (r: EditionExtraRoute) => toMenuItem(r, badges?.[r.path]);

  const items: MenuDataItem[] = [
    ...flat.sort(byOrder).map(itemOf),
    ...[...groups.entries()]
      .sort((a, b) => (a[1][0]?.menu?.order ?? 99) - (b[1][0]?.menu?.order ?? 99))
      .map(([name, list]) => ({
        name,
        icon: <MenuOutlined />,
        children: list.sort(byOrder).map(itemOf),
      })),
  ];
  return items;
}

/** 是否启用控制台壳：有客户菜单声明（或值班员控制台模式） */
export function shouldUseConsole(edition: EditionConfig): boolean {
  return edition.dutyConsole === true || (edition.extraRoutes ?? []).some((r) => r.menu);
}

/** 轮询带 badge 声明的菜单端点 → { path: 计数 } */
function useMenuBadges(routes: EditionExtraRoute[]): Record<string, number> {
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    const withBadge = routes.filter((r) => r.menu?.badge);
    if (withBadge.length === 0) return;
    let alive = true;

    const poll = async () => {
      for (const r of withBadge) {
        const b = r.menu?.badge;
        if (!b) continue;
        try {
          const data = await request<Record<string, unknown>>({ method: 'GET', path: b.endpoint });
          const val = Number((data as Record<string, unknown>)[b.field] ?? 0);
          if (alive) setBadges((prev) => ({ ...prev, [r.path]: Number.isFinite(val) ? val : 0 }));
        } catch {
          /* 轮询失败保持原值 */
        }
      }
    };

    void poll();
    const interval = withBadge[0]?.menu?.badge?.intervalMs ?? 30_000;
    const t = setInterval(() => void poll(), interval);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [routes]);

  return badges;
}

export default function ConsoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const edition = getEdition();
  const extraRoutes = edition.extraRoutes ?? [];
  const badges = useMenuBadges(extraRoutes);
  // 管理员（平台超管/租户管理员）可见「项目管理」（平台功能 · 右上角）
  const isAdmin = (user?.roles ?? []).some((r) => r === 'PLATFORM_ADMIN' || r === 'TENANT_ADMIN');
  const menuItems = useMemo(
    () => buildMenuItems(edition, user?.roles, badges),
    [edition, user?.roles, badges],
  );

  return (
    <ProLayout
      title={edition.brandName}
      logo={false}
      headerTitleRender={(logoDom, titleDom) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {logoDom}
          {titleDom}
          <ProjectSwitcher />
        </div>
      )}

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
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: '个人中心',
                  onClick: () => navigate('/profile'),
                },
                // 系统设置（平台功能 · 管理员，个人中心下面）
                ...(isAdmin
                  ? [
                      {
                        key: 'settings',
                        icon: <SettingOutlined />,
                        label: '系统设置',
                        onClick: () => navigate('/settings'),
                      },
                    ]
                  : []),
                {
                  key: 'about',
                  icon: <InfoCircleOutlined />,
                  label: '关于',
                  onClick: () => navigate('/about'),
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => { logout(); navigate('/portal'); },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      actionsRender={() => [
        <NotificationBell key="notif" />,
        ...(edition.headerActions ?? []).map((a) => (
          <Button
            key={a.path}
            type="link"
            icon={<FundProjectionScreenOutlined />}
            style={{ color: '#1677ff', fontWeight: 600 }}
            onClick={() => navigate(a.path)}
          >
            {a.label}
          </Button>
        )),
      ]}
    >
      <Outlet />
    </ProLayout>
  );
}
