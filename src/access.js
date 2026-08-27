"use strict";
/**
 * 权限模型（ADR-0024 · RBAC · 权限码驱动 · 2026-08-25 平台基础层化）.
 *
 * 菜单可见性与接口鉴权共用权限码数据源（后端 permissions 表 / JWT permissions claim）：
 *   canManageTenant → tenant:manage · canUseLegal → legal:use …
 * 兼容：permissions 缺失（旧 token / 旧后端）时回退角色推导（Phase 8 逻辑）。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_DUTY_OFFICER = exports.ROLE_TENANT_ADMIN = exports.ROLE_PLATFORM_ADMIN = void 0;
exports.derivePermissions = derivePermissions;
exports.createAccess = createAccess;
exports.ROLE_PLATFORM_ADMIN = 'PLATFORM_ADMIN';
exports.ROLE_TENANT_ADMIN = 'TENANT_ADMIN';
exports.ROLE_DUTY_OFFICER = 'DUTY_OFFICER';
/**
 * 角色 → 权限码列表（permissions 缺失时回退，与 createAccess 角色推导语义对齐）。
 *
 * 菜单（BasicLayout filterRoutes）按权限码数组过滤；后端暂不返回 permissions 时
 * 用角色推导保证菜单完整（对齐 access.ts 的 access 推导）。
 */
function derivePermissions(user) {
    var _a, _b;
    if (!user)
        return [];
    var perms = (_a = user.permissions) !== null && _a !== void 0 ? _a : [];
    if (perms.length > 0)
        return perms;
    var roles = (_b = user.roles) !== null && _b !== void 0 ? _b : [];
    var isPlatformAdmin = roles.includes(exports.ROLE_PLATFORM_ADMIN);
    var isTenantAdmin = isPlatformAdmin || roles.includes(exports.ROLE_TENANT_ADMIN);
    var isDutyOfficer = roles.includes(exports.ROLE_DUTY_OFFICER);
    // 租户内业务（非值班员）：审批流/CRM/进销存/财务/审计入口
    var tenantBiz = ['approval:use', 'crm:use', 'finance:use', 'inventory:use', 'audit:read'];
    var codes = isDutyOfficer ? [] : tenantBiz;
    if (isTenantAdmin)
        codes.push('user:manage', 'user:list');
    if (isPlatformAdmin)
        codes.push('tenant:manage');
    // 物联网（值班员只读监控 + 管理员配置）
    codes.push('iot:monitor');
    if (!isDutyOfficer)
        codes.push('iot:config');
    // 法律能力域（layer 版启用；generic 版菜单已被 hiddenMenus 裁剪，不影响）
    codes.push('legal:use');
    return codes;
}
/** 从当前用户计算权限（权限码优先；permissions 缺失时回退角色推导） */
function createAccess(user) {
    var _a, _b;
    if (!user)
        return {};
    var roles = (_a = user.roles) !== null && _a !== void 0 ? _a : [];
    var perms = (_b = user.permissions) !== null && _b !== void 0 ? _b : [];
    var has = function (code) { return perms.includes(code); };
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
    var isPlatformAdmin = roles.includes(exports.ROLE_PLATFORM_ADMIN);
    var isTenantAdmin = isPlatformAdmin || roles.includes(exports.ROLE_TENANT_ADMIN);
    var isDutyOfficer = roles.includes(exports.ROLE_DUTY_OFFICER);
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
var initialAccess = createAccess(null);
exports.default = initialAccess;
