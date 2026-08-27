import { describe, expect, it } from 'vitest';

import { createAccess, derivePermissions, ROLE_PLATFORM_ADMIN, ROLE_TENANT_ADMIN } from './access';

describe('derivePermissions (角色 → 权限码 · 与后端 MenuService 一致性契约)', () => {
  // ⚠️ 单一事实源 = 后端 MenuService（ADR-0024 后端裁决）；本函数为菜单接口失败时的
  // 本地降级副本，映射必须与后端 MenuServiceTest 保持完全一致（改两端必须同步更新）。

  const USER_CODES = [
    'approval:use', 'crm:use', 'finance:use', 'inventory:use', 'audit:read',
    'iot:monitor', 'iot:config', 'legal:use',
  ];

  it('缺省/普通用户 → 业务全开 + iot + legal', () => {
    expect(derivePermissions(null)).toEqual([]);
    expect(derivePermissions({ userId: 1, username: 'u', roles: ['USER'] })).toEqual(USER_CODES);
  });

  it('租户管理员 → 增加用户管理', () => {
    const p = derivePermissions({ userId: 1, username: 'u', roles: ['TENANT_ADMIN'] });
    expect(p).toEqual([
      ...USER_CODES.slice(0, 5), 'user:manage', 'user:list', ...USER_CODES.slice(5),
    ]);
  });

  it('平台管理员 → 增加租户管理', () => {
    const p = derivePermissions({ userId: 1, username: 'u', roles: ['PLATFORM_ADMIN'] });
    expect(p).toEqual([
      ...USER_CODES.slice(0, 5), 'user:manage', 'user:list', 'tenant:manage', ...USER_CODES.slice(5),
    ]);
  });

  it('值班员 → 仅 iot:monitor + legal（与后端一致）', () => {
    const p = derivePermissions({ userId: 1, username: 'u', roles: ['DUTY_OFFICER'] });
    expect(p).toEqual(['iot:monitor', 'legal:use']);
  });

  it('有 permissions 字段 → 权限码驱动（不再角色推导）', () => {
    const p = derivePermissions({
      userId: 1,
      username: 'u',
      roles: ['PLATFORM_ADMIN'],
      permissions: ['crm:use'],
    });
    expect(p).toEqual(['crm:use']);
  });
});

describe('createAccess (RBAC · ADR-0024)', () => {
  it('未登录 → 无任何权限', () => {
    expect(createAccess(null)).toEqual({});
  });

  it('普通用户 → 仅通用后台 + 三大业务模块', () => {
    const a = createAccess({ userId: 1, username: 'u', roles: ['USER'] });
    expect(a.canSeeAdmin).toBe(true);
    expect(a.canUseCrm).toBe(true);
    expect(a.canUseInventory).toBe(true);
    expect(a.canUseFinance).toBe(true);
    expect(a.canManageTenant).toBeFalsy();
    expect(a.canManageUsers).toBeFalsy();
  });

  it('租户管理员 → 可管理本租户用户，不可管平台租户', () => {
    const a = createAccess({ userId: 2, username: 'admin', roles: [ROLE_TENANT_ADMIN] });
    expect(a.canManageUsers).toBe(true);
    expect(a.canManageTenant).toBeFalsy();
    expect(a.canUseCrm).toBe(true);
  });

  it('平台管理员 → 全量权限', () => {
    const a = createAccess({ userId: 3, username: 'ops', roles: [ROLE_PLATFORM_ADMIN] });
    expect(a.canManageTenant).toBe(true);
    expect(a.canManageUsers).toBe(true);
    expect(a.canUseCrm).toBe(true);
    expect(a.canSeeAdmin).toBe(true);
  });

  it('roles 缺失时按空数组处理（不抛错）', () => {
    const a = createAccess({ userId: 4, username: 'no-roles', roles: [] });
    expect(a.canManageTenant).toBeFalsy();
    expect(a.canManageUsers).toBeFalsy();
    expect(a.canUseCrm).toBe(true);
  });

  // ============================================================
  // 权限码驱动（ADR-0024 Phase 2 · 后端 permissions 权威）
  // ============================================================

  it('有 permissions → 权限码驱动（不再角色推导）', () => {
    const a = createAccess({
      userId: 5,
      username: 'lawyer',
      roles: ['USER'],
      permissions: ['legal:use', 'crm:use'],
    });
    expect(a.canUseLegal).toBe(true);
    expect(a.canUseCrm).toBe(true);
    // 未授予的权限码 → false（即使角色是 USER 也不给）
    expect(a.canManageTenant).toBeFalsy();
    expect(a.canUseFinance).toBeFalsy();
    expect(a.canManageIotConfig).toBeFalsy();
  });

  it('值班员权限码：仅 iot:monitor（无 iot:config / 业务域）', () => {
    const a = createAccess({
      userId: 6,
      username: 'duty',
      roles: ['DUTY_OFFICER'],
      permissions: ['iot:monitor'],
    });
    expect(a.canUseIot).toBe(true);
    expect(a.canManageIotConfig).toBeFalsy();
    expect(a.canUseLegal).toBeFalsy();
    expect(a.canUseCrm).toBeFalsy();
  });

  it('平台管理员权限码 → 全量', () => {
    const a = createAccess({
      userId: 7,
      username: 'ops',
      roles: [],
      permissions: [
        'tenant:manage',
        'user:manage',
        'user:list',
        'crm:use',
        'inventory:use',
        'finance:use',
        'approval:use',
        'legal:use',
        'iot:monitor',
        'iot:config',
      ],
    });
    expect(a.canManageTenant).toBe(true);
    expect(a.canManageUsers).toBe(true);
    expect(a.canUseLegal).toBe(true);
    expect(a.canUseIot).toBe(true);
    expect(a.canManageIotConfig).toBe(true);
  });
});
