"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var list_filter_1 = require("./list-filter");
var ROWS = [
    {
        id: 1,
        username: 'futurewl',
        displayName: 'Future Wang',
        email: 'future@example.com',
        phone: '13800000001',
        status: 'ACTIVE',
    },
    {
        id: 2,
        username: 'alice',
        displayName: 'Alice Li',
        email: 'alice@huntercat.cn',
        phone: null,
        status: 'DISABLED',
    },
    {
        id: 3,
        username: 'bob',
        displayName: 'Bob Zhang',
        email: null,
        phone: '13900000002',
        status: 'ACTIVE',
    },
];
(0, vitest_1.describe)('filterByKeywordAndStatus', function () {
    (0, vitest_1.it)('空 keyword + 空 status → 原数组', function () {
        (0, vitest_1.expect)((0, list_filter_1.filterByKeywordAndStatus)(ROWS, {}, ['username'])).toEqual(ROWS);
    });
    (0, vitest_1.it)('keyword 大小写不敏感', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: 'FUTURE' }, ['username']);
        (0, vitest_1.expect)(r).toHaveLength(1);
        (0, vitest_1.expect)(r[0].username).toBe('futurewl');
    });
    (0, vitest_1.it)('keyword 多字段拼接命中（email）', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: 'huntercat' }, [
            'username',
            'displayName',
            'email',
            'phone',
        ]);
        (0, vitest_1.expect)(r).toHaveLength(1);
        (0, vitest_1.expect)(r[0].username).toBe('alice');
    });
    (0, vitest_1.it)('keyword 命中 phone（null 字段被跳过）', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: '139' }, [
            'username',
            'displayName',
            'email',
            'phone',
        ]);
        (0, vitest_1.expect)(r.map(function (x) { return x.id; })).toEqual([3]);
    });
    (0, vitest_1.it)('status 精确匹配', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { status: 'DISABLED' }, ['username']);
        (0, vitest_1.expect)(r.map(function (x) { return x.id; })).toEqual([2]);
    });
    (0, vitest_1.it)('keyword + status AND 组合', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: 'alice', status: 'ACTIVE' }, [
            'username',
            'displayName',
            'email',
            'phone',
        ]);
        (0, vitest_1.expect)(r).toHaveLength(0); // alice 是 DISABLED，与 ACTIVE 不符
    });
    (0, vitest_1.it)('keyword 无命中返回空数组', function () {
        (0, vitest_1.expect)((0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: 'nonexistent' }, ['username'])).toEqual([]);
    });
    (0, vitest_1.it)('keyword trim 后再比较', function () {
        var r = (0, list_filter_1.filterByKeywordAndStatus)(ROWS, { keyword: '  alice  ' }, ['username']);
        (0, vitest_1.expect)(r).toHaveLength(1);
    });
});
