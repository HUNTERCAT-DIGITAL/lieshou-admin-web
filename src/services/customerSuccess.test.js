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
 * customerSuccess service wrapper 单测.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
var vitest_1 = require("vitest");
var customerSuccess_1 = require("@lieshoucloud/contract-types/business/customerSuccess");
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPost: vitest_1.vi.fn(),
    apiPut: vitest_1.vi.fn(),
    apiDelete: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPost = _a.apiPost, apiPut = _a.apiPut, apiDelete = _a.apiDelete;
vitest_1.vi.mock('./api', function () { return ({
    api: {
        get: apiGet,
        post: apiPost,
        put: apiPut,
        delete: apiDelete,
    },
}); });
var customerSuccess_2 = require("./customerSuccess");
(0, vitest_1.beforeEach)(function () {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPut.mockReset();
    apiDelete.mockReset();
});
(0, vitest_1.describe)('customerSuccess service · 联系函', function () {
    (0, vitest_1.it)('listLetters：无过滤参数不带 query', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, customerSuccess_2.listLetters)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/letters');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listLetters：customerId/type/status 过滤参数拼接', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, customerSuccess_2.listLetters)({ customerId: 10, type: 'RENEWAL', status: 'DRAFT' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/letters?customerId=10&type=RENEWAL&status=DRAFT');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countLetters / createLetter / updateLetter / deleteLetter', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(3);
                    return [4 /*yield*/, (0, customerSuccess_2.countLetters)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/letters/count');
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.createLetter)({ customerId: 10, type: 'RENEWAL', title: '续费提醒函', content: '正文' })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/letters', {
                        customerId: 10,
                        type: 'RENEWAL',
                        title: '续费提醒函',
                        content: '正文',
                    });
                    apiPut.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.updateLetter)(1, { title: '改标题' })];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/letters/1', { title: '改标题' });
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, customerSuccess_2.deleteLetter)(1)];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/letters/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('状态流转动作：send / read / complete / cancel 走对应 POST 端点', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.sendLetter)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/letters/1/send', {});
                    return [4 /*yield*/, (0, customerSuccess_2.readLetter)(1)];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/letters/1/read', {});
                    return [4 /*yield*/, (0, customerSuccess_2.completeLetter)(1)];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/letters/1/complete', {});
                    return [4 /*yield*/, (0, customerSuccess_2.cancelLetter)(1)];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/letters/1/cancel', {});
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('customerSuccess service · 客户响应', function () {
    (0, vitest_1.it)('listResponses：过滤参数拼接', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, customerSuccess_2.listResponses)({ customerId: 10, status: 'OPEN', sentiment: 'NEGATIVE' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/responses?customerId=10&status=OPEN&sentiment=NEGATIVE');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listResponses：跟进到期筛选 followUpOverdue / followUpDueToday', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, customerSuccess_2.listResponses)({ followUpOverdue: true })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/responses?followUpOverdue=true');
                    return [4 /*yield*/, (0, customerSuccess_2.listResponses)({ followUpDueToday: true })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/responses?followUpDueToday=true');
                    return [4 /*yield*/, (0, customerSuccess_2.listResponses)({ followUpOverdue: true, followUpDueToday: false })];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/responses?followUpOverdue=true');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countResponses / createResponse / updateResponse / resolveResponse / deleteResponse', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(2);
                    return [4 /*yield*/, (0, customerSuccess_2.countResponses)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/responses/count');
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.createResponse)({
                            customerId: 10,
                            letterId: 3,
                            type: 'PHONE',
                            sentiment: 'NEGATIVE',
                            content: '客户不满',
                            followUpAction: '跟进',
                        })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/responses', {
                        customerId: 10,
                        letterId: 3,
                        type: 'PHONE',
                        sentiment: 'NEGATIVE',
                        content: '客户不满',
                        followUpAction: '跟进',
                    });
                    apiPut.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.updateResponse)(1, { status: 'RESOLVED' })];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/responses/1', { status: 'RESOLVED' });
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, customerSuccess_2.resolveResponse)(1)];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/responses/1/resolve', {});
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, customerSuccess_2.deleteResponse)(1)];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/responses/1');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('customerSuccess service · 工作台汇总', function () {
    (0, vitest_1.it)('getCustomerSuccessSummary：GET /customer-success/summary', function () { return __awaiter(void 0, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ totalLetters: 6, draftLetters: 2 });
                    return [4 /*yield*/, (0, customerSuccess_2.getCustomerSuccessSummary)()];
                case 1:
                    s = _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/customer-success/summary');
                    (0, vitest_1.expect)(s.totalLetters).toBe(6);
                    (0, vitest_1.expect)(s.draftLetters).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('customerSuccess service · 联系函模板', function () {
    (0, vitest_1.it)('getLetterTemplates：GET /letter-templates', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tpl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([{ templateKey: 'renewal-reminder', title: '续费提醒函' }]);
                    return [4 /*yield*/, (0, customerSuccess_2.getLetterTemplates)()];
                case 1:
                    tpl = _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/letter-templates');
                    (0, vitest_1.expect)(tpl[0].templateKey).toBe('renewal-reminder');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('customerSuccess 纯函数 · 模板占位 + 跟进到期', function () {
    (0, vitest_1.it)('fillTemplatePlaceholder：{customer} 替换为客户名；未选客户保留占位', function () {
        (0, vitest_1.expect)((0, customerSuccess_1.fillTemplatePlaceholder)('尊敬的 {customer}：您好', '猎手猫公司')).toBe('尊敬的 猎手猫公司：您好');
        (0, vitest_1.expect)((0, customerSuccess_1.fillTemplatePlaceholder)('尊敬的 {customer}：您好')).toBe('尊敬的 {customer}：您好');
    });
    (0, vitest_1.it)('followUpTone：逾期 / 今日到期 / 未来 分级正确；已闭环不计', function () {
        var now = new Date('2026-08-25T12:00:00');
        var overdue = new Date('2026-08-24T10:00:00').toISOString();
        var dueToday = new Date('2026-08-25T15:00:00').toISOString();
        var future = new Date('2026-08-30T10:00:00').toISOString();
        (0, vitest_1.expect)((0, customerSuccess_1.followUpTone)(overdue, 'OPEN', now).tone).toBe('overdue');
        (0, vitest_1.expect)((0, customerSuccess_1.followUpTone)(dueToday, 'IN_PROGRESS', now).tone).toBe('dueToday');
        (0, vitest_1.expect)((0, customerSuccess_1.followUpTone)(future, 'OPEN', now).tone).toBe('none');
        // 已闭环或无跟进时间不计提醒
        (0, vitest_1.expect)((0, customerSuccess_1.followUpTone)(overdue, 'RESOLVED', now).tone).toBe('none');
        (0, vitest_1.expect)((0, customerSuccess_1.followUpTone)(null, 'OPEN', now).tone).toBe('none');
    });
});
