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
 * 审批流 service 单测（ADR-0032）.
 *
 * 验证 URL path / query / body 透传（approval-service 封装）。
 */
var vitest_1 = require("vitest");
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPost: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPost = _a.apiPost;
vitest_1.vi.mock('./api', function () { return ({
    api: { get: apiGet, post: apiPost },
}); });
var approval_1 = require("./approval");
(0, vitest_1.beforeEach)(function () {
    apiGet.mockReset();
    apiPost.mockReset();
});
(0, vitest_1.describe)('admin approval service', function () {
    (0, vitest_1.it)('listApprovals 无参数 → GET /approvals', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, approval_1.listApprovals)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/approvals');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listApprovals 带 role/status/type → query', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, approval_1.listApprovals)({ role: 'inbox', status: 'PENDING', type: 'EXPENSE' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/approvals?role=inbox&status=PENDING&type=EXPENSE');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getApprovalCounts → GET /approvals/counts', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ inbox: 3, mine: 1 });
                    return [4 /*yield*/, (0, vitest_1.expect)((0, approval_1.getApprovalCounts)()).resolves.toEqual({ inbox: 3, mine: 1 })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/approvals/counts');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getApproval 动态 id', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 7 });
                    return [4 /*yield*/, (0, approval_1.getApproval)(7)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/approvals/7');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createApproval body 透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, approval_1.createApproval)({ type: 'EXPENSE', title: '报销', approverId: 10 })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/approvals', {
                        type: 'EXPENSE',
                        title: '报销',
                        approverId: 10,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('approveApproval → POST /approvals/{id}/approve（空 body）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1, status: 'APPROVED' });
                    return [4 /*yield*/, (0, approval_1.approveApproval)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/approvals/1/approve', {});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('approveApproval 带意见', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, approval_1.approveApproval)(1, { comment: '同意' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/approvals/1/approve', { comment: '同意' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('rejectApproval → POST /approvals/{id}/reject（comment 必填）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, approval_1.rejectApproval)(1, '金额超预算')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/approvals/1/reject', { comment: '金额超预算' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('cancelApproval 无意见 → 空 body', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, approval_1.cancelApproval)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/approvals/1/cancel', {});
                    return [2 /*return*/];
            }
        });
    }); });
});
