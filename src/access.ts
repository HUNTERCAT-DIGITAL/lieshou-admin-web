/**
 * 权限模型（ADR-0024 · RBAC · 权限码驱动 · 2026-08-25 平台基础层化）.
 *
 * 菜单可见性与接口鉴权共用权限码数据源（后端 permissions 表 / JWT permissions claim）：
 *   canManageTenant → tenant:manage · canUseLegal → legal:use …
 * 兼容：permissions 缺失（旧 token / 旧后端）时回退角色推导（Phase 8 逻辑）。
 */

import type { CurrentUser } from './types/auth';

export type Access = {
  /** 通用管理后台（登录即可见） */
  canSeeAdmin?: boolean;
  /** 平台级：租户管理 / 角色管理 */
  canManageTenant?: boolean;
  /** 租户级：用户管理（平台管理员或租户管理员） */
  canManageUsers?: boolean;
  /** 租户内业务：CRM 客户（所有登录用户） */
  canUseCrm?: boolean;
  /** 租户内业务：进销存（所有登录用户） */
  canUseInventory?: boolean;
  /** 租户内业务：财务记账（所有登录用户） */
  canUseFinance?: boolean;
  /** 租户内业务：审批流（所有登录用户） */
  canUseApproval?: boolean;
  /** 租户内业务：师资档案（zhiye 教育行业版 · 所有登录用户） */
  canUseEdu?: boolean;
  /** 租户内业务：法律能力域·案件管理（法律版显示，ADR-0036） */
  canUseLegal?: boolean;
  /** 租户内业务：物联网监控（值班员也可见：驾驶舱/总览/拓扑/告警） */
  canUseIot?: boolean;
  /** 物联网配置（设备管理/产品物模型/规则配置）：仅管理员，值班员隐藏 */
  canManageIotConfig?: boolean;
};

export const ROLE_PLATFORM_ADMIN = 'PLATFORM_ADMIN';
export const ROLE_TENANT_ADMIN = 'TENANT_ADMIN';
export const ROLE_DUTY_OFFICER = 'DUTY_OFFICER';

/** 从当前用户计算权限（权限码优先；permissions 缺失时回退角色推导） */
export function createAccess(user: CurrentUser | null): Access {
  if (!user) return {};
  const roles = user.roles ?? [];
  const perms = user.permissions ?? [];
  const has = (code: string) => perms.includes(code);

  // 权限码驱动（后端权威）——有权限码时不再用角色推导
  if (perms.length > 0) {
    return {
      canSeeAdmin: true,
      canManageTenant: has('tenant:manage'),
      canManageUsers: has('user:manage'),
      canUseCrm: has('crm:use'),
      canUseInventory: has('inventory:use'),
      canUseFinance: has('finance:use'),
      canUseApproval: has('approval:use'),
      canUseLegal: has('legal:use'),
      canUseIot: has('iot:monitor'),
      canManageIotConfig: has('iot:config'),
    };
  }

  // 回退：角色推导（旧 token / 旧后端）
  const isPlatformAdmin = roles.includes(ROLE_PLATFORM_ADMIN);
  const isTenantAdmin = isPlatformAdmin || roles.includes(ROLE_TENANT_ADMIN);
  const isDutyOfficer = roles.includes(ROLE_DUTY_OFFICER);
  return {
    canSeeAdmin: true,
    canManageTenant: isPlatformAdmin,
    canManageUsers: isTenantAdmin,
    canUseCrm: !isDutyOfficer,
    canUseInventory: !isDutyOfficer,
    canUseFinance: !isDutyOfficer,
    canUseApproval: !isDutyOfficer,
    canUseEdu: !isDutyOfficer,
    canUseLegal: !isDutyOfficer,
    canUseIot: true,
    canManageIotConfig: !isDutyOfficer,
  };
}

const initialAccess: Access = createAccess(null);

export default initialAccess;
