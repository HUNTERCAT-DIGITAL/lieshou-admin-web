"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BasicLayout;
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var access_1 = require("../access");
var editions_1 = require("../config/editions");
var DevTools_1 = require("../components/DevTools");
var NotificationBell_1 = require("../components/NotificationBell");
var ui_1 = require("@lieshoucloud/ui");
var useThemeMode_1 = require("../hooks/useThemeMode");
var api_1 = require("../services/api");
var approval_1 = require("../services/approval");
var menu_1 = require("../services/menu");
var auth_1 = require("../stores/auth");
var errors_1 = require("../utils/errors");
var theme_1 = require("../stores/theme");
var _defaultProps_1 = require("./_defaultProps");
/** 菜单图标映射（后端返回 icon 字符串 key → antd 图标；ADR-0024 P2 阶段 4） */
var ICON_MAP = {
    smile: <icons_1.SmileOutlined />,
    dashboard: <icons_1.DashboardOutlined />,
    user: <icons_1.UserOutlined />,
    cluster: <icons_1.ClusterOutlined />,
    shop: <icons_1.ShopOutlined />,
    safety: <icons_1.SafetyCertificateOutlined />,
    'file-search': <icons_1.FileSearchOutlined />,
    team: <icons_1.TeamOutlined />,
    contacts: <icons_1.ContactsOutlined />,
    solution: <icons_1.SolutionOutlined />,
    rise: <icons_1.RiseOutlined />,
    fund: <icons_1.FundOutlined />,
    audit: <icons_1.AuditOutlined />,
    book: <icons_1.BookOutlined />,
    bulb: <icons_1.BulbOutlined />,
    api: <icons_1.ApiOutlined />,
    radar: <icons_1.RadarChartOutlined />,
    apartment: <icons_1.ApartmentOutlined />,
};
/** 菜单路径 → 权限码（无权限码的路径默认可见） */
var ACCESS_BY_PATH = {
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
/** 递归过滤路由树：版别隐藏（hiddenMenus）+ 法律域开关（showLegal）+ 权限码（accessKey · ADR-0024 Phase 2） */
function filterRoutes(routes, access, permissions, hiddenMenus, showLegal) {
    if (!routes)
        return routes;
    return routes
        .map(function (r) { return (__assign(__assign({}, r), { routes: filterRoutes(r.routes, access, permissions, hiddenMenus, showLegal) })); })
        .filter(function (r) {
        var _a;
        var p = (_a = r.path) !== null && _a !== void 0 ? _a : '';
        if (hiddenMenus.some(function (h) { return p === h || p.startsWith(h + '/'); }))
            return false;
        // 客户能力组合（2026-09）：capabilities 声明行业子集时，按能力前缀匹配裁剪
        if (!(0, editions_1.isPathCapabilityEnabled)((0, editions_1.getEdition)(), p))
            return false;
        // 法律能力域（ADR-0036）：仅 layer/legalmind 版显示案件菜单
        if (p === '/legal' && !showLegal)
            return false;
        // 权限码驱动：菜单项声明 accessKey → 检查当前用户 permissions；缺省 = 登录即可见
        var key = r.accessKey;
        if (key) {
            if (!permissions.includes(key))
                return false;
        }
        else {
            var legacy = ACCESS_BY_PATH[p];
            if (legacy && !access[legacy])
                return false;
        }
        // 分组展开后为空 → 整组隐藏（如值班员下 CRM/进销存等整组消失）
        if (r.routes && Array.isArray(r.routes) && r.routes.length === 0)
            return false;
        return true;
    });
}
/**
 * Ant Design Pro 风格基础布局（Phase 5 用户菜单 + Phase 8 RBAC + Phase 9 体验打磨）.
 */
function BasicLayout() {
    var _this = this;
    var _a, _b;
    var location = (0, react_router_dom_1.useLocation)();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var isAuthenticated = (0, auth_1.useAuthStore)(function (s) { return s.isAuthenticated; });
    var accessToken = (0, auth_1.useAuthStore)(function (s) { return s.accessToken; });
    var fetchMe = (0, auth_1.useAuthStore)(function (s) { return s.fetchMe; });
    var logout = (0, auth_1.useAuthStore)(function (s) { return s.logout; });
    var availableTenants = (0, auth_1.useAuthStore)(function (s) { return s.availableTenants; });
    var switchTenant = (0, auth_1.useAuthStore)(function (s) { return s.switchTenant; });
    var messageApi = antd_1.App.useApp().message;
    var _c = (0, useThemeMode_1.useThemeMode)(), themeMode = _c.mode, setThemeMode = _c.setMode;
    var resolvedTheme = (0, theme_1.useThemeStore)(function (s) { return s.resolved; });
    // 审批待办红点：进布局拉一次 + 每分钟轮询（失败静默，不打扰）
    var _d = (0, react_1.useState)(0), approvalInbox = _d[0], setApprovalInbox = _d[1];
    var loadApprovalCount = (0, react_1.useCallback)(function () {
        if (!isAuthenticated)
            return;
        (0, approval_1.getApprovalCounts)()
            .then(function (c) { return setApprovalInbox(c.inbox); })
            .catch(function () { });
    }, [isAuthenticated]);
    (0, react_1.useEffect)(function () {
        loadApprovalCount();
        var timer = setInterval(loadApprovalCount, 60000);
        return function () { return clearInterval(timer); };
    }, [loadApprovalCount]);
    // 401 统一出口（services/api.ts refresh 失败后调用）：提示 + 登出 + 跳登录
    (0, react_1.useEffect)(function () {
        (0, api_1.setUnauthorizedHandler)(function () {
            messageApi.error('登录已过期，请重新登录');
            logout();
            navigate('/login', { replace: true });
        });
        return function () { return (0, api_1.setUnauthorizedHandler)(null); };
    }, [messageApi, logout, navigate]);
    // 挂载时刷新用户信息（拿真实 roles；token 过期由 api 层自动 refresh / 登出）
    (0, react_1.useEffect)(function () {
        if (!isAuthenticated || !accessToken)
            return;
        fetchMe().catch(function (e) {
            if (e instanceof errors_1.AuthError && e.code === 'UNAUTHORIZED')
                return; // 已由 handler 处理
            messageApi.error((0, errors_1.getErrorMessage)(e));
        });
    }, [isAuthenticated, accessToken, fetchMe, messageApi]);
    var onLogout = function () {
        logout();
        messageApi.success('已退出登录');
        navigate('/login', { replace: true });
    };
    /** 租户切换（先登录后选租户）：多租户时顶栏显示，切换后 state 更新自动刷新租户上下文 */
    var onSwitchTenant = function (code) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (code === (user === null || user === void 0 ? void 0 : user.tenantCode))
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, switchTenant(code)];
                case 2:
                    _d.sent();
                    messageApi.success('已切换到' + ((_c = (_b = availableTenants.find(function (t) { return t.tenantCode === code; })) === null || _b === void 0 ? void 0 : _b.tenantName) !== null && _c !== void 0 ? _c : code));
                    navigate('/welcome', { replace: true });
                    return [3 /*break*/, 4];
                case 3:
                    _a = _d.sent();
                    messageApi.error('切换租户失败');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var tenantItems = availableTenants
        .filter(function (t) { return t.tenantCode !== (user === null || user === void 0 ? void 0 : user.tenantCode); })
        .map(function (t) { return ({
        key: t.tenantCode,
        icon: <icons_1.ClusterOutlined />,
        label: t.tenantName,
        onClick: function () { return void onSwitchTenant(t.tenantCode); },
    }); });
    var userMenu = __spreadArray(__spreadArray([], ((0, editions_1.getEdition)().dutyConsole
        ? []
        : [
            {
                key: 'profile',
                icon: <icons_1.UserOutlined />,
                label: '个人中心',
                onClick: function () { return navigate('/profile'); },
            },
        ]), true), [
        { type: 'divider' },
        {
            key: 'logout',
            icon: <icons_1.LogoutOutlined />,
            label: '退出登录',
            onClick: onLogout,
        },
    ], false);
    // 菜单数据驱动（ADR-0024 P2 阶段 4）：后端返回当前用户菜单树（租户覆盖 + 权限过滤）
    // 远程菜单渲染优先；接口失败（旧后端/网络）→ 回退本地 filterRoutes
    var _e = (0, react_1.useState)(null), remoteMenus = _e[0], setRemoteMenus = _e[1];
    (0, react_1.useEffect)(function () {
        if (!isAuthenticated)
            return;
        (0, menu_1.fetchUserMenus)()
            .then(function (menus) { return setRemoteMenus(menus); })
            .catch(function () { return setRemoteMenus(null); });
    }, [isAuthenticated]);
    // RBAC（ADR-0024）：菜单按当前用户角色过滤（本地回退路径）
    var access = (0, access_1.createAccess)(user);
    // 版别裁剪（ADR-0035）：hiddenMenus 前缀的菜单隐藏（如 dwjk 隐藏 CRM/进销存/财务/审批；
    // 非 eduTeacher 版别隐藏师资档案 /edu；非 showLegal 版别隐藏法律域 /legal）
    var hiddenMenus = (0, editions_1.getEditionHiddenMenus)((0, editions_1.getEdition)());
    var showLegal = (_a = (0, editions_1.getEdition)().showLegal) !== null && _a !== void 0 ? _a : false;
    var localRoutes = filterRoutes((_b = _defaultProps_1.default.route) === null || _b === void 0 ? void 0 : _b.routes, access, (0, access_1.derivePermissions)(user), hiddenMenus, showLegal);
    // 远程菜单树 → ProLayout route 格式（版别裁剪兜底 + 图标映射）
    var isEditionHidden = function (p) {
        return hiddenMenus.some(function (h) { return p === h || p.startsWith(h + '/'); }) ||
            (p.startsWith('/legal') && !showLegal) ||
            !(0, editions_1.isPathCapabilityEnabled)((0, editions_1.getEdition)(), p);
    };
    var toRoute = function (n) {
        var _a, _b;
        if (isEditionHidden(n.path))
            return null;
        var children = (_a = n.children) === null || _a === void 0 ? void 0 : _a.map(toRoute).filter(function (c) { return c !== null; });
        if (n.children && n.children.length > 0 && (!children || children.length === 0))
            return null;
        return {
            path: n.path,
            name: n.name,
            icon: (_b = ICON_MAP[n.icon]) !== null && _b !== void 0 ? _b : <icons_1.AppstoreOutlined />,
            routes: children && children.length > 0 ? children : undefined,
        };
    };
    var remoteRoutes = remoteMenus === null
        ? null
        : remoteMenus.map(toRoute).filter(function (r) { return r !== null; });
    var visibleRoutes = remoteRoutes && remoteRoutes.length > 0 ? remoteRoutes : localRoutes;
    var layoutProps = __assign(__assign({}, _defaultProps_1.default), { route: __assign(__assign({}, _defaultProps_1.default.route), { routes: visibleRoutes }) });
    return (<>
      {/* 左侧菜单样式：分组标题（主色+装饰竖线+间距）与菜单项（朴素）视觉区分 */}
      <style>{"\n        /* \u5206\u7EC4\u6807\u9898\uFF1A\u52A0\u7C97 + \u4E3B\u8272 + \u5DE6\u4FA7\u53D1\u5149\u7AD6\u7EBF + \u5206\u7EC4\u95F4\u8DDD */\n        .ant-pro-sider .ant-menu-item-group-title {\n          font-size: 14px !important;\n          font-weight: 700 !important;\n          color: #1677ff !important;\n          padding-left: 20px !important;\n          padding-top: 14px !important;\n          padding-bottom: 8px !important;\n          letter-spacing: 1px;\n          position: relative;\n        }\n        .ant-pro-sider .ant-menu-item-group-title::before {\n          content: '';\n          position: absolute;\n          left: 8px;\n          top: 50%;\n          transform: translateY(-50%);\n          width: 4px;\n          height: 14px;\n          border-radius: 2px;\n          background: linear-gradient(180deg, #1677ff, #69b1ff);\n          box-shadow: 0 0 6px rgba(22,119,255,0.4);\n        }\n        /* \u5206\u7EC4\u4E4B\u95F4\u7684\u7EC6\u5206\u9694\u7EBF */\n        .ant-pro-sider .ant-menu-item-group + .ant-menu-item-group {\n          border-top: 1px solid rgba(5, 10, 25, 0.06);\n          margin-top: 4px;\n        }\n        /* \u83DC\u5355\u9879\uFF1A\u6B63\u5E38 14px\uFF0Chover \u4E3B\u8272 */\n        .ant-pro-sider .ant-menu-item {\n          font-size: 14px !important;\n          border-radius: 6px;\n          margin: 2px 8px;\n        }\n        /* \u6697\u8272\u4E3B\u9898\u9002\u914D */\n        .ant-pro-sider.ant-layout-sider-dark .ant-menu-item-group-title,\n        .ant-pro-sider.ant-menu-dark .ant-menu-item-group-title {\n          color: #00bceb !important;\n        }\n        .ant-pro-sider.ant-menu-dark .ant-menu-item-group-title::before {\n          background: linear-gradient(180deg, #00e5ff, #00bceb) !important;\n          box-shadow: 0 0 8px rgba(0,188,235,0.5) !important;\n        }\n        .ant-pro-sider.ant-menu-dark .ant-menu-item-group + .ant-menu-item-group {\n          border-top: 1px solid rgba(255, 255, 255, 0.08);\n        }\n      "}</style>
      <pro_components_1.ProLayout {...layoutProps} location={location} menu={{ type: 'group' }} contentWidth="Fluid" fixedHeader fixSiderbar layout="mix" navTheme={resolvedTheme === 'dark' ? 'realDark' : 'light'} /* Phase 9 · 暗色主题 */ 
    /* Phase 9 · ProLayout 与 react-router 集成：items API 不内置点击导航，
     需要 menuItemRender 用 <Link> 包叶子项（保留右键新标签页 + a11y） */
    menuItemRender={function (item, dom) { return (item.path ? <react_router_dom_1.Link to={item.path}>{dom}</react_router_dom_1.Link> : dom); }} actionsRender={function () {
            var _a, _b;
            return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], (availableTenants.length > 1
                ? [
                    <antd_1.Dropdown key="tenant-switch" menu={{ items: tenantItems, selectedKeys: [(_a = user === null || user === void 0 ? void 0 : user.tenantCode) !== null && _a !== void 0 ? _a : ''] }} placement="bottomRight">
                  <antd_1.Button type="text" icon={<icons_1.ClusterOutlined />} data-testid="tenant-switch">
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {(_b = user === null || user === void 0 ? void 0 : user.tenantName) !== null && _b !== void 0 ? _b : user === null || user === void 0 ? void 0 : user.tenantCode}
                    </span>
                  </antd_1.Button>
                </antd_1.Dropdown>,
                ]
                : []), true), [
                /* 通知铃铛（未读数轮询 30s）—— 值班员也可见（通知与审批无关） */
                <NotificationBell_1.default key="notification-bell"/>
            ], false), ((0, editions_1.getEdition)().dutyConsole
                ? []
                : [
                    <antd_1.Badge key="approval-bell" count={approvalInbox} size="small" overflowCount={99} offset={[-2, 4]}>
                  <antd_1.Button type="text" icon={<icons_1.BellOutlined />} aria-label="审批待办" onClick={function () { return navigate('/approval/list'); }}/>
                </antd_1.Badge>,
                ]), true), [
                /* 主题切换（顶栏操作区） */
                <antd_1.Dropdown key="theme" menu={{
                        items: [
                            { key: 'light', label: '明亮', onClick: function () { return setThemeMode('light'); } },
                            { key: 'dark', label: '暗黑', onClick: function () { return setThemeMode('dark'); } },
                            { key: 'system', label: '跟随系统', onClick: function () { return setThemeMode('system'); } },
                        ],
                        selectedKeys: [themeMode],
                    }} placement="bottomRight">
            <antd_1.Button type="text" icon={resolvedTheme === 'dark' ? <icons_1.MoonOutlined /> : <icons_1.SunOutlined />} aria-label="切换主题" data-testid="theme-switcher"/>
          </antd_1.Dropdown>,
            ], false);
        }} avatarProps={user
            ? {
                render: function () { return (<antd_1.Dropdown menu={{ items: userMenu }} placement="bottomRight">
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: 8,
                    }}>
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background: '#1677ff',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                    }}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 14 }}>{user.username}</span>
                    </span>
                  </antd_1.Dropdown>); },
                size: 'small',
            }
            : { src: '', title: '', size: 'small' }}>
        {/* 内层 Suspense：路由懒加载时只换内容区，保住布局壳 */}
        <ui_1.ErrorBoundary>
          <react_1.Suspense fallback={<ui_1.PageLoading />}>
            <react_router_dom_1.Outlet />
          </react_1.Suspense>
        </ui_1.ErrorBoundary>
        {/* 开发者工具悬浮钮（右下角 · 调试面板） */}
        <DevTools_1.default />
      </pro_components_1.ProLayout>
    </>);
}
