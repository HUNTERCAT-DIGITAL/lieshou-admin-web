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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * analytics 聚合 + 趋势 mock 单测（Phase 9 · BI 看板）.
 */
var vitest_1 = require("vitest");
var analytics_1 = require("./analytics");
function customer(overrides) {
    return __assign({ id: 1, tenantId: 1, name: 'C', status: 'NEW', createdAt: '2026-01-01' }, overrides);
}
(0, vitest_1.describe)('aggregateStatus', function () {
    (0, vitest_1.it)('空数组 → 全 0% / 0 条', function () {
        var r = (0, analytics_1.aggregateStatus)([]);
        (0, vitest_1.expect)(r).toHaveLength(4);
        (0, vitest_1.expect)(r.every(function (b) { return b.count === 0 && b.pct === 0; })).toBe(true);
    });
    (0, vitest_1.it)('混合状态：计数 + 百分比', function () {
        var list = [
            customer({ id: 1, status: 'NEW' }),
            customer({ id: 2, status: 'NEW' }),
            customer({ id: 3, status: 'FOLLOWING' }),
            customer({ id: 4, status: 'CONVERTED' }),
        ];
        var r = (0, analytics_1.aggregateStatus)(list);
        (0, vitest_1.expect)(r.find(function (b) { return b.status === 'NEW'; })).toMatchObject({ count: 2, pct: 50 });
        (0, vitest_1.expect)(r.find(function (b) { return b.status === 'FOLLOWING'; })).toMatchObject({ count: 1, pct: 25 });
        (0, vitest_1.expect)(r.find(function (b) { return b.status === 'CONVERTED'; })).toMatchObject({ count: 1, pct: 25 });
        (0, vitest_1.expect)(r.find(function (b) { return b.status === 'LOST'; })).toMatchObject({ count: 0, pct: 0 });
    });
});
(0, vitest_1.describe)('aggregateFunnel', function () {
    (0, vitest_1.it)('按 FUNNEL_ORDER 顺序输出 4 个桶', function () {
        var r = (0, analytics_1.aggregateFunnel)([]);
        (0, vitest_1.expect)(r.map(function (b) { return b.status; })).toEqual(['NEW', 'FOLLOWING', 'CONVERTED', 'LOST']);
    });
});
(0, vitest_1.describe)('getCustomerCreatedSeries (mock)', function () {
    (0, vitest_1.it)('返回 30 天（按 YYYY-MM-DD）', function () {
        var s = (0, analytics_1.getCustomerCreatedSeries)('any');
        (0, vitest_1.expect)(s).toHaveLength(30);
        (0, vitest_1.expect)(s[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        (0, vitest_1.expect)(s[29].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    (0, vitest_1.it)('同一种子每次返回相同曲线（确定性）', function () {
        var a = (0, analytics_1.getCustomerCreatedSeries)('seed-x');
        var b = (0, analytics_1.getCustomerCreatedSeries)('seed-x');
        (0, vitest_1.expect)(a).toEqual(b);
    });
    (0, vitest_1.it)('不同种子产生不同曲线', function () {
        var a = (0, analytics_1.getCustomerCreatedSeries)('seed-a');
        var b = (0, analytics_1.getCustomerCreatedSeries)('seed-b');
        (0, vitest_1.expect)(a).not.toEqual(b);
    });
    (0, vitest_1.it)('每个 count ≥ 0（无负数）', function () {
        var s = (0, analytics_1.getCustomerCreatedSeries)('any');
        (0, vitest_1.expect)(s.every(function (b) { return b.count >= 0; })).toBe(true);
    });
});
(0, vitest_1.describe)('seriesExtent / seriesTotal', function () {
    (0, vitest_1.it)('extent 返回最大 + 最小', function () {
        var e = (0, analytics_1.seriesExtent)([
            { date: '2026-01-01', count: 1 },
            { date: '2026-01-02', count: 5 },
            { date: '2026-01-03', count: 3 },
        ]);
        (0, vitest_1.expect)(e).toEqual({ max: 5, min: 1 });
    });
    (0, vitest_1.it)('extent：空数组 → max: 1 / min: 0', function () {
        (0, vitest_1.expect)((0, analytics_1.seriesExtent)([])).toEqual({ max: 1, min: 0 });
    });
    (0, vitest_1.it)('total 取最后 N 天总和', function () {
        var series = Array.from({ length: 30 }, function (_, i) { return ({
            date: "2026-01-".concat(String(i + 1).padStart(2, '0')),
            count: i + 1,
        }); });
        (0, vitest_1.expect)((0, analytics_1.seriesTotal)(series, 7)).toBe(24 + 25 + 26 + 27 + 28 + 29 + 30); // 最后 7 天
        (0, vitest_1.expect)((0, analytics_1.seriesTotal)(series, 30)).toBe(465); // 1..30 sum
    });
});
