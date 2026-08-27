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
 * 烟雾测试：_defaultProps 模块加载不抛错 + 版别菜单差异（ADR-0035 配置层）.
 *
 * 重要回归点：
 * 1. 之前图标用纯字符串，ProLayout 的 getIcon 会静默丢弃——任何菜单项没有 icon 必须 fail。
 * 2. 法律版（layer/legalmind · showLegal）菜单置顶「今日作战台」+ 隐藏通用「欢迎」页；
 *    通用版保持 欢迎/工作台 原顺序（登录后直进今日作战台，2026-08-25 客户反馈）。
 */
var vitest_1 = require("vitest");
function flatten(routes) {
    var out = [];
    routes.forEach(function (r) {
        var _a;
        out.push(r);
        ((_a = r.routes) !== null && _a !== void 0 ? _a : []).forEach(function (c) { return out.push(c); });
    });
    return out;
}
/** 以指定版别动态加载 _defaultProps（模块级 getEdition() 在导入时求值） */
function loadProps(edition) {
    return __awaiter(this, void 0, void 0, function () {
        var mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubEnv('VITE_EDITION', edition);
                    vitest_1.vi.resetModules();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../_defaultProps'); })];
                case 1:
                    mod = _a.sent();
                    vitest_1.vi.unstubAllEnvs();
                    return [2 /*return*/, mod.default];
            }
        });
    });
}
(0, vitest_1.describe)('_defaultProps smoke', function () {
    (0, vitest_1.it)('模块加载成功（图标导入正确）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var props;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadProps('generic')];
                case 1:
                    props = _b.sent();
                    (0, vitest_1.expect)(props).toBeDefined();
                    (0, vitest_1.expect)((_a = props.route) === null || _a === void 0 ? void 0 : _a.routes).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('每个有 name 的菜单项 icon 都是 ReactNode（@ant-design/icons JSX）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var props, flat, named;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadProps('generic')];
                case 1:
                    props = _c.sent();
                    flat = flatten((_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.routes) !== null && _b !== void 0 ? _b : []);
                    (0, vitest_1.expect)(flat.length).toBeGreaterThan(0);
                    named = flat.filter(function (r) { return r.name; });
                    (0, vitest_1.expect)(named.length).toBeGreaterThan(0);
                    named.forEach(function (r) {
                        (0, vitest_1.expect)(typeof r.icon).not.toBe('string');
                        // icon 必须是 React 元素（有 type 字段的 object 或函数组件）
                        (0, vitest_1.expect)(r.icon).toBeDefined();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('通用版（generic）：菜单含 欢迎 + 工作台（不显示今日作战台）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var names, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = flatten;
                    return [4 /*yield*/, loadProps('generic')];
                case 1:
                    names = _a.apply(void 0, [(_c = (_b = (_d.sent()).route) === null || _b === void 0 ? void 0 : _b.routes) !== null && _c !== void 0 ? _c : []]).map(function (r) { return r.name; });
                    (0, vitest_1.expect)(names).toContain('欢迎');
                    (0, vitest_1.expect)(names).toContain('工作台');
                    (0, vitest_1.expect)(names).not.toContain('今日作战台');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('法律版（layer · showLegal）：菜单置顶 今日作战台 + 隐藏通用欢迎页', function () { return __awaiter(void 0, void 0, void 0, function () {
        var flat, _a, names;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = flatten;
                    return [4 /*yield*/, loadProps('layer')];
                case 1:
                    flat = _a.apply(void 0, [(_c = (_b = (_d.sent()).route) === null || _b === void 0 ? void 0 : _b.routes) !== null && _c !== void 0 ? _c : []]);
                    names = flat.map(function (r) { return r.name; });
                    (0, vitest_1.expect)(flat[0]).toMatchObject({ path: '/admin', name: '今日作战台' });
                    (0, vitest_1.expect)(names).toContain('今日作战台');
                    (0, vitest_1.expect)(names).not.toContain('欢迎');
                    (0, vitest_1.expect)(names).not.toContain('工作台');
                    return [2 /*return*/];
            }
        });
    }); });
});
