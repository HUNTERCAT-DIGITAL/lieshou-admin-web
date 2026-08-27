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
exports.listBatches = listBatches;
exports.countBatches = countBatches;
exports.createBatch = createBatch;
exports.getBatchDetail = getBatchDetail;
exports.listInspections = listInspections;
exports.countInspections = countInspections;
exports.createInspection = createInspection;
exports.getInspection = getInspection;
exports.getProductTrace = getProductTrace;
/**
 * 质检追溯 API service（ADR-0037 · inventory-service，走统一 api 封装）.
 */
var api_1 = require("./api");
/** GET /api/batches — 批次列表（可选 productId / keyword） */
function listBatches(productId, keyword) {
    return __awaiter(this, void 0, void 0, function () {
        var params, qs;
        return __generator(this, function (_a) {
            params = new URLSearchParams();
            if (productId)
                params.set('productId', String(productId));
            if (keyword)
                params.set('keyword', keyword);
            qs = params.toString();
            return [2 /*return*/, api_1.api.get("/batches".concat(qs ? "?".concat(qs) : ''))];
        });
    });
}
/** GET /api/batches/count */
function countBatches() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/batches/count')];
        });
    });
}
/** POST /api/batches — 创建批次（追溯维度，不叠加库存） */
function createBatch(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/batches', body)];
        });
    });
}
/** GET /api/batches/{id} — 批次详情（含质检 + 流水追溯链路） */
function getBatchDetail(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/batches/".concat(id))];
        });
    });
}
/** GET /api/inspections — 质检列表（可选 productId / type / result） */
function listInspections(params) {
    return __awaiter(this, void 0, void 0, function () {
        var search, qs;
        return __generator(this, function (_a) {
            search = new URLSearchParams();
            if (params === null || params === void 0 ? void 0 : params.productId)
                search.set('productId', String(params.productId));
            if (params === null || params === void 0 ? void 0 : params.type)
                search.set('type', params.type);
            if (params === null || params === void 0 ? void 0 : params.result)
                search.set('result', params.result);
            qs = search.toString();
            return [2 /*return*/, api_1.api.get("/inspections".concat(qs ? "?".concat(qs) : ''))];
        });
    });
}
/** GET /api/inspections/count */
function countInspections() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/inspections/count')];
        });
    });
}
/** POST /api/inspections — 创建质检记录 */
function createInspection(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/inspections', body)];
        });
    });
}
/** GET /api/inspections/{id} — 质检详情（含商品名 + 批次号） */
function getInspection(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/inspections/".concat(id))];
        });
    });
}
/** GET /api/products/{id}/trace — 商品追溯（批次 + 质检 + 流水） */
function getProductTrace(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/products/".concat(id, "/trace"))];
        });
    });
}
