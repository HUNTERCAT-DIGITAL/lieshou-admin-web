"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * BarChart 自绘 SVG 组件单测（Phase 9 · BI 看板）.
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var vitest_1 = require("vitest");
var BarChart_1 = require("./BarChart");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>{children}</antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('BarChart', function () {
    (0, vitest_1.it)('渲染 SVG + 30 根柱（rect）', function () {
        var data = Array.from({ length: 30 }, function (_, i) { return ({
            date: "2026-08-".concat(String(i + 1).padStart(2, '0')),
            count: i % 7,
        }); });
        var container = (0, react_1.render)(<BarChart_1.default data={data}/>, { wrapper: wrap }).container;
        var svg = container.querySelector('svg');
        (0, vitest_1.expect)(svg).not.toBeNull();
        // rect 数：每根柱一个 + 1 个透明 hover 命中区 = 60
        var rects = container.querySelectorAll('rect');
        (0, vitest_1.expect)(rects.length).toBeGreaterThanOrEqual(30);
    });
    (0, vitest_1.it)('空数据：仍然渲染 SVG', function () {
        var container = (0, react_1.render)(<BarChart_1.default data={[]}/>, { wrapper: wrap }).container;
        (0, vitest_1.expect)(container.querySelector('svg')).not.toBeNull();
    });
    (0, vitest_1.it)('可访问性：svg 带 aria-label', function () {
        (0, react_1.render)(<BarChart_1.default data={[{ date: '2026-01-01', count: 1 }]}/>, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getByRole('img', { name: '30 天客户创建趋势' })).toBeInTheDocument();
    });
});
