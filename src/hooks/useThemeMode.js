"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeMode = useThemeMode;
/**
 * 主题模式 hook（Phase 9 · 暗色主题）.
 *
 * - 返回 { mode, resolved, setMode }：mode 是用户偏好；resolved 是当前实际生效
 * - 监听 prefers-color-scheme 系统偏好，mode='system' 时自动同步
 */
var react_1 = require("react");
var theme_1 = require("../stores/theme");
var MQ = '(prefers-color-scheme: dark)';
/** 把 mode + 系统偏好合并为实际生效的主题 */
function resolveTheme(mode, systemDark) {
    if (mode === 'light')
        return 'light';
    if (mode === 'dark')
        return 'dark';
    return systemDark ? 'dark' : 'light';
}
function useThemeMode() {
    var mode = (0, theme_1.useThemeStore)(function (s) { return s.mode; });
    var resolved = (0, theme_1.useThemeStore)(function (s) { return s.resolved; });
    var setMode = (0, theme_1.useThemeStore)(function (s) { return s.setMode; });
    var setResolved = (0, theme_1.useThemeStore)(function (s) { return s.setResolved; });
    (0, react_1.useEffect)(function () {
        if (typeof window === 'undefined' || !window.matchMedia) {
            // SSR / jsdom 无 matchMedia：按 light 处理
            setResolved('light');
            return;
        }
        var mql = window.matchMedia(MQ);
        var apply = function () { return setResolved(resolveTheme(mode, mql.matches)); };
        apply();
        // modern API
        if (mql.addEventListener) {
            mql.addEventListener('change', apply);
            return function () { return mql.removeEventListener('change', apply); };
        }
        // legacy fallback（Safari < 14 等）
        mql.addListener(apply);
        return function () { return mql.removeListener(apply); };
    }, [mode, setResolved]);
    return { mode: mode, resolved: resolved, setMode: setMode };
}
