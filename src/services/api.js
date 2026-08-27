"use strict";
/**
 * 后端 API 请求封装 —— 薄封装,逻辑收敛到 @lieshoucloud/contract-api（L0-2 · Bottom-Up）
 *
 * - JWT 注入 / 401 单飞 refresh / 标准化错误体 → 全部由共享 api-client 承担
 * - 本文件只负责绑定本应用上下文：auth store、UI 登出出口、devlog
 *
 * @see BOTTOM_UP.md · L0-2
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.setUnauthorizedHandler = setUnauthorizedHandler;
var contract_api_1 = require("@lieshoucloud/contract-api");
var auth_1 = require("../stores/auth");
var devtools_1 = require("../utils/devtools");
var contract_config_1 = require("@lieshoucloud/contract-config");
// API base：默认同源 /api（nginx 反代 gateway；与后端路由前缀一致）。
// VITE_API_BASE_URL 构建注入可覆盖（如 http://localhost:9000/api 本地直连 gateway）。
var BASE = (0, contract_config_1.resolveApiBase)({ key: 'API_BASE_URL', defaultBase: '/api' });
/**
 * 登录过期后的 UI 出口（由 BasicLayout 注册：提示 + logout + 跳 /login）.
 * 登录页等未注册场景下为 null,此时 api 层仅抛 AuthError 由调用方处理。
 */
var unauthorizedHandler = null;
function setUnauthorizedHandler(fn) {
    unauthorizedHandler = fn;
}
exports.api = (0, contract_api_1.createApiClient)({
    baseUrl: BASE,
    hooks: {
        getAccessToken: function () { return auth_1.useAuthStore.getState().accessToken; },
        /** 单飞 refresh：并发 401 只发起一次;失败即 logout（共享客户端内部统一单飞） */
        refreshTokens: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, auth_1.useAuthStore.getState().refresh()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        auth_1.useAuthStore.getState().logout();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); },
        onUnauthorized: function () { return unauthorizedHandler === null || unauthorizedHandler === void 0 ? void 0 : unauthorizedHandler(); },
        onLog: devtools_1.pushDevLog,
    },
});
