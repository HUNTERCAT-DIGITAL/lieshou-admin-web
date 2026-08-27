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
 * Admin 数据看板单测（开源版 · 2026-08-27）.
 *
 * 数据源全部为开源服务：user（租户/用户/审计/通知）+ approval（审批）。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
    vitest_1.vi.restoreAllMocks();
    countUsers.mockResolvedValue(0);
    listTenants.mockResolvedValue([]);
    getApprovalCounts.mockResolvedValue({ inbox: 0, mine: 0 });
    countAuditLogs.mockResolvedValue(0);
    unreadNotificationCount.mockResolvedValue(0);
    listApprovals.mockResolvedValue([]);
    listAuditLogs.mockResolvedValue([]);
});
var _a = vitest_1.vi.hoisted(function () { return ({
    countUsers: vitest_1.vi.fn(),
    listTenants: vitest_1.vi.fn(),
    getApprovalCounts: vitest_1.vi.fn(),
    countAuditLogs: vitest_1.vi.fn(),
    unreadNotificationCount: vitest_1.vi.fn(),
    listApprovals: vitest_1.vi.fn(),
    listAuditLogs: vitest_1.vi.fn(),
}); }), countUsers = _a.countUsers, listTenants = _a.listTenants, getApprovalCounts = _a.getApprovalCounts, countAuditLogs = _a.countAuditLogs, unreadNotificationCount = _a.unreadNotificationCount, listApprovals = _a.listApprovals, listAuditLogs = _a.listAuditLogs;
vitest_1.vi.mock('../../services/user', function () { return ({ countUsers: countUsers }); });
vitest_1.vi.mock('../../services/tenant', function () { return ({ listTenants: listTenants }); });
vitest_1.vi.mock('../../services/approval', function () { return ({ getApprovalCounts: getApprovalCounts, listApprovals: listApprovals }); });
vitest_1.vi.mock('../../services/audit', function () { return ({ countAuditLogs: countAuditLogs, listAuditLogs: listAuditLogs }); });
vitest_1.vi.mock('../../services/notification', function () { return ({ unreadNotificationCount: unreadNotificationCount }); });
// ECharts 环形图在 jsdom 不可渲染，mock 为轻量占位；useApiError 一并 mock（来自同一包）
vitest_1.vi.mock('@lieshoucloud/ui', function () { return ({
    DatavDvRing: function (_a) {
        var data = _a.data;
        return (<div data-testid="dvring">{data.map(function (d) { return "".concat(d.name, ":").concat(d.value); }).join(',')}</div>);
    },
    useApiError: function () { return function () { }; },
}); });
var Admin_1 = require("../Admin");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('Admin 数据看板（开源版）', function () {
    (0, vitest_1.it)('PLATFORM_ADMIN：6 张统计卡 + 审批分布 + 最近审计 + 快捷入口', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    countUsers.mockResolvedValue(100);
                    listTenants.mockResolvedValue([{}, {}, {}]);
                    getApprovalCounts.mockResolvedValue({ inbox: 4, mine: 2 });
                    countAuditLogs.mockResolvedValue(88);
                    unreadNotificationCount.mockResolvedValue(7);
                    listApprovals.mockResolvedValue([
                        { id: 1, type: 'EXPENSE', title: '报销', status: 'PENDING' },
                        { id: 2, type: 'PURCHASE', title: '采购', status: 'APPROVED' },
                    ]);
                    listAuditLogs.mockResolvedValue([
                        { id: 1, action: 'CREATE', resourceType: 'USER', resourceId: 5, createdAt: '2026-08-27T00:00:00Z' },
                    ]);
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
                        isAuthenticated: true,
                    });
                    (0, react_1.render)(<Admin_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('租户数')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.getByText('用户数')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('审批待办')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('我发起的审批')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getAllByText('审计日志').length).toBeGreaterThan(0);
                    (0, vitest_1.expect)(react_1.screen.getByText('未读通知')).toBeInTheDocument();
                    // 数值
                    (0, vitest_1.expect)(react_1.screen.getByText('3')).toBeInTheDocument(); // 租户数
                    (0, vitest_1.expect)(react_1.screen.getByText('100')).toBeInTheDocument(); // 用户数
                    (0, vitest_1.expect)(react_1.screen.getByText('4')).toBeInTheDocument(); // 审批待办
                    (0, vitest_1.expect)(react_1.screen.getByText('88')).toBeInTheDocument(); // 审计
                    (0, vitest_1.expect)(react_1.screen.getByText('7')).toBeInTheDocument(); // 未读通知
                    // 审批类型分布（ECharts mock 占位）
                    (0, vitest_1.expect)(react_1.screen.getByTestId('dvring').textContent).toContain('支出报销');
                    // 最近审计动态
                    (0, vitest_1.expect)(react_1.screen.getByText('最近审计动态')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('CREATE')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('USER')).toBeInTheDocument();
                    // 快捷入口
                    (0, vitest_1.expect)(react_1.screen.getByText('审批中心')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('通知中心')).toBeInTheDocument();
                    (0, vitest_1.expect)(listTenants).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('非平台管理员：租户数为空占位 + 不调 listTenants', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    countUsers.mockResolvedValue(5);
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: { userId: 2, username: 'alice', roles: ['USER'] },
                        isAuthenticated: true,
                    });
                    (0, react_1.render)(<Admin_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('用户数')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(listTenants).not.toHaveBeenCalled();
                    // 租户卡显示 '-'（null）
                    (0, vitest_1.expect)(react_1.screen.getByText('租户数')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('-')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('审批为空：环形图占位提示', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    auth_1.useAuthStore.setState({
                        accessToken: 't',
                        refreshToken: 'r',
                        user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
                        isAuthenticated: true,
                    });
                    (0, react_1.render)(<Admin_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('暂无审批数据')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
