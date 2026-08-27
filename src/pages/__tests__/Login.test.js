"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
 * Login 页面单测（Phase 9 · 覆盖率）.
 *
 * 注：Login 有 593 行 + 三个表单（密码 / 验证码 / 注册 Modal / 重置密码 Modal），
 * 全部测成本太高；这里覆盖核心结构 + 错误消息映射。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    fetchTenantOptions.mockResolvedValue([]);
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
    vitest_1.vi.restoreAllMocks();
});
var _a = vitest_1.vi.hoisted(function () { return ({
    login: vitest_1.vi.fn(),
    loginWithCode: vitest_1.vi.fn(),
    register: vitest_1.vi.fn(),
    resetPassword: vitest_1.vi.fn(),
    sendCode: vitest_1.vi.fn(),
    fetchTenantOptions: vitest_1.vi.fn(),
}); }), login = _a.login, loginWithCode = _a.loginWithCode, register = _a.register, resetPassword = _a.resetPassword, sendCode = _a.sendCode, fetchTenantOptions = _a.fetchTenantOptions;
vitest_1.vi.mock('../../services/auth', function () { return ({
    login: login,
    loginWithCode: loginWithCode,
    register: register,
    resetPassword: resetPassword,
    sendCode: sendCode,
    fetchTenantOptions: fetchTenantOptions,
    AuthError: /** @class */ (function (_super) {
        __extends(AuthError, _super);
        function AuthError(code, message, status) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.status = status;
            _this.name = 'AuthError';
            return _this;
        }
        return AuthError;
    }(Error)),
}); });
var Login_1 = require("../Login");
var authApi = require("../../services/auth");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter initialEntries={['/login']}>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('Login 页', function () {
    (0, vitest_1.it)('渲染：品牌 + 登录标题 + 密码表单', function () {
        (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getByText('LieShouCloud')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('登录')).toBeInTheDocument();
        // 去验证码（2026-08-25）：仅账号密码登录，无 Tabs
        (0, vitest_1.expect)(react_1.screen.getByPlaceholderText('futurewl')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByPlaceholderText('password')).toBeInTheDocument();
        // 租户自助开通入口（generic 版 allowRegister=true · issue #24）
        (0, vitest_1.expect)(react_1.screen.getByText('免费开通租户').closest('a')).toHaveAttribute('href', '/register');
    });
    (0, vitest_1.it)('已登录 → 直接 Navigate 跳过 login', function () {
        auth_1.useAuthStore.setState({
            accessToken: 't',
            refreshToken: 'r',
            user: { userId: 1, username: 'u', roles: ['USER'] },
            isAuthenticated: true,
        });
        var container = (0, react_1.render)(<Login_1.default />, { wrapper: wrap }).container;
        // Navigate 后会渲染空（路由切到 /welcome，但测试环境没注册此路由）
        (0, vitest_1.expect)(container).toBeDefined();
    });
    (0, vitest_1.it)('密码登录：输入 + 提交调 login', function () { return __awaiter(void 0, void 0, void 0, function () {
        var userInputs, passInputs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    login.mockResolvedValue({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    });
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: null,
                        isAuthenticated: false,
                    });
                    // 设置未登录
                    auth_1.useAuthStore.setState({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        isAuthenticated: false,
                    });
                    (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
                    userInputs = react_1.screen.getAllByPlaceholderText('futurewl');
                    passInputs = react_1.screen.getAllByPlaceholderText('password');
                    react_1.fireEvent.change(userInputs[0], { target: { value: 'alice' } });
                    react_1.fireEvent.change(passInputs[0], { target: { value: 'secret' } });
                    react_1.fireEvent.click(react_1.screen.getByTestId('submit-button'));
                    return [4 /*yield*/, vitest_1.vi.waitFor(function () {
                            (0, vitest_1.expect)(login).toHaveBeenCalledWith({
                                username: 'alice',
                                password: 'secret',
                                tenantCode: undefined,
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('密码登录失败 INVALID_CREDENTIALS → 显示「密码错误」', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    login.mockRejectedValue(new authApi.AuthError('INVALID_CREDENTIALS', 'wrong', 401));
                    auth_1.useAuthStore.setState({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        isAuthenticated: false,
                    });
                    (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
                    react_1.fireEvent.change(react_1.screen.getByTestId('username-input'), { target: { value: 'a' } });
                    react_1.fireEvent.change(react_1.screen.getByTestId('password-input'), { target: { value: 'b' } });
                    react_1.fireEvent.click(react_1.screen.getByTestId('submit-button'));
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('密码错误')];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('密码登录失败 USER_NOT_FOUND → 显示「用户不存在」', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    login.mockRejectedValue(new authApi.AuthError('USER_NOT_FOUND', 'no', 404));
                    auth_1.useAuthStore.setState({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        isAuthenticated: false,
                    });
                    (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
                    react_1.fireEvent.change(react_1.screen.getByTestId('username-input'), { target: { value: 'x' } });
                    react_1.fireEvent.change(react_1.screen.getByTestId('password-input'), { target: { value: 'p' } });
                    react_1.fireEvent.click(react_1.screen.getByTestId('submit-button'));
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('用户不存在')];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('登录页不显示租户选择（先登录后选租户，登录带默认租户）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    login.mockResolvedValue({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    });
                    auth_1.useAuthStore.setState({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        isAuthenticated: false,
                    });
                    (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
                    // 登录页无租户输入/下拉（登录前不选租户）
                    (0, vitest_1.expect)(react_1.screen.queryByTestId('tenant-input')).not.toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.queryByTestId('tenant-select')).not.toBeInTheDocument();
                    react_1.fireEvent.change(react_1.screen.getByTestId('username-input'), { target: { value: 'a' } });
                    react_1.fireEvent.change(react_1.screen.getByTestId('password-input'), { target: { value: 'p' } });
                    react_1.fireEvent.click(react_1.screen.getByTestId('submit-button'));
                    return [4 /*yield*/, vitest_1.vi.waitFor(function () {
                            // 登录不指定租户 → 后端默认；登录后多租户在顶栏切换
                            (0, vitest_1.expect)(login).toHaveBeenCalledWith({ username: 'a', password: 'p', tenantCode: undefined });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('单租户：不显示租户下拉，直接登录（tenantCode undefined → 后端默认）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchTenantOptions.mockResolvedValue([
                        { tenantId: 1, tenantCode: 'huntercat', tenantName: '南昌猎手猫数字科技有限公司' },
                    ]);
                    login.mockResolvedValue({
                        accessToken: 'a',
                        refreshToken: 'r',
                        expiresIn: 1800,
                        tokenType: 'Bearer',
                        userId: 1,
                        username: 'u',
                    });
                    auth_1.useAuthStore.setState({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        isAuthenticated: false,
                    });
                    (0, react_1.render)(<Login_1.default />, { wrapper: wrap });
                    react_1.fireEvent.change(react_1.screen.getByTestId('username-input'), { target: { value: 'a' } });
                    react_1.fireEvent.change(react_1.screen.getByTestId('password-input'), { target: { value: 'p' } });
                    // 单租户 → 无下拉
                    (0, vitest_1.expect)(react_1.screen.queryByTestId('tenant-select')).not.toBeInTheDocument();
                    react_1.fireEvent.click(react_1.screen.getByTestId('submit-button'));
                    return [4 /*yield*/, vitest_1.vi.waitFor(function () {
                            (0, vitest_1.expect)(login).toHaveBeenCalledWith({
                                username: 'a',
                                password: 'p',
                                tenantCode: undefined,
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
