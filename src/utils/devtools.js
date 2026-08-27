"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushDevLog = pushDevLog;
exports.getDevLogs = getDevLogs;
exports.clearDevLogs = clearDevLogs;
exports.subscribeDevLogs = subscribeDevLogs;
exports.collectEnvSnapshot = collectEnvSnapshot;
exports.decodeJwtPayload = decodeJwtPayload;
exports.maskSecret = maskSecret;
var MAX_LOGS = 100;
var logs = [];
var nextId = 1;
var listeners = new Set();
function pushDevLog(entry) {
    logs = __spreadArray(__spreadArray([], logs.slice(-(MAX_LOGS - 1)), true), [__assign(__assign({}, entry), { id: nextId++, at: new Date().toLocaleTimeString('zh-CN', { hour12: false }) })], false);
    listeners.forEach(function (fn) { return fn(); });
}
function getDevLogs() {
    return logs;
}
function clearDevLogs() {
    logs = [];
    listeners.forEach(function (fn) { return fn(); });
}
function subscribeDevLogs(fn) {
    listeners.add(fn);
    return function () { return listeners.delete(fn); };
}
function collectEnvSnapshot() {
    var _a, _b, _c, _d;
    return {
        edition: (_a = import.meta.env.VITE_EDITION) !== null && _a !== void 0 ? _a : '(未注入)',
        apiBase: (_b = import.meta.env.VITE_API_BASE_URL) !== null && _b !== void 0 ? _b : '',
        mode: (_c = import.meta.env.MODE) !== null && _c !== void 0 ? _c : '',
        isDev: Boolean(import.meta.env.DEV),
        isProd: Boolean(import.meta.env.PROD),
        appVersion: (_d = import.meta.env.VITE_APP_VERSION) !== null && _d !== void 0 ? _d : 'dev',
        userAgent: navigator.userAgent,
        pathname: window.location.pathname,
        href: window.location.href,
    };
}
/** JWT payload 安全解码（token 脱敏展示用） */
function decodeJwtPayload(token) {
    if (!token)
        return null;
    var parts = token.split('.');
    if (parts.length !== 3)
        return null;
    try {
        return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    }
    catch (_a) {
        return null;
    }
}
/** 脱敏：长值只留头尾（token / secret 等） */
function maskSecret(value, keep) {
    if (keep === void 0) { keep = 8; }
    if (!value)
        return '(空)';
    if (value.length <= keep * 2)
        return "".concat(value.slice(0, keep), "\u2026");
    return "".concat(value.slice(0, keep), "\u2026").concat(value.slice(-keep));
}
