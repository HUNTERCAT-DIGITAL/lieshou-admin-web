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
 * 会员 service 单测（CRM V5 补齐）.
 *
 * 验证 URL path / query / body 透传（member service 封装）。
 */
var vitest_1 = require("vitest");
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPost: vitest_1.vi.fn(),
    apiPut: vitest_1.vi.fn(),
    apiDelete: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPost = _a.apiPost, apiPut = _a.apiPut, apiDelete = _a.apiDelete;
vitest_1.vi.mock('./api', function () { return ({
    api: { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete },
}); });
var member_1 = require("./member");
(0, vitest_1.beforeEach)(function () {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPut.mockReset();
    apiDelete.mockReset();
});
(0, vitest_1.describe)('admin member service', function () {
    (0, vitest_1.it)('listMembers 无参数 → GET /members', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, member_1.listMembers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/members');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listMembers 带 customerId + level + status + keyword → query', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, member_1.listMembers)(10, 'GOLD', 'ACTIVE', 'VIP-2026')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/members?customerId=10&level=GOLD&status=ACTIVE&keyword=VIP-2026');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countMembers → GET /members/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(12);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, member_1.countMembers)()).resolves.toBe(12)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/members/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getMember 动态 id', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 3 });
                    return [4 /*yield*/, (0, member_1.getMember)(3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/members/3');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createMember body 透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, member_1.createMember)({ customerId: 10, memberNo: 'VIP-1', level: 'GOLD', points: 100 })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/members', {
                        customerId: 10,
                        memberNo: 'VIP-1',
                        level: 'GOLD',
                        points: 100,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateMember 动态 id + body', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({ id: 3 });
                    return [4 /*yield*/, (0, member_1.updateMember)(3, { balance: 800.5, status: 'DISABLED' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/members/3', { balance: 800.5, status: 'DISABLED' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteMember → DELETE /members/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, member_1.deleteMember)(3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/members/3');
                    return [2 /*return*/];
            }
        });
    }); });
});
