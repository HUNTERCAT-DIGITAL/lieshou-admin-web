"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 进销存库存预警逻辑单测（Phase 9）.
 *
 * stockLevel 是页面内纯函数，直接验证三段判定：
 * - OUT：≤ 0
 * - LOW：1..LOW_STOCK_THRESHOLD
 * - OK：> LOW_STOCK_THRESHOLD
 */
var vitest_1 = require("vitest");
var List_1 = require("./List");
(0, vitest_1.describe)('stockLevel（低库存预警阈值）', function () {
    (0, vitest_1.it)('stock ≤ 0 → OUT（缺货）', function () {
        (0, vitest_1.expect)((0, List_1.stockLevel)(0)).toBe('OUT');
        (0, vitest_1.expect)((0, List_1.stockLevel)(-3)).toBe('OUT');
    });
    (0, vitest_1.it)('1..5 → LOW（低库存）', function () {
        (0, vitest_1.expect)((0, List_1.stockLevel)(1)).toBe('LOW');
        (0, vitest_1.expect)((0, List_1.stockLevel)(5)).toBe('LOW');
    });
    (0, vitest_1.it)('> 5 → OK', function () {
        (0, vitest_1.expect)((0, List_1.stockLevel)(6)).toBe('OK');
        (0, vitest_1.expect)((0, List_1.stockLevel)(100)).toBe('OK');
    });
});
