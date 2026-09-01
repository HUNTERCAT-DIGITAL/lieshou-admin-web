/**
 * 管理后台 · 路由装配（端自身骨架 · 登录态来自 core-web useAuthStore）.
 * /login 登录页；/、/home 启动页（登录守卫）；客户 extraRoutes 懒加载注入。
 * 有客户菜单声明（或 dutyConsole 值班员模式）时套 ProLayout 控制台壳；
 * 无菜单版别（generic 骨架）保持扁平路由。
 */
import { Suspense, lazy, useEffect, useMemo, type ComponentType } from 'react';
import AppErrorBoundary from './components/AppErrorBoundary';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from './config/editions';
import ConsoleLayout, { shouldUseConsole } from './layout/ConsoleLayout';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import ActivatePage from './pages/ActivatePage';
import PortalPage from './pages/PortalPage';
import ProfilePage from './pages/ProfilePage';

/** 客户注入路由的懒加载出口 */
function LazyRoute({ load }: { load: () => Promise<{ default: ComponentType }> }) {
  // useMemo 缓存 lazy 组件：避免每次渲染重建组件身份（否则叠加 v7 BrowserRouter
  // 默认 startTransition 导航，懒加载页面内 navigate/Link 会挂起并卡在旧 UI · E13）
  const Lazy = useMemo(() => lazy(load), [load]);
  return (
    <Suspense fallback={<div className="page-loading">加载中…</div>}>
      {/* 错误边界：发布后旧 chunk 404 → 中文提示刷新（2026-09-01） */}
      <AppErrorBoundary>
        <Lazy />
      </AppErrorBoundary>
    </Suspense>
  );
}

/** 登录守卫：required=false（游客直达）时放行 */
function RequireAuth() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const required = edition.login?.required !== false;
  if (required && !isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * 会话过期主动检测（2026-09-01）：无 API 请求的页面也到点自动退出。
 * 首次登录解析 accessToken 的 exp 固定 deadline（登录时间到期即退出，
 * 不随 refresh 续期重置倒计时），每 2 秒检查；到点 logout + 跳登录。
 */
function SessionGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    const tok = useAuthStore.getState().accessToken;
    if (!tok) return;
    let exp = 0;
    try {
      exp = (JSON.parse(atob(tok.split('.')[1])) as { exp?: number }).exp ?? 0;
    } catch {
      return;
    }
    if (!exp) return;
    const deadline = exp * 1000;
    const check = () => {
      if (Date.now() >= deadline) {
        logout();
        navigate('/login', { replace: true });
      }
    };
    check();
    const t = setInterval(check, 2000);
    return () => clearInterval(t);
  }, [isAuthenticated, logout, navigate]);

  return null;
}

export default function App() {
  const edition = getEdition();
  const extraRoutes = edition.extraRoutes ?? [];
  const useConsole = shouldUseConsole(edition);
  const fallbackPath = edition.homePath ?? '/home';

  // 工作台/首页：客户可注入 path='/' 或 '/home' 覆盖骨架 HomePage
  const homeRoute = extraRoutes.find((r) => r.path === '/' || r.path === '/home');
  const homeElement = homeRoute ? <LazyRoute load={homeRoute.load} /> : <HomePage />;

  const layoutRoutes = extraRoutes.filter(
    (r) => !r.standalone && r.path !== '/' && r.path !== '/home',
  );
  const standaloneRoutes = extraRoutes.filter((r) => r.standalone);

  const layoutChildren = (
    <>
      <Route path="/" element={homeElement} />
      <Route path="/home" element={homeElement} />
      <Route path="about" element={<AboutPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="users" element={<UsersPage />} />
      {layoutRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path.replace(/^\//, '')}
          element={<LazyRoute load={r.load} />}
        />
      ))}
    </>
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      {/* 会话过期主动检测（无请求页面也到点退出） */}
      <SessionGuard />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route element={<RequireAuth />}>
          {useConsole ? <Route element={<ConsoleLayout />}>{layoutChildren}</Route> : layoutChildren}
        </Route>
        {standaloneRoutes.map((r) => (
          <Route
            key={r.path}
            path={r.path.replace(/^\//, '')}
            element={<LazyRoute load={r.load} />}
          />
        ))}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
