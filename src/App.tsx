/**
 * 管理后台 · 路由装配（端自身骨架 · 登录态来自 core-web useAuthStore）
 * /login 登录页；/、/home 启动页（登录守卫）；客户 extraRoutes 懒加载注入。
 */
import { Suspense, lazy, type ComponentType } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from './config/editions';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

/** 客户注入路由的懒加载出口 */
function LazyRoute({ load }: { load: () => Promise<{ default: ComponentType }> }) {
  const Lazy = lazy(load);
  return (
    <Suspense fallback={<div className="page-loading">加载中…</div>}>
      <Lazy />
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

export default function App() {
  const edition = getEdition();
  const extraRoutes = edition.extraRoutes ?? [];
  const layoutRoutes = extraRoutes.filter((r) => !r.standalone);
  const standaloneRoutes = extraRoutes.filter((r) => r.standalone);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          {layoutRoutes.map((r) => (
            <Route
              key={r.path}
              path={r.path.replace(/^\//, '')}
              element={<LazyRoute load={r.load} />}
            />
          ))}
        </Route>
        {standaloneRoutes.map((r) => (
          <Route
            key={r.path}
            path={r.path.replace(/^\//, '')}
            element={<LazyRoute load={r.load} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
