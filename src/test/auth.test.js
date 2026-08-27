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
var vitest_1 = require("vitest");
var authApi = require("../services/auth");
var auth_1 = require("../services/auth");
var auth_2 = require("../stores/auth");
(0, vitest_1.describe)('useAuthStore (Zustand)', function () {
    (0, vitest_1.beforeEach)(function () {
        // 重置 store 与 localStorage
        localStorage.clear();
        auth_2.useAuthStore.setState({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
        });
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('初始 isAuthenticated=false', function () {
        (0, vitest_1.expect)(auth_2.useAuthStore.getState().isAuthenticated).toBe(false);
        (0, vitest_1.expect)(auth_2.useAuthStore.getState().accessToken).toBeNull();
    });
    (0, vitest_1.it)('login 成功：写 token + 标 authenticated', function () { return __awaiter(void 0, void 0, void 0, function () {
        var loginSpy, s;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loginSpy = vitest_1.vi.spyOn(authApi, 'login').mockResolvedValue({
                        accessToken: 'access-x',
                        refreshToken: 'refresh-x',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 42,
                        username: 'futurewl',
                    });
                    vitest_1.vi.spyOn(authApi, 'fetchCurrentUser').mockResolvedValue({
                        userId: 42,
                        username: 'futurewl',
                        roles: ['USER'],
                    });
                    return [4 /*yield*/, auth_2.useAuthStore.getState().login('futurewl', 'secret')];
                case 1:
                    _b.sent();
                    s = auth_2.useAuthStore.getState();
                    (0, vitest_1.expect)(loginSpy).toHaveBeenCalledWith({ username: 'futurewl', password: 'secret' });
                    (0, vitest_1.expect)(s.accessToken).toBe('access-x');
                    (0, vitest_1.expect)(s.refreshToken).toBe('refresh-x');
                    (0, vitest_1.expect)(s.isAuthenticated).toBe(true);
                    (0, vitest_1.expect)((_a = s.user) === null || _a === void 0 ? void 0 : _a.userId).toBe(42);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('login 失败：抛 AuthError + 不改 state', function () { return __awaiter(void 0, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.spyOn(authApi, 'login').mockRejectedValue(new auth_1.AuthError('INVALID_CREDENTIALS', 'wrong password', 401));
                    return [4 /*yield*/, (0, vitest_1.expect)(auth_2.useAuthStore.getState().login('x', 'wrong')).rejects.toThrow(auth_1.AuthError)];
                case 1:
                    _a.sent();
                    s = auth_2.useAuthStore.getState();
                    (0, vitest_1.expect)(s.isAuthenticated).toBe(false);
                    (0, vitest_1.expect)(s.accessToken).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('login 成功但 fetchMe 失败：吞错不阻塞（lines 57-58）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.spyOn(authApi, 'login').mockResolvedValue({
                        accessToken: 'access-x',
                        refreshToken: 'refresh-x',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 42,
                        username: 'futurewl',
                    });
                    // fetchMe 在 setSession/login 成功后被异步调用，抛错应被吞掉
                    vitest_1.vi.spyOn(authApi, 'fetchCurrentUser').mockRejectedValue(new Error('network down'));
                    return [4 /*yield*/, (0, vitest_1.expect)(auth_2.useAuthStore.getState().login('futurewl', 'secret')).resolves.toBeUndefined()];
                case 1:
                    _a.sent();
                    // 等一个 tick 让 fire-and-forget 的 catch 跑完
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    // 等一个 tick 让 fire-and-forget 的 catch 跑完
                    _a.sent();
                    s = auth_2.useAuthStore.getState();
                    // login 主体成功 → token 已写入；fetchMe 失败被忽略
                    (0, vitest_1.expect)(s.isAuthenticated).toBe(true);
                    (0, vitest_1.expect)(s.accessToken).toBe('access-x');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('setSession 成功但 fetchMe 失败：吞错不阻塞（lines 75-91）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.spyOn(authApi, 'fetchCurrentUser').mockRejectedValue(new Error('network down'));
                    auth_2.useAuthStore.getState().setSession({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    });
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(auth_2.useAuthStore.getState().accessToken).toBe('a');
                    (0, vitest_1.expect)(auth_2.useAuthStore.getState().isAuthenticated).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('logout：清空 token + user', function () {
        auth_2.useAuthStore.setState({
            accessToken: 'a',
            refreshToken: 'r',
            user: { userId: 1, username: 'u', roles: [] },
            isAuthenticated: true,
        });
        auth_2.useAuthStore.getState().logout();
        var s = auth_2.useAuthStore.getState();
        (0, vitest_1.expect)(s.isAuthenticated).toBe(false);
        (0, vitest_1.expect)(s.accessToken).toBeNull();
        (0, vitest_1.expect)(s.refreshToken).toBeNull();
        (0, vitest_1.expect)(s.user).toBeNull();
    });
    (0, vitest_1.it)('refresh：无 refresh token 抛 AuthError(NO_REFRESH_TOKEN)', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, vitest_1.expect)(auth_2.useAuthStore.getState().refresh()).rejects.toMatchObject({
                        code: 'NO_REFRESH_TOKEN',
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('refresh：成功换 access token', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    auth_2.useAuthStore.setState({
                        accessToken: 'old-access',
                        refreshToken: 'old-refresh',
                        user: null,
                        isAuthenticated: true,
                    });
                    vitest_1.vi.spyOn(authApi, 'refreshTokens').mockResolvedValue({
                        accessToken: 'new-access',
                        refreshToken: 'old-refresh',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    });
                    return [4 /*yield*/, auth_2.useAuthStore.getState().refresh()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(auth_2.useAuthStore.getState().accessToken).toBe('new-access');
                    return [2 /*return*/];
            }
        });
    }); });
});
