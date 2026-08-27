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
exports.default = AuditList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var audit_1 = require("../../services/audit");
var audit_2 = require("@lieshoucloud/contract-types/business/audit");
var ACTION_COLOR = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    DENIED: 'orange',
    LOGIN: 'geekblue',
    READ: 'default',
};
var OUTCOME_COLOR = {
    SUCCESS: 'green',
    DENIED: 'orange',
    ERROR: 'red',
};
/**
 * 审计日志页（append-only 只读 · DATA_SECURITY §7）.
 *
 * 数据源 user-service /api/audit-logs（平台操作：用户/租户/角色）；
 * 客户操作审计存于 crm-service（后续合并到统一查询）。
 */
function AuditList() {
    var _this = this;
    var actionRef = (0, react_1.useRef)(undefined);
    var handleError = (0, useApiError_1.useApiError)();
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 70, search: false },
        {
            title: '时间',
            dataIndex: 'createdAt',
            width: 170,
            search: false,
            render: function (_, row) { return new Date(row.createdAt).toLocaleString('zh-CN', { hour12: false }); },
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 90,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.entries(audit_2.AUDIT_ACTION_TEXT).map(function (_a) {
                var k = _a[0], v = _a[1];
                return [k, { text: v }];
            })),
            render: function (_, row) { return (<antd_1.Tag color={ACTION_COLOR[row.action]}>{audit_2.AUDIT_ACTION_TEXT[row.action]}</antd_1.Tag>); },
        },
        {
            title: '对象',
            dataIndex: 'resourceType',
            width: 100,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.entries(audit_2.AUDIT_RESOURCE_TEXT).map(function (_a) {
                var k = _a[0], v = _a[1];
                return [k, { text: v }];
            })),
            render: function (_, row) { var _a; return (_a = audit_2.AUDIT_RESOURCE_TEXT[row.resourceType]) !== null && _a !== void 0 ? _a : row.resourceType; },
        },
        { title: '对象ID', dataIndex: 'resourceId', width: 80, search: false },
        { title: '操作者', dataIndex: 'userId', width: 90, search: false },
        {
            title: '结果',
            dataIndex: 'outcome',
            width: 80,
            search: false,
            render: function (_, row) { return (<antd_1.Tag color={OUTCOME_COLOR[row.outcome]}>{audit_2.AUDIT_OUTCOME_TEXT[row.outcome]}</antd_1.Tag>); },
        },
        { title: '详情', dataIndex: 'detail', search: false, ellipsis: true },
        { title: '来源IP', dataIndex: 'sourceIp', width: 120, search: false },
        { title: 'RequestId', dataIndex: 'requestId', width: 150, search: false },
    ];
    return (<pro_components_1.PageContainer header={{
            title: (<span>
            <icons_1.HistoryOutlined style={{ marginRight: 8 }}/> 审计日志
          </span>),
            subTitle: '用户/租户/角色操作记录（append-only，不可删除）',
        }}>
      <pro_components_1.ProTable headerTitle="操作审计" rowKey="id" actionRef={actionRef} columns={columns} search={{ labelWidth: 'auto' }} options={{ setting: { draggable: true, checkable: true } }} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var _a, action, resourceType, current, pageSize, data, start, rows, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = params, action = _a.action, resourceType = _a.resourceType, current = _a.current, pageSize = _a.pageSize;
                        return [4 /*yield*/, (0, audit_1.listAuditLogs)({ action: action, resourceType: resourceType, limit: pageSize })];
                    case 1:
                        data = _b.sent();
                        start = (current - 1) * pageSize;
                        rows = data.slice(start, start + pageSize);
                        return [2 /*return*/, { data: rows, success: true, total: data.length }];
                    case 2:
                        e_1 = _b.sent();
                        handleError(e_1);
                        return [2 /*return*/, { data: [], success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ defaultPageSize: 20, showSizeChanger: true }} dateFormatter={false}/>
    </pro_components_1.PageContainer>);
}
