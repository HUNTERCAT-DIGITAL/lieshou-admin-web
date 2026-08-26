/**
 * 门户页（Phase 8 · 获客入口）.
 *
 * 未登录访问 / 时展示：GenericPortal（平台通用门户）。
 * 行业/客户版门户由客户仓经 extraRoutes 注入（2026-09 客户聚合仓模式）。
 */

import GenericPortal from './portal/GenericPortal';

export default function Portal() {
  return <GenericPortal />;
}
