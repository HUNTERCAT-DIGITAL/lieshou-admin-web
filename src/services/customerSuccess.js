"use strict";
/**
 * 客户成功中心 API service — 调 Spring Cloud gateway → crm-service.
 *
 * 售后闭环：联系函（/api/letters/**）+ 客户响应（/api/responses/**）+ 工作台汇总
 * （/api/customer-success/summary）。与 crm.ts 同构：后端强制 X-Tenant-Id，跨租户 404。
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
exports.listLetters = listLetters;
exports.countLetters = countLetters;
exports.getLetterTemplates = getLetterTemplates;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.createLetter = createLetter;
exports.updateLetter = updateLetter;
exports.deleteLetter = deleteLetter;
exports.sendLetter = sendLetter;
exports.readLetter = readLetter;
exports.completeLetter = completeLetter;
exports.cancelLetter = cancelLetter;
exports.listResponses = listResponses;
exports.countResponses = countResponses;
exports.createResponse = createResponse;
exports.updateResponse = updateResponse;
exports.resolveResponse = resolveResponse;
exports.deleteResponse = deleteResponse;
exports.getCustomerSuccessSummary = getCustomerSuccessSummary;
var api_1 = require("./api");
// ============================================================
// 联系函
// ============================================================
/** GET /api/letters — 租户内联系函列表（可选 customerId / type / status 过滤） */
function listLetters(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs;
        return __generator(this, function (_a) {
            qs = [];
            if ((params === null || params === void 0 ? void 0 : params.customerId) !== undefined)
                qs.push("customerId=".concat(params.customerId));
            if (params === null || params === void 0 ? void 0 : params.type)
                qs.push("type=".concat(params.type));
            if (params === null || params === void 0 ? void 0 : params.status)
                qs.push("status=".concat(params.status));
            return [2 /*return*/, api_1.api.get("/letters".concat(qs.length > 0 ? "?".concat(qs.join('&')) : ''))];
        });
    });
}
/** GET /api/letters/count — 租户内未删联系函数 */
function countLetters() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/letters/count')];
        });
    });
}
/** GET /api/letter-templates — 系统预置 + 租户自定义模板（含 {customer} 占位符） */
function getLetterTemplates() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/letter-templates')];
        });
    });
}
/** POST /api/letter-templates — 创建租户自定义模板（templateKey 租户内唯一，冲突 409） */
function createTemplate(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/letter-templates', body)];
        });
    });
}
/** PUT /api/letter-templates/{id} — 更新租户自定义模板（系统模板 404） */
function updateTemplate(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/letter-templates/".concat(id), body)];
        });
    });
}
/** DELETE /api/letter-templates/{id} — 软删租户自定义模板（系统模板 404） */
function deleteTemplate(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/letter-templates/".concat(id))];
        });
    });
}
/** POST /api/letters — 创建（一律 DRAFT 草稿，发送走 /send） */
function createLetter(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/letters', body)];
        });
    });
}
/** PUT /api/letters/{id} — 仅 DRAFT 可改（后端 409 兜底） */
function updateLetter(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/letters/".concat(id), body)];
        });
    });
}
/** DELETE /api/letters/{id} — 软删 */
function deleteLetter(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/letters/".concat(id))];
        });
    });
}
/** POST /api/letters/{id}/send — DRAFT → SENT */
function sendLetter(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/letters/".concat(id, "/send"), {})];
        });
    });
}
/** POST /api/letters/{id}/read — SENT → READ（客户已读） */
function readLetter(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/letters/".concat(id, "/read"), {})];
        });
    });
}
/** POST /api/letters/{id}/complete — SENT/READ → COMPLETED */
function completeLetter(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/letters/".concat(id, "/complete"), {})];
        });
    });
}
/** POST /api/letters/{id}/cancel — 非终态 → CANCELLED */
function cancelLetter(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/letters/".concat(id, "/cancel"), {})];
        });
    });
}
// ============================================================
// 客户响应（响应深化）
// ============================================================
/** GET /api/responses — 租户内响应列表（可选 customerId / letterId / status / sentiment / 跟进到期 过滤） */
function listResponses(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs;
        return __generator(this, function (_a) {
            qs = [];
            if ((params === null || params === void 0 ? void 0 : params.customerId) !== undefined)
                qs.push("customerId=".concat(params.customerId));
            if ((params === null || params === void 0 ? void 0 : params.letterId) !== undefined)
                qs.push("letterId=".concat(params.letterId));
            if (params === null || params === void 0 ? void 0 : params.status)
                qs.push("status=".concat(params.status));
            if (params === null || params === void 0 ? void 0 : params.sentiment)
                qs.push("sentiment=".concat(params.sentiment));
            if (params === null || params === void 0 ? void 0 : params.followUpOverdue)
                qs.push('followUpOverdue=true');
            if (params === null || params === void 0 ? void 0 : params.followUpDueToday)
                qs.push('followUpDueToday=true');
            return [2 /*return*/, api_1.api.get("/responses".concat(qs.length > 0 ? "?".concat(qs.join('&')) : ''))];
        });
    });
}
/** GET /api/responses/count — 租户内未删响应数 */
function countResponses() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/responses/count')];
        });
    });
}
/** POST /api/responses — 创建（默认 OPEN 待跟进） */
function createResponse(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/responses', body)];
        });
    });
}
/** PUT /api/responses/{id} — 更新（含状态流转） */
function updateResponse(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/responses/".concat(id), body)];
        });
    });
}
/** POST /api/responses/{id}/resolve — → RESOLVED 闭环 */
function resolveResponse(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/responses/".concat(id, "/resolve"), {})];
        });
    });
}
/** DELETE /api/responses/{id} — 软删 */
function deleteResponse(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/responses/".concat(id))];
        });
    });
}
// ============================================================
// 工作台汇总
// ============================================================
/** GET /api/customer-success/summary — 客户成功中心工作台卡片聚合 */
function getCustomerSuccessSummary() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/customer-success/summary')];
        });
    });
}
