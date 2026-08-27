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
 * auth.ts 未鉴权路径单测（Phase 9 · 覆盖率）.
 *
 * api.test.ts 已覆盖 api.ts（401 重试等）；这里覆盖 services/auth.ts 里
 * 走 raw fetch 的匿名接口（login/register/send-code/login-code/reset-password/refresh）。
 */
var vitest_1 = require("vitest");
var auth = require("./auth");
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
(0, vitest_1.describe)('services/auth.ts（匿名接口）', function () {
    (0, vitest_1.it)('login POST /auth/login + 透传 body', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, tok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, auth.login({ username: 'u', password: 'p' })];
                case 1:
                    tok = _a.sent();
                    (0, vitest_1.expect)(tok.userId).toBe(1);
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/login$/);
                    (0, vitest_1.expect)(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ username: 'u', password: 'p' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('refresh POST /auth/refresh', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, auth.refreshTokens('old-refresh')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/refresh$/);
                    (0, vitest_1.expect)(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: 'old-refresh' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('sendCode POST /auth/send-code + 三参数透传', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({}));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, auth.sendCode('SMS', '13800000000', 'LOGIN')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/send-code$/);
                    (0, vitest_1.expect)(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
                        channel: 'SMS',
                        target: '13800000000',
                        purpose: 'LOGIN',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('loginWithCode POST /auth/login/code + tenantCode 可选', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, auth.loginWithCode(undefined, 'EMAIL', 'a@b.com', '123456')];
                case 1:
                    _a.sent();
                    body = JSON.parse(fetchMock.mock.calls[0][1].body);
                    (0, vitest_1.expect)(body).toEqual({ channel: 'EMAIL', target: 'a@b.com', code: '123456' });
                    (0, vitest_1.expect)(body.tenantCode).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('register POST /auth/register 透传全字段', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi.fn().mockResolvedValue(jsonResponse({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    }));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, auth.register({
                            tenantCode: 'h',
                            username: 'u',
                            displayName: 'd',
                            password: 'p',
                            channel: 'SMS',
                            target: 't',
                            code: 'c',
                            inviteCode: 'inv',
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/register$/);
                    body = JSON.parse(fetchMock.mock.calls[0][1].body);
                    (0, vitest_1.expect)(body).toMatchObject({ tenantCode: 'h', inviteCode: 'inv' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('resetPassword POST /auth/reset-password + 后端 message 透传为 AuthError', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi
                        .fn()
                        .mockResolvedValue(jsonResponse({ error: 'INVALID_CODE', message: '验证码错误' }, 400));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    return [4 /*yield*/, (0, vitest_1.expect)(auth.resetPassword('SMS', 't', 'c', 'new')).rejects.toMatchObject({
                            code: 'RESET_FAILED',
                            message: '验证码错误',
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('login 401 → 抛 AuthError INVALID_CREDENTIALS', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(jsonResponse({}, 401)));
                    return [4 /*yield*/, (0, vitest_1.expect)(auth.login({ username: 'u', password: 'bad' })).rejects.toMatchObject({
                            code: 'INVALID_CREDENTIALS',
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('login 404 → 抛 AuthError USER_NOT_FOUND', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(jsonResponse({}, 404)));
                    return [4 /*yield*/, (0, vitest_1.expect)(auth.login({ username: 'missing', password: 'p' })).rejects.toMatchObject({
                            code: 'USER_NOT_FOUND',
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('AuthError 类 export 仍可用', function () {
        var e = new auth.AuthError('X', 'msg', 500);
        (0, vitest_1.expect)(e.code).toBe('X');
        (0, vitest_1.expect)(e.status).toBe(500);
        (0, vitest_1.expect)(e.name).toBe('AuthError');
    });
});
