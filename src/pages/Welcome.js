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
exports.default = Welcome;
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useApiError_1 = require("../hooks/useApiError");
var auth_1 = require("../stores/auth");
var editions_1 = require("../config/editions");
var Title = antd_1.Typography.Title, Paragraph = antd_1.Typography.Paragraph;
function Welcome() {
    var _this = this;
    var _a, _b;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var accessToken = (0, auth_1.useAuthStore)(function (s) { return s.accessToken; });
    var fetchMe = (0, auth_1.useAuthStore)(function (s) { return s.fetchMe; });
    var logout = (0, auth_1.useAuthStore)(function (s) { return s.logout; });
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var dutyConsole = (0, editions_1.getEdition)().dutyConsole;
    var _c = (0, react_1.useState)(user), me = _c[0], setMe = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var fetchFresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var u, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetchMe()];
                case 2:
                    u = _a.sent();
                    setMe(u);
                    messageApi.success('已刷新');
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    handleError(e_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        setMe(user);
    }, [user]);
    var onLogout = function () {
        logout();
        messageApi.success('已退出登录');
        navigate('/login', { replace: true });
    };
    return (<pro_components_1.PageContainer title="欢迎" extra={[
            <antd_1.Button key="refresh" icon={<icons_1.ReloadOutlined />} onClick={function () { return void fetchFresh(); }} loading={loading}>
          刷新 /me
        </antd_1.Button>,
            <antd_1.Button key="logout" danger icon={<icons_1.LogoutOutlined />} onClick={onLogout} data-testid="logout-button">
          退出登录
        </antd_1.Button>,
        ]}>
      <antd_1.Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <antd_1.Card loading={loading}>
          <antd_1.Space size="middle">
            <antd_1.Avatar size={48} icon={<icons_1.UserOutlined />} style={{ background: '#1677ff' }}/>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {(_a = me === null || me === void 0 ? void 0 : me.username) !== null && _a !== void 0 ? _a : '(unknown)'}
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                <antd_1.Tag color="blue">UID {me === null || me === void 0 ? void 0 : me.userId}</antd_1.Tag>
                {(me === null || me === void 0 ? void 0 : me.tenantCode) && <antd_1.Tag color="geekblue">租户 {me.tenantCode}</antd_1.Tag>}
                {(_b = me === null || me === void 0 ? void 0 : me.roles) === null || _b === void 0 ? void 0 : _b.map(function (r) { return (<antd_1.Tag key={r} color="green">
                    {r}
                  </antd_1.Tag>); })}
              </Paragraph>
            </div>
          </antd_1.Space>
        </antd_1.Card>

        <antd_1.Card title="快捷入口">
          <antd_1.Space wrap>
            {dutyConsole ? (<>
                <antd_1.Button type="primary" icon={<icons_1.RadarChartOutlined />} onClick={function () { return navigate('/iot/cockpit'); }}>
                  监控驾驶舱
                </antd_1.Button>
                <antd_1.Button icon={<icons_1.DashboardOutlined />} onClick={function () { return navigate('/iot/overview'); }}>
                  监控总览
                </antd_1.Button>
                <antd_1.Button icon={<icons_1.ApartmentOutlined />} onClick={function () { return navigate('/iot/topo'); }}>
                  电网拓扑
                </antd_1.Button>
                <antd_1.Button icon={<icons_1.AlertOutlined />} onClick={function () { return navigate('/iot/alerts'); }}>
                  告警中心
                </antd_1.Button>
                <antd_1.Button icon={<icons_1.UserOutlined />} onClick={function () { return navigate('/profile'); }}>
                  个人中心
                </antd_1.Button>
              </>) : (<>
                <antd_1.Button type="primary" onClick={function () { return navigate('/customer/list'); }}>
                  CRM 客户管理
                </antd_1.Button>
                <antd_1.Button onClick={function () { return navigate('/user/list'); }}>用户列表</antd_1.Button>
                <antd_1.Button onClick={function () { return navigate('/profile'); }}>个人中心</antd_1.Button>
              </>)}
          </antd_1.Space>
        </antd_1.Card>

        {!dutyConsole && (<antd_1.Collapse items={[
                {
                    key: 'jwt',
                    label: '调试信息（JWT）',
                    children: (<antd_1.Descriptions column={1} size="small">
                  <antd_1.Descriptions.Item label="Access Token">
                    <code style={{ fontSize: 11, wordBreak: 'break-all' }}>
                      {accessToken ? "".concat(accessToken.slice(0, 32), "\u2026") : '—'}
                    </code>
                  </antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="Issuer">lieshoucloud-dev</antd_1.Descriptions.Item>
                  <antd_1.Descriptions.Item label="Expires In">1800 s</antd_1.Descriptions.Item>
                </antd_1.Descriptions>),
                },
            ]}/>)}

        {loading && <antd_1.Spin />}
      </antd_1.Space>
    </pro_components_1.PageContainer>);
}
