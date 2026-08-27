"use strict";
/**
 * Login page (Phase 5 + Phase 8 · ADR-0023).
 *
 * - 账号密码登录（原有）
 * - 验证码登录（短信 / 邮箱）
 * - 注册（验证码，注册即登录）
 * - 忘记密码（验证码重置）
 */
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
exports.default = Login;
var icons_1 = require("@ant-design/icons");
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var BeianFooter_1 = require("../components/BeianFooter");
var auth_1 = require("../services/auth");
var editions_1 = require("../config/editions");
var auth_2 = require("../stores/auth");
var tenant_code_1 = require("../utils/tenant-code");
var Title = antd_1.Typography.Title, Text = antd_1.Typography.Text;
/** 登录页左栏价值点（图标 + 标签 + 描述；白色主题下使用） */
function TrustPoint(_a) {
    var icon = _a.icon, tag = _a.tag, desc = _a.desc;
    return (<div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.12)',
            color: '#9ec5ff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            flexShrink: 0,
        }}>
        {icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ color: '#eaf2ff', fontSize: 13 }}>
          {tag}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.62)', fontSize: 12 }}>{desc}</Text>
      </span>
    </div>);
}
function Login() {
    var _this = this;
    var _a, _b, _c, _d;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var searchParams = (0, react_router_dom_1.useSearchParams)()[0];
    var login = (0, auth_2.useAuthStore)(function (s) { return s.login; });
    var setSession = (0, auth_2.useAuthStore)(function (s) { return s.setSession; });
    var isAuthenticated = (0, auth_2.useAuthStore)(function (s) { return s.isAuthenticated; });
    // 版别配置（ADR-0035）：品牌名 / logo / 默认租户 / 注册开关
    var edition = (0, editions_1.getEdition)();
    var _e = (0, react_1.useState)(false), submitting = _e[0], setSubmitting = _e[1];
    var _f = (0, react_1.useState)(null), errorMsg = _f[0], setErrorMsg = _f[1];
    // 可信身份登录（OAuth 演示通道）
    var _g = (0, react_1.useState)(false), oauthOpen = _g[0], setOauthOpen = _g[1];
    // 门户「免费注册体验」→ /login?register=1 → 自动打开注册 Modal
    var _h = (0, react_1.useState)(function () { return searchParams.get('register') === '1'; }), registerOpen = _h[0], setRegisterOpen = _h[1];
    var _j = (0, react_1.useState)(false), resetOpen = _j[0], setResetOpen = _j[1];
    // 默认租户优先级：URL ?tenant= > 上次记忆 > 版别默认（ADR-0035）
    var rememberedTenant = (function () {
        if (typeof window === 'undefined')
            return null;
        try {
            var v = window.localStorage.getItem(tenant_code_1.TENANT_CODE_STORAGE_KEY);
            return v && v.trim() ? v.trim() : null;
        }
        catch (_a) {
            return null;
        }
    })();
    var initialTenant = ((_a = searchParams.get('tenant')) === null || _a === void 0 ? void 0 : _a.trim()) ||
        rememberedTenant ||
        edition.defaultTenantCode ||
        (0, tenant_code_1.getTenantCode)();
    // 租户自助开通成功后预填管理员用户名（issue #24）
    var initialUsername = ((_b = searchParams.get('username')) === null || _b === void 0 ? void 0 : _b.trim()) || undefined;
    var go = function () {
        var _a, _b;
        // 法律版 / 值班员控制台：登录默认进工作台（今日作战台）；通用版进欢迎页
        var fallback = (0, editions_1.getEdition)().dutyConsole || (0, editions_1.getEdition)().showLegal === true ? '/admin' : '/welcome';
        var from = (_b = (_a = location.state) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : fallback;
        navigate(from, { replace: true });
    };
    // 已登录 → 直接跳过 login 页（置于所有 hooks 之后，避免条件 hook 数量不一致）
    if (isAuthenticated) {
        var from = (_d = (_c = location.state) === null || _c === void 0 ? void 0 : _c.from) !== null && _d !== void 0 ? _d : ((0, editions_1.getEdition)().dutyConsole || (0, editions_1.getEdition)().showLegal === true ? '/admin' : '/welcome');
        return <react_router_dom_1.Navigate to={from} replace/>;
    }
    var onPwdFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    setErrorMsg(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // 先登录后选租户：登录不指定租户（后端默认），登录后多租户可在顶栏切换
                    return [4 /*yield*/, login(values.username, values.password, undefined)];
                case 2:
                    // 先登录后选租户：登录不指定租户（后端默认），登录后多租户可在顶栏切换
                    _a.sent();
                    go();
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    if (e_1 instanceof auth_1.AuthError) {
                        if (e_1.code === 'INVALID_CREDENTIALS')
                            setErrorMsg('密码错误');
                        else if (e_1.code === 'USER_NOT_FOUND')
                            setErrorMsg('用户不存在');
                        else
                            setErrorMsg("".concat(e_1.code, ": ").concat(e_1.message));
                    }
                    else {
                        setErrorMsg("\u767B\u5F55\u5931\u8D25: ".concat(String(e_1)));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div style={styles.page}>
      <antd_1.Card style={styles.card} bodyStyle={{ padding: 0 }}>
        <div style={styles.grid}>
          {/* ── 左侧 · 品牌 + 可信专业工作空间（SECURE WORKSPACE） ── */}
          <div style={styles.left}>
            <div style={styles.brand}>
              <img src={edition.logo} alt={edition.brandName} style={styles.logo}/>
              <span style={styles.brandText}>{edition.brandName}</span>
            </div>

            <div>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>
                {edition.slogan}
              </Title>
              <Text style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 13,
            display: 'block',
            marginTop: 8,
        }}>
                进入您的可信专业工作空间——登录即进入受控工作区。
              </Text>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 18 }}>
              {edition.showLegal ? (<>
                  <antd_1.Space size={8} style={{ marginBottom: 14 }}>
                    <icons_1.SafetyCertificateOutlined style={{ color: '#9ec5ff', fontSize: 15 }}/>
                    <Text strong style={{ color: '#cfe3ff', fontSize: 13, letterSpacing: 0.5 }}>
                      SECURE WORKSPACE · 可信专业工作空间
                    </Text>
                  </antd_1.Space>
                  <antd_1.Space direction="vertical" size={14} style={{ width: '100%' }}>
                    <TrustPoint icon={<icons_1.LockOutlined />} tag="可信身份登录" desc="身份 × 案件职责分别管理"/>
                    <TrustPoint icon={<icons_1.IdcardOutlined />} tag="组织成员核验" desc="登录后核验资格与有效期"/>
                    <TrustPoint icon={<icons_1.SafetyOutlined />} tag="数据受控" desc="按密级受控访问 · 不保存密码"/>
                  </antd_1.Space>
                </>) : (<antd_1.Space direction="vertical" size={14} style={{ width: '100%' }}>
                  <TrustPoint icon={<icons_1.ClusterOutlined />} tag="多租户隔离" desc="数据按租户行级隔离"/>
                  <TrustPoint icon={<icons_1.SafetyOutlined />} tag="权限体系" desc="平台 / 租户两级角色分权"/>
                  <TrustPoint icon={<icons_1.LinkOutlined />} tag="一体化" desc="业务全流程在线 · 全程留痕"/>
                </antd_1.Space>)}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.7 }}>
                安全会话：工作已同步 · 上次安全登录可见。
                <br />
                演示数据仅登录后浏览受控内容。
              </Text>
            </div>
          </div>

          {/* ── 右侧 · 登录表单 ── */}
          <div style={styles.right}>
            <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
              登录
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
              使用组织账号密码进入工作空间
            </Text>

            {errorMsg && (<antd_1.Alert type="error" message={errorMsg} showIcon closable style={{ marginBottom: 16 }}/>)}

            <antd_1.Form name="login-pwd" layout="vertical" onFinish={onPwdFinish} autoComplete="off" requiredMark={false} initialValues={{ username: initialUsername }}>
              <antd_1.Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <antd_1.Input prefix={<icons_1.UserOutlined />} placeholder="futurewl" autoFocus size="large" data-testid="username-input"/>
              </antd_1.Form.Item>
              <antd_1.Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <antd_1.Input.Password prefix={<icons_1.LockOutlined />} placeholder="password" size="large" data-testid="password-input"/>
              </antd_1.Form.Item>
              <antd_1.Form.Item style={{ marginBottom: 0 }}>
                <antd_1.Button type="primary" htmlType="submit" loading={submitting} size="large" block data-testid="submit-button">
                  登录
                </antd_1.Button>
              </antd_1.Form.Item>
              <antd_1.Form.Item style={{ marginTop: 12, marginBottom: 0 }}>
                <antd_1.Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ cursor: 'pointer' }} onClick={function () { return setResetOpen(true); }}>
                    忘记密码？
                  </Text>
                  {edition.allowRegister && (<Text type="secondary" style={{ cursor: 'pointer' }} onClick={function () { return setRegisterOpen(true); }}>
                      注册账号
                    </Text>)}
                </antd_1.Space>
              </antd_1.Form.Item>
              {edition.allowRegister && (<antd_1.Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                  <react_router_dom_1.Link to="/register" style={{ fontSize: 12 }}>
                    免费开通租户
                  </react_router_dom_1.Link>
                </antd_1.Form.Item>)}
            </antd_1.Form>

            {/* 可信身份登录（SECURE WORKSPACE · 法律版） */}
            {edition.showLegal && (<>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '18px 0 12px',
            }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e5e5' }}/>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    或使用可信身份登录
                  </Text>
                  <div style={{ flex: 1, height: 1, background: '#e5e5e5' }}/>
                </div>
                <antd_1.Button block size="large" icon={<icons_1.RobotOutlined />} onClick={function () { return setOauthOpen(true); }} data-testid="oauth-login-button">
                  Sign in with ChatGPT
                </antd_1.Button>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 11, marginTop: 6 }}>
                  可信身份通道 · 不保存密码 · 组织成员核验
                </Text>
              </>)}

            {/* 返回首页 */}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <react_router_dom_1.Link to="/" style={{ fontSize: 13, color: '#8fc1e3' }}>
                ← 返回首页
              </react_router_dom_1.Link>
            </div>
          </div>
        </div>
      </antd_1.Card>

      <TrustedOAuthModal open={oauthOpen} defaultTenant={initialTenant} defaultUsername={initialUsername !== null && initialUsername !== void 0 ? initialUsername : 'admin'} onClose={function () { return setOauthOpen(false); }} onSuccess={function (token) {
            setSession(token);
            go();
        }}/>
      <RegisterModal open={registerOpen} onClose={function () { return setRegisterOpen(false); }} onGo={go}/>
      <ResetModal open={resetOpen} onClose={function () { return setResetOpen(false); }}/>
      {/* 登录页底部统一署名（开源演示版）+ 备案信息 */}
      <div style={styles.footer}>
        <Text type="secondary">LieShouCloud 开源版 · 演示项目</Text>
        <div style={{ marginTop: 4 }}>
          <BeianFooter_1.BeianFooter />
        </div>
      </div>
    </div>);
}
function RegisterModal(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose, onGo = _a.onGo;
    var form = antd_1.Form.useForm()[0];
    var _b = (0, react_1.useState)(false), submitting = _b[0], setSubmitting = _b[1];
    var _c = (0, react_1.useState)(null), err = _c[0], setErr = _c[1];
    var send = function () { return __awaiter(_this, void 0, void 0, function () {
        var channel, target, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    channel = form.getFieldValue('channel');
                    target = form.getFieldValue('target');
                    if (!target) {
                        setErr('请先输入手机号/邮箱');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, auth_1.sendCode)(channel, target, 'REGISTER')];
                case 2:
                    _b.sent();
                    setErr('验证码已发送（dev 日志查看）');
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setErr('发送失败（60 秒内请勿重复）');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var submit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var edition, tenant, token, e_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setSubmitting(true);
                    setErr(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    edition = (0, editions_1.getEdition)();
                    tenant = edition.hideTenantInput
                        ? edition.defaultTenantCode
                        : (_a = values.tenantCode) === null || _a === void 0 ? void 0 : _a.trim();
                    return [4 /*yield*/, (0, auth_1.register)({
                            tenantCode: tenant || undefined,
                            username: values.username,
                            displayName: values.displayName,
                            password: values.password,
                            channel: values.channel,
                            target: values.target,
                            code: values.code,
                            inviteCode: values.inviteCode || undefined,
                        })];
                case 2:
                    token = _b.sent();
                    if (tenant)
                        (0, tenant_code_1.setTenantCode)(tenant);
                    auth_2.useAuthStore.getState().setSession(token);
                    onClose();
                    onGo();
                    return [3 /*break*/, 5];
                case 3:
                    e_2 = _b.sent();
                    setErr(e_2 instanceof auth_1.AuthError ? "".concat(e_2.code, ": ").concat(e_2.message) : "\u6CE8\u518C\u5931\u8D25: ".concat(String(e_2)));
                    return [3 /*break*/, 5];
                case 4:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<antd_1.Modal title="注册账号" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <antd_1.Form form={form} layout="vertical" onFinish={submit} requiredMark={false} initialValues={{ channel: 'SMS', tenantCode: (0, tenant_code_1.getTenantCode)() }} style={{ marginTop: 16 }}>
        <antd_1.Form.Item label="租户编码" name="tenantCode" tooltip="加入哪个企业；有邀请码时忽略；默认猎手猫">
          {(0, editions_1.getEdition)().hideTenantInput ? (<antd_1.Input prefix={<icons_1.UserOutlined />} disabled value={(0, editions_1.getEdition)().defaultTenantCode}/>) : (<antd_1.Input prefix={<icons_1.UserOutlined />} placeholder={(0, editions_1.getEdition)().defaultTenantCode}/>)}
        </antd_1.Form.Item>
        <antd_1.Form.Item label="邀请码（可选）" name="inviteCode" tooltip="租户管理员发的邀请码；填写后自动加入该租户并分配角色">
          <antd_1.Input prefix={<icons_1.LinkOutlined />} placeholder="如：AB12CD34"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="用户名" name="username" rules={[
            { required: true, message: '请输入用户名' },
            { pattern: /^[a-zA-Z0-9_]{3,64}$/, message: '3-64 位字母/数字/下划线' },
        ]}>
          <antd_1.Input prefix={<icons_1.UserOutlined />} placeholder="登录名"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="显示名" name="displayName" rules={[{ required: true, message: '请输入显示名' }]}>
          <antd_1.Input placeholder="如：李四"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="密码" name="password" rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '至少 6 位' },
        ]}>
          <antd_1.Input.Password prefix={<icons_1.LockOutlined />} placeholder="至少 6 位"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="验证方式" name="channel">
          <antd_1.Select options={[
            { label: '手机号', value: 'SMS' },
            { label: '邮箱', value: 'EMAIL' },
        ]}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="手机号 / 邮箱" name="target" rules={[{ required: true, message: '请输入手机号或邮箱' }]}>
          <antd_1.Input prefix={<icons_1.MailOutlined />} placeholder="13800000000 / user@example.com"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <antd_1.Space.Compact style={{ width: '100%' }}>
            <antd_1.Input prefix={<icons_1.SafetyOutlined />} placeholder="6 位验证码"/>
            <antd_1.Button onClick={send}>获取验证码</antd_1.Button>
          </antd_1.Space.Compact>
        </antd_1.Form.Item>
        {err && (<antd_1.Alert type={err.includes('已发送') ? 'success' : 'error'} message={err} showIcon style={{ marginBottom: 12 }}/>)}
        <antd_1.Button type="primary" htmlType="submit" loading={submitting} block>
          注册并登录
        </antd_1.Button>
      </antd_1.Form>
    </antd_1.Modal>);
}
/** 忘记密码 Modal */
function ResetModal(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose;
    var form = antd_1.Form.useForm()[0];
    var _b = (0, react_1.useState)(false), submitting = _b[0], setSubmitting = _b[1];
    var _c = (0, react_1.useState)(null), err = _c[0], setErr = _c[1];
    var _d = (0, react_1.useState)(false), done = _d[0], setDone = _d[1];
    var send = function () { return __awaiter(_this, void 0, void 0, function () {
        var channel, target, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    channel = form.getFieldValue('channel');
                    target = form.getFieldValue('target');
                    if (!target) {
                        setErr('请先输入手机号/邮箱');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, auth_1.sendCode)(channel, target, 'RESET_PASSWORD')];
                case 2:
                    _b.sent();
                    setErr('验证码已发送（dev 日志查看）');
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setErr('发送失败（60 秒内请勿重复）');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var submit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    setErr(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, auth_1.resetPassword)(values.channel, values.target, values.code, values.newPassword)];
                case 2:
                    _a.sent();
                    setDone(true);
                    return [3 /*break*/, 5];
                case 3:
                    e_3 = _a.sent();
                    setErr(e_3 instanceof auth_1.AuthError ? "".concat(e_3.code, ": ").concat(e_3.message) : "\u91CD\u7F6E\u5931\u8D25: ".concat(String(e_3)));
                    return [3 /*break*/, 5];
                case 4:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<antd_1.Modal title="忘记密码" open={open} onCancel={onClose} footer={null} destroyOnClose>
      {done ? (<antd_1.Alert type="success" message="密码已重置" description="请返回登录页使用新密码登录。" showIcon/>) : (<antd_1.Form form={form} layout="vertical" onFinish={submit} requiredMark={false} initialValues={{ channel: 'SMS' }} style={{ marginTop: 16 }}>
          <antd_1.Form.Item label="验证方式" name="channel">
            <antd_1.Select options={[
                { label: '手机号', value: 'SMS' },
                { label: '邮箱', value: 'EMAIL' },
            ]}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item label="手机号 / 邮箱" name="target" rules={[{ required: true, message: '请输入手机号或邮箱' }]}>
            <antd_1.Input prefix={<icons_1.MobileOutlined />} placeholder="13800000000 / user@example.com"/>
          </antd_1.Form.Item>
          <antd_1.Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <antd_1.Space.Compact style={{ width: '100%' }}>
              <antd_1.Input prefix={<icons_1.SafetyOutlined />} placeholder="6 位验证码"/>
              <antd_1.Button onClick={send}>获取验证码</antd_1.Button>
            </antd_1.Space.Compact>
          </antd_1.Form.Item>
          <antd_1.Form.Item label="新密码" name="newPassword" rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '至少 6 位' },
            ]}>
            <antd_1.Input.Password prefix={<icons_1.LockOutlined />} placeholder="至少 6 位"/>
          </antd_1.Form.Item>
          {err && (<antd_1.Alert type={err.includes('已发送') ? 'success' : 'error'} message={err} showIcon style={{ marginBottom: 12 }}/>)}
          <antd_1.Button type="primary" htmlType="submit" loading={submitting} block>
            重置密码
          </antd_1.Button>
        </antd_1.Form>)}
    </antd_1.Modal>);
}
var styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f4ff 100%)',
        padding: 16,
    },
    card: {
        width: 860,
        borderRadius: 14,
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 16px 48px rgba(2,66,155,0.16)',
    },
    grid: {
        display: 'flex',
        minHeight: 540,
    },
    left: {
        width: 380,
        padding: '44px 34px',
        background: 'linear-gradient(165deg, #02429B 0%, #01306f 55%, #012348 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
        objectFit: 'contain',
    },
    brandText: {
        fontSize: 17,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: 0.3,
    },
    right: {
        flex: 1,
        padding: '44px 44px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    footer: {
        position: 'fixed',
        bottom: 12,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 12,
    },
};
/**
 * 可信身份登录 Modal（SECURE WORKSPACE · OAuth 授权码演示通道）.
 *
 * 流程：选择可信身份通道 → 组织成员核验（AUTH REQUIRED）→ 授权 →
 * 一次性授权码换组织 JWT 会话（不保存密码）。愿景「Sign in with ChatGPT」。
 */
function TrustedOAuthModal(_a) {
    var _this = this;
    var _b;
    var open = _a.open, defaultTenant = _a.defaultTenant, defaultUsername = _a.defaultUsername, onClose = _a.onClose, onSuccess = _a.onSuccess;
    var _c = (0, react_1.useState)([]), providers = _c[0], setProviders = _c[1];
    var _d = (0, react_1.useState)('chatgpt'), provider = _d[0], setProvider = _d[1];
    var _e = (0, react_1.useState)(defaultUsername !== null && defaultUsername !== void 0 ? defaultUsername : 'admin'), memberUsername = _e[0], setMemberUsername = _e[1];
    var _f = (0, react_1.useState)(defaultTenant !== null && defaultTenant !== void 0 ? defaultTenant : ''), tenantCode = _f[0], setTenantCode = _f[1];
    var _g = (0, react_1.useState)('authorize'), step = _g[0], setStep = _g[1];
    var _h = (0, react_1.useState)(false), submitting = _h[0], setSubmitting = _h[1];
    var _j = (0, react_1.useState)(null), err = _j[0], setErr = _j[1];
    var _k = (0, react_1.useState)(null), sessionMsg = _k[0], setSessionMsg = _k[1];
    var openModal = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setErr(null);
                    setSessionMsg(null);
                    setStep('authorize');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    _a = setProviders;
                    return [4 /*yield*/, (0, auth_1.oauthProviders)()];
                case 2:
                    _a.apply(void 0, [_c.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    _b = _c.sent();
                    setProviders([]);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // open 变化时预加载通道列表（演示数据）
    var _l = (0, react_1.useState)(false), prevOpen = _l[0], setPrevOpen = _l[1];
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open)
            void openModal();
    }
    var authorize = function () { return __awaiter(_this, void 0, void 0, function () {
        var tenant, result, token, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    setErr(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    tenant = tenantCode.trim() || undefined;
                    return [4 /*yield*/, (0, auth_1.oauthAuthorize)(provider, memberUsername.trim(), tenant)];
                case 2:
                    result = _a.sent();
                    // 组织成员核验通过（VERIFIED）→ 授权码换会话
                    setStep('exchanging');
                    return [4 /*yield*/, (0, auth_1.oauthToken)(result.code, tenant)];
                case 3:
                    token = _a.sent();
                    setSessionMsg("\u7EC4\u7EC7\u6210\u5458\u6838\u9A8C\u901A\u8FC7\uFF08".concat(result.memberStatus, "\uFF09\u00B7 \u5B89\u5168\u4F1A\u8BDD\u5DF2\u5EFA\u7ACB \u00B7 \u4E0A\u6B21\u5B89\u5168\u767B\u5F55\uFF1A\u521A\u521A"));
                    onSuccess(token);
                    return [3 /*break*/, 6];
                case 4:
                    e_4 = _a.sent();
                    if (e_4 instanceof auth_1.AuthError) {
                        setErr(e_4.code === 'OAUTH_AUTHORIZE_FAILED' ? "\u6388\u6743\u5931\u8D25\uFF1A".concat(e_4.message) : "\u767B\u5F55\u5931\u8D25\uFF1A".concat(e_4.message));
                    }
                    else {
                        setErr("\u53EF\u4FE1\u8EAB\u4EFD\u767B\u5F55\u5931\u8D25: ".concat(String(e_4)));
                    }
                    setStep('authorize');
                    return [3 /*break*/, 6];
                case 5:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var selectedProvider = providers.find(function (p) { return p.provider === provider; });
    return (<antd_1.Modal title="可信身份登录" open={open} onCancel={onClose} footer={null} width={480} destroyOnClose>
      <antd_1.Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 理念区 */}
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 14px' }}>
          <antd_1.Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong style={{ color: '#1677ff' }}>
              进入您的可信专业工作空间
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              可信身份登录 · 身份与案件职责分别管理
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              组织成员关系（AUTH REQUIRED）· 登录后核验资格与有效期
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              不保存密码 · 系统不在前端保存或模拟密码
            </Text>
          </antd_1.Space>
        </div>

        {/* 通道选择 */}
        <antd_1.Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            选择可信身份通道
          </Text>
          <antd_1.Space wrap>
            {providers.length === 0 && <antd_1.Spin size="small"/>}
            {providers.map(function (p) { return (<antd_1.Button key={p.provider} type={provider === p.provider ? 'primary' : 'default'} onClick={function () { return setProvider(p.provider); }}>
                {p.name}
              </antd_1.Button>); })}
          </antd_1.Space>
        </antd_1.Space>

        {/* 成员绑定 */}
        <antd_1.Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            组织成员账号（{(_b = selectedProvider === null || selectedProvider === void 0 ? void 0 : selectedProvider.hint) !== null && _b !== void 0 ? _b : '演示通道'}）
          </Text>
          <antd_1.Input value={memberUsername} onChange={function (e) { return setMemberUsername(e.target.value); }} placeholder="组织成员用户名，如 admin" data-testid="oauth-member-input"/>
          <antd_1.Input value={tenantCode} onChange={function (e) { return setTenantCode(e.target.value); }} placeholder="租户编码（留空使用默认）" data-testid="oauth-tenant-input"/>
        </antd_1.Space>

        {err && <antd_1.Alert type="error" showIcon message={err}/>}
        {sessionMsg && <antd_1.Alert type="success" showIcon message={sessionMsg}/>}

        <antd_1.Button type="primary" block loading={submitting} disabled={!memberUsername.trim()} onClick={function () { return void authorize(); }} data-testid="oauth-authorize-button">
          {step === 'exchanging' ? '正在建立安全会话…' : '授权并登录'}
        </antd_1.Button>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center' }}>
          演示通道：可信身份 provider 已完成身份验证；正式环境由真实 OAuth provider 接管。
        </Text>
      </antd_1.Space>
    </antd_1.Modal>);
}
