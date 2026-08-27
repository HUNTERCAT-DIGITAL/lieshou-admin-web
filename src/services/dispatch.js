"use strict";
/**
 * 师资派遣 API service — 调 Spring Cloud gateway → edu-service（/api/dispatches/**）.
 *
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 师资派遣排期）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404；创建时做产能校验（时段重叠 409 / 周课时超 weekly_cap 409）。
 * 基于 services/api.ts 的通用封装（自动带 JWT）。
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
exports.listDispatches = listDispatches;
exports.countDispatches = countDispatches;
exports.getDispatch = getDispatch;
exports.createDispatch = createDispatch;
exports.completeDispatch = completeDispatch;
exports.cancelDispatch = cancelDispatch;
exports.deleteDispatch = deleteDispatch;
var api_1 = require("./api");
/** GET /api/dispatches — 租户内派遣单列表（可选 keyword / status / teacherId 过滤；后端未分页） */
function listDispatches(keyword, status, teacherId) {
    return __awaiter(this, void 0, void 0, function () {
        var params, qs;
        return __generator(this, function (_a) {
            params = [];
            if (keyword)
                params.push("keyword=".concat(encodeURIComponent(keyword)));
            if (status)
                params.push("status=".concat(status));
            if (teacherId)
                params.push("teacherId=".concat(teacherId));
            qs = params.length > 0 ? "?".concat(params.join('&')) : '';
            return [2 /*return*/, api_1.api.get("/dispatches".concat(qs))];
        });
    });
}
/** GET /api/dispatches/count — 租户内未删派遣单数 */
function countDispatches() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/dispatches/count')];
        });
    });
}
/** GET /api/dispatches/{id} */
function getDispatch(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/dispatches/".concat(id))];
        });
    });
}
/** POST /api/dispatches — 创建（创建即派遣生效；产能校验失败返回 409） */
function createDispatch(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/dispatches', body)];
        });
    });
}
/** POST /api/dispatches/{id}/complete — 完成（教师无其他进行中派遣时释放回可用） */
function completeDispatch(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/dispatches/".concat(id, "/complete"), {})];
        });
    });
}
/** POST /api/dispatches/{id}/cancel — 取消（教师无其他进行中派遣时释放回可用） */
function cancelDispatch(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/dispatches/".concat(id, "/cancel"), {})];
        });
    });
}
/** DELETE /api/dispatches/{id} — 软删（仅终态 COMPLETED / CANCELLED） */
function deleteDispatch(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/dispatches/".concat(id))];
        });
    });
}
