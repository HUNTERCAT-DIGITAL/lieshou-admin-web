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
exports.selectUser = exports.selectIsAuthenticated = exports.selectAccessToken = exports.useAuthStore = void 0;
/**
 * Auth store (Zustand) - Phase 5.
 *
 * 持久化: localStorage; Phase 2+ 接 HttpOnly cookie + refresh rotation.
 *
 * @see .ai/decisions/0017-spring-security-jwt.md
 */
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var auth_1 = require("../services/auth");
var STORAGE_KEY = 'lieshoucloud:auth';
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)(function (set, get) { return ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    availableTenants: [],
    login: function (username, password, tenantCode) { return __awaiter(void 0, void 0, void 0, function () {
        var token, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, auth_1.login)({ username: username, password: password, tenantCode: tenantCode })];
                case 1:
                    token = _b.sent();
                    set({
                        accessToken: token.accessToken,
                        refreshToken: token.refreshToken,
                        user: {
                            userId: token.userId,
                            username: token.username,
                            roles: ['USER'],
                            tenantCode: token.tenantCode,
                            tenantName: token.tenantName,
                            tenantEdition: token.tenantEdition,
                        },
                        isAuthenticated: true,
                        availableTenants: (_a = token.availableTenants) !== null && _a !== void 0 ? _a : [],
                    });
                    // 异步 fetch /me 拿真实 roles（不阻塞登录）
                    get()
                        .fetchMe()
                        .catch(function () {
                        /* ignore; 后续按需刷新 */
                    });
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _b.sent();
                    if (e_1 instanceof auth_1.AuthError)
                        throw e_1;
                    throw new auth_1.AuthError('UNKNOWN', String(e_1));
                case 3: return [2 /*return*/];
            }
        });
    }); },
    refresh: function () { return __awaiter(void 0, void 0, void 0, function () {
        var refreshToken, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    refreshToken = get().refreshToken;
                    if (!refreshToken)
                        throw new auth_1.AuthError('NO_REFRESH_TOKEN', 'not logged in');
                    return [4 /*yield*/, (0, auth_1.refreshTokens)(refreshToken)];
                case 1:
                    token = _a.sent();
                    set({ accessToken: token.accessToken, refreshToken: token.refreshToken });
                    return [2 /*return*/];
            }
        });
    }); },
    fetchMe: function () { return __awaiter(void 0, void 0, void 0, function () {
        var me;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, auth_1.fetchCurrentUser)()];
                case 1:
                    me = _a.sent();
                    set({ user: me });
                    return [2 /*return*/, me];
            }
        });
    }); },
    setSession: function (token) {
        var _a;
        set({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            user: {
                userId: token.userId,
                username: token.username,
                roles: ['USER'],
                tenantCode: token.tenantCode,
                tenantName: token.tenantName,
                tenantEdition: token.tenantEdition,
            },
            isAuthenticated: true,
            availableTenants: (_a = token.availableTenants) !== null && _a !== void 0 ? _a : [],
        });
        // 异步拉真实 roles（不阻塞）
        get()
            .fetchMe()
            .catch(function () {
            /* ignore */
        });
    },
    logout: function () {
        set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            availableTenants: [],
        });
    },
    switchTenant: function (tenantCode) { return __awaiter(void 0, void 0, void 0, function () {
        var rt, token;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    rt = get().refreshToken;
                    if (!rt)
                        throw new auth_1.AuthError('UNAUTHORIZED', '未登录');
                    return [4 /*yield*/, (0, auth_1.switchTenant)(rt, tenantCode)];
                case 1:
                    token = _b.sent();
                    set({
                        accessToken: token.accessToken,
                        refreshToken: token.refreshToken,
                        user: {
                            userId: token.userId,
                            username: token.username,
                            roles: ['USER'],
                            tenantCode: token.tenantCode,
                            tenantName: token.tenantName,
                            tenantEdition: token.tenantEdition,
                        },
                        isAuthenticated: true,
                        availableTenants: (_a = token.availableTenants) !== null && _a !== void 0 ? _a : [],
                    });
                    // 异步拉真实 roles（切换租户后角色可能不同）
                    get()
                        .fetchMe()
                        .catch(function () {
                        /* ignore */
                    });
                    return [2 /*return*/];
            }
        });
    }); },
}); }, {
    name: STORAGE_KEY,
    partialize: function (s) { return ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        availableTenants: s.availableTenants,
    }); },
}));
/**
 * Selector helpers
 */
var selectAccessToken = function (s) { return s.accessToken; };
exports.selectAccessToken = selectAccessToken;
var selectIsAuthenticated = function (s) { return s.isAuthenticated; };
exports.selectIsAuthenticated = selectIsAuthenticated;
var selectUser = function (s) { return s.user; };
exports.selectUser = selectUser;
