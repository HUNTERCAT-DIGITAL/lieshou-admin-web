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
exports.listApprovals = listApprovals;
exports.getApprovalCounts = getApprovalCounts;
exports.getApproval = getApproval;
exports.createApproval = createApproval;
exports.approveApproval = approveApproval;
exports.rejectApproval = rejectApproval;
exports.cancelApproval = cancelApproval;
/**
 * 审批流 API service（ADR-0032 · approval-service，走统一 api 封装）.
 */
var api_1 = require("./api");
/** GET /api/approvals — 租户内列表（role: mine=我发起的 / inbox=待我审批 / all=全部） */
function listApprovals(params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs, s;
        return __generator(this, function (_a) {
            qs = new URLSearchParams();
            if (params === null || params === void 0 ? void 0 : params.role)
                qs.set('role', params.role);
            if (params === null || params === void 0 ? void 0 : params.status)
                qs.set('status', params.status);
            if (params === null || params === void 0 ? void 0 : params.type)
                qs.set('type', params.type);
            s = qs.toString();
            return [2 /*return*/, api_1.api.get("/approvals".concat(s ? "?".concat(s) : ''))];
        });
    });
}
/** GET /api/approvals/counts — 待办计数（inbox=待我审批 / mine=我发起待处理） */
function getApprovalCounts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/approvals/counts')];
        });
    });
}
/** GET /api/approvals/{id} */
function getApproval(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/approvals/".concat(id))];
        });
    });
}
/** POST /api/approvals — 发起审批 */
function createApproval(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/approvals', body)];
        });
    });
}
/** POST /api/approvals/{id}/approve — 通过（仅审批人） */
function approveApproval(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/approvals/".concat(id, "/approve"), body !== null && body !== void 0 ? body : {})];
        });
    });
}
/** POST /api/approvals/{id}/reject — 驳回（仅审批人，comment 必填） */
function rejectApproval(id, comment) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/approvals/".concat(id, "/reject"), { comment: comment })];
        });
    });
}
/** POST /api/approvals/{id}/cancel — 撤销（仅发起人） */
function cancelApproval(id, comment) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/approvals/".concat(id, "/cancel"), comment ? { comment: comment } : {})];
        });
    });
}
