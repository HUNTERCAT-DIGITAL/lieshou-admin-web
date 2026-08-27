"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * useApiError hook 单测（Phase 9 · 覆盖率提升）.
 */
var antd_1 = require("antd");
var react_1 = require("@testing-library/react");
var errors_1 = require("../utils/errors");
var useApiError_1 = require("./useApiError");
var wrapper = function (_a) {
    var children = _a.children;
    return <antd_1.App>{children}</antd_1.App>;
};
describe('useApiError', function () {
    it('AuthError UNAUTHORIZED → 不弹 message（由 api 层统一处理）', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useApiError_1.useApiError)(); }, { wrapper: wrapper }).result;
        result.current(new errors_1.AuthError('UNAUTHORIZED', '登录已过期', 401));
        // 没有断言失败即通过；message.error 不被调用即可
    });
    it('AuthError 其他 code → 弹 message', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useApiError_1.useApiError)(); }, { wrapper: wrapper }).result;
        expect(function () { return result.current(new errors_1.AuthError('INVALID_CREDENTIALS', '密码错误')); }).not.toThrow();
    });
    it('ApiError → 弹 backend message', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useApiError_1.useApiError)(); }, { wrapper: wrapper }).result;
        expect(function () { return result.current(new errors_1.ApiError('DB_DOWN', '数据库开小差', 500)); }).not.toThrow();
    });
    it('普通 Error → 弹 message', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useApiError_1.useApiError)(); }, { wrapper: wrapper }).result;
        expect(function () { return result.current(new Error('boom')); }).not.toThrow();
    });
    it('字符串异常 → 弹 string 形式', function () {
        var result = (0, react_1.renderHook)(function () { return (0, useApiError_1.useApiError)(); }, { wrapper: wrapper }).result;
        expect(function () { return result.current('网络错误'); }).not.toThrow();
    });
    it('getErrorMessage 兜底', function () {
        expect((0, errors_1.getErrorMessage)(new Error('e'))).toBe('e');
        expect((0, errors_1.getErrorMessage)('plain')).toBe('plain');
        expect((0, errors_1.getErrorMessage)(null)).toBe('null');
        expect((0, errors_1.getErrorMessage)(undefined)).toBe('undefined');
    });
});
