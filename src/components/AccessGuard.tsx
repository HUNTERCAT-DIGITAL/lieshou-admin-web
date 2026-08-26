/**
 * AccessGuard - 路由级权限守卫（Phase 9 · P0 体验硬伤）.
 *
 * 菜单按角色隐藏后，直接敲 URL 仍可进入受保护路由；本组件做兜底：
 * 无权限 → 渲染 403 页（而非跳转，避免与 BasicLayout 异步 fetchMe 的角色刷新竞争；
 * 角色刷新完成后自动转为渲染内容）。
 */
import type { ReactNode } from 'react';

import { createAccess, type Access } from '../access';
import Forbidden from '../pages/Forbidden';
import { useAuthStore } from '../stores/auth';

export function AccessGuard({
  access: required,
  children,
}: {
  access: keyof Access;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const granted = Boolean(createAccess(user)[required]);
  return granted ? <>{children}</> : <Forbidden />;
}
