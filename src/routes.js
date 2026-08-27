"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
/**
 * Routes (Phase 5 + Phase 8 + Phase 9).
 *
 * /       — 公开：门户介绍页（获客入口）
 * /login  — 公开
 * 其他    — AuthGuard 保护（管理后台）
 * Phase 9：路由级懒加载（包体积）+ AccessGuard（权限兜底，防直接敲 URL）+ 403/404
 *
 * dwjk 合并说明（2026-08-24）：主仓库 5 条 IoT 路由（监控总览/设备/产品/规则/告警）+
 * dwjk 功能裁剪 EditionGuard（CRM/线索/进销存/财务按版别隐藏）；旧 IoT 路由
 * （/iot/device/list 等）已被主仓库新页面取代，不再保留。
 */
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var editions_1 = require("./config/editions");
var AccessGuard_1 = require("./components/AccessGuard");
var EditionGuard_1 = require("./components/EditionGuard");
var ui_1 = require("@lieshoucloud/ui");
var BasicLayout_1 = require("./layouts/BasicLayout");
var auth_1 = require("./stores/auth");
// 路由级懒加载：首屏只加载当前页 chunk，antd/pro 进 vendor 缓存
var Admin = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Admin'); }); });
var ApprovalList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Approval/List'); }); });
var AuditList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Audit/List'); }); });
var CustomerDetail = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Customer/Detail'); }); });
var CustomerList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Customer/List'); }); });
var CustomerSuccess = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Customer/Success'); }); });
var LeadList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Lead/List'); }); });
var ContactList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Contact/List'); }); });
var ContractList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Contract/List'); }); });
var MemberList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Member/List'); }); });
var Forbidden = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Forbidden'); }); });
var FinanceList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Finance/List'); }); });
var InventoryList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Inventory/List'); }); });
var QualityList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Quality/List'); }); });
var Login = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Login'); }); });
var RegisterTenant = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/RegisterTenant'); }); });
var NotFound = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/NotFound'); }); });
var NotificationList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Notification/List'); }); });
var Portal = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Portal'); }); });
var Profile = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Profile'); }); });
var RoleList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Role/List'); }); });
var TenantList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Tenant/List'); }); });
var UserList = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/User/List'); }); });
var Welcome = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./pages/Welcome'); }); });
/** 客户专属路由槽（extraRoutes · 2026-09 客户聚合仓）：内容由客户仓注入 */
function ExtraRoute(_a) {
    var route = _a.route;
    var _b = (0, react_1.useState)(null), Comp = _b[0], setComp = _b[1];
    (0, react_1.useEffect)(function () {
        route
            .load()
            .then(function (m) { return setComp(function () { return m.default; }); })
            .catch(function () { return setComp(null); });
    }, [route]);
    return Comp ? <Comp /> : <ui_1.PageLoading />;
}
var EXTRA_ROUTES = (_a = (0, editions_1.getExtraEdition)().extraRoutes) !== null && _a !== void 0 ? _a : [];
/**
 * 受保护布局：认证状态由端内 auth store 读取，注入共享 AuthGuard（L1-1 · 受控版）.
 */
function ProtectedLayout() {
    var isAuthenticated = (0, auth_1.useAuthStore)(function (s) { return s.isAuthenticated; });
    return (<ui_1.AuthGuard isAuthenticated={isAuthenticated}>
      <BasicLayout_1.default />
    </ui_1.AuthGuard>);
}
exports.routes = (<react_1.Suspense fallback={<ui_1.PageLoading />}>
    <react_router_dom_1.Routes>
      {/* 公开: 门户（获客）+ 登录 + 租户自助开通 */}
      <react_router_dom_1.Route path="/" element={<Portal />}/>
      <react_router_dom_1.Route path="/login" element={<Login />}/>
      <react_router_dom_1.Route path="/register" element={<RegisterTenant />}/>

      {/* 受保护: 走 BasicLayout + AuthGuard */}
      <react_router_dom_1.Route element={<ProtectedLayout />}>
        <react_router_dom_1.Route path="/welcome" element={<Welcome />}/>
        <react_router_dom_1.Route path="/admin" element={<Admin />}/>
        <react_router_dom_1.Route path="/profile" element={<Profile />}/>
        <react_router_dom_1.Route path="/notification" element={<NotificationList />}/>
        <react_router_dom_1.Route path="/tenant/list" element={<AccessGuard_1.AccessGuard access="canManageTenant">
              <TenantList />
            </AccessGuard_1.AccessGuard>}/>
        <react_router_dom_1.Route path="/role/list" element={<AccessGuard_1.AccessGuard access="canManageTenant">
              <RoleList />
            </AccessGuard_1.AccessGuard>}/>
        <react_router_dom_1.Route path="/audit/list" element={<AccessGuard_1.AccessGuard access="canManageTenant">
              <AuditList />
            </AccessGuard_1.AccessGuard>}/>
        <react_router_dom_1.Route path="/user/list" element={<AccessGuard_1.AccessGuard access="canManageUsers">
              <UserList />
            </AccessGuard_1.AccessGuard>}/>
        <react_router_dom_1.Route path="/customer/list" element={<EditionGuard_1.EditionGuard>
              <CustomerList />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/customer/detail/:id" element={<EditionGuard_1.EditionGuard>
              <CustomerDetail />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/customer/success" element={<EditionGuard_1.EditionGuard>
              <CustomerSuccess />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/lead/list" element={<EditionGuard_1.EditionGuard>
              <LeadList />
            </EditionGuard_1.EditionGuard>}/>
        {/* CRM 联系人/合同/会员（saas 行业线合并回 dev） */}
        <react_router_dom_1.Route path="/contact/list" element={<EditionGuard_1.EditionGuard>
              <ContactList />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/contract/list" element={<EditionGuard_1.EditionGuard>
              <ContractList />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/member/list" element={<EditionGuard_1.EditionGuard>
              <MemberList />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/inventory/list" element={<EditionGuard_1.EditionGuard>
              <InventoryList />
            </EditionGuard_1.EditionGuard>}/>
        {/* ADR-0037 · 质检追溯（jmzz 行业线合并回 dev） */}
        <react_router_dom_1.Route path="/quality/list" element={<QualityList />}/>
        <react_router_dom_1.Route path="/finance/list" element={<EditionGuard_1.EditionGuard>
              <FinanceList />
            </EditionGuard_1.EditionGuard>}/>
        <react_router_dom_1.Route path="/approval/list" element={<EditionGuard_1.EditionGuard>
              <AccessGuard_1.AccessGuard access="canUseApproval">
                <ApprovalList />
              </AccessGuard_1.AccessGuard>
            </EditionGuard_1.EditionGuard>}/>
        {EXTRA_ROUTES.map(function (r) { return (<react_router_dom_1.Route key={r.path} path={r.path} element={<ExtraRoute route={r}/>}/>); })}
        <react_router_dom_1.Route path="/403" element={<Forbidden />}/>
        <react_router_dom_1.Route path="*" element={<NotFound />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>
  </react_1.Suspense>);
