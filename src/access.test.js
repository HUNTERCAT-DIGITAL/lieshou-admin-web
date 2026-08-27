"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var access_1 = require("./access");
(0, vitest_1.describe)('createAccess (RBAC · ADR-0024)', function () {
    (0, vitest_1.it)('未登录 → 无任何权限', function () {
        (0, vitest_1.expect)((0, access_1.createAccess)(null)).toEqual({});
    });
    (0, vitest_1.it)('普通用户 → 仅通用后台 + 三大业务模块', function () {
        var a = (0, access_1.createAccess)({ userId: 1, username: 'u', roles: ['USER'] });
        (0, vitest_1.expect)(a.canSeeAdmin).toBe(true);
        (0, vitest_1.expect)(a.canUseCrm).toBe(true);
        (0, vitest_1.expect)(a.canUseInventory).toBe(true);
        (0, vitest_1.expect)(a.canUseFinance).toBe(true);
        (0, vitest_1.expect)(a.canManageTenant).toBeFalsy();
        (0, vitest_1.expect)(a.canManageUsers).toBeFalsy();
    });
    (0, vitest_1.it)('租户管理员 → 可管理本租户用户，不可管平台租户', function () {
        var a = (0, access_1.createAccess)({ userId: 2, username: 'admin', roles: [access_1.ROLE_TENANT_ADMIN] });
        (0, vitest_1.expect)(a.canManageUsers).toBe(true);
        (0, vitest_1.expect)(a.canManageTenant).toBeFalsy();
        (0, vitest_1.expect)(a.canUseCrm).toBe(true);
    });
    (0, vitest_1.it)('平台管理员 → 全量权限', function () {
        var a = (0, access_1.createAccess)({ userId: 3, username: 'ops', roles: [access_1.ROLE_PLATFORM_ADMIN] });
        (0, vitest_1.expect)(a.canManageTenant).toBe(true);
        (0, vitest_1.expect)(a.canManageUsers).toBe(true);
        (0, vitest_1.expect)(a.canUseCrm).toBe(true);
        (0, vitest_1.expect)(a.canSeeAdmin).toBe(true);
    });
    (0, vitest_1.it)('roles 缺失时按空数组处理（不抛错）', function () {
        var a = (0, access_1.createAccess)({ userId: 4, username: 'no-roles', roles: [] });
        (0, vitest_1.expect)(a.canManageTenant).toBeFalsy();
        (0, vitest_1.expect)(a.canManageUsers).toBeFalsy();
        (0, vitest_1.expect)(a.canUseCrm).toBe(true);
    });
    // ============================================================
    // 权限码驱动（ADR-0024 Phase 2 · 后端 permissions 权威）
    // ============================================================
    (0, vitest_1.it)('有 permissions → 权限码驱动（不再角色推导）', function () {
        var a = (0, access_1.createAccess)({
            userId: 5,
            username: 'lawyer',
            roles: ['USER'],
            permissions: ['legal:use', 'crm:use'],
        });
        (0, vitest_1.expect)(a.canUseLegal).toBe(true);
        (0, vitest_1.expect)(a.canUseCrm).toBe(true);
        // 未授予的权限码 → false（即使角色是 USER 也不给）
        (0, vitest_1.expect)(a.canManageTenant).toBeFalsy();
        (0, vitest_1.expect)(a.canUseFinance).toBeFalsy();
        (0, vitest_1.expect)(a.canManageIotConfig).toBeFalsy();
    });
    (0, vitest_1.it)('值班员权限码：仅 iot:monitor（无 iot:config / 业务域）', function () {
        var a = (0, access_1.createAccess)({
            userId: 6,
            username: 'duty',
            roles: ['DUTY_OFFICER'],
            permissions: ['iot:monitor'],
        });
        (0, vitest_1.expect)(a.canUseIot).toBe(true);
        (0, vitest_1.expect)(a.canManageIotConfig).toBeFalsy();
        (0, vitest_1.expect)(a.canUseLegal).toBeFalsy();
        (0, vitest_1.expect)(a.canUseCrm).toBeFalsy();
    });
    (0, vitest_1.it)('平台管理员权限码 → 全量', function () {
        var a = (0, access_1.createAccess)({
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
        (0, vitest_1.expect)(a.canManageTenant).toBe(true);
        (0, vitest_1.expect)(a.canManageUsers).toBe(true);
        (0, vitest_1.expect)(a.canUseLegal).toBe(true);
        (0, vitest_1.expect)(a.canUseIot).toBe(true);
        (0, vitest_1.expect)(a.canManageIotConfig).toBe(true);
    });
});
