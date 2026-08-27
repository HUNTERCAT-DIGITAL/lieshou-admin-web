"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
 * 登录页可信身份理念区测试（SECURE WORKSPACE · 愿景「可信身份登录」）.
 *
 * 法律版（layer/legalmind · showLegal）登录页显示理念区；通用版不显示。
 * 用 vi.doMock editions + 动态 import（本文件不静态 import Login，避免 resetModules 失效）。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
vitest_1.vi.mock('../../services/auth', function () { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vitest_1.vi.importActual('../../services/auth')];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign(__assign({}, actual), { oauthProviders: vitest_1.vi.fn(), oauthAuthorize: vitest_1.vi.fn(), oauthToken: vitest_1.vi.fn() })];
        }
    });
}); });
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
    vitest_1.vi.restoreAllMocks();
});
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter initialEntries={['/login']}>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
/** 以指定 showLegal 动态加载 Login（mock editions 配置层） */
function loadLogin(showLegal) {
    return __awaiter(this, void 0, void 0, function () {
        var mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.doMock('../../config/editions', function () { return ({
                        getEdition: function () { return ({
                            id: showLegal ? 'legalmind' : 'generic',
                            showLegal: showLegal,
                            dutyConsole: false,
                            hideTenantInput: false,
                            brandName: 'LegalMind · 智法云枢',
                            logo: '/logo-legalmind.png',
                            defaultTenantCode: 'jxlkas',
                            allowRegister: false,
                            hiddenMenus: [],
                        }); },
                    }); });
                    vitest_1.vi.resetModules();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../Login'); })];
                case 1:
                    mod = _a.sent();
                    vitest_1.vi.doUnmock('../../config/editions');
                    return [2 /*return*/, mod.default];
            }
        });
    });
}
(0, vitest_1.describe)('登录页 · 可信身份理念区（SECURE WORKSPACE）', function () {
    (0, vitest_1.it)('法律版（showLegal）：显示理念区（标题 + 三个要点）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var LegalLogin, unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadLogin(true)];
                case 1:
                    LegalLogin = _a.sent();
                    unmount = (0, react_1.render)(<LegalLogin />, { wrapper: wrap }).unmount;
                    (0, vitest_1.expect)(react_1.screen.getByText('SECURE WORKSPACE · 可信专业工作空间')).toBeTruthy();
                    (0, vitest_1.expect)(react_1.screen.getByText('可信身份登录')).toBeTruthy();
                    (0, vitest_1.expect)(react_1.screen.getByText('组织成员核验')).toBeTruthy();
                    (0, vitest_1.expect)(react_1.screen.getByText('数据受控')).toBeTruthy();
                    (0, vitest_1.expect)(react_1.screen.getByText(/进入您的可信专业工作空间/)).toBeTruthy();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('通用版（generic）：不显示理念区', function () { return __awaiter(void 0, void 0, void 0, function () {
        var GenericLogin, unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadLogin(false)];
                case 1:
                    GenericLogin = _a.sent();
                    unmount = (0, react_1.render)(<GenericLogin />, { wrapper: wrap }).unmount;
                    (0, vitest_1.expect)(react_1.screen.queryByText('SECURE WORKSPACE · 可信专业工作空间')).toBeNull();
                    (0, vitest_1.expect)(react_1.screen.queryByText('组织成员核验')).toBeNull();
                    (0, vitest_1.expect)(react_1.screen.queryByTestId('oauth-login-button')).toBeNull();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('登录页 · 可信身份 OAuth 通道', function () {
    (0, vitest_1.it)('法律版显示「Sign in with ChatGPT」按钮 → 打开授权 Modal（理念 + 通道）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oauthProviders, LegalLogin, unmount, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/auth'); })];
                case 1:
                    oauthProviders = (_b.sent()).oauthProviders;
                    vitest_1.vi.mocked(oauthProviders).mockResolvedValue([
                        {
                            provider: 'chatgpt',
                            name: 'Sign in with ChatGPT',
                            hint: '不保存密码',
                            permissions: ['member:verify'],
                        },
                        {
                            provider: 'wecom',
                            name: '企业微信扫码',
                            hint: 'AUTH REQUIRED',
                            permissions: ['member:verify'],
                        },
                    ]);
                    return [4 /*yield*/, loadLogin(true)];
                case 2:
                    LegalLogin = _b.sent();
                    unmount = (0, react_1.render)(<LegalLogin />, { wrapper: wrap }).unmount;
                    (0, vitest_1.expect)(react_1.screen.getByTestId('oauth-login-button')).toBeTruthy();
                    react_1.fireEvent.click(react_1.screen.getByTestId('oauth-login-button'));
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('进入您的可信专业工作空间')];
                case 3:
                    _a.apply(void 0, [_b.sent()]).toBeTruthy();
                    // 按钮 + Modal 通道按钮均含该文案 → getAllByText
                    (0, vitest_1.expect)(react_1.screen.getAllByText('Sign in with ChatGPT').length).toBeGreaterThan(0);
                    (0, vitest_1.expect)(react_1.screen.getByText('企业微信扫码')).toBeTruthy();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('授权并登录：核验通过 → 一次性授权码 → 安全会话建立 → 跳转', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, oauthProviders, oauthAuthorize, oauthToken, LegalLogin, unmount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/auth'); })];
                case 1:
                    _a = _b.sent(), oauthProviders = _a.oauthProviders, oauthAuthorize = _a.oauthAuthorize, oauthToken = _a.oauthToken;
                    vitest_1.vi.mocked(oauthProviders).mockResolvedValue([
                        {
                            provider: 'chatgpt',
                            name: 'Sign in with ChatGPT',
                            hint: '不保存密码',
                            permissions: ['member:verify'],
                        },
                    ]);
                    vitest_1.vi.mocked(oauthAuthorize).mockResolvedValue({
                        code: 'oc_test',
                        state: 'st_test',
                        expiresInSeconds: 300,
                        memberUsername: 'admin',
                        tenantCode: 'jxlkas',
                        memberStatus: 'VERIFIED',
                    });
                    vitest_1.vi.mocked(oauthToken).mockResolvedValue({
                        accessToken: 'at-oauth',
                        refreshToken: 'rt-oauth',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'admin',
                        tenantCode: 'jxlkas',
                        tenantName: '凌科安时',
                        tenantEdition: 'LEGALMIND',
                        provider: 'chatgpt',
                        memberStatus: 'VERIFIED',
                        sessionAt: '2026-08-26T02:00:00Z',
                    });
                    return [4 /*yield*/, loadLogin(true)];
                case 2:
                    LegalLogin = _b.sent();
                    unmount = (0, react_1.render)(<LegalLogin />, { wrapper: wrap }).unmount;
                    react_1.fireEvent.click(react_1.screen.getByTestId('oauth-login-button'));
                    return [4 /*yield*/, react_1.screen.findByText('进入您的可信专业工作空间')];
                case 3:
                    _b.sent();
                    react_1.fireEvent.click(react_1.screen.getByTestId('oauth-authorize-button'));
                    // 默认租户来自版别配置（jxlkas）→ 授权携带租户
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(oauthAuthorize).toHaveBeenCalledWith('chatgpt', 'admin', 'jxlkas'); })];
                case 4:
                    // 默认租户来自版别配置（jxlkas）→ 授权携带租户
                    _b.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(oauthToken).toHaveBeenCalledWith('oc_test', 'jxlkas'); })];
                case 5:
                    _b.sent();
                    // 授权成功后 onSuccess → setSession + 跳转（页面卸载）→ 授权按钮消失
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.queryByTestId('oauth-authorize-button')).toBeNull(); })];
                case 6:
                    // 授权成功后 onSuccess → setSession + 跳转（页面卸载）→ 授权按钮消失
                    _b.sent();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('授权失败：成员非 ACTIVE → 显示错误且不登录', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, oauthProviders, oauthAuthorize, LegalLogin, unmount, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/auth'); })];
                case 1:
                    _a = _c.sent(), oauthProviders = _a.oauthProviders, oauthAuthorize = _a.oauthAuthorize;
                    vitest_1.vi.mocked(oauthProviders).mockResolvedValue([
                        {
                            provider: 'chatgpt',
                            name: 'Sign in with ChatGPT',
                            hint: '不保存密码',
                            permissions: ['member:verify'],
                        },
                    ]);
                    vitest_1.vi.mocked(oauthAuthorize).mockRejectedValue(new Error('MEMBER_DISABLED'));
                    return [4 /*yield*/, loadLogin(true)];
                case 2:
                    LegalLogin = _c.sent();
                    unmount = (0, react_1.render)(<LegalLogin />, { wrapper: wrap }).unmount;
                    react_1.fireEvent.click(react_1.screen.getByTestId('oauth-login-button'));
                    return [4 /*yield*/, react_1.screen.findByText('进入您的可信专业工作空间')];
                case 3:
                    _c.sent();
                    react_1.fireEvent.click(react_1.screen.getByTestId('oauth-authorize-button'));
                    _b = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText(/登录失败/)];
                case 4:
                    _b.apply(void 0, [_c.sent()]).toBeTruthy();
                    (0, vitest_1.expect)(auth_1.useAuthStore.getState().isAuthenticated).toBe(false);
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
});
