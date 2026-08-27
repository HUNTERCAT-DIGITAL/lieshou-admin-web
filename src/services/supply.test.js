"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 供应结算 service wrapper 单测（zhiye 教育行业版 · edu-service）.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
var vitest_1 = require("vitest");
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPost: vitest_1.vi.fn(),
    apiDelete: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPost = _a.apiPost, apiDelete = _a.apiDelete;
vitest_1.vi.mock('./api', function () { return ({
    api: {
        get: apiGet,
        post: apiPost,
        delete: apiDelete,
    },
}); });
var supply_1 = require("./supply");
var dayjs_1 = require("dayjs");
var supply_2 = require("@lieshoucloud/contract-types/business/supply");
(0, vitest_1.describe)('supply service', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    // ---------- 供应单 ----------
    (0, vitest_1.it)('listSupplyOrders 无过滤 → /supplies', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, supply_1.listSupplyOrders)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/supplies');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listSupplyOrders 带 keyword/status/partnerCustomerId → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, supply_1.listSupplyOrders)('启蒙', 'ACTIVE', 3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/supplies?keyword=%E5%90%AF%E8%92%99&status=ACTIVE&partnerCustomerId=3');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countSupplyOrders → /supplies/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(4);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, supply_1.countSupplyOrders)()).resolves.toBe(4)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/supplies/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getSupplyOrder → /supplies/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, supply_1.getSupplyOrder)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/supplies/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createSupplyOrder → POST /supplies + body 透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 9 });
                    body = {
                        partnerCustomerId: 3,
                        partnerName: '南山区机器人培训中心',
                        courseId: 5,
                        courseName: '机器人启蒙班',
                        lessonCount: 24,
                        unitPrice: 128,
                        validUntil: '2026-12-31',
                        remark: '秋季学期',
                    };
                    return [4 /*yield*/, (0, supply_1.createSupplyOrder)(body)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/supplies', body);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('completeSupplyOrder / cancelSupplyOrder → POST /supplies/{id}/complete|/cancel', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, supply_1.completeSupplyOrder)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/supplies/1/complete', {});
                    return [4 /*yield*/, (0, supply_1.cancelSupplyOrder)(1)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/supplies/1/cancel', {});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteSupplyOrder → DELETE /supplies/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supply_1.deleteSupplyOrder)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/supplies/1');
                    return [2 /*return*/];
            }
        });
    }); });
    // ---------- 消课明细 ----------
    (0, vitest_1.it)('listConsumptions 无过滤 → /consumptions；带 supplyOrderId → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, supply_1.listConsumptions)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/consumptions');
                    return [4 /*yield*/, (0, supply_1.listConsumptions)('启蒙', 1)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/consumptions?keyword=%E5%90%AF%E8%92%99&supplyOrderId=1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countConsumptions → /consumptions/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(2);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, supply_1.countConsumptions)()).resolves.toBe(2)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/consumptions/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getConsumption → /consumptions/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, supply_1.getConsumption)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/consumptions/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createConsumption → POST /consumptions + body 透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 9 });
                    body = {
                        supplyOrderId: 1,
                        consumedAt: '2026-09-01',
                        lessonCount: 2,
                        remark: '点名',
                    };
                    return [4 /*yield*/, (0, supply_1.createConsumption)(body)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/consumptions', body);
                    return [2 /*return*/];
            }
        });
    }); });
    // ---------- 结算单 ----------
    (0, vitest_1.it)('listSettlements 无过滤 → /settlements；带 keyword/status/partnerCustomerId → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, supply_1.listSettlements)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/settlements');
                    return [4 /*yield*/, (0, supply_1.listSettlements)('南山', 'PENDING', 3)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/settlements?keyword=%E5%8D%97%E5%B1%B1&status=PENDING&partnerCustomerId=3');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countSettlements → /settlements/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(1);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, supply_1.countSettlements)()).resolves.toBe(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/settlements/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getSettlement → /settlements/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, supply_1.getSettlement)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/settlements/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createSettlement → POST /settlements + body 透传（含分成比例）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 9 });
                    body = {
                        partnerCustomerId: 3,
                        partnerName: '南山区机器人培训中心',
                        periodStart: '2026-09-01',
                        periodEnd: '2026-09-30',
                        revenueShare: 60,
                        remark: '9 月结算',
                    };
                    return [4 /*yield*/, (0, supply_1.createSettlement)(body)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/settlements', body);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('approveSettlement / rejectSettlement → POST /settlements/{id}/approve|/reject', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, supply_1.approveSettlement)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/settlements/1/approve', {});
                    return [4 /*yield*/, (0, supply_1.rejectSettlement)(1)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/settlements/1/reject', {});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteSettlement → DELETE /settlements/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supply_1.deleteSettlement)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/settlements/1');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('supply types', function () {
    (0, vitest_1.it)('SUPPLY_STATUS_META 覆盖全部供应单状态', function () {
        (0, vitest_1.expect)(Object.keys(supply_2.SUPPLY_STATUS_META).sort()).toEqual(['ACTIVE', 'COMPLETED', 'CANCELLED'].sort());
    });
    (0, vitest_1.it)('SETTLEMENT_STATUS_META 覆盖全部结算单状态', function () {
        (0, vitest_1.expect)(Object.keys(supply_2.SETTLEMENT_STATUS_META).sort()).toEqual(['PENDING', 'APPROVED', 'REJECTED'].sort());
    });
    (0, vitest_1.it)('formatMoney：千分位 + 两位小数；null/undefined → —', function () {
        (0, vitest_1.expect)((0, supply_2.formatMoney)(3072)).toBe('3,072.00');
        (0, vitest_1.expect)((0, supply_2.formatMoney)(128.5)).toBe('128.50');
        (0, vitest_1.expect)((0, supply_2.formatMoney)(null)).toBe('—');
        (0, vitest_1.expect)((0, supply_2.formatMoney)(undefined)).toBe('—');
    });
});
(0, vitest_1.describe)('defaultSettlementPeriod（结算周期可配置化 · customers.settle_cycle 驱动）', function () {
    /** 断言周期起止（YYYY-MM-DD） */
    var periodOf = function (cycle, date) { var _a, _b; return (_b = (_a = (0, supply_2.defaultSettlementPeriod)(cycle, (0, dayjs_1.default)(date))) === null || _a === void 0 ? void 0 : _a.map(function (d) { return d.format('YYYY-MM-DD'); })) !== null && _b !== void 0 ? _b : []; };
    (0, vitest_1.it)('月结：2026-08-26 → 上一自然月 [7/1, 7/31]', function () {
        (0, vitest_1.expect)(periodOf('月', '2026-08-26')).toEqual(['2026-07-01', '2026-07-31']);
    });
    (0, vitest_1.it)('月结：跨年 2026-01-15 → [2025-12-01, 2025-12-31]', function () {
        (0, vitest_1.expect)(periodOf('月', '2026-01-15')).toEqual(['2025-12-01', '2025-12-31']);
    });
    (0, vitest_1.it)('季结：2026-08-26（Q3）→ 上一自然季 Q2 [4/1, 6/30]', function () {
        (0, vitest_1.expect)(periodOf('季', '2026-08-26')).toEqual(['2026-04-01', '2026-06-30']);
    });
    (0, vitest_1.it)('季结：跨年 2026-01-10（Q1）→ 上一季 Q4 [2025-10-01, 2025-12-31]', function () {
        (0, vitest_1.expect)(periodOf('季', '2026-01-10')).toEqual(['2025-10-01', '2025-12-31']);
    });
    (0, vitest_1.it)('学期结：2026-08-26（秋季学期内）→ 上一学期春季 [2026-02-01, 2026-07-31]', function () {
        (0, vitest_1.expect)(periodOf('学期', '2026-08-26')).toEqual(['2026-02-01', '2026-07-31']);
    });
    (0, vitest_1.it)('学期结：2026-03-15（春季学期内）→ 上一学期秋季 [2025-08-01, 2026-01-31]', function () {
        (0, vitest_1.expect)(periodOf('学期', '2026-03-15')).toEqual(['2025-08-01', '2026-01-31']);
    });
    (0, vitest_1.it)('学期结：2026-01-15（秋季学期内 1 月）→ 上一学期春季 [2026-02-01, 2026-07-31]', function () {
        (0, vitest_1.expect)(periodOf('学期', '2026-01-15')).toEqual(['2026-02-01', '2026-07-31']);
    });
    (0, vitest_1.it)('未设置 / 空串 / 未知值 → null（不预填，保持手动）', function () {
        (0, vitest_1.expect)((0, supply_2.defaultSettlementPeriod)(null, (0, dayjs_1.default)('2026-08-26'))).toBeNull();
        (0, vitest_1.expect)((0, supply_2.defaultSettlementPeriod)(undefined, (0, dayjs_1.default)('2026-08-26'))).toBeNull();
        (0, vitest_1.expect)((0, supply_2.defaultSettlementPeriod)('', (0, dayjs_1.default)('2026-08-26'))).toBeNull();
        (0, vitest_1.expect)((0, supply_2.defaultSettlementPeriod)('未知', (0, dayjs_1.default)('2026-08-26'))).toBeNull();
    });
});
