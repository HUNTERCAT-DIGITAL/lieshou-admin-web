"use strict";
/**
 * Auth API service - 调 Spring Cloud auth-service:8083.
 * Phase 5: 与 SpringDoc bearerAuth scheme 对齐.
 * @see .ai/decisions/0017-spring-security-jwt.md
 */
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
exports.login = login;
exports.switchTenant = switchTenant;
exports.fetchTenantOptions = fetchTenantOptions;
exports.refreshTokens = refreshTokens;
exports.fetchCurrentUser = fetchCurrentUser;
exports.sendCode = sendCode;
exports.loginWithCode = loginWithCode;
exports.register = register;
exports.resetPassword = resetPassword;
exports.oauthProviders = oauthProviders;
exports.oauthAuthorize = oauthAuthorize;
exports.oauthToken = oauthToken;
var api_1 = require("./api");
var errors_1 = require("../utils/errors");
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return errors_1.AuthError; } });
// VITE_API_BASE_URL 语义: gateway 的 API 前缀（dev 下为 /api, 由 vite proxy 原样转发;
// 未配置时同源 /api（与 services/api.ts 一致，nginx 反代 gateway）
var GATEWAY_BASE = (_a = import.meta.env.VITE_API_BASE_URL) !== null && _a !== void 0 ? _a : '/api';
// gateway 路由为 /api/auth/**，故 GATEWAY_BASE 后只拼 /auth（不要再重复 /api）
var AUTH_BASE = "".concat(GATEWAY_BASE, "/auth");
/**
 * POST /api/auth/login
 * @throws AuthError INVALID_CREDENTIALS (401) / USER_NOT_FOUND (404)
 */
function login(req) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/login"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(req),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
/**
 * POST /api/auth/switch-tenant — 用 refresh token 切换登录租户（先登录后选租户）
 */
function switchTenant(refreshToken, tenantCode) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/switch-tenant"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: refreshToken, tenantCode: tenantCode }),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
/**
 * POST /api/auth/tenant-options — 按 username 查可登录租户（公开，不校验密码）
 */
function fetchTenantOptions(username) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/tenant-options"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: username }),
                    })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = (_a.sent());
                    return [2 /*return*/, Array.isArray(data) ? data : []];
            }
        });
    });
}
/**
 * POST /api/auth/refresh
 */
function refreshTokens(refreshToken) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/refresh"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: refreshToken }),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
/**
 * GET /api/auth/me - 当前用户（走统一 api 封装：自动带 JWT + 401 自动 refresh）
 */
function fetchCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/auth/me')];
        });
    });
}
/** POST /api/auth/send-code */
function sendCode(channel, target, purpose) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/send-code"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channel: channel, target: target, purpose: purpose }),
                    })];
                case 1:
                    res = _a.sent();
                    if (!res.ok) {
                        throw new errors_1.AuthError('SEND_CODE_FAILED', "HTTP ".concat(res.status), res.status);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/** POST /api/auth/login/code - 验证码登录 */
function loginWithCode(tenantCode, channel, target, code) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/login/code"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tenantCode: tenantCode, channel: channel, target: target, code: code }),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
/** POST /api/auth/register - 注册（注册即登录）；inviteCode 可选（自动入租户） */
function register(req) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/register"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(req),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
/** POST /api/auth/reset-password - 忘记密码 */
function resetPassword(channel, target, code, newPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var res, body;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/reset-password"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channel: channel, target: target, code: code, newPassword: newPassword }),
                    })];
                case 1:
                    res = _b.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return null; })];
                case 2:
                    body = (_b.sent());
                    throw new errors_1.AuthError('RESET_FAILED', (_a = body === null || body === void 0 ? void 0 : body.message) !== null && _a !== void 0 ? _a : "HTTP ".concat(res.status), res.status);
                case 3: return [2 /*return*/];
            }
        });
    });
}
function parseTokenOrThrow(res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!res.ok) return [3 /*break*/, 2];
                    return [4 /*yield*/, res.json()];
                case 1: return [2 /*return*/, (_f.sent())];
                case 2:
                    body = {};
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, res.json()];
                case 4:
                    body = (_f.sent());
                    return [3 /*break*/, 6];
                case 5:
                    _a = _f.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (res.status === 401) {
                        throw new errors_1.AuthError('INVALID_CREDENTIALS', (_b = body.message) !== null && _b !== void 0 ? _b : 'invalid credentials', 401);
                    }
                    if (res.status === 404) {
                        throw new errors_1.AuthError('USER_NOT_FOUND', (_c = body.message) !== null && _c !== void 0 ? _c : 'user not found', 404);
                    }
                    throw new errors_1.AuthError((_d = body.error) !== null && _d !== void 0 ? _d : 'UNKNOWN', (_e = body.message) !== null && _e !== void 0 ? _e : "HTTP ".concat(res.status), res.status);
            }
        });
    });
}
/** GET /api/auth/oauth/providers - 可信身份通道注册表 */
function oauthProviders() {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/oauth/providers"))];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new errors_1.AuthError('OAUTH_FAILED', "HTTP ".concat(res.status), res.status);
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, (_a.sent())];
            }
        });
    });
}
/** POST /api/auth/oauth/authorize - 可信身份通道授权（一次性授权码） */
function oauthAuthorize(provider, memberUsername, tenantCode) {
    return __awaiter(this, void 0, void 0, function () {
        var res, body;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/oauth/authorize"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ provider: provider, memberUsername: memberUsername, tenantCode: tenantCode }),
                    })];
                case 1:
                    res = _b.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return null; })];
                case 2:
                    body = (_b.sent());
                    throw new errors_1.AuthError('OAUTH_AUTHORIZE_FAILED', (_a = body === null || body === void 0 ? void 0 : body.message) !== null && _a !== void 0 ? _a : "HTTP ".concat(res.status), res.status);
                case 3: return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, (_b.sent())];
            }
        });
    });
}
/** POST /api/auth/oauth/token - 授权码换组织会话 JWT */
function oauthToken(code, tenantCode) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/oauth/token"), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: code, tenantCode: tenantCode }),
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, parseTokenOrThrow(res)];
            }
        });
    });
}
