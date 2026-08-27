"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * App 入口 smoke 单测（Phase 9 · 覆盖率）.
 *
 * App.tsx 包了 ErrorBoundary + BrowserRouter，自身没逻辑；
 * 这里只验证它能渲染（不抛错）。
 */
var react_1 = require("@testing-library/react");
var vitest_1 = require("vitest");
var App_1 = require("../App");
// matchMedia / ResizeObserver 已在 setup.ts 中 mock
(0, vitest_1.describe)('App', function () {
    (0, vitest_1.it)('挂载 ErrorBoundary + BrowserRouter 不抛错', function () {
        (0, vitest_1.expect)(function () { return (0, react_1.render)(<App_1.default />); }).not.toThrow();
    });
});
