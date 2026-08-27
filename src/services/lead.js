"use strict";
/**
 * CRM 线索 API service — 调 Spring Cloud gateway → crm-service（/api/leads/**）.
 *
 * 与 crm.ts（客户）同构：后端强制 X-Tenant-Id，跨租户 404。
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
exports.listLeads = listLeads;
exports.getLead = getLead;
exports.createLead = createLead;
exports.updateLead = updateLead;
exports.deleteLead = deleteLead;
exports.assignLead = assignLead;
exports.releaseLead = releaseLead;
exports.convertLead = convertLead;
exports.listFollowUps = listFollowUps;
exports.addFollowUp = addFollowUp;
exports.importLeads = importLeads;
var api_1 = require("./api");
/** GET /api/leads — 租户内线索列表；owner=-1 线索池(未认领) 0 全部 >0 指定认领人 */
function listLeads(keyword_1, status_1) {
    return __awaiter(this, arguments, void 0, function (keyword, status, owner) {
        var params, qs;
        if (owner === void 0) { owner = 0; }
        return __generator(this, function (_a) {
            params = [];
            if (keyword)
                params.push("keyword=".concat(encodeURIComponent(keyword)));
            if (status)
                params.push("status=".concat(status));
            if (owner !== 0)
                params.push("owner=".concat(owner));
            qs = params.length > 0 ? "?".concat(params.join('&')) : '';
            return [2 /*return*/, api_1.api.get("/leads".concat(qs))];
        });
    });
}
/** GET /api/leads/{id} */
function getLead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/leads/".concat(id))];
        });
    });
}
/** POST /api/leads — 创建（进池，ownerId 为空） */
function createLead(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/leads', body)];
        });
    });
}
/** PUT /api/leads/{id} */
function updateLead(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/leads/".concat(id), body)];
        });
    });
}
/** DELETE /api/leads/{id} */
function deleteLead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/leads/".concat(id))];
        });
    });
}
/** POST /api/leads/{id}/assign — 认领（当前用户） */
function assignLead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/leads/".concat(id, "/assign"), {})];
        });
    });
}
/** POST /api/leads/{id}/release — 释放回池 */
function releaseLead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/leads/".concat(id, "/release"), {})];
        });
    });
}
/** POST /api/leads/{id}/convert — 转化（创建客户并关联） */
function convertLead(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/leads/".concat(id, "/convert"), {})];
        });
    });
}
/** GET /api/leads/{id}/follow-ups — 跟进时间线 */
function listFollowUps(leadId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/leads/".concat(leadId, "/follow-ups"))];
        });
    });
}
/** POST /api/leads/{id}/follow-ups — 添加跟进 */
function addFollowUp(leadId, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/leads/".concat(leadId, "/follow-ups"), body)];
        });
    });
}
/** POST /api/leads/import — CSV 批量导入（进线索池，来源默认 IMPORT） */
function importLeads(file) {
    return __awaiter(this, void 0, void 0, function () {
        var form;
        return __generator(this, function (_a) {
            form = new FormData();
            form.append('file', file);
            return [2 /*return*/, api_1.api.postForm('/leads/import', form)];
        });
    });
}
