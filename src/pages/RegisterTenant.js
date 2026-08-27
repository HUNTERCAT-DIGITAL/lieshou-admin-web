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
exports.default = RegisterTenant;
/**
 * 租户自助开通页（SaaS 增长路径 · 公开页面，无需登录 · issue #24）.
 *
 * 官网/登录页「免费开通」→ 填写租户 + 管理员 → 创建成功 → 自动跳登录页（预填租户编码 + 用户名）。
 * 后端 POST /api/tenants/register（gateway 白名单放行）；版别默认 GENERIC。
 */
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var editions_1 = require("../config/editions");
var tenant_1 = require("../services/tenant");
var CODE_RULE = /^[a-z0-9][a-z0-9-]{1,31}$/;
function RegisterTenant() {
    var _this = this;
    var messageApi = antd_1.App.useApp().message;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var edition = (0, editions_1.getEdition)();
    var _a = (0, react_1.useState)(false), submitting = _a[0], setSubmitting = _a[1];
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var result, e_1, err;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (values.password !== values.confirm) {
                        messageApi.error('两次输入的密码不一致');
                        return [2 /*return*/];
                    }
                    setSubmitting(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, tenant_1.registerTenant)({
                            tenantName: values.tenantName,
                            tenantCode: values.tenantCode,
                            username: values.username,
                            displayName: values.displayName,
                            password: values.password,
                            email: values.email,
                        })];
                case 2:
                    result = _d.sent();
                    messageApi.success("\u5F00\u901A\u6210\u529F\uFF01\u79DF\u6237\u300C".concat(result.tenant.name, "\u300D\uFF0C\u7BA1\u7406\u5458 ").concat(result.adminUsername));
                    // 跳登录页并预填
                    navigate("/login?tenant=".concat(encodeURIComponent(result.tenant.code), "&username=").concat(encodeURIComponent(result.adminUsername)));
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _d.sent();
                    err = e_1;
                    messageApi.error((_c = (_b = (_a = err.data) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : err.message) !== null && _c !== void 0 ? _c : '开通失败，请稍后重试');
                    setSubmitting(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: "linear-gradient(135deg, ".concat(edition.primaryColor, " 0%, ").concat(edition.primaryColor, "99 100%)"),
            padding: 24,
        }}>
      <antd_1.Card style={{ width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <antd_1.Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          {edition.brandName} · 免费开通
        </antd_1.Typography.Title>
        <antd_1.Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          创建您的专属租户，注册即开通（管理员账号可直接登录）
        </antd_1.Typography.Paragraph>

        <antd_1.Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <antd_1.Form.Item name="tenantName" label="公司 / 组织名称" rules={[{ required: true, message: '请输入公司或组织名称' }]}>
            <antd_1.Input placeholder="如：示例科技有限公司" maxLength={128}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="tenantCode" label="租户编码（登录用）" rules={[
            { required: true, message: '请输入租户编码' },
            {
                pattern: CODE_RULE,
                message: '2-32 位小写字母/数字/连字符（如 mycompany）',
            },
        ]}>
            <antd_1.Input placeholder="mycompany" maxLength={32}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="username" label="管理员用户名" rules={[{ required: true, message: '请输入管理员用户名' }]}>
            <antd_1.Input placeholder="admin" maxLength={64}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="displayName" label="管理员姓名" rules={[{ required: true, message: '请输入管理员姓名' }]}>
            <antd_1.Input placeholder="如：张三" maxLength={64}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="email" label="邮箱（选填）" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <antd_1.Input placeholder="admin@company.com"/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="password" label="密码" rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少 6 位' },
        ]}>
            <antd_1.Input.Password placeholder="至少 6 位"/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="confirm" label="确认密码" dependencies={['password']} rules={[
            { required: true, message: '请再次输入密码' },
            function (_a) {
                var getFieldValue = _a.getFieldValue;
                return ({
                    validator: function (_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                });
            },
        ]}>
            <antd_1.Input.Password placeholder="再次输入密码"/>
          </antd_1.Form.Item>
          <antd_1.Button type="primary" htmlType="submit" block loading={submitting} style={{ background: edition.primaryColor, borderColor: edition.primaryColor }}>
            免费开通
          </antd_1.Button>
        </antd_1.Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <antd_1.Typography.Text type="secondary" style={{ fontSize: 12 }}>
            已有账号？<react_router_dom_1.Link to="/login">去登录</react_router_dom_1.Link>
          </antd_1.Typography.Text>
        </div>
      </antd_1.Card>
    </div>);
}
