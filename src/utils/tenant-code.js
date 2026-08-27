"use strict";
/**
 * 记住最近一次使用的租户编码（Phase 9 · 登录体验 · B-2）.
 *
 * localStorage key: 'lieshoucloud:lastTenantCode'
 * - 读：返回记忆值，没有则返回默认 'jxlkas'
 * - 写：空值/空白不写；只接受非空字符串且 trim 后非空
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TENANT_CODE = exports.TENANT_CODE_STORAGE_KEY = void 0;
exports.getTenantCode = getTenantCode;
exports.setTenantCode = setTenantCode;
exports.clearTenantCode = clearTenantCode;
var KEY = 'lieshoucloud:lastTenantCode';
var DEFAULT = 'jxlkas';
/** 安全读取 localStorage（SSR / 隐私模式抛错兜底） */
function getTenantCode() {
    if (typeof window === 'undefined')
        return DEFAULT;
    try {
        var v = window.localStorage.getItem(KEY);
        return v && v.trim() ? v.trim() : DEFAULT;
    }
    catch (_a) {
        return DEFAULT;
    }
}
/** 写入；空值/非法输入忽略 */
function setTenantCode(code) {
    if (typeof window === 'undefined')
        return;
    var v = (code !== null && code !== void 0 ? code : '').trim();
    if (!v)
        return; // 空值不写
    try {
        window.localStorage.setItem(KEY, v);
    }
    catch (_a) {
        /* 隐私模式 / 配额超限：忽略 */
    }
}
/** 测试 / 切换租户时可调用 */
function clearTenantCode() {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.removeItem(KEY);
    }
    catch (_a) {
        /* ignore */
    }
}
exports.TENANT_CODE_STORAGE_KEY = KEY;
exports.DEFAULT_TENANT_CODE = DEFAULT;
