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
 * RegisterTenant 租户自助开通页单测（issue #24 · SaaS 增长路径）.
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
var registerTenant = vitest_1.vi.hoisted(function () { return ({ registerTenant: vitest_1.vi.fn() }); }).registerTenant;
vitest_1.vi.mock('../../services/tenant', function () { return ({ registerTenant: registerTenant }); });
var RegisterTenant_1 = require("../RegisterTenant");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter initialEntries={['/register']}>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('RegisterTenant 租户自助开通页', function () {
    (0, vitest_1.it)('渲染：品牌 + 表单字段（租户/编码/管理员/密码）', function () {
        (0, react_1.render)(<RegisterTenant_1.default />, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getAllByText(/LieShouCloud/).length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getByText('免费开通')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('公司 / 组织名称')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('租户编码（登录用）')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('管理员用户名')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('确认密码')).toBeInTheDocument();
    });
    (0, vitest_1.it)('提交成功 → 调 registerTenant + 跳登录页（预填租户编码与用户名）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    registerTenant.mockResolvedValueOnce({
                        tenant: { id: 99, name: '示例公司', code: 'sampleco', status: 'ACTIVE', createdAt: '' },
                        adminUsername: 'admin',
                        adminDisplayName: '管理员',
                    });
                    (0, react_1.render)(<RegisterTenant_1.default />, { wrapper: wrap });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('如：示例科技有限公司'), {
                        target: { value: '示例公司' },
                    });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('mycompany'), { target: { value: 'sampleco' } });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('如：张三'), { target: { value: '管理员' } });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret123' } });
                    react_1.fireEvent.change(react_1.screen.getByPlaceholderText('再次输入密码'), {
                        target: { value: 'secret123' },
                    });
                    react_1.fireEvent.click(react_1.screen.getByRole('button', { name: '免费开通' }));
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(registerTenant).toHaveBeenCalledWith({
                                tenantName: '示例公司',
                                tenantCode: 'sampleco',
                                username: 'admin',
                                displayName: '管理员',
                                password: 'secret123',
                                email: undefined,
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
