/**
 * 管理后台 · 欢迎页（公开 · 未登录首个页面 2026-08-31）.
 *
 * 访问流程：欢迎页 → /portal 门户页 → /login 登录页；退出登录回门户页。
 * 已登录访问自动直达工作台（edition.homePath ?? /home）。
 */
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';

export default function WelcomePage() {
  const edition = getEdition();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const homePath = edition.homePath ?? '/home';

  // 已登录 → 直达工作台
  if (isAuthenticated) return <Navigate to={homePath} replace />;

  return (
    <div className="welcome-page">
      <div className="welcome-inner">
        {edition.logo && (
          <img
            className="welcome-logo"
            src={`${import.meta.env.BASE_URL}${edition.logo.replace(/^\//, '')}`}
            alt={edition.brandName}
          />
        )}
        <h1 className="welcome-brand">{edition.brandName}</h1>
        {edition.slogan && <p className="welcome-slogan">{edition.slogan}</p>}
        <div className="welcome-actions">
          <button type="button" className="portal-cta" onClick={() => navigate('/portal')}>
            进入门户
          </button>
        </div>
        <p className="welcome-tip">统一认证 · 数据按租户隔离 · 猎手云 LieShouCloud</p>
      </div>
    </div>
  );
}
