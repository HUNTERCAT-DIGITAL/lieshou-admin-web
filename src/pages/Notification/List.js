"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = NotificationList;
/**
 * 通知中心：我的站内通知列表（未读优先）· 标记已读 / 全部已读。
 */
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
var react_1 = require("react");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var notification_1 = require("../../services/notification");
var PAGE_SIZE = 20;
var TYPE_META = {
    SYSTEM: { text: '系统', color: 'default' },
    APPROVAL: { text: '审批', color: 'blue' },
    AUDIT: { text: '审计', color: 'cyan' },
};
function NotificationList() {
    var _this = this;
    var handleError = (0, useApiError_1.useApiError)();
    var _a = (0, react_1.useState)([]), items = _a[0], setItems = _a[1];
    var _b = (0, react_1.useState)(0), unread = _b[0], setUnread = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(0), page = _d[0], setPage = _d[1];
    var load = (0, react_1.useCallback)(function (p) { return __awaiter(_this, void 0, void 0, function () {
        var _a, list, count, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            (0, notification_1.listNotifications)({ page: p, size: PAGE_SIZE }),
                            (0, notification_1.unreadNotificationCount)(),
                        ])];
                case 2:
                    _a = _b.sent(), list = _a[0], count = _a[1];
                    setItems(list);
                    setUnread(count);
                    setPage(p);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _b.sent();
                    handleError(e_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [handleError]);
    (0, react_1.useEffect)(function () {
        void load(0);
    }, [load]);
    var onRead = (0, react_1.useCallback)(function (n) { return __awaiter(_this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (n.readAt)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, notification_1.markNotificationRead)(n.id)];
                case 2:
                    _a.sent();
                    setItems(function (prev) {
                        return prev.map(function (x) { return (x.id === n.id ? __assign(__assign({}, x), { readAt: new Date().toISOString() }) : x); });
                    });
                    setUnread(function (u) { return Math.max(0, u - 1); });
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    handleError(e_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [handleError]);
    var onReadAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var updated_1, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, notification_1.markAllNotificationsRead)()];
                case 1:
                    updated_1 = _a.sent();
                    setItems(function (prev) {
                        return prev.map(function (x) { var _a; return (__assign(__assign({}, x), { readAt: (_a = x.readAt) !== null && _a !== void 0 ? _a : new Date().toISOString() })); });
                    });
                    setUnread(function (u) { return Math.max(0, u - updated_1); });
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    handleError(e_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [handleError]);
    return (<pro_components_1.PageContainer title="通知中心" extra={<antd_1.Space>
          <antd_1.Button icon={<icons_1.ReloadOutlined />} onClick={function () { return void load(page); }}>
            刷新
          </antd_1.Button>
          <antd_1.Button type="primary" icon={<icons_1.CheckOutlined />} onClick={onReadAll} disabled={unread === 0}>
            全部已读{unread > 0 ? "\uFF08".concat(unread, "\uFF09") : ''}
          </antd_1.Button>
        </antd_1.Space>}>
      <pro_components_1.ProCard>
        <antd_1.List loading={loading} dataSource={items} locale={{ emptyText: <antd_1.Empty description="暂无通知"/> }} renderItem={function (n) {
            var _a, _b, _c, _d;
            return (<antd_1.List.Item onClick={function () { return void onRead(n); }} style={{ cursor: n.readAt ? 'default' : 'pointer' }}>
              <antd_1.List.Item.Meta title={<antd_1.Space>
                    <antd_1.Typography.Text strong={!n.readAt}>{n.title}</antd_1.Typography.Text>
                    {!n.readAt && <antd_1.Tag color="red">未读</antd_1.Tag>}
                    <antd_1.Tag color={(_b = (_a = TYPE_META[n.type]) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : 'default'}>
                      {(_d = (_c = TYPE_META[n.type]) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : n.type}
                    </antd_1.Tag>
                  </antd_1.Space>} description={<antd_1.Typography.Text type="secondary">
                    {(0, dayjs_1.default)(n.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    {n.content ? " \u00B7 ".concat(n.content) : ''}
                  </antd_1.Typography.Text>}/>
            </antd_1.List.Item>);
        }}/>
      </pro_components_1.ProCard>
    </pro_components_1.PageContainer>);
}
