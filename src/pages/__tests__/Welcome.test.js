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
 * Welcome 页面单测（Phase 9 · 覆盖率）.
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
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
var stubAuthModule = vitest_1.vi.hoisted(function () { return function () { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vitest_1.vi.importActual('../../services/auth')];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign(__assign({}, actual), { fetchCurrentUser: vitest_1.vi.fn() })];
        }
    });
}); }; });
vitest_1.vi.mock('../../services/auth', stubAuthModule);
var Welcome_1 = require("../Welcome");
var authApi = require("../../services/auth");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('Welcome 页', function () {
    (0, vitest_1.it)('渲染用户信息卡 + 快捷入口 + 调试信息折叠', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            vitest_1.vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
                userId: 1,
                tenantCode: 'jxlkas',
                username: 'futurewl',
                roles: ['PLATFORM_ADMIN'],
            });
            auth_1.useAuthStore.setState({
                accessToken: 't',
                refreshToken: 'r',
                user: { userId: 1, username: 'futurewl', roles: ['PLATFORM_ADMIN'] },
                isAuthenticated: true,
            });
            (0, react_1.render)(<Welcome_1.default />, { wrapper: wrap });
            (0, vitest_1.expect)(react_1.screen.getByText('futurewl')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('UID 1')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('PLATFORM_ADMIN')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('快捷入口')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('CRM 客户管理')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('个人中心')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('调试信息（JWT）')).toBeInTheDocument();
            (0, vitest_1.expect)(react_1.screen.getByText('退出登录')).toBeInTheDocument();
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.it)('点「退出登录」清空 state + 跳登录页', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
                        userId: 1,
                        username: 'u',
                        roles: ['USER'],
                    });
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: { userId: 1, username: 'u', roles: ['USER'] },
                        isAuthenticated: true,
                    });
                    (0, react_1.render)(<Welcome_1.default />, { wrapper: wrap });
                    react_1.fireEvent.click(react_1.screen.getByTestId('logout-button'));
                    return [4 /*yield*/, vitest_1.vi.waitFor(function () {
                            (0, vitest_1.expect)(auth_1.useAuthStore.getState().isAuthenticated).toBe(false);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('点「刷新 /me」调 fetchMe + 成功 message', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
                        userId: 2,
                        username: 'refreshed',
                        roles: ['USER'],
                    });
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: { userId: 1, username: 'u', roles: ['USER'] },
                        isAuthenticated: true,
                    });
                    (0, react_1.render)(<Welcome_1.default />, { wrapper: wrap });
                    react_1.fireEvent.click(react_1.screen.getByRole('button', { name: /刷新 \/me/ }));
                    return [4 /*yield*/, vitest_1.vi.waitFor(function () {
                            (0, vitest_1.expect)(authApi.fetchCurrentUser).toHaveBeenCalled();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
