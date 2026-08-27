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
 * 师资档案 service wrapper 单测（zhiye 教育行业版 · edu-service）.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
var vitest_1 = require("vitest");
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
var teacher_1 = require("./teacher");
var teacher_2 = require("@lieshoucloud/contract-types/business/teacher");
(0, vitest_1.describe)('teacher service', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('listTeachers 无过滤 → /teachers', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, teacher_1.listTeachers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/teachers');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listTeachers 带 keyword + status → 拼接 query', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, teacher_1.listTeachers)('机器人', 'AVAILABLE')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/teachers?keyword=%E6%9C%BA%E5%99%A8%E4%BA%BA&status=AVAILABLE');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countTeachers → /teachers/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(3);
                    return [4 /*yield*/, (0, vitest_1.expect)((0, teacher_1.countTeachers)()).resolves.toBe(3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/teachers/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getTeacher → /teachers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, teacher_1.getTeacher)(1)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/teachers/1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createTeacher → POST /teachers 且 body 原样透传（含 idCard 只写字段）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    body = {
                        name: '张老师',
                        subject: '机器人编程',
                        weeklyCap: 20,
                        idCard: '360100199001011234',
                    };
                    return [4 /*yield*/, (0, teacher_1.createTeacher)(body)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/teachers', body);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateTeacher → PUT /teachers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, teacher_1.updateTeacher)(1, { status: 'DISPATCHING', weeklyCap: 16 })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/teachers/1', { status: 'DISPATCHING', weeklyCap: 16 });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteTeacher → DELETE /teachers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, teacher_1.deleteTeacher)(9)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/teachers/9');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('STATUS_META 覆盖三态且中文文案正确', function () {
        (0, vitest_1.expect)(teacher_2.STATUS_META.AVAILABLE.text).toBe('可用');
        (0, vitest_1.expect)(teacher_2.STATUS_META.DISPATCHING.text).toBe('派遣中');
        (0, vitest_1.expect)(teacher_2.STATUS_META.DISABLED.text).toBe('停用');
    });
    (0, vitest_1.it)('SUBJECT_OPTIONS 提供常用授课方向', function () {
        (0, vitest_1.expect)(teacher_2.SUBJECT_OPTIONS).toContain('机器人编程');
        (0, vitest_1.expect)(teacher_2.SUBJECT_OPTIONS).toContain('科学实验');
    });
});
