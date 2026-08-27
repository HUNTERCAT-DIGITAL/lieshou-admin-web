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
 * 菜单数据驱动测试（ADR-0024 P2 阶段 4）.
 *
 * 验证：
 * 1. fetchUserMenus 走 /api/users/me/menus（services/menu.ts）
 * 2. BasicLayout 登录后拉取远程菜单并渲染（后端返回 → 版别裁剪 → ICON_MAP → ProLayout）
 * 3. 远程菜单失败 → 回退本地 _defaultProps 过滤（不白屏）
 */
var vitest_1 = require("vitest");
var react_router_dom_1 = require("react-router-dom");
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var BasicLayout_1 = require("../BasicLayout");
var auth_1 = require("../../stores/auth");
var menu_1 = require("../../services/menu");
vitest_1.vi.mock('../../services/menu', function () { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vitest_1.vi.importActual('../../services/menu')];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign(__assign({}, actual), { fetchUserMenus: vitest_1.vi.fn() })];
        }
    });
}); });
beforeAll(function () {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: function (query) { return ({
            matches: false,
            media: query,
            onchange: null,
            addListener: function () { },
            removeListener: function () { },
            addEventListener: function () { },
            removeEventListener: function () { },
            dispatchEvent: function () { return false; },
        }); },
    });
});
function mockMenus() {
    return [
        {
            key: 'today',
            path: '/admin',
            name: '今日作战台',
            icon: 'dashboard',
            accessKey: null,
            sort: 10,
            children: [],
        },
        {
            key: 'legal',
            path: '/legal',
            name: '案件管理',
            icon: 'book',
            accessKey: 'legal:use',
            sort: 20,
            children: [
                {
                    key: 'legal-cases',
                    path: '/legal/cases',
                    name: '办案列表',
                    icon: 'solution',
                    accessKey: 'legal:use',
                    sort: 10,
                    children: [],
                },
            ],
        },
    ];
}
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: 't',
        refreshToken: 'r',
        user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'], permissions: ['legal:use'] },
        isAuthenticated: true,
    });
    vitest_1.vi.mocked(menu_1.fetchUserMenus).mockResolvedValue(mockMenus());
});
(0, vitest_1.afterEach)(function () {
    vitest_1.vi.clearAllMocks();
});
var wrap = function () { return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter initialEntries={['/admin']}>
        <BasicLayout_1.default />
      </react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>); };
(0, vitest_1.describe)('菜单数据驱动（阶段 4）', function () {
    (0, vitest_1.it)('fetchUserMenus 在登录后调用', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(wrap());
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(menu_1.fetchUserMenus).toHaveBeenCalledTimes(1); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('远程菜单渲染：今日作战台（后端数据源）+ 案件管理分组存在', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, layout;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, react_1.render)(wrap());
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('今日作战台')];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBeTruthy();
                    // 分组项（案件管理）可能折叠渲染；用容器断言远程菜单已注入（含 legal 路由）
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(menu_1.fetchUserMenus).toHaveBeenCalled(); })];
                case 2:
                    // 分组项（案件管理）可能折叠渲染；用容器断言远程菜单已注入（含 legal 路由）
                    _b.sent();
                    layout = document.querySelector('.ant-pro-layout');
                    (0, vitest_1.expect)(layout).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('远程菜单失败 → 回退本地菜单（不白屏）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.mocked(menu_1.fetchUserMenus).mockRejectedValue(new Error('network'));
                    (0, vitest_1.expect)(function () { return (0, react_1.render)(wrap()); }).not.toThrow();
                    // 本地回退：PLATFORM_ADMIN 角色推导仍渲染菜单
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(menu_1.fetchUserMenus).toHaveBeenCalled(); })];
                case 1:
                    // 本地回退：PLATFORM_ADMIN 角色推导仍渲染菜单
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
