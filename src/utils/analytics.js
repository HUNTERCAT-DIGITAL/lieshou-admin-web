"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNNEL_ORDER = void 0;
exports.aggregateStatus = aggregateStatus;
exports.aggregateFunnel = aggregateFunnel;
exports.getCustomerCreatedSeries = getCustomerCreatedSeries;
exports.seriesExtent = seriesExtent;
exports.seriesTotal = seriesTotal;
/** 漏斗：每个状态的客户数（漏斗可视化用，顺序按客户生命周期） */
exports.FUNNEL_ORDER = ['NEW', 'FOLLOWING', 'CONVERTED', 'LOST'];
/** 把日期向前数 30 天（含今天）按 YYYY-MM-DD 列出 */
function last30Days() {
    var days = [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    for (var i = 29; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}
/** 客户状态分布聚合（基于 listCustomers 全量） */
function aggregateStatus(customers) {
    var total = customers.length || 1; // 防 0 除
    var counts = {
        NEW: 0,
        FOLLOWING: 0,
        CONVERTED: 0,
        LOST: 0,
    };
    customers.forEach(function (c) {
        counts[c.status] += 1;
    });
    return Object.keys(counts).map(function (status) { return ({
        status: status,
        count: counts[status],
        pct: Math.round((counts[status] / total) * 100),
    }); });
}
/** 漏斗（按 FUNNEL_ORDER 顺序） */
function aggregateFunnel(customers) {
    return exports.FUNNEL_ORDER.map(function (s) {
        var found = aggregateStatus(customers).find(function (b) { return b.status === s; });
        return found !== null && found !== void 0 ? found : { status: s, count: 0, pct: 0 };
    });
}
/**
 * 30 天客户创建趋势 mock.
 *
 * 用种子（默认 'default'）产生确定性数据：同一种子每次返回相同曲线。
 * 真实数据接入后只需：拉每日 count 序列 → 转 DailyBucket[]。
 */
function getCustomerCreatedSeries(seed) {
    if (seed === void 0) { seed = 'default'; }
    var days = last30Days();
    // 简单确定性 hash
    var hash = function (s) {
        var h = 0;
        for (var i = 0; i < s.length; i++)
            h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    };
    var base = (hash(seed) % 8) + 2; // 2~9 baseline
    return days.map(function (date, i) {
        // 周期: 周一周五高点, 周末低点 + 线性递增
        var dow = new Date(date).getDay();
        var weekly = dow >= 1 && dow <= 5 ? 1.5 : 0.6;
        var trend = 1 + (i / 29) * 0.8; // 0~29 天增长 1x→1.8x
        var noise = ((hash(date + seed) % 5) - 2) * 0.3; // -0.6 ~ +0.6
        var count = Math.max(0, Math.round(base * weekly * trend + noise));
        return { date: date, count: count };
    });
}
/** 一组数的最大 + 最小（用于图表坐标） */
function seriesExtent(series) {
    if (series.length === 0)
        return { max: 1, min: 0 };
    var max = 0, min = Infinity;
    series.forEach(function (b) {
        if (b.count > max)
            max = b.count;
        if (b.count < min)
            min = b.count;
    });
    return { max: Math.max(1, max), min: min };
}
/** 7 天总和（用于趋势卡对比） */
function seriesTotal(series, days) {
    return series.slice(-days).reduce(function (s, b) { return s + b.count; }, 0);
}
