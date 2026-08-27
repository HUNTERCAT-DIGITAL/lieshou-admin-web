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
exports.listLedger = listLedger;
exports.getLedgerSummary = getLedgerSummary;
exports.getMonthlySummary = getMonthlySummary;
exports.getLedger = getLedger;
exports.createLedger = createLedger;
exports.updateLedger = updateLedger;
exports.deleteLedger = deleteLedger;
/**
 * 财务记账 API service（Phase 9 · finance-service，走统一 api 封装）.
 */
var api_1 = require("./api");
/** GET /api/ledger — 租户内流水（可选 type/category/from/to 过滤） */
function listLedger(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs, s;
        return __generator(this, function (_a) {
            qs = new URLSearchParams();
            if (params === null || params === void 0 ? void 0 : params.type)
                qs.set('type', params.type);
            if (params === null || params === void 0 ? void 0 : params.category)
                qs.set('category', params.category);
            if (params === null || params === void 0 ? void 0 : params.from)
                qs.set('from', params.from);
            if (params === null || params === void 0 ? void 0 : params.to)
                qs.set('to', params.to);
            s = qs.toString();
            return [2 /*return*/, api_1.api.get("/ledger".concat(s ? "?".concat(s) : ''))];
        });
    });
}
/** GET /api/ledger/summary — 收支汇总（可选日期区间） */
function getLedgerSummary(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs, s;
        return __generator(this, function (_a) {
            qs = new URLSearchParams();
            if (params === null || params === void 0 ? void 0 : params.from)
                qs.set('from', params.from);
            if (params === null || params === void 0 ? void 0 : params.to)
                qs.set('to', params.to);
            s = qs.toString();
            return [2 /*return*/, api_1.api.get("/ledger/summary".concat(s ? "?".concat(s) : ''))];
        });
    });
}
/** GET /api/ledger/summary/monthly — 月度收支（默认最近 6 个月） */
function getMonthlySummary() {
    return __awaiter(this, arguments, void 0, function (months) {
        if (months === void 0) { months = 6; }
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/ledger/summary/monthly?months=".concat(months))];
        });
    });
}
/** GET /api/ledger/{id} */
function getLedger(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/ledger/".concat(id))];
        });
    });
}
/** POST /api/ledger */
function createLedger(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/ledger', body)];
        });
    });
}
/** PUT /api/ledger/{id} */
function updateLedger(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/ledger/".concat(id), body)];
        });
    });
}
/** DELETE /api/ledger/{id} */
function deleteLedger(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/ledger/".concat(id))];
        });
    });
}
