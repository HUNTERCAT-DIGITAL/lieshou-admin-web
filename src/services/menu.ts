/**
 * 菜单数据驱动服务（ADR-0024 Phase 2 阶段 4 · 平台基础层）.
 *
 * GET /api/users/me/menus —— 当前用户菜单树（默认清单 ⊕ 租户覆盖 ⊕ 权限过滤，后端裁决）。
 * 走统一 api 封装（自动带 JWT）；gateway 注入 X-Tenant-Id / X-User-Permissions 到下游。
 */
import { api } from './api';
import type { MenuNode } from '@lieshoucloud/contract-types/business/menu';

/** GET /api/users/me/menus — 当前用户菜单树 */
export async function fetchUserMenus(): Promise<MenuNode[]> {
  const data = await api.get<MenuNode[]>('/users/me/menus');
  return Array.isArray(data) ? data : [];
}
