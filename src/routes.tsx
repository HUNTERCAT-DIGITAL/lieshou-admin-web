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
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';

import { getExtraEdition } from './config/editions';
import type { EditionExtraRoute } from './config/editions';
import { AccessGuard } from './components/AccessGuard';
import { AuthGuard } from './components/AuthGuard';
import { EditionGuard } from './components/EditionGuard';
import PageLoading from './components/PageLoading';
import BasicLayout from './layouts/BasicLayout';

// 路由级懒加载：首屏只加载当前页 chunk，antd/pro 进 vendor 缓存
const Admin = lazy(() => import('./pages/Admin'));
const ApprovalList = lazy(() => import('./pages/Approval/List'));
const AuditList = lazy(() => import('./pages/Audit/List'));
const CustomerDetail = lazy(() => import('./pages/Customer/Detail'));
const CustomerList = lazy(() => import('./pages/Customer/List'));
const CustomerSuccess = lazy(() => import('./pages/Customer/Success'));
const LeadList = lazy(() => import('./pages/Lead/List'));
const ContactList = lazy(() => import('./pages/Contact/List'));
const ContractList = lazy(() => import('./pages/Contract/List'));
const MemberList = lazy(() => import('./pages/Member/List'));
const TeacherList = lazy(() => import('./pages/Edu/Teacher/List'));
const DispatchList = lazy(() => import('./pages/Edu/Dispatch/List'));
const SupplyList = lazy(() => import('./pages/Edu/Supply/List'));
const ConsumptionList = lazy(() => import('./pages/Edu/Consumption/List'));
const SettlementList = lazy(() => import('./pages/Edu/Settlement/List'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const FinanceList = lazy(() => import('./pages/Finance/List'));
const InventoryList = lazy(() => import('./pages/Inventory/List'));
const CaseList = lazy(() => import('./pages/Legal/CaseList'));
const CaseDetail = lazy(() => import('./pages/Legal/CaseDetail'));
const ClientSuccessCenter = lazy(() => import('./pages/Legal/ClientSuccessCenter'));
const MatterCalendar = lazy(() => import('./pages/Legal/MatterCalendar'));
const EnablementCenter = lazy(() => import('./pages/Legal/EnablementCenter'));
const GovernanceCenter = lazy(() => import('./pages/Legal/GovernanceCenter'));
const KnowledgeCenter = lazy(() => import('./pages/Legal/KnowledgeCenter'));
const GrowthCenter = lazy(() => import('./pages/Legal/GrowthCenter'));
const IotOverview = lazy(() => import('./pages/IoT/Overview'));
const IotCockpit = lazy(() => import('./pages/IoT/Cockpit'));
const IotProducts = lazy(() => import('./pages/IoT/Products'));
const IotDevices = lazy(() => import('./pages/IoT/Devices'));
const IotRules = lazy(() => import('./pages/IoT/Rules'));
const IotAlerts = lazy(() => import('./pages/IoT/Alerts'));
const IotTopo = lazy(() => import('./pages/IoT/Topo'));
const QualityList = lazy(() => import('./pages/Quality/List'));
const Login = lazy(() => import('./pages/Login'));
const RegisterTenant = lazy(() => import('./pages/RegisterTenant'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Portal = lazy(() => import('./pages/Portal'));
const Profile = lazy(() => import('./pages/Profile'));
const RoleList = lazy(() => import('./pages/Role/List'));
const TenantList = lazy(() => import('./pages/Tenant/List'));
const UserList = lazy(() => import('./pages/User/List'));
const Welcome = lazy(() => import('./pages/Welcome'));

/** 客户专属路由槽（extraRoutes · 2026-09 客户聚合仓）：内容由客户仓注入 */
function ExtraRoute({ route }: { route: EditionExtraRoute }) {
  const [Comp, setComp] = useState<ComponentType | null>(null);
  useEffect(() => {
    route
      .load()
      .then((m) => setComp(() => m.default))
      .catch(() => setComp(null));
  }, [route]);
  return Comp ? <Comp /> : <PageLoading />;
}

const EXTRA_ROUTES = getExtraEdition().extraRoutes ?? [];

export const routes = (
  <Suspense fallback={<PageLoading />}>
    <Routes>
      {/* 公开: 门户（获客）+ 登录 + 租户自助开通 */}
      <Route path="/" element={<Portal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterTenant />} />

      {/* 受保护: 走 BasicLayout + AuthGuard */}
      <Route
        element={
          <AuthGuard>
            <BasicLayout />
          </AuthGuard>
        }
      >
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/tenant/list"
          element={
            <AccessGuard access="canManageTenant">
              <TenantList />
            </AccessGuard>
          }
        />
        <Route
          path="/role/list"
          element={
            <AccessGuard access="canManageTenant">
              <RoleList />
            </AccessGuard>
          }
        />
        <Route
          path="/audit/list"
          element={
            <AccessGuard access="canManageTenant">
              <AuditList />
            </AccessGuard>
          }
        />
        <Route
          path="/user/list"
          element={
            <AccessGuard access="canManageUsers">
              <UserList />
            </AccessGuard>
          }
        />
        <Route
          path="/customer/list"
          element={
            <EditionGuard>
              <CustomerList />
            </EditionGuard>
          }
        />
        <Route
          path="/customer/detail/:id"
          element={
            <EditionGuard>
              <CustomerDetail />
            </EditionGuard>
          }
        />
        <Route
          path="/customer/success"
          element={
            <EditionGuard>
              <CustomerSuccess />
            </EditionGuard>
          }
        />
        <Route
          path="/lead/list"
          element={
            <EditionGuard>
              <LeadList />
            </EditionGuard>
          }
        />
        {/* CRM 联系人/合同/会员（saas 行业线合并回 dev） */}
        <Route
          path="/contact/list"
          element={
            <EditionGuard>
              <ContactList />
            </EditionGuard>
          }
        />
        <Route
          path="/edu/teacher/list"
          element={
            <EditionGuard>
              <TeacherList />
            </EditionGuard>
          }
        />
        <Route
          path="/contract/list"
          element={
            <EditionGuard>
              <ContractList />
            </EditionGuard>
          }
        />
        <Route
          path="/edu/dispatch/list"
          element={
            <EditionGuard>
              <DispatchList />
            </EditionGuard>
          }
        />
        <Route
          path="/member/list"
          element={
            <EditionGuard>
              <MemberList />
            </EditionGuard>
          }
        />
        <Route
          path="/edu/supply/list"
          element={
            <EditionGuard>
              <SupplyList />
            </EditionGuard>
          }
        />
        <Route
          path="/edu/consumption/list"
          element={
            <EditionGuard>
              <ConsumptionList />
            </EditionGuard>
          }
        />
        <Route
          path="/edu/settlement/list"
          element={
            <EditionGuard>
              <SettlementList />
            </EditionGuard>
          }
        />
        <Route
          path="/inventory/list"
          element={
            <EditionGuard>
              <InventoryList />
            </EditionGuard>
          }
        />
        {/* ADR-0037 · 质检追溯（jmzz 行业线合并回 dev） */}
        <Route path="/quality/list" element={<QualityList />} />
        <Route
          path="/finance/list"
          element={
            <EditionGuard>
              <FinanceList />
            </EditionGuard>
          }
        />
        <Route path="/iot/overview" element={<IotOverview />} />
        <Route path="/iot/cockpit" element={<IotCockpit />} />
        <Route
          path="/iot/products"
          element={
            <AccessGuard access="canManageIotConfig">
              <IotProducts />
            </AccessGuard>
          }
        />
        <Route
          path="/iot/devices"
          element={
            <AccessGuard access="canManageIotConfig">
              <IotDevices />
            </AccessGuard>
          }
        />
        <Route
          path="/iot/rules"
          element={
            <AccessGuard access="canManageIotConfig">
              <IotRules />
            </AccessGuard>
          }
        />
        <Route path="/iot/alerts" element={<IotAlerts />} />
        <Route path="/iot/topo" element={<IotTopo />} />
        <Route
          path="/approval/list"
          element={
            <EditionGuard>
              <AccessGuard access="canUseApproval">
                <ApprovalList />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/cases"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <CaseList />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/cases/:id"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <CaseDetail />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/knowledge"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <KnowledgeCenter />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/clients"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <ClientSuccessCenter />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/calendar"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <MatterCalendar />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/enablement"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <EnablementCenter />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/governance"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <GovernanceCenter />
              </AccessGuard>
            </EditionGuard>
          }
        />
        <Route
          path="/legal/growth"
          element={
            <EditionGuard>
              <AccessGuard access="canUseLegal">
                <GrowthCenter />
              </AccessGuard>
            </EditionGuard>
          }
        />
        {EXTRA_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<ExtraRoute route={r} />} />
        ))}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);
