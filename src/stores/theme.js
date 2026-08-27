"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeStore = void 0;
/**
 * 主题模式 store（Phase 9 · 暗色主题 · UI.md §2.1 留口落地）.
 *
 * - 'light' | 'dark' | 'system' 三种偏好
 * - 持久化到 localStorage
 * - 启动时附带系统偏好监听（matchMedia change）
 */
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
exports.useThemeStore = (0, zustand_1.create)()((0, middleware_1.persist)(function (set) { return ({
    mode: 'system',
    resolved: 'light',
    setMode: function (mode) { return set({ mode: mode }); },
    setResolved: function (resolved) { return set({ resolved: resolved }); },
}); }, {
    name: 'lieshoucloud:theme',
    partialize: function (s) { return ({ mode: s.mode }); },
}));
