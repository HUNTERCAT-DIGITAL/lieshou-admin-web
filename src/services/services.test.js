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
/**
 * Service wrapper 单测（Phase 9 · 覆盖率提升）.
 *
 * 这些 service 都是 api.get/post/put/delete 的轻量包装，主要验证：
 * - URL path 拼接正确（含动态 id）
 * - query string 拼接正确（crm 的 listCustomers 关键字 + status）
 * - body 透传
 *
 * api.ts 本身有独立测试覆盖 401 重试等。
 */
var vitest_1 = require("vitest");
// 用 vi.mock 替换整个 api 模块（这些 service 用的都是这个 api 对象）。
// vi.mock 会被 hoist 到文件顶部，factory 不能引用外层变量；
// 用 vi.hoisted 提前定义可变 mock 函数。
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPost: vitest_1.vi.fn(),
    apiPut: vitest_1.vi.fn(),
    apiDelete: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPost = _a.apiPost, apiPut = _a.apiPut, apiDelete = _a.apiDelete;
vitest_1.vi.mock('./api', function () { return ({
    api: {
        get: apiGet,
        post: apiPost,
        put: apiPut,
        delete: apiDelete,
    },
}); });
// 必须在 mock 之后 import service 模块
var crm_1 = require("./crm");
var role_1 = require("./role");
var tenant_1 = require("./tenant");
var user_1 = require("./user");
(0, vitest_1.beforeEach)(function () {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPut.mockReset();
    apiDelete.mockReset();
});
// ============================================================
// crm
// ============================================================
(0, vitest_1.describe)('crm service', function () {
    (0, vitest_1.it)('listCustomers 无过滤 → /customers', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, crm_1.listCustomers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/customers');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listCustomers keyword + status → query string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, crm_1.listCustomers)('hello world', 'NEW')];
                case 1:
                    _a.sent();
                    url = apiGet.mock.calls[0][0];
                    (0, vitest_1.expect)(url).toContain('/customers?');
                    (0, vitest_1.expect)(url).toContain('keyword=hello%20world');
                    (0, vitest_1.expect)(url).toContain('status=NEW');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listCustomers keyword 单独', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, crm_1.listCustomers)('foo')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet.mock.calls[0][0]).toBe('/customers?keyword=foo');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listCustomers status 单独', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, crm_1.listCustomers)(undefined, 'FOLLOWING')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet.mock.calls[0][0]).toBe('/customers?status=FOLLOWING');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countCustomers → /customers/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(42);
                    return [4 /*yield*/, (0, crm_1.countCustomers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/customers/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getCustomer → /customers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 7 });
                    return [4 /*yield*/, (0, crm_1.getCustomer)(7)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/customers/7');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createCustomer → POST /customers + body', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({ id: 1 });
                    return [4 /*yield*/, (0, crm_1.createCustomer)({ name: 'A' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/customers', { name: 'A' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateCustomer → PUT /customers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({ id: 9 });
                    return [4 /*yield*/, (0, crm_1.updateCustomer)(9, { name: 'B' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/customers/9', { name: 'B' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteCustomer → DELETE /customers/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, crm_1.deleteCustomer)(11)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/customers/11');
                    return [2 /*return*/];
            }
        });
    }); });
});
// ============================================================
// user
// ============================================================
(0, vitest_1.describe)('user service', function () {
    (0, vitest_1.it)('listUsers → /users', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, user_1.listUsers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/users');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('countUsers → /users/count', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue(0);
                    return [4 /*yield*/, (0, user_1.countUsers)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/users/count');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getUser → /users/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({});
                    return [4 /*yield*/, (0, user_1.getUser)(3)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/users/3');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createUser → POST /users', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({});
                    return [4 /*yield*/, (0, user_1.createUser)({ username: 'x' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/users', { username: 'x' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateUser → PUT /users/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({});
                    return [4 /*yield*/, (0, user_1.updateUser)(2, { displayName: 'X' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/users/2', { displayName: 'X' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteUser → DELETE /users/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, user_1.deleteUser)(5)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/users/5');
                    return [2 /*return*/];
            }
        });
    }); });
});
// ============================================================
// role
// ============================================================
(0, vitest_1.describe)('role service', function () {
    (0, vitest_1.it)('listRoles → /roles', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, role_1.listRoles)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/roles');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createRole → POST /roles', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({});
                    return [4 /*yield*/, (0, role_1.createRole)({ code: 'X' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/roles', { code: 'X' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateRole → PUT /roles/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({});
                    return [4 /*yield*/, (0, role_1.updateRole)(4, { name: 'Y' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/roles/4', { name: 'Y' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteRole → DELETE /roles/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, role_1.deleteRole)(6)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/roles/6');
                    return [2 /*return*/];
            }
        });
    }); });
});
// ============================================================
// tenant
// ============================================================
(0, vitest_1.describe)('tenant service', function () {
    (0, vitest_1.it)('listTenants → /tenants', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, tenant_1.listTenants)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/tenants');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getTenant → /tenants/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({});
                    return [4 /*yield*/, (0, tenant_1.getTenant)(2)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/tenants/2');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createTenant → POST /tenants', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({});
                    return [4 /*yield*/, (0, tenant_1.createTenant)({ name: 'A' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/tenants', { name: 'A' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updateTenant → PUT /tenants/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPut.mockResolvedValue({});
                    return [4 /*yield*/, (0, tenant_1.updateTenant)(3, { name: 'B' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPut).toHaveBeenCalledWith('/tenants/3', { name: 'B' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('deleteTenant → DELETE /tenants/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiDelete.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, tenant_1.deleteTenant)(4)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiDelete).toHaveBeenCalledWith('/tenants/4');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('createInvite → POST /tenants/{id}/invites', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue({});
                    return [4 /*yield*/, (0, tenant_1.createInvite)(5, { role: 'USER' })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/tenants/5/invites', { role: 'USER' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('listInvites → /tenants/{id}/invites', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue([]);
                    return [4 /*yield*/, (0, tenant_1.listInvites)(7)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/tenants/7/invites');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('revokeInvite → POST /tenants/{tenantId}/invites/{id}/revoke', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiPost.mockResolvedValue(undefined);
                    return [4 /*yield*/, (0, tenant_1.revokeInvite)(8, 99)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiPost).toHaveBeenCalledWith('/tenants/8/invites/99/revoke', {});
                    return [2 /*return*/];
            }
        });
    }); });
});
