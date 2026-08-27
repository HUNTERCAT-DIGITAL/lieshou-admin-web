"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 主题 store + 解析逻辑测试.
 */
var vitest_1 = require("vitest");
var theme_1 = require("../stores/theme");
/** 复刻 useThemeMode 里的 resolveTheme 纯函数（避免在 jsdom 下引用 hook） */
function resolveTheme(mode, systemDark) {
    if (mode === 'light')
        return 'light';
    if (mode === 'dark')
        return 'dark';
    return systemDark ? 'dark' : 'light';
}
(0, vitest_1.describe)('theme store', function () {
    (0, vitest_1.afterEach)(function () {
        localStorage.clear();
        theme_1.useThemeStore.setState({ mode: 'system', resolved: 'light' });
    });
    (0, vitest_1.it)('默认 mode 是 system', function () {
        (0, vitest_1.expect)(theme_1.useThemeStore.getState().mode).toBe('system');
    });
    (0, vitest_1.it)('setMode 写入 store', function () {
        theme_1.useThemeStore.getState().setMode('dark');
        (0, vitest_1.expect)(theme_1.useThemeStore.getState().mode).toBe('dark');
    });
});
(0, vitest_1.describe)('resolveTheme（mode + 系统偏好合并）', function () {
    (0, vitest_1.it)('mode=light → 永远 light（忽略系统）', function () {
        (0, vitest_1.expect)(resolveTheme('light', false)).toBe('light');
        (0, vitest_1.expect)(resolveTheme('light', true)).toBe('light');
    });
    (0, vitest_1.it)('mode=dark → 永远 dark（忽略系统）', function () {
        (0, vitest_1.expect)(resolveTheme('dark', false)).toBe('dark');
        (0, vitest_1.expect)(resolveTheme('dark', true)).toBe('dark');
    });
    (0, vitest_1.it)('mode=system → 跟随系统', function () {
        (0, vitest_1.expect)(resolveTheme('system', false)).toBe('light');
        (0, vitest_1.expect)(resolveTheme('system', true)).toBe('dark');
    });
});
