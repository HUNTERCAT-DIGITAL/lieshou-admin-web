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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Admin;
/**
 * 管理首页 · 数据看板（开源版 · 2026-08-27 开源数据源重构）.
 *
 * - 数据全部来自开源服务：user（租户/用户/审计/通知）+ approval（审批）
 * - 闭源商业模块（CRM/进销存/财务）不再请求（开源交付包未部署）
 * - dwjk（物联网云平台）：精简工作台——只看用户数（兼容既有版别）
 *
 * 布局：统计卡片（租户/用户/审批待办/我发起/审计/未读通知）
 *      + 审批类型分布（环形图）+ 最近审计动态
 */
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var ui_1 = require("@lieshoucloud/ui");
var access_1 = require("../access");
var useApiError_1 = require("../hooks/useApiError");
var editions_1 = require("../config/editions");
var approval_1 = require("../services/approval");
var approval_2 = require("@lieshoucloud/contract-types/business/approval");
var audit_1 = require("../services/audit");
var notification_1 = require("../services/notification");
var user_1 = require("../services/user");
var tenant_1 = require("../services/tenant");
var auth_1 = require("../stores/auth");
var Text = antd_1.Typography.Text;
function Admin() {
    var _this = this;
    var _a, _b;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleError = (0, useApiError_1.useApiError)();
    var user = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var roles = (_a = user === null || user === void 0 ? void 0 : user.roles) !== null && _a !== void 0 ? _a : [];
    var isPlatformAdmin = roles.includes(access_1.ROLE_PLATFORM_ADMIN);
    var dutyConsole = (0, editions_1.getEdition)().dutyConsole;
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)({
        tenants: null,
        users: 0,
        approvalInbox: 0,
        approvalMine: 0,
        auditCount: 0,
        unread: 0,
    }), overview = _d[0], setOverview = _d[1];
    var _e = (0, react_1.useState)([]), approvalTypeDist = _e[0], setApprovalTypeDist = _e[1];
    var _f = (0, react_1.useState)([]), recentAudits = _f[0], setRecentAudits = _f[1];
    var load = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var users, tenants, _a, counts, auditCount, unread, approvals, byType, _i, approvals_1, a, _b, e_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 12, 13, 14]);
                    return [4 /*yield*/, (0, user_1.countUsers)()];
                case 2:
                    users = _d.sent();
                    if (!isPlatformAdmin) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, tenant_1.listTenants)()];
                case 3:
                    _a = (_d.sent()).length;
                    return [3 /*break*/, 5];
                case 4:
                    _a = null;
                    _d.label = 5;
                case 5:
                    tenants = _a;
                    return [4 /*yield*/, (0, approval_1.getApprovalCounts)()];
                case 6:
                    counts = _d.sent();
                    return [4 /*yield*/, (0, audit_1.countAuditLogs)()];
                case 7:
                    auditCount = _d.sent();
                    return [4 /*yield*/, (0, notification_1.unreadNotificationCount)()];
                case 8:
                    unread = _d.sent();
                    setOverview({
                        tenants: tenants,
                        users: users,
                        approvalInbox: counts.inbox,
                        approvalMine: counts.mine,
                        auditCount: auditCount,
                        unread: unread,
                    });
                    if (!!dutyConsole) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, approval_1.listApprovals)({})];
                case 9:
                    approvals = _d.sent();
                    byType = new Map();
                    for (_i = 0, approvals_1 = approvals; _i < approvals_1.length; _i++) {
                        a = approvals_1[_i];
                        byType.set(a.type, ((_c = byType.get(a.type)) !== null && _c !== void 0 ? _c : 0) + 1);
                    }
                    setApprovalTypeDist(__spreadArray([], byType.entries(), true).map(function (_a) {
                        var _b, _c, _d;
                        var t = _a[0], value = _a[1];
                        return ({
                            name: (_c = (_b = approval_2.APPROVAL_TYPE_META[t]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : t,
                            value: value,
                            color: (_d = approval_2.APPROVAL_TYPE_META[t]) === null || _d === void 0 ? void 0 : _d.color,
                        });
                    }));
                    // 最近审计动态
                    _b = setRecentAudits;
                    return [4 /*yield*/, (0, audit_1.listAuditLogs)({ limit: 8 })];
                case 10:
                    // 最近审计动态
                    _b.apply(void 0, [_d.sent()]);
                    _d.label = 11;
                case 11: return [3 /*break*/, 14];
                case 12:
                    e_1 = _d.sent();
                    handleError(e_1);
                    return [3 /*break*/, 14];
                case 13:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    }); }, [handleError, isPlatformAdmin, dutyConsole]);
    (0, react_1.useEffect)(function () {
        void load();
    }, [load]);
    return (<pro_components_1.PageContainer title="数据看板" subTitle="开源版：租户 / 用户 / 审批 / 审计 / 通知 全景" extra={<antd_1.Button icon={<icons_1.ReloadOutlined />} onClick={function () { return void load(); }} loading={loading}>
          刷新
        </antd_1.Button>}>
      {/* ===== 第一行：平台规模 ===== */}
      <pro_components_1.ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
        <pro_components_1.StatisticCard statistic={{ title: '租户数', value: (_b = overview.tenants) !== null && _b !== void 0 ? _b : '-', icon: <icons_1.ClusterOutlined /> }}/>
        <pro_components_1.StatisticCard statistic={{ title: '用户数', value: overview.users, icon: <icons_1.TeamOutlined /> }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '审批待办',
            value: overview.approvalInbox,
            icon: <icons_1.BellOutlined />,
            suffix: '条',
        }} onClick={function () { return navigate('/approval/list'); }}/>
      </pro_components_1.ProCard>

      {/* ===== 第二行：业务动态 ===== */}
      {!dutyConsole && (<pro_components_1.ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          <pro_components_1.StatisticCard statistic={{
                title: '我发起的审批',
                value: overview.approvalMine,
                icon: <icons_1.SendOutlined />,
                suffix: '条',
            }} onClick={function () { return navigate('/approval/list'); }}/>
          <pro_components_1.StatisticCard statistic={{
                title: '审计日志',
                value: overview.auditCount,
                icon: <icons_1.AuditOutlined />,
                suffix: '条',
            }} onClick={function () { return navigate('/audit/list'); }}/>
          <pro_components_1.StatisticCard statistic={{
                title: '未读通知',
                value: overview.unread,
                icon: <icons_1.BellOutlined />,
                suffix: '条',
            }} onClick={function () { return navigate('/notification'); }}/>
        </pro_components_1.ProCard>)}

      {/* ===== 第三行：审批分布 + 最近审计 ===== */}
      {!dutyConsole && (<pro_components_1.ProCard gutter={16} wrap>
          <pro_components_1.ProCard title="审批类型分布" colSpan={{ xs: 24, lg: 10 }} loading={loading}>
            {approvalTypeDist.length > 0 ? (<ui_1.DatavDvRing data={approvalTypeDist} type="ring" height={200}/>) : (<Text type="secondary">暂无审批数据</Text>)}
          </pro_components_1.ProCard>
          <pro_components_1.ProCard title="最近审计动态" colSpan={{ xs: 24, lg: 14 }} loading={loading}>
            <antd_1.List size="small" dataSource={recentAudits} locale={{ emptyText: '暂无审计记录' }} renderItem={function (l) {
                var _a;
                return (<antd_1.List.Item>
                  <antd_1.Space>
                    <antd_1.Tag>{l.action}</antd_1.Tag>
                    <Text>{l.resourceType}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      #{(_a = l.resourceId) !== null && _a !== void 0 ? _a : '-'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(l.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    </Text>
                  </antd_1.Space>
                </antd_1.List.Item>);
            }}/>
          </pro_components_1.ProCard>
        </pro_components_1.ProCard>)}

      {/* ===== 快捷入口 ===== */}
      <pro_components_1.ProCard gutter={16} wrap style={{ marginTop: 16 }}>
        <antd_1.Space size="middle" wrap>
          <antd_1.Button icon={<icons_1.FileSearchOutlined />} onClick={function () { return navigate('/audit/list'); }}>
            审计日志
          </antd_1.Button>
          <antd_1.Button icon={<icons_1.CheckCircleOutlined />} onClick={function () { return navigate('/approval/list'); }}>
            审批中心
          </antd_1.Button>
          <antd_1.Button icon={<icons_1.BellOutlined />} onClick={function () { return navigate('/notification'); }}>
            通知中心
          </antd_1.Button>
          <antd_1.Button icon={<icons_1.UserOutlined />} onClick={function () { return navigate('/profile'); }}>
            个人中心
          </antd_1.Button>
        </antd_1.Space>
      </pro_components_1.ProCard>
    </pro_components_1.PageContainer>);
}
