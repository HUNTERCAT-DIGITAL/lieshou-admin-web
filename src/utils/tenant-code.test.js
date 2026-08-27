"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * tenant-code localStorage 工具单测（Phase 9 · 登录体验）.
 */
var vitest_1 = require("vitest");
var tenant_code_1 = require("./tenant-code");
(0, vitest_1.afterEach)(function () {
    localStorage.clear();
});
(0, vitest_1.describe)('getTenantCode', function () {
    (0, vitest_1.it)('空 localStorage → 默认 jxlkas', function () {
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe(tenant_code_1.DEFAULT_TENANT_CODE);
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe('jxlkas');
    });
    (0, vitest_1.it)('有值 → 返回记忆值', function () {
        localStorage.setItem(tenant_code_1.TENANT_CODE_STORAGE_KEY, 'acme');
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe('acme');
    });
    (0, vitest_1.it)('空白值 → 默认（视同未记忆）', function () {
        localStorage.setItem(tenant_code_1.TENANT_CODE_STORAGE_KEY, '   ');
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe(tenant_code_1.DEFAULT_TENANT_CODE);
    });
    (0, vitest_1.it)('trim 后比较', function () {
        localStorage.setItem(tenant_code_1.TENANT_CODE_STORAGE_KEY, '  acme  ');
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe('acme');
    });
});
(0, vitest_1.describe)('setTenantCode', function () {
    (0, vitest_1.it)('正常字符串写入', function () {
        (0, tenant_code_1.setTenantCode)('acme');
        (0, vitest_1.expect)(localStorage.getItem(tenant_code_1.TENANT_CODE_STORAGE_KEY)).toBe('acme');
    });
    (0, vitest_1.it)('trim 后写入', function () {
        (0, tenant_code_1.setTenantCode)('  acme  ');
        (0, vitest_1.expect)(localStorage.getItem(tenant_code_1.TENANT_CODE_STORAGE_KEY)).toBe('acme');
    });
    (0, vitest_1.it)('空字符串 / null / undefined → 不写', function () {
        (0, tenant_code_1.setTenantCode)('');
        (0, tenant_code_1.setTenantCode)('   ');
        (0, tenant_code_1.setTenantCode)(null);
        (0, tenant_code_1.setTenantCode)(undefined);
        (0, vitest_1.expect)(localStorage.getItem(tenant_code_1.TENANT_CODE_STORAGE_KEY)).toBeNull();
    });
});
(0, vitest_1.describe)('clearTenantCode', function () {
    (0, vitest_1.it)('写入后清除', function () {
        (0, tenant_code_1.setTenantCode)('acme');
        (0, tenant_code_1.clearTenantCode)();
        (0, vitest_1.expect)((0, tenant_code_1.getTenantCode)()).toBe(tenant_code_1.DEFAULT_TENANT_CODE);
    });
});
