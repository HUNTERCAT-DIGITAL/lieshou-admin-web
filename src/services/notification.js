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
exports.listNotifications = listNotifications;
exports.unreadNotificationCount = unreadNotificationCount;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
/**
 * 站内通知 API service — 调 gateway → user-service（/api/notifications/**）.
 *
 * 开源版消息通知模块：当前用户通知列表 / 未读数 / 标记已读 / 全部已读。
 * 接收者上下文（X-User-Id / X-Tenant-Id）由 gateway 从 JWT 注入。
 */
var api_1 = require("./api");
/** GET /api/notifications — 我的通知（未读优先，新→旧） */
function listNotifications(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs, page, size, s;
        var _a, _b;
        return __generator(this, function (_c) {
            qs = new URLSearchParams();
            page = (_a = params === null || params === void 0 ? void 0 : params.page) !== null && _a !== void 0 ? _a : 0;
            size = (_b = params === null || params === void 0 ? void 0 : params.size) !== null && _b !== void 0 ? _b : 20;
            if (page !== null)
                qs.set('page', String(page));
            if (size !== null)
                qs.set('size', String(size));
            s = qs.toString();
            return [2 /*return*/, api_1.api.get("/notifications".concat(s ? "?".concat(s) : ''))];
        });
    });
}
/** GET /api/notifications/unread-count — 未读数 */
function unreadNotificationCount() {
    return __awaiter(this, void 0, void 0, function () {
        var r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.get('/notifications/unread-count')];
                case 1:
                    r = _a.sent();
                    return [2 /*return*/, r.unread];
            }
        });
    });
}
/** POST /api/notifications/{id}/read — 标记单条已读 */
function markNotificationRead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.post("/notifications/".concat(id, "/read"))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/** POST /api/notifications/read-all — 全部已读（返回本次标记条数） */
function markAllNotificationsRead() {
    return __awaiter(this, void 0, void 0, function () {
        var r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.post('/notifications/read-all')];
                case 1:
                    r = _a.sent();
                    return [2 /*return*/, r.updated];
            }
        });
    });
}
