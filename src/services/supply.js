"use strict";
/**
 * 供应结算 API service — 调 Spring Cloud gateway → edu-service（/api/supplies、/api/consumptions、/api/settlements）.
 *
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 供应单/消课/结算）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404；消课超额返回 409 BALANCE_INSUFFICIENT；结算周期重复返回 409 SETTLEMENT_PERIOD_CONFLICT。
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
exports.listSupplyOrders = listSupplyOrders;
exports.countSupplyOrders = countSupplyOrders;
exports.getSupplyOrder = getSupplyOrder;
exports.createSupplyOrder = createSupplyOrder;
exports.completeSupplyOrder = completeSupplyOrder;
exports.cancelSupplyOrder = cancelSupplyOrder;
exports.deleteSupplyOrder = deleteSupplyOrder;
exports.listConsumptions = listConsumptions;
exports.countConsumptions = countConsumptions;
exports.getConsumption = getConsumption;
exports.createConsumption = createConsumption;
exports.listSettlements = listSettlements;
exports.countSettlements = countSettlements;
exports.getSettlement = getSettlement;
exports.createSettlement = createSettlement;
exports.approveSettlement = approveSettlement;
exports.rejectSettlement = rejectSettlement;
exports.deleteSettlement = deleteSettlement;
var api_1 = require("./api");
// ---------- 供应单 ----------
/** GET /api/supplies — 租户内供应单列表（可选 keyword / status / partnerCustomerId 过滤；后端未分页） */
function listSupplyOrders(keyword, status, partnerCustomerId) {
    return __awaiter(this, void 0, void 0, function () {
        var params, qs;
        return __generator(this, function (_a) {
            params = [];
            if (keyword)
                params.push("keyword=".concat(encodeURIComponent(keyword)));
            if (status)
                params.push("status=".concat(status));
            if (partnerCustomerId)
                params.push("partnerCustomerId=".concat(partnerCustomerId));
            qs = params.length > 0 ? "?".concat(params.join('&')) : '';
            return [2 /*return*/, api_1.api.get("/supplies".concat(qs))];
        });
    });
}
/** GET /api/supplies/count — 租户内未删供应单数 */
function countSupplyOrders() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/supplies/count')];
        });
    });
}
/** GET /api/supplies/{id} */
function getSupplyOrder(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/supplies/".concat(id))];
        });
    });
}
/** POST /api/supplies — 创建（amount 由后端计算） */
function createSupplyOrder(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/supplies', body)];
        });
    });
}
/** POST /api/supplies/{id}/complete — 完成（ACTIVE → COMPLETED） */
function completeSupplyOrder(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/supplies/".concat(id, "/complete"), {})];
        });
    });
}
/** POST /api/supplies/{id}/cancel — 取消（有消课记录不可取消 → 409） */
function cancelSupplyOrder(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/supplies/".concat(id, "/cancel"), {})];
        });
    });
}
/** DELETE /api/supplies/{id} — 软删（仅终态 COMPLETED / CANCELLED） */
function deleteSupplyOrder(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/supplies/".concat(id))];
        });
    });
}
// ---------- 消课明细 ----------
/** GET /api/consumptions — 租户内消课明细（可选 supplyOrderId / keyword 过滤） */
function listConsumptions(keyword, supplyOrderId) {
    return __awaiter(this, void 0, void 0, function () {
        var params, qs;
        return __generator(this, function (_a) {
            params = [];
            if (keyword)
                params.push("keyword=".concat(encodeURIComponent(keyword)));
            if (supplyOrderId)
                params.push("supplyOrderId=".concat(supplyOrderId));
            qs = params.length > 0 ? "?".concat(params.join('&')) : '';
            return [2 /*return*/, api_1.api.get("/consumptions".concat(qs))];
        });
    });
}
/** GET /api/consumptions/count */
function countConsumptions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/consumptions/count')];
        });
    });
}
/** GET /api/consumptions/{id} */
function getConsumption(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/consumptions/".concat(id))];
        });
    });
}
/** POST /api/consumptions — 创建（快照由后端从供应单取；余额不足 → 409；审计流水不可删除） */
function createConsumption(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/consumptions', body)];
        });
    });
}
// ---------- 结算单 ----------
/** GET /api/settlements — 租户内结算单列表（可选 keyword / status / partnerCustomerId 过滤） */
function listSettlements(keyword, status, partnerCustomerId) {
    return __awaiter(this, void 0, void 0, function () {
        var params, qs;
        return __generator(this, function (_a) {
            params = [];
            if (keyword)
                params.push("keyword=".concat(encodeURIComponent(keyword)));
            if (status)
                params.push("status=".concat(status));
            if (partnerCustomerId)
                params.push("partnerCustomerId=".concat(partnerCustomerId));
            qs = params.length > 0 ? "?".concat(params.join('&')) : '';
            return [2 /*return*/, api_1.api.get("/settlements".concat(qs))];
        });
    });
}
/** GET /api/settlements/count */
function countSettlements() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/settlements/count')];
        });
    });
}
/** GET /api/settlements/{id} */
function getSettlement(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/settlements/".concat(id))];
        });
    });
}
/** POST /api/settlements — 创建（服务端聚合金额；周期重复 → 409） */
function createSettlement(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/settlements', body)];
        });
    });
}
/** POST /api/settlements/{id}/approve — 审批通过（PENDING → APPROVED） */
function approveSettlement(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/settlements/".concat(id, "/approve"), {})];
        });
    });
}
/** POST /api/settlements/{id}/reject — 驳回（PENDING → REJECTED） */
function rejectSettlement(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/settlements/".concat(id, "/reject"), {})];
        });
    });
}
/** DELETE /api/settlements/{id} — 软删（仅 PENDING） */
function deleteSettlement(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/settlements/".concat(id))];
        });
    });
}
