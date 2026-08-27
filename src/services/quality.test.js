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
 * 质检追溯 service 单测（ADR-0037 · 覆盖率）.
 *
 * 覆盖 services/quality.ts 的 API 路径与查询参数拼接
 * （页面含 ProTable，jsdom 渲染脆，按项目惯例测服务层）。
 */
var vitest_1 = require("vitest");
var quality = require("../services/quality");
(0, vitest_1.beforeEach)(function () {
    vitest_1.vi.restoreAllMocks();
});
function jsonResponse(body, status) {
    if (status === void 0) { status = 200; }
    return new Response(JSON.stringify(body), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
(0, vitest_1.describe)('services/quality.ts（批次 + 质检追溯 API）', function () {
    (0, vitest_1.it)('listBatches 不带参数 → GET /batches', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse([]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.listBatches()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/batches$/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listBatches 带 productId + keyword → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse([]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.listBatches(7, 'B001')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/batches\?productId=7&keyword=B001/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createBatch POST /batches + 透传 body', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.createBatch({
                            productId: 1,
                            batchNo: 'B001',
                            supplier: '供应商甲',
                            quantity: 500,
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/batches$/);
                    body = JSON.parse(fetchMock.mock.calls[0][1].body);
                    (0, vitest_1.expect)(body).toEqual({
                        productId: 1,
                        batchNo: 'B001',
                        supplier: '供应商甲',
                        quantity: 500,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getBatchDetail GET /batches/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, detail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi
                        .fn()
                        .mockResolvedValue(jsonResponse({ batch: { id: 3 }, inspections: [], movements: [] }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.getBatchDetail(3)];
                case 1:
                    detail = _a.sent();
                    (0, vitest_1.expect)(detail.batch.id).toBe(3);
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/batches\/3$/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listInspections 带 type/result 过滤 → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse([]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.listInspections({ type: 'IQC', result: 'FAIL' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/inspections\?type=IQC&result=FAIL/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listInspections 不带参数 → GET /inspections', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse([]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.listInspections()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/inspections$/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createInspection POST /inspections + 透传 body（含 batchId）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({ id: 9 }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.createInspection({
                            productId: 1,
                            batchId: 11,
                            type: 'IQC',
                            result: 'PASS',
                            quantity: 500,
                            inspector: '张三',
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/inspections$/);
                    body = JSON.parse(fetchMock.mock.calls[0][1].body);
                    (0, vitest_1.expect)(body).toEqual({
                        productId: 1,
                        batchId: 11,
                        type: 'IQC',
                        result: 'PASS',
                        quantity: 500,
                        inspector: '张三',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getInspection GET /inspections/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, detail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({ inspection: { id: 9 } }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.getInspection(9)];
                case 1:
                    detail = _a.sent();
                    (0, vitest_1.expect)(detail.inspection.id).toBe(9);
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/inspections\/9$/);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getProductTrace GET /products/{id}/trace', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, trace;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({ batches: [], inspections: [] }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, quality.getProductTrace(5)];
                case 1:
                    trace = _a.sent();
                    (0, vitest_1.expect)(trace.batches).toEqual([]);
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/products\/5\/trace$/);
                    return [2 /*return*/];
            }
        });
    }); });
});
