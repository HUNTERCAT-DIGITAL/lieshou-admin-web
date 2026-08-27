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
 * services/api.ts 测试（Phase 9 · 集中鉴权）.
 *
 * 覆盖：401 → 单飞 refresh → 重试；refresh 失败 → logout + unauthorizedHandler；
 * 后端错误体透传；204 无响应体；网络错误。
 */
var vitest_1 = require("vitest");
var api_1 = require("./api");
var auth_1 = require("../stores/auth");
function jsonResponse(body, status) {
    if (status === void 0) { status = 200; }
    return new Response(JSON.stringify(body), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
var TOKEN_BODY = {
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
    expiresIn: 1800,
    tokenType: 'Bearer',
    userId: 1,
    username: 'futurewl',
};
function setLoggedIn(access, refresh) {
    if (access === void 0) { access = 'old-access'; }
    if (refresh === void 0) { refresh = 'old-refresh'; }
    auth_1.useAuthStore.setState({
        accessToken: access,
        refreshToken: refresh,
        user: { userId: 1, username: 'futurewl', roles: ['USER'] },
        isAuthenticated: true,
    });
}
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
    (0, api_1.setUnauthorizedHandler)(null);
    vitest_1.vi.unstubAllGlobals();
});
(0, vitest_1.describe)('api 401 集中处理', function () {
    (0, vitest_1.it)('401 → refresh 成功 → 用新 token 重试成功', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, data, retryHeaders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock = vitest_1.vi
                        .fn()
                        .mockResolvedValueOnce(jsonResponse({ error: 'UNAUTHORIZED', message: 'expired' }, 401)) // GET /customers
                        .mockResolvedValueOnce(jsonResponse(TOKEN_BODY)) // POST /auth/refresh
                        .mockResolvedValueOnce(jsonResponse([{ id: 1, name: '客户A' }]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    setLoggedIn();
                    return [4 /*yield*/, api_1.api.get('/customers')];
                case 1:
                    data = _a.sent();
                    (0, vitest_1.expect)(data).toEqual([{ id: 1, name: '客户A' }]);
                    (0, vitest_1.expect)(fetchMock).toHaveBeenCalledTimes(3);
                    // 新 token 已写入 store，重试请求带新 Authorization
                    (0, vitest_1.expect)(auth_1.useAuthStore.getState().accessToken).toBe('new-access');
                    retryHeaders = fetchMock.mock.calls[2][1].headers;
                    (0, vitest_1.expect)(retryHeaders.Authorization).toBe('Bearer new-access');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('并发 401 只发起一次 refresh（单飞）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchMock, _a, a, b, refreshCalls;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fetchMock = vitest_1.vi
                        .fn()
                        .mockResolvedValueOnce(jsonResponse({}, 401))
                        .mockResolvedValueOnce(jsonResponse({}, 401))
                        .mockResolvedValueOnce(jsonResponse(TOKEN_BODY)) // 仅一次 refresh
                        .mockResolvedValueOnce(jsonResponse([{ id: 1 }]))
                        .mockResolvedValueOnce(jsonResponse([{ id: 2 }]));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    setLoggedIn();
                    return [4 /*yield*/, Promise.all([api_1.api.get('/a'), api_1.api.get('/b')])];
                case 1:
                    _a = _b.sent(), a = _a[0], b = _a[1];
                    (0, vitest_1.expect)(a).toEqual([{ id: 1 }]);
                    (0, vitest_1.expect)(b).toEqual([{ id: 2 }]);
                    refreshCalls = fetchMock.mock.calls.filter(function (_a) {
                        var init = _a[1];
                        return (init === null || init === void 0 ? void 0 : init.method) === 'POST';
                    });
                    (0, vitest_1.expect)(refreshCalls).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('401 → refresh 失败 → logout + 触发 unauthorizedHandler + 抛 AuthError', function () { return __awaiter(void 0, void 0, void 0, function () {
        var handlerCalled, fetchMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    handlerCalled = false;
                    (0, api_1.setUnauthorizedHandler)(function () {
                        handlerCalled = true;
                    });
                    fetchMock = vitest_1.vi
                        .fn()
                        .mockResolvedValueOnce(jsonResponse({}, 401)) // GET /customers
                        .mockResolvedValueOnce(jsonResponse({ error: 'INVALID_REFRESH', message: 'bad refresh' }, 401));
                    vitest_1.vi.stubGlobal('fetch', fetchMock);
                    setLoggedIn('old-access', 'bad-refresh');
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.get('/customers')).rejects.toMatchObject({
                            code: 'UNAUTHORIZED',
                            message: '登录已过期，请重新登录',
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(handlerCalled).toBe(true);
                    (0, vitest_1.expect)(auth_1.useAuthStore.getState().isAuthenticated).toBe(false);
                    (0, vitest_1.expect)(auth_1.useAuthStore.getState().accessToken).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('无 refresh token → refresh 失败 → 仍走统一登出处理', function () { return __awaiter(void 0, void 0, void 0, function () {
        var handlerCalled;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    handlerCalled = false;
                    (0, api_1.setUnauthorizedHandler)(function () {
                        handlerCalled = true;
                    });
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(jsonResponse({}, 401)));
                    // store 未登录（accessToken/refreshToken 均 null）
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.get('/customers')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })];
                case 1:
                    // store 未登录（accessToken/refreshToken 均 null）
                    _a.sent();
                    (0, vitest_1.expect)(handlerCalled).toBe(true);
                    (0, vitest_1.expect)(auth_1.useAuthStore.getState().isAuthenticated).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('api 错误透传', function () {
    (0, vitest_1.it)('500 → ApiError 透传后端 { error, message }', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(jsonResponse({ error: 'DB_DOWN', message: '数据库连接失败' }, 500)));
                    setLoggedIn();
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.get('/customers')).rejects.toMatchObject({
                            code: 'DB_DOWN',
                            message: '数据库连接失败',
                            status: 500,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('非 JSON 错误体 → 兜底 HTTP 状态描述', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(new Response('gateway error', { status: 502 })));
                    setLoggedIn();
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.get('/customers')).rejects.toMatchObject({
                            code: 'HTTP_502',
                            status: 502,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('204 → 返回 undefined（DELETE 软删）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
                    setLoggedIn();
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.delete('/customers/1')).resolves.toBeUndefined()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('网络错误 → ApiError NETWORK_ERROR', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
                    setLoggedIn();
                    return [4 /*yield*/, (0, vitest_1.expect)(api_1.api.get('/customers')).rejects.toMatchObject({ code: 'NETWORK_ERROR' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
