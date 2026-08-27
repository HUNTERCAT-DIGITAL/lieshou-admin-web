"use strict";
/**
 * Tenant API service — 调 Spring Cloud gateway → user-service（/api/tenants/**）.
 *
 * Phase 8 · 租户管理（开通/停用/列表）运营视角。
 * @see .ai/decisions/0022-multitenant-schema.md
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
exports.listTenants = listTenants;
exports.registerTenant = registerTenant;
exports.getTenant = getTenant;
exports.createTenant = createTenant;
exports.updateTenant = updateTenant;
exports.deleteTenant = deleteTenant;
exports.createInvite = createInvite;
exports.listInvites = listInvites;
exports.revokeInvite = revokeInvite;
var api_1 = require("./api");
/** GET /api/tenants — 全量列表 */
function listTenants() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/tenants')];
        });
    });
}
/** POST /api/tenants/register — 租户自助开通（公开端点，无鉴权 · issue #24） */
function registerTenant(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/tenants/register', body)];
        });
    });
}
/** GET /api/tenants/{id} */
function getTenant(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/tenants/".concat(id))];
        });
    });
}
/** POST /api/tenants — 开通租户 */
function createTenant(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/tenants', body)];
        });
    });
}
/** PUT /api/tenants/{id} — 更新（改名 / 启停） */
function updateTenant(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/tenants/".concat(id), body)];
        });
    });
}
/** DELETE /api/tenants/{id} — 删除（仅无用户时） */
function deleteTenant(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/tenants/".concat(id))];
        });
    });
}
// ============================================================
// 邀请码（ADR-0023 Phase 2）
// ============================================================
/** POST /api/tenants/{tenantId}/invites — 生成邀请码 */
function createInvite(tenantId, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/tenants/".concat(tenantId, "/invites"), body)];
        });
    });
}
/** GET /api/tenants/{tenantId}/invites — 列表 */
function listInvites(tenantId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/tenants/".concat(tenantId, "/invites"))];
        });
    });
}
/** POST /api/tenants/{tenantId}/invites/{id}/revoke — 撤销 */
function revokeInvite(tenantId, id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/tenants/".concat(tenantId, "/invites/").concat(id, "/revoke"), {})];
        });
    });
}
