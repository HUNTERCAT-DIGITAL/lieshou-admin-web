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
 * 师资派遣 service wrapper 单测（zhiye 教育行业版 · edu-service）.
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
var dispatch_1 = require("./dispatch");
var dispatch_2 = require("@lieshoucloud/contract-types/business/dispatch");
(0, vitest_1.describe)('dispatch service', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('listDispatches 无过滤 → /dispatches', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, dispatch_1.listDispatches)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/dispatches');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listDispatches 带 keyword/status/teacherId → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, dispatch_1.listDispatches)('启蒙', 'DISPATCHED', 2)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/dispatches?keyword=%E5%90%AF%E8%92%99&status=DISPATCHED&teacherId=2');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countDispatches → /dispatches/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(3);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, dispatch_1.countDispatches)()).resolves.toBe(3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/dispatches/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getDispatch → /dispatches/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, dispatch_1.getDispatch)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/dispatches/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createDispatch → POST /dispatches + body 透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 9 });
                    body = {
                        teacherId: 1,
                        partnerCustomerId: 3,
                        courseId: 5,
                        slotStart: '2026-09-01T10:00:00.000Z',
                        slotEnd: '2026-09-01T12:00:00.000Z',
                        lessonCount: 2,
                    };
                    return [4 /*yield*/, (0, dispatch_1.createDispatch)(body)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/dispatches', body);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('completeDispatch / cancelDispatch → POST 动作端点', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1, status: 'COMPLETED' });
                    return [4 /*yield*/, (0, dispatch_1.completeDispatch)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/dispatches/1/complete', {});
                    apiPost.mockResolvedValue({ id: 1, status: 'CANCELLED' });
                    return [4 /*yield*/, (0, dispatch_1.cancelDispatch)(1)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/dispatches/1/cancel', {});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteDispatch → DELETE /dispatches/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, dispatch_1.deleteDispatch)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/dispatches/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('STATUS_META 覆盖三种状态', function () {
        (0, vitest_1.expect)(Object.keys(dispatch_2.STATUS_META)).toEqual(['DISPATCHED', 'COMPLETED', 'CANCELLED']);
        (0, vitest_1.expect)(dispatch_2.STATUS_META.DISPATCHED.text).toBe('派遣中');
    });
    (0, vitest_1.it)('formatSlot 格式化起止时间为本地短时间', function () {
        // 起止都解析为本地 9月1日（任何常规时区）；小时段按时区折算，用正则断言格式
        (0, vitest_1.expect)((0, dispatch_2.formatSlot)('2026-09-01T10:00:00+08:00', '2026-09-01T12:00:00+08:00')).toMatch(/^9月1日 \d{2}:\d{2} - 9月1日 \d{2}:\d{2}$/);
    });
    (0, vitest_1.it)('formatSlot 非法日期兜底原样返回', function () {
        (0, vitest_1.expect)((0, dispatch_2.formatSlot)('nope', 'also-nope')).toBe('nope ~ also-nope');
    });
});
