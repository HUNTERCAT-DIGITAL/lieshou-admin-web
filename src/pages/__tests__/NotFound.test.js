"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NotFound / Forbidden 页面单测（Phase 9 · 覆盖率）.
 */
var react_1 = require("@testing-library/react");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var Forbidden_1 = require("../Forbidden");
var NotFound_1 = require("../NotFound");
(0, vitest_1.describe)('NotFound', function () {
    (0, vitest_1.it)('渲染 404 + 跳转按钮', function () {
        (0, react_1.render)(<react_router_dom_1.MemoryRouter>
        <NotFound_1.default />
      </react_router_dom_1.MemoryRouter>);
        (0, vitest_1.expect)(react_1.screen.getByText('404')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('页面不存在或已被移除。')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('回到工作台')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('返回上一页')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('Forbidden', function () {
    (0, vitest_1.it)('渲染 403 + 跳转按钮', function () {
        (0, react_1.render)(<react_router_dom_1.MemoryRouter>
        <Forbidden_1.default />
      </react_router_dom_1.MemoryRouter>);
        (0, vitest_1.expect)(react_1.screen.getByText('403')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText(/没有权限/)).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('回到工作台')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('返回上一页')).toBeInTheDocument();
    });
});
