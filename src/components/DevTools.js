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
exports.default = DevTools;
/**
 * 开发者工具（悬浮 · 调试面板）.
 *
 * 右下角低调悬浮按钮，点击展开抽屉，Tab 分四类开发者关心的信息：
 *   - 环境：版别 / API 地址 / 构建模式 / 版本 / UA / 当前路由
 *   - 会话：当前用户 / 角色 / 租户 / JWT 载荷与剩余有效期
 *   - 请求：api.ts 插桩的实时请求日志（方法 / 路径 / 状态 / 耗时 / 错误）
 *   - 存储：localStorage / sessionStorage 键值（敏感值脱敏）
 * 支持一键「复制诊断信息」，方便反馈问题时携带上下文。
 *
 * 显示开关：默认显示；localStorage `lieshoucloud:devtools=off` 关闭，
 * URL 加 `?devtools=1` 强制显示（生产环境应急排查）。
 */
var icons_1 = require("@ant-design/icons");
var antd_1 = require("antd");
var react_1 = require("react");
var auth_1 = require("../stores/auth");
var devtools_1 = require("../utils/devtools");
var TOGGLE_KEY = 'lieshoucloud:devtools';
function isForcedOpen() {
    return new URLSearchParams(window.location.search).get('devtools') === '1';
}
function isEnabled() {
    return isForcedOpen() || localStorage.getItem(TOGGLE_KEY) !== 'off';
}
/** 剩余有效期（秒 → 人类可读） */
function formatRemain(exp, nowSec) {
    if (!exp)
        return '-';
    var remain = exp - nowSec;
    if (remain <= 0)
        return '已过期';
    if (remain < 3600)
        return "".concat(Math.floor(remain / 60), " \u5206\u949F");
    return "".concat(Math.floor(remain / 3600), " \u5C0F\u65F6 ").concat(Math.floor((remain % 3600) / 60), " \u5206");
}
function DevTools() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f;
    var messageApi = antd_1.App.useApp().message;
    var _g = (0, react_1.useState)(false), open = _g[0], setOpen = _g[1];
    var _h = (0, react_1.useState)(0), forceTick = _h[1];
    var user = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var accessToken = (0, auth_1.useAuthStore)(function (s) { return s.accessToken; });
    var refreshToken = (0, auth_1.useAuthStore)(function (s) { return s.refreshToken; });
    // 请求日志订阅（api.ts pushDevLog → 刷新）
    (0, react_1.useEffect)(function () { return (0, devtools_1.subscribeDevLogs)(function () { return forceTick(function (n) { return n + 1; }); }); }, []);
    (0, react_1.useEffect)(function () {
        if (!isEnabled())
            return;
    }, []);
    var env = (0, react_1.useMemo)(devtools_1.collectEnvSnapshot, [open]);
    var logs = (0, react_1.useMemo)(devtools_1.getDevLogs, [open, forceTick]);
    var jwt = (0, react_1.useMemo)(function () { return (0, devtools_1.decodeJwtPayload)(accessToken); }, [accessToken, open]);
    var nowSec = Math.floor(Date.now() / 1000);
    if (!isEnabled())
        return null;
    var copyDiagnostics = function () { return __awaiter(_this, void 0, void 0, function () {
        var session, storage, text;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    session = {
                        username: (_a = user === null || user === void 0 ? void 0 : user.username) !== null && _a !== void 0 ? _a : '(未登录)',
                        userId: user === null || user === void 0 ? void 0 : user.userId,
                        roles: (_b = user === null || user === void 0 ? void 0 : user.roles) !== null && _b !== void 0 ? _b : [],
                        tenantCode: user === null || user === void 0 ? void 0 : user.tenantCode,
                        tenantName: user === null || user === void 0 ? void 0 : user.tenantName,
                        tenantEdition: user === null || user === void 0 ? void 0 : user.tenantEdition,
                        accessToken: (0, devtools_1.maskSecret)(accessToken),
                        tokenExp: (jwt === null || jwt === void 0 ? void 0 : jwt.exp) ? new Date(Number(jwt.exp) * 1000).toLocaleString('zh-CN') : '-',
                    };
                    storage = {
                        localStorage: Object.fromEntries(Object.keys(localStorage).map(function (k) { return [k, (0, devtools_1.maskSecret)(localStorage.getItem(k))]; })),
                        sessionStorage: Object.fromEntries(Object.keys(sessionStorage).map(function (k) { return [k, (0, devtools_1.maskSecret)(sessionStorage.getItem(k))]; })),
                    };
                    text = JSON.stringify({ env: env, session: session, jwt: jwt, storage: storage, lastRequests: logs.slice(-20) }, null, 2);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _c.sent();
                    messageApi.success('诊断信息已复制到剪贴板');
                    return [2 /*return*/];
            }
        });
    }); };
    var requestColumns = [
        {
            title: '时间',
            dataIndex: 'at',
            width: 90,
            render: function (v) { return <antd_1.Typography.Text type="secondary">{v}</antd_1.Typography.Text>; },
        },
        {
            title: '方法',
            dataIndex: 'method',
            width: 70,
            render: function (v) { return <antd_1.Tag color={v === 'GET' ? 'blue' : v === 'POST' ? 'green' : 'orange'}>{v}</antd_1.Tag>; },
        },
        { title: '路径', dataIndex: 'path', ellipsis: true },
        {
            title: '状态',
            dataIndex: 'status',
            width: 70,
            render: function (v) { return (<antd_1.Tag color={v === 0 ? 'red' : v < 300 ? 'green' : v < 500 ? 'orange' : 'red'}>{v || 'ERR'}</antd_1.Tag>); },
        },
        {
            title: '耗时',
            dataIndex: 'durationMs',
            width: 80,
            sorter: function (a, b) { return a.durationMs - b.durationMs; },
            render: function (v) { return "".concat(v, "ms"); },
        },
        {
            title: '错误',
            dataIndex: 'error',
            ellipsis: true,
            render: function (v) {
                return v ? <antd_1.Typography.Text type="danger">{v}</antd_1.Typography.Text> : <antd_1.Typography.Text type="secondary">-</antd_1.Typography.Text>;
            },
        },
    ];
    var storageEntries = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray([], Object.keys(localStorage).map(function (k) { return ({ area: 'localStorage', key: k, value: (0, devtools_1.maskSecret)(localStorage.getItem(k)) }); }), true), Object.keys(sessionStorage).map(function (k) { return ({ area: 'sessionStorage', key: k, value: (0, devtools_1.maskSecret)(sessionStorage.getItem(k)) }); }), true); }, [open]);
    return (<>
      {/* 悬浮按钮：右下角，低调半透明 */}
      <antd_1.Button shape="circle" size="small" icon={<icons_1.BugOutlined />} title="开发者工具" onClick={function () { return setOpen(true); }} style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 1000,
            opacity: 0.55,
        }}/>
      <antd_1.Drawer title="开发者工具" width={760} open={open} onClose={function () { return setOpen(false); }} extra={<antd_1.Space>
            <antd_1.Button size="small" icon={<icons_1.CopyOutlined />} onClick={copyDiagnostics}>
              复制诊断信息
            </antd_1.Button>
          </antd_1.Space>}>
        <antd_1.Tabs items={[
            {
                key: 'env',
                label: (<span>
                  <icons_1.EnvironmentOutlined /> 环境
                </span>),
                children: (<antd_1.Descriptions column={2} size="small" bordered>
                  <antd_1.Descriptions.Item label="版别 (VITE_EDITION)">{env.edition}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="API 地址">{env.apiBase || '(同源)'}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="构建模式">
                    {env.mode} {env.isDev && <antd_1.Tag color="green">dev</antd_1.Tag>}
                    {env.isProd && <antd_1.Tag color="blue">prod</antd_1.Tag>}
                  </antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="应用版本">{env.appVersion}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="当前路由">{env.pathname}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="UA">{env.userAgent}</antd_1.Descriptions.Item>
                </antd_1.Descriptions>),
            },
            {
                key: 'session',
                label: (<span>
                  <icons_1.TeamOutlined /> 会话
                </span>),
                children: (<antd_1.Descriptions column={2} size="small" bordered>
                  <antd_1.Descriptions.Item label="用户名">{(_a = user === null || user === void 0 ? void 0 : user.username) !== null && _a !== void 0 ? _a : '(未登录)'}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="用户 ID">{(_b = user === null || user === void 0 ? void 0 : user.userId) !== null && _b !== void 0 ? _b : '-'}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="角色">
                    {((_c = user === null || user === void 0 ? void 0 : user.roles) !== null && _c !== void 0 ? _c : []).map(function (r) { return (<antd_1.Tag key={r} color="geekblue">{r}</antd_1.Tag>); })}
                  </antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="租户">
                    {(_d = user === null || user === void 0 ? void 0 : user.tenantName) !== null && _d !== void 0 ? _d : '-'}（{(_e = user === null || user === void 0 ? void 0 : user.tenantCode) !== null && _e !== void 0 ? _e : '-'}）
                  </antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="版别 (tenantEdition)">{(_f = user === null || user === void 0 ? void 0 : user.tenantEdition) !== null && _f !== void 0 ? _f : '-'}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="Token">{(0, devtools_1.maskSecret)(accessToken)}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="Refresh Token">{(0, devtools_1.maskSecret)(refreshToken)}</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="Token 有效期">
                    {(jwt === null || jwt === void 0 ? void 0 : jwt.exp)
                        ? "".concat(new Date(Number(jwt.exp) * 1000).toLocaleString('zh-CN'), "\uFF08\u5269\u4F59 ").concat(formatRemain(Number(jwt.exp), nowSec), "\uFF09")
                        : '-'}
                  </antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="JWT 载荷">
                    <pre style={{ margin: 0, fontSize: 12, maxHeight: 200, overflow: 'auto' }}>
                      {JSON.stringify(jwt !== null && jwt !== void 0 ? jwt : {}, null, 2)}
                    </pre>
                  </antd_1.Descriptions.Item>
                </antd_1.Descriptions>),
            },
            {
                key: 'requests',
                label: (<span>
                  <icons_1.SendOutlined /> 请求 ({logs.length})
                </span>),
                children: (<antd_1.Space direction="vertical" style={{ width: '100%' }}>
                  <antd_1.Button size="small" icon={<icons_1.ClearOutlined />} onClick={function () { (0, devtools_1.clearDevLogs)(); forceTick(function (n) { return n + 1; }); }}>
                    清空日志
                  </antd_1.Button>
                  {logs.length === 0 ? (<antd_1.Empty description="暂无请求记录（进行页面操作后自动采集）"/>) : (<antd_1.Table size="small" rowKey="id" columns={requestColumns} dataSource={logs} pagination={false} scroll={{ y: 420 }}/>)}
                </antd_1.Space>),
            },
            {
                key: 'storage',
                label: (<span>
                  <icons_1.HddOutlined /> 存储
                </span>),
                children: (<antd_1.Table size="small" rowKey={function (r) { return "".concat(r.area, ":").concat(r.key); }} pagination={false} scroll={{ y: 420 }} columns={[
                        { title: '区域', dataIndex: 'area', width: 130 },
                        { title: '键', dataIndex: 'key' },
                        { title: '值（脱敏）', dataIndex: 'value', ellipsis: true },
                    ]} dataSource={storageEntries} locale={{ emptyText: '无存储数据' }}/>),
            },
        ]}/>
        <antd_1.Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          提示：URL 加 <antd_1.Typography.Text code>?devtools=1</antd_1.Typography.Text> 可强制显示；localStorage{' '}
          <antd_1.Typography.Text code>{TOGGLE_KEY}=off</antd_1.Typography.Text> 可关闭本工具。
        </antd_1.Typography.Paragraph>
      </antd_1.Drawer>
    </>);
}
