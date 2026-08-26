/**
 * EditionGuard - 路由级版别裁剪守卫（ADR-0035 · 配置层）.
 *
 * hiddenMenus 里配置的路径前缀在菜单中已隐藏；直接敲 URL 仍可进入，
 * 本组件兜底：命中隐藏前缀 → 渲染 404（页面不存在，而非 403，避免暴露功能存在）。
 */
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { getEdition, getEditionHiddenMenus } from '../config/editions';
import NotFound from '../pages/NotFound';

export function EditionGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const edition = getEdition();
  const hiddenMenus = getEditionHiddenMenus(edition);
  const hidden = hiddenMenus.some(
    (h) => pathname === h || pathname.startsWith(h + '/') || pathname.startsWith(h + '?'),
  );
  // 法律能力域（ADR-0036）：仅 showLegal 版别（layer/legalmind）可访问 /legal/**
  const legalHidden = pathname.startsWith('/legal') && !(edition.showLegal ?? false);
  return hidden || legalHidden ? <NotFound /> : <>{children}</>;
}
