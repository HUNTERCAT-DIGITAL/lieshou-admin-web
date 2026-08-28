import {
  AccountBookOutlined,
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  RiseOutlined,
  ClusterOutlined,
  ContactsOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FundOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MoonOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  SmileOutlined,
  SolutionOutlined,
  SunOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { App as AntdApp, Badge, Button, Dropdown, type MenuProps } from 'antd';
import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { createAccess, derivePermissions, type Access } from '../access';
import { getEdition, getEditionHiddenMenus, isPathCapabilityEnabled, type EditionAlert } from '../config/editions';
import DevTools from '../components/DevTools';
import NotificationBell from '../components/NotificationBell';
import { ErrorBoundary, PageLoading } from '@lieshoucloud/ui';
import { useThemeMode } from '../hooks/useThemeMode';
import { setUnauthorizedHandler } from '../services/api';
import { getApprovalCounts } from '../services/approval';
import { fetchUserMenus } from '../services/menu';
import { useAuthStore } from '../stores/auth';
import type { MenuNode } from '@lieshoucloud/contract-types/business/menu';
import { AuthError, getErrorMessage } from '../utils/errors';
import { useThemeStore } from '../stores/theme';
import defaultProps from './_defaultProps';

/** 菜单图标映射（后端返回 icon 字符串 key → antd 图标；ADR-0024 P2 阶段 4） */
const ICON_MAP: Record<string, ReactNode> = {
  smile: <SmileOutlined />,
  dashboard: <DashboardOutlined />,
  user: <UserOutlined />,
  cluster: <ClusterOutlined />,
  shop: <ShopOutlined />,
  safety: <SafetyCertificateOutlined />,
  'file-search': <FileSearchOutlined />,
  team: <TeamOutlined />,
  contacts: <ContactsOutlined />,
  solution: <SolutionOutlined />,
  rise: <RiseOutlined />,
  fund: <FundOutlined />,
  'line-chart': <LineChartOutlined />,
  audit: <AuditOutlined />,
  book: <BookOutlined />,
  bulb: <BulbOutlined />,
  api: <ApiOutlined />,
  radar: <RadarChartOutlined />,
  apartment: <ApartmentOutlined />,
  'account-book': <AccountBookOutlined />,
  swap: <SwapOutlined />,
  'file-text': <FileTextOutlined />,
};

/** 顶栏提醒红点（Edition.alerts · 2026-10 账龄预警等）：轮询 load()，>0 显示红点 */
function AlertBadge({ alert }: { alert: EditionAlert }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const tick = () =>
      alert
        .load()
        .then((n) => {
          if (alive) setCount(Number.isFinite(n) && n > 0 ? n : 0);
        })
        .catch(() => alive && setCount(0));
    void tick();
    const timer = setInterval(tick, alert.pollMs ?? 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [alert]);
  return (
    <Badge count={count} size="small" overflowCount={99} offset={[-2, 4]}>
      <Button
        type="text"
        icon={<WarningOutlined />}
        aria-label={alert.label}
        title={alert.label}
        data-testid={`alert-${alert.label}`}
        onClick={() => navigate(alert.href)}
      />
    </Badge>
  );
}

/** 菜单路径 → 权限码（无权限码的路径默认可见） */
const ACCESS_BY_PATH: Record<string, keyof Access> = {
  '/admin': 'canSeeAdmin',
  '/tenant': 'canManageTenant',
  '/user': 'canManageUsers',
  '/customer': 'canUseCrm',
  '/inventory': 'canUseInventory',
  '/quality': 'canUseInventory',
  '/finance': 'canUseFinance',
  '/approval': 'canUseApproval',
  '/edu': 'canUseEdu',
  '/legal': 'canUseLegal',
  '/iot': 'canUseIot',
  // IoT 叶子：值班员只看监控，配置类隐藏
  '/iot/cockpit': 'canUseIot',
  '/iot/overview': 'canUseIot',
  '/iot/topo': 'canUseIot',
  '/iot/alerts': 'canUseIot',
  '/iot/devices': 'canManageIotConfig',
  '/iot/products': 'canManageIotConfig',
  '/iot/rules': 'canManageIotConfig',
  '/profile': 'canSeeAdmin',
};

/** 客户菜单项（分组前形态） */
interface ExtraMenuItem {
  path: string;
  name: string;
  /** menu.group：同组收进分组子菜单；缺省平铺 */
  group?: string;
  /** 排序（越小越靠前） */
  menuOrder: number;
  icon: ReactNode;
}

/**
 * 客户专属菜单分组（2026-10 菜单治理）.
 * - menu.group 声明的同组项收进分组子菜单（复用 ProLayout group 渲染）；
 * - 组顺序 = 组内最小 order，组内成员按 order；无 group 的项平铺；
 * - 分组节点 path = 组内成员路径公共前缀（保证访问组内任一路由时分组可选中高亮）。
 */
function groupExtraMenuRoutes(items: ExtraMenuItem[]) {
  interface GroupLeaf {
    path: string;
    name: string;
    icon: ReactNode;
  }
  interface Group {
    name: string;
    order: number;
    icon: ReactNode;
    children: GroupLeaf[];
  }
  const groups = new Map<string, Group>();
  const top: GroupLeaf[] = [];
  for (const it of items) {
    const { group, menuOrder, ...leaf } = it;
    if (!group) {
      top.push(leaf);
      continue;
    }
    const g = groups.get(group);
    if (g) {
      g.children.push(leaf);
      g.order = Math.min(g.order, menuOrder);
    } else {
      groups.set(group, { name: group, order: menuOrder, icon: leaf.icon, children: [leaf] });
    }
  }
  const grouped = [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({
      path: commonPathPrefix(g.children.map((c) => c.path)),
      name: g.name,
      icon: g.icon,
      routes: g.children,
    }));
  return [...top, ...grouped];
}

/** 计算多个路径的公共前缀（按路径段；无公共段回退 '/'） */
function commonPathPrefix(paths: string[]): string {
  if (paths.length === 0) return '/';
  const segs = paths.map((p) => p.split('/').filter(Boolean));
  const first = segs[0];
  const common: string[] = [];
  for (let i = 0; i < first.length; i += 1) {
    if (segs.every((s) => s[i] === first[i])) common.push(first[i]);
    else break;
  }
  return `/${common.join('/')}`;
}

/** 递归过滤路由树：版别隐藏（hiddenMenus）+ 法律域开关（showLegal）+ 权限码（accessKey · ADR-0024 Phase 2） */
function filterRoutes(
  routes: { path?: string; routes?: { path?: string; routes?: unknown }[] }[] | undefined,
  access: Access,
  permissions: string[],
  hiddenMenus: string[],
  showLegal: boolean,
): typeof routes {
  if (!routes) return routes;
  return routes
    .map((r) => ({
      ...r,
      routes: filterRoutes(r.routes as typeof routes, access, permissions, hiddenMenus, showLegal),
    }))
    .filter((r) => {
      const p = r.path ?? '';
      if (hiddenMenus.some((h) => p === h || p.startsWith(h + '/'))) return false;
      // 客户能力组合（2026-09）：capabilities 声明行业子集时，按能力前缀匹配裁剪
      if (!isPathCapabilityEnabled(getEdition(), p)) return false;
      // 法律能力域（ADR-0036）：仅 layer/legalmind 版显示案件菜单
      if (p === '/legal' && !showLegal) return false;
      // 权限码驱动：菜单项声明 accessKey → 检查当前用户 permissions；缺省 = 登录即可见
      const key = (r as { accessKey?: string | null }).accessKey;
      if (key) {
        if (!permissions.includes(key)) return false;
      } else {
        const legacy = ACCESS_BY_PATH[p];
        if (legacy && !access[legacy]) return false;
      }
      // 分组展开后为空 → 整组隐藏（如值班员下 CRM/进销存等整组消失）
      if (r.routes && Array.isArray(r.routes) && r.routes.length === 0) return false;
      return true;
    });
}

/**
 * Ant Design Pro 风格基础布局（Phase 5 用户菜单 + Phase 8 RBAC + Phase 9 体验打磨）.
 */
export default function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const availableTenants = useAuthStore((s) => s.availableTenants);
  const switchTenant = useAuthStore((s) => s.switchTenant);
  const { message: messageApi } = AntdApp.useApp();
  const { mode: themeMode, setMode: setThemeMode } = useThemeMode();
  const resolvedTheme = useThemeStore((s) => s.resolved);

  // 审批待办红点：进布局拉一次 + 每分钟轮询（失败静默，不打扰）
  const [approvalInbox, setApprovalInbox] = useState(0);
  const loadApprovalCount = useCallback(() => {
    if (!isAuthenticated) return;
    getApprovalCounts()
      .then((c) => setApprovalInbox(c.inbox))
      .catch(() => {});
  }, [isAuthenticated]);
  useEffect(() => {
    loadApprovalCount();
    const timer = setInterval(loadApprovalCount, 60_000);
    return () => clearInterval(timer);
  }, [loadApprovalCount]);

  // 401 统一出口（services/api.ts refresh 失败后调用）：提示 + 登出 + 跳登录
  useEffect(() => {
    setUnauthorizedHandler(() => {
      messageApi.error('登录已过期，请重新登录');
      logout();
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [messageApi, logout, navigate]);

  // 挂载时刷新用户信息（拿真实 roles；token 过期由 api 层自动 refresh / 登出）
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    fetchMe().catch((e) => {
      if (e instanceof AuthError && e.code === 'UNAUTHORIZED') return; // 已由 handler 处理
      messageApi.error(getErrorMessage(e));
    });
  }, [isAuthenticated, accessToken, fetchMe, messageApi]);

  const onLogout = () => {
    logout();
    messageApi.success('已退出登录');
    navigate('/login', { replace: true });
  };

  /** 租户切换（先登录后选租户）：多租户时顶栏显示，切换后 state 更新自动刷新租户上下文 */
  const onSwitchTenant = async (code: string) => {
    if (code === user?.tenantCode) return;
    try {
      await switchTenant(code);
      messageApi.success('已切换到' + (availableTenants.find((t) => t.tenantCode === code)?.tenantName ?? code));
      navigate('/welcome', { replace: true });
    } catch {
      messageApi.error('切换租户失败');
    }
  };

  const tenantItems: MenuProps['items'] = availableTenants
    .filter((t) => t.tenantCode !== user?.tenantCode)
    .map((t) => ({
      key: t.tenantCode,
      icon: <ClusterOutlined />,
      label: t.tenantName,
      onClick: () => void onSwitchTenant(t.tenantCode),
    }));

  const userMenu: MenuProps['items'] = [
    // 值班员控制台：个人中心页是开发向信息（ID/租户编码），值班员无需查看 → 移除入口
    ...(getEdition().dutyConsole
      ? []
      : [
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人中心',
            onClick: () => navigate('/profile'),
          },
        ]),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  // 菜单数据驱动（ADR-0024 P2 阶段 4）：后端返回当前用户菜单树（租户覆盖 + 权限过滤）
  // 远程菜单渲染优先；接口失败（旧后端/网络）→ 回退本地 filterRoutes
  const [remoteMenus, setRemoteMenus] = useState<MenuNode[] | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUserMenus()
      .then((menus) => setRemoteMenus(menus))
      .catch(() => setRemoteMenus(null));
  }, [isAuthenticated]);

  // RBAC（ADR-0024）：菜单按当前用户角色过滤（本地回退路径）
  const access = createAccess(user);
  // 版别裁剪（ADR-0035）：hiddenMenus 前缀的菜单隐藏（如 dwjk 隐藏 CRM/进销存/财务/审批；
  // 非 eduTeacher 版别隐藏师资档案 /edu；非 showLegal 版别隐藏法律域 /legal）
  const hiddenMenus = getEditionHiddenMenus(getEdition());
  const showLegal = getEdition().showLegal ?? false;
  const localRoutes = filterRoutes(
    defaultProps.route?.routes as {
      path?: string;
      routes?: { path?: string; routes?: unknown }[];
    }[],
    access,
    derivePermissions(user),
    hiddenMenus,
    showLegal,
  );

  // 远程菜单树 → ProLayout route 格式（版别裁剪兜底 + 图标映射）
  const isEditionHidden = (p: string) =>
    hiddenMenus.some((h) => p === h || p.startsWith(h + '/')) ||
    (p.startsWith('/legal') && !showLegal) ||
    !isPathCapabilityEnabled(getEdition(), p);
  const toRoute = (
    n: MenuNode,
  ): { path: string; name: string; icon: ReactNode; routes?: unknown[] } | null => {
    if (isEditionHidden(n.path)) return null;
    const children = n.children?.map(toRoute).filter((c): c is NonNullable<typeof c> => c !== null);
    if (n.children && n.children.length > 0 && (!children || children.length === 0)) return null;
    return {
      path: n.path,
      name: n.name,
      icon: ICON_MAP[n.icon] ?? <AppstoreOutlined />,
      routes: children && children.length > 0 ? children : undefined,
    };
  };
  const remoteRoutes =
    remoteMenus === null
      ? null
      : remoteMenus.map(toRoute).filter((r): r is NonNullable<typeof r> => r !== null);
  // 客户专属菜单（extraRoutes.menu · 2026-09 客户聚合仓模式）：客户仓注入的专属页面
  // 显示在通用菜单之前（按 menu.order 排序）；menu.group 同组收进分组子菜单（2026-10 菜单治理）
  // 无 menu 声明的路由只挂路由不进菜单
  const extraMenuRoutes: ExtraMenuItem[] =
    (getEdition().extraRoutes ?? [])
      .filter((r) => r.menu)
      .sort((a, b) => (a.menu?.order ?? 99) - (b.menu?.order ?? 99))
      .map((r) => ({
        path: r.path,
        name: r.menu?.name ?? r.path,
        group: r.menu?.group,
        menuOrder: r.menu?.order ?? 99,
        icon: ICON_MAP[r.menu?.icon ?? ''] ?? <AppstoreOutlined />,
      }));
  const visibleRoutes = [
    ...groupExtraMenuRoutes(extraMenuRoutes),
    ...(remoteRoutes && remoteRoutes.length > 0 ? remoteRoutes : (localRoutes ?? [])),
  ];
  const layoutProps = {
    ...defaultProps,
    route: { ...defaultProps.route, routes: visibleRoutes },
  };

  return (
    <>
      {/* 左侧菜单样式：分组标题（主色+装饰竖线+间距）与菜单项（朴素）视觉区分 */}
      <style>{`
        /* 分组标题：加粗 + 主色 + 左侧发光竖线 + 分组间距 */
        .ant-pro-sider .ant-menu-item-group-title {
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #1677ff !important;
          padding-left: 20px !important;
          padding-top: 14px !important;
          padding-bottom: 8px !important;
          letter-spacing: 1px;
          position: relative;
        }
        .ant-pro-sider .ant-menu-item-group-title::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 14px;
          border-radius: 2px;
          background: linear-gradient(180deg, #1677ff, #69b1ff);
          box-shadow: 0 0 6px rgba(22,119,255,0.4);
        }
        /* 分组之间的细分隔线 */
        .ant-pro-sider .ant-menu-item-group + .ant-menu-item-group {
          border-top: 1px solid rgba(5, 10, 25, 0.06);
          margin-top: 4px;
        }
        /* 菜单项：正常 14px，hover 主色 */
        .ant-pro-sider .ant-menu-item {
          font-size: 14px !important;
          border-radius: 6px;
          margin: 2px 8px;
        }
        /* 暗色主题适配 */
        .ant-pro-sider.ant-layout-sider-dark .ant-menu-item-group-title,
        .ant-pro-sider.ant-menu-dark .ant-menu-item-group-title {
          color: #00bceb !important;
        }
        .ant-pro-sider.ant-menu-dark .ant-menu-item-group-title::before {
          background: linear-gradient(180deg, #00e5ff, #00bceb) !important;
          box-shadow: 0 0 8px rgba(0,188,235,0.5) !important;
        }
        .ant-pro-sider.ant-menu-dark .ant-menu-item-group + .ant-menu-item-group {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>
      <ProLayout
        {...layoutProps}
        location={location}
        menu={{ type: 'group' }}
        contentWidth="Fluid"
        fixedHeader
        fixSiderbar
        layout="mix"
        navTheme={resolvedTheme === 'dark' ? 'realDark' : 'light'} /* Phase 9 · 暗色主题 */
        /* Phase 9 · ProLayout 与 react-router 集成：items API 不内置点击导航，
         需要 menuItemRender 用 <Link> 包叶子项（保留右键新标签页 + a11y） */
        menuItemRender={(item, dom) => (item.path ? <Link to={item.path}>{dom}</Link> : dom)}
        actionsRender={() => [
          /* 租户切换（先登录后选租户）：多租户时显示当前租户 + 切换下拉 */
          ...(availableTenants.length > 1
            ? [
                <Dropdown
                  key="tenant-switch"
                  menu={{ items: tenantItems, selectedKeys: [user?.tenantCode ?? ''] }}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<ClusterOutlined />} data-testid="tenant-switch">
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.tenantName ?? user?.tenantCode}
                    </span>
                  </Button>
                </Dropdown>,
              ]
            : []),
          /* 顶栏提醒红点（Edition.alerts · 2026-10 账龄预警等）：客户仓注入，轮询刷新 */
          ...(getEdition().alerts ?? []).map((a) => <AlertBadge key={a.label} alert={a} />),
          /* 通知铃铛（未读数轮询 30s）—— 值班员也可见（通知与审批无关） */
          <NotificationBell key="notification-bell" />,
          /* 审批待办红点（每分钟轮询）—— 值班员控制台隐藏（通知功能未开发，值班员无审批） */
          ...(getEdition().dutyConsole
            ? []
            : [
                <Badge
                  key="approval-bell"
                  count={approvalInbox}
                  size="small"
                  overflowCount={99}
                  offset={[-2, 4]}
                >
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    aria-label="审批待办"
                    onClick={() => navigate('/approval/list')}
                  />
                </Badge>,
              ]),
          /* 主题切换（顶栏操作区） */
          <Dropdown
            key="theme"
            menu={{
              items: [
                { key: 'light', label: '明亮', onClick: () => setThemeMode('light') },
                { key: 'dark', label: '暗黑', onClick: () => setThemeMode('dark') },
                { key: 'system', label: '跟随系统', onClick: () => setThemeMode('system') },
              ],
              selectedKeys: [themeMode],
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />}
              aria-label="切换主题"
              data-testid="theme-switcher"
            />
          </Dropdown>,
        ]}
        avatarProps={
          user
            ? {
                render: () => (
                  <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          background: '#1677ff',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 14 }}>{user.username}</span>
                    </span>
                  </Dropdown>
                ),
                size: 'small',
              }
            : { src: '', title: '', size: 'small' }
        }
      >
        {/* 内层 Suspense：路由懒加载时只换内容区，保住布局壳 */}
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
        {/* 开发者工具悬浮钮（右下角 · 调试面板） */}
        <DevTools />
      </ProLayout>
    </>
  );
}
