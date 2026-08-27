/**
 * 门户页（Phase 8 · 获客入口）.
 *
 * 未登录访问 / 时展示：版别专属门户（edition.portal，如 LieShouBoot 产品介绍页）优先，
 * 缺省回退 GenericPortal（平台通用门户）。
 * 行业/客户版门户由客户仓经 edition.portal / extraRoutes 注入（2026-09 客户聚合仓模式）。
 */

import { lazy, Suspense, type ComponentType } from 'react';

import GenericPortal from './portal/GenericPortal';
import { getEdition } from '../config/editions';

export default function Portal() {
  const edition = getEdition();

  // 版别专属门户组件（懒加载）；缺省用通用门户
  const portalLoad = edition.portal?.load;
  const PortalComponent: ComponentType = portalLoad
    ? lazy(portalLoad as () => Promise<{ default: ComponentType }>)
    : GenericPortal;

  return (
    <Suspense fallback={null}>
      <PortalComponent />
    </Suspense>
  );
}
