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
 * Profile 租户展示测试（ADR-0035 配置层 · 法律版单租户不体现「租户」概念）.
 *
 * 法律版（showLegal）个人中心不显示租户；通用版保留。用 vi.doMock editions + 动态 import。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: 't',
        refreshToken: 'r',
        user: {
            userId: 1,
            tenantId: 1,
            tenantCode: 'jxlkas',
            username: 'ops',
            roles: ['PLATFORM_ADMIN'],
        },
        isAuthenticated: true,
    });
    vitest_1.vi.restoreAllMocks();
});
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>{children}</antd_1.App>
  </antd_1.ConfigProvider>);
};
/** 以指定 showLegal 动态加载 Profile（mock editions 配置层） */
function loadProfile(showLegal) {
    return __awaiter(this, void 0, void 0, function () {
        var mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.doMock('../../config/editions', function () { return ({
                        getEdition: function () { return ({ showLegal: showLegal, dutyConsole: false }); },
                    }); });
                    vitest_1.vi.resetModules();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../Profile'); })];
                case 1:
                    mod = _a.sent();
                    vitest_1.vi.doUnmock('../../config/editions');
                    return [2 /*return*/, mod.default];
            }
        });
    });
}
(0, vitest_1.describe)('Profile · 租户展示（法律版隐藏）', function () {
    (0, vitest_1.it)('法律版（showLegal）：不显示租户/租户编码', function () { return __awaiter(void 0, void 0, void 0, function () {
        var LegalProfile, unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadProfile(true)];
                case 1:
                    LegalProfile = _a.sent();
                    unmount = (0, react_1.render)(<LegalProfile />, { wrapper: wrap }).unmount;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('个人中心')).toBeTruthy();
                        })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.queryByText(/租户/)).toBeNull();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('通用版（generic）：显示租户编码', function () { return __awaiter(void 0, void 0, void 0, function () {
        var GenericProfile, unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadProfile(false)];
                case 1:
                    GenericProfile = _a.sent();
                    unmount = (0, react_1.render)(<GenericProfile />, { wrapper: wrap }).unmount;
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText(/租户：jxlkas/)).toBeTruthy();
                        })];
                case 2:
                    _a.sent();
                    unmount();
                    return [2 /*return*/];
            }
        });
    }); });
});
