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
exports.default = NotificationBell;
/**
 * 顶栏通知铃铛：未读 Badge + 最近通知下拉 + 全部已读 / 查看全部。
 * 轮询 30s 刷新未读数（与审批待办红点节奏一致）。
 */
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useApiError_1 = require("../hooks/useApiError");
var notification_1 = require("../services/notification");
var POLL_MS = 30000;
var PREVIEW_SIZE = 5;
function NotificationBell() {
    var _this = this;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleError = (0, useApiError_1.useApiError)();
    var _a = (0, react_1.useState)(0), unread = _a[0], setUnread = _a[1];
    var _b = (0, react_1.useState)([]), recent = _b[0], setRecent = _b[1];
    var _c = (0, react_1.useState)(false), open = _c[0], setOpen = _c[1];
    var refresh = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, count, list, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            (0, notification_1.unreadNotificationCount)(),
                            (0, notification_1.listNotifications)({ page: 0, size: PREVIEW_SIZE }),
                        ])];
                case 1:
                    _a = _c.sent(), count = _a[0], list = _a[1];
                    setUnread(count);
                    setRecent(list);
                    return [3 /*break*/, 3];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void refresh();
        var timer = setInterval(function () { return void refresh(); }, POLL_MS);
        return function () { return clearInterval(timer); };
    }, [refresh]);
    var onMarkAllRead = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, notification_1.markAllNotificationsRead)()];
                case 1:
                    _a.sent();
                    setUnread(0);
                    setRecent(function (prev) { return prev.map(function (n) { return (__assign(__assign({}, n), { readAt: new Date().toISOString() })); }); });
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    handleError(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [handleError]);
    return (<antd_1.Dropdown open={open} onOpenChange={setOpen} trigger={['click']} placement="bottomRight" dropdownRender={function () { return (<div style={{
                width: 320,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                padding: 12,
            }}>
          <antd_1.Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
            <antd_1.Typography.Text strong>通知</antd_1.Typography.Text>
            <antd_1.Button type="link" size="small" icon={<icons_1.CheckOutlined />} onClick={onMarkAllRead}>
              全部已读
            </antd_1.Button>
          </antd_1.Space>
          <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}>
            {recent.length === 0 ? (<antd_1.Empty image={antd_1.Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知"/>) : (recent.map(function (n) { return (<div key={n.id} style={{
                    padding: '8px 4px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                }} onClick={function () {
                    setOpen(false);
                    navigate('/notification');
                }}>
                  <div style={{ fontWeight: n.readAt ? 400 : 600 }}>
                    {n.title}
                    {!n.readAt && (<span style={{ color: '#ff4d4f', marginLeft: 6, fontSize: 12 }}>未读</span>)}
                  </div>
                  <antd_1.Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {(0, dayjs_1.default)(n.createdAt).format('MM-DD HH:mm')}
                  </antd_1.Typography.Text>
                </div>); }))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <antd_1.Button type="link" size="small" onClick={function () { return navigate('/notification'); }}>
              查看全部通知
            </antd_1.Button>
          </div>
        </div>); }}>
      <antd_1.Badge count={unread} size="small" overflowCount={99} offset={[-2, 4]}>
        <antd_1.Button type="text" icon={<icons_1.BellOutlined />} aria-label="通知" data-testid="notification-bell"/>
      </antd_1.Badge>
    </antd_1.Dropdown>);
}
