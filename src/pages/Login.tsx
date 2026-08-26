/**
 * Login page (Phase 5 + Phase 8 · ADR-0023).
 *
 * - 账号密码登录（原有）
 * - 验证码登录（短信 / 邮箱）
 * - 注册（验证码，注册即登录）
 * - 忘记密码（验证码重置）
 */

import {
  ClusterOutlined,
  IdcardOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Spin, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  AuthError,
  oauthAuthorize,
  oauthProviders,
  oauthToken,
  register,
  resetPassword,
  sendCode,
  type CodeChannel,
  type OAuthProvider,
} from '../services/auth';
import { getEdition } from '../config/editions';
import { useAuthStore } from '../stores/auth';
import { getTenantCode, setTenantCode, TENANT_CODE_STORAGE_KEY } from '../utils/tenant-code';

const { Title, Text } = Typography;

/** 登录页左栏价值点（图标 + 标签 + 描述；白色主题下使用） */
function TrustPoint({ icon, tag, desc }: { icon: React.ReactNode; tag: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span
        style={{
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
        }}
      >
        {icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ color: '#eaf2ff', fontSize: 13 }}>
          {tag}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.62)', fontSize: 12 }}>{desc}</Text>
      </span>
    </div>
  );
}

interface LocationState {
  from?: string;
}

interface PwdFormValues {
  username: string;
  password: string;
  tenantCode?: string;
}

interface CodeFormValues {
  channel: CodeChannel;
  target: string;
  code: string;
}

interface RegisterFormValues extends CodeFormValues {
  tenantCode?: string;
  username: string;
  displayName: string;
  password: string;
  inviteCode?: string;
}

interface ResetFormValues extends CodeFormValues {
  newPassword: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // 版别配置（ADR-0035）：品牌名 / logo / 默认租户 / 注册开关
  const edition = getEdition();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // 可信身份登录（OAuth 演示通道）
  const [oauthOpen, setOauthOpen] = useState(false);
  // 门户「免费注册体验」→ /login?register=1 → 自动打开注册 Modal
  const [registerOpen, setRegisterOpen] = useState(() => searchParams.get('register') === '1');
  const [resetOpen, setResetOpen] = useState(false);
  // 默认租户优先级：URL ?tenant= > 上次记忆 > 版别默认（ADR-0035）
  const rememberedTenant = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const v = window.localStorage.getItem(TENANT_CODE_STORAGE_KEY);
      return v && v.trim() ? v.trim() : null;
    } catch {
      return null;
    }
  })();
  const initialTenant =
    searchParams.get('tenant')?.trim() ||
    rememberedTenant ||
    edition.defaultTenantCode ||
    getTenantCode();
  // 租户自助开通成功后预填管理员用户名（issue #24）
  const initialUsername = searchParams.get('username')?.trim() || undefined;

  // 已登录 → 直接跳过 login 页
  if (isAuthenticated) {
    const from =
      (location.state as LocationState | null)?.from ??
      (getEdition().dutyConsole || getEdition().showLegal === true ? '/admin' : '/welcome');
    return <Navigate to={from} replace />;
  }

  const go = () => {
    // 法律版 / 值班员控制台：登录默认进工作台（今日作战台）；通用版进欢迎页
    const fallback =
      getEdition().dutyConsole || getEdition().showLegal === true ? '/admin' : '/welcome';
    const from = (location.state as LocationState | null)?.from ?? fallback;
    navigate(from, { replace: true });
  };

  const onPwdFinish = async (values: PwdFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // 单租户版（hideTenantInput）：固定用版别默认租户，不读表单输入
      const tenant = edition.hideTenantInput
        ? edition.defaultTenantCode
        : values.tenantCode?.trim();
      await login(values.username, values.password, tenant || undefined);
      if (tenant) setTenantCode(tenant);
      go();
    } catch (e) {
      if (e instanceof AuthError) {
        if (e.code === 'INVALID_CREDENTIALS') setErrorMsg('密码错误');
        else if (e.code === 'USER_NOT_FOUND') setErrorMsg('用户不存在');
        else setErrorMsg(`${e.code}: ${e.message}`);
      } else {
        setErrorMsg(`登录失败: ${String(e)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <Card style={styles.card} bodyStyle={{ padding: 0 }}>
        <div style={styles.grid}>
          {/* ── 左侧 · 品牌 + 可信专业工作空间（SECURE WORKSPACE） ── */}
          <div style={styles.left}>
            <div style={styles.brand}>
              <img src={edition.logo} alt={edition.brandName} style={styles.logo} />
              <span style={styles.brandText}>{edition.brandName}</span>
            </div>

            <div>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>
                {edition.slogan}
              </Title>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 13,
                  display: 'block',
                  marginTop: 8,
                }}
              >
                进入您的可信专业工作空间——登录即进入受控工作区。
              </Text>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 18 }}>
              {edition.showLegal ? (
                <>
                  <Space size={8} style={{ marginBottom: 14 }}>
                    <SafetyCertificateOutlined style={{ color: '#9ec5ff', fontSize: 15 }} />
                    <Text strong style={{ color: '#cfe3ff', fontSize: 13, letterSpacing: 0.5 }}>
                      SECURE WORKSPACE · 可信专业工作空间
                    </Text>
                  </Space>
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    <TrustPoint
                      icon={<LockOutlined />}
                      tag="可信身份登录"
                      desc="身份 × 案件职责分别管理"
                    />
                    <TrustPoint
                      icon={<IdcardOutlined />}
                      tag="组织成员核验"
                      desc="登录后核验资格与有效期"
                    />
                    <TrustPoint
                      icon={<SafetyOutlined />}
                      tag="数据受控"
                      desc="按密级受控访问 · 不保存密码"
                    />
                  </Space>
                </>
              ) : (
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                  <TrustPoint
                    icon={<ClusterOutlined />}
                    tag="多租户隔离"
                    desc="数据按租户行级隔离"
                  />
                  <TrustPoint
                    icon={<SafetyOutlined />}
                    tag="权限体系"
                    desc="平台 / 租户两级角色分权"
                  />
                  <TrustPoint
                    icon={<LinkOutlined />}
                    tag="一体化"
                    desc="业务全流程在线 · 全程留痕"
                  />
                </Space>
              )}
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

            {errorMsg && (
              <Alert
                type="error"
                message={errorMsg}
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
            )}

            <Form<PwdFormValues>
              name="login-pwd"
              layout="vertical"
              onFinish={onPwdFinish}
              autoComplete="off"
              requiredMark={false}
              initialValues={{ tenantCode: initialTenant, username: initialUsername }}
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="futurewl"
                  autoFocus
                  size="large"
                  data-testid="username-input"
                />
              </Form.Item>
              {!edition.hideTenantInput && (
                <Form.Item
                  label="租户编码"
                  name="tenantCode"
                  tooltip={`记住上次使用的租户；留空使用默认（${edition.defaultTenantCode}）`}
                >
                  <Input
                    prefix={<ClusterOutlined />}
                    placeholder={edition.defaultTenantCode}
                    size="large"
                    data-testid="tenant-input"
                  />
                </Form.Item>
              )}
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="password"
                  size="large"
                  data-testid="password-input"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  block
                  data-testid="submit-button"
                >
                  登录
                </Button>
              </Form.Item>
              <Form.Item style={{ marginTop: 12, marginBottom: 0 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text
                    type="secondary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setResetOpen(true)}
                  >
                    忘记密码？
                  </Text>
                  {edition.allowRegister && (
                    <Text
                      type="secondary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setRegisterOpen(true)}
                    >
                      注册账号
                    </Text>
                  )}
                </Space>
              </Form.Item>
              {edition.allowRegister && (
                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                  <Link to="/register" style={{ fontSize: 12 }}>
                    免费开通租户
                  </Link>
                </Form.Item>
              )}
            </Form>

            {/* 可信身份登录（SECURE WORKSPACE · 法律版） */}
            {edition.showLegal && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '18px 0 12px',
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    或使用可信身份登录
                  </Text>
                  <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
                </div>
                <Button
                  block
                  size="large"
                  icon={<RobotOutlined />}
                  onClick={() => setOauthOpen(true)}
                  data-testid="oauth-login-button"
                >
                  Sign in with ChatGPT
                </Button>
                <Text
                  type="secondary"
                  style={{ display: 'block', textAlign: 'center', fontSize: 11, marginTop: 6 }}
                >
                  可信身份通道 · 不保存密码 · 组织成员核验
                </Text>
              </>
            )}

            {/* 返回首页 */}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <Link to="/" style={{ fontSize: 13, color: '#8fc1e3' }}>
                ← 返回首页
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <TrustedOAuthModal
        open={oauthOpen}
        defaultTenant={initialTenant}
        defaultUsername={initialUsername ?? 'admin'}
        onClose={() => setOauthOpen(false)}
        onSuccess={(token) => {
          setSession(token as never);
          go();
        }}
      />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onGo={go} />
      <ResetModal open={resetOpen} onClose={() => setResetOpen(false)} />
      {/* 登录页底部署名（凌科安时定制） */}
      <div style={styles.footer}>
        <Text type="secondary">由 猎手云强力驱动</Text>
      </div>
    </div>
  );
}

function RegisterModal({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: () => void;
}) {
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    const channel = form.getFieldValue('channel') as CodeChannel;
    const target = form.getFieldValue('target') as string;
    if (!target) {
      setErr('请先输入手机号/邮箱');
      return;
    }
    try {
      await sendCode(channel, target, 'REGISTER');
      setErr('验证码已发送（dev 日志查看）');
    } catch {
      setErr('发送失败（60 秒内请勿重复）');
    }
  };

  const submit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setErr(null);
    try {
      // 单租户版（hideTenantInput）：固定用版别默认租户，不读表单输入
      const edition = getEdition();
      const tenant = edition.hideTenantInput
        ? edition.defaultTenantCode
        : values.tenantCode?.trim();
      const token = await register({
        tenantCode: tenant || undefined,
        username: values.username,
        displayName: values.displayName,
        password: values.password,
        channel: values.channel,
        target: values.target,
        code: values.code,
        inviteCode: values.inviteCode || undefined,
      });
      if (tenant) setTenantCode(tenant);
      useAuthStore.getState().setSession(token);
      onClose();
      onGo();
    } catch (e) {
      setErr(e instanceof AuthError ? `${e.code}: ${e.message}` : `注册失败: ${String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="注册账号" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        onFinish={submit}
        requiredMark={false}
        initialValues={{ channel: 'SMS', tenantCode: getTenantCode() }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="租户编码"
          name="tenantCode"
          tooltip="加入哪个企业；有邀请码时忽略；默认猎手猫"
        >
          {getEdition().hideTenantInput ? (
            <Input prefix={<UserOutlined />} disabled value={getEdition().defaultTenantCode} />
          ) : (
            <Input prefix={<UserOutlined />} placeholder={getEdition().defaultTenantCode} />
          )}
        </Form.Item>
        <Form.Item
          label="邀请码（可选）"
          name="inviteCode"
          tooltip="租户管理员发的邀请码；填写后自动加入该租户并分配角色"
        >
          <Input prefix={<LinkOutlined />} placeholder="如：AB12CD34" />
        </Form.Item>
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { pattern: /^[a-zA-Z0-9_]{3,64}$/, message: '3-64 位字母/数字/下划线' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="登录名" />
        </Form.Item>
        <Form.Item
          label="显示名"
          name="displayName"
          rules={[{ required: true, message: '请输入显示名' }]}
        >
          <Input placeholder="如：李四" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '至少 6 位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
        </Form.Item>
        <Form.Item label="验证方式" name="channel">
          <Select
            options={[
              { label: '手机号', value: 'SMS' },
              { label: '邮箱', value: 'EMAIL' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="手机号 / 邮箱"
          name="target"
          rules={[{ required: true, message: '请输入手机号或邮箱' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="13800000000 / user@example.com" />
        </Form.Item>
        <Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Space.Compact style={{ width: '100%' }}>
            <Input prefix={<SafetyOutlined />} placeholder="6 位验证码" />
            <Button onClick={send}>获取验证码</Button>
          </Space.Compact>
        </Form.Item>
        {err && (
          <Alert
            type={err.includes('已发送') ? 'success' : 'error'}
            message={err}
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}
        <Button type="primary" htmlType="submit" loading={submitting} block>
          注册并登录
        </Button>
      </Form>
    </Modal>
  );
}

/** 忘记密码 Modal */
function ResetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form] = Form.useForm<ResetFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = async () => {
    const channel = form.getFieldValue('channel') as CodeChannel;
    const target = form.getFieldValue('target') as string;
    if (!target) {
      setErr('请先输入手机号/邮箱');
      return;
    }
    try {
      await sendCode(channel, target, 'RESET_PASSWORD');
      setErr('验证码已发送（dev 日志查看）');
    } catch {
      setErr('发送失败（60 秒内请勿重复）');
    }
  };

  const submit = async (values: ResetFormValues) => {
    setSubmitting(true);
    setErr(null);
    try {
      await resetPassword(values.channel, values.target, values.code, values.newPassword);
      setDone(true);
    } catch (e) {
      setErr(e instanceof AuthError ? `${e.code}: ${e.message}` : `重置失败: ${String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="忘记密码" open={open} onCancel={onClose} footer={null} destroyOnClose>
      {done ? (
        <Alert
          type="success"
          message="密码已重置"
          description="请返回登录页使用新密码登录。"
          showIcon
        />
      ) : (
        <Form<ResetFormValues>
          form={form}
          layout="vertical"
          onFinish={submit}
          requiredMark={false}
          initialValues={{ channel: 'SMS' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item label="验证方式" name="channel">
            <Select
              options={[
                { label: '手机号', value: 'SMS' },
                { label: '邮箱', value: 'EMAIL' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="手机号 / 邮箱"
            name="target"
            rules={[{ required: true, message: '请输入手机号或邮箱' }]}
          >
            <Input prefix={<MobileOutlined />} placeholder="13800000000 / user@example.com" />
          </Form.Item>
          <Form.Item
            label="验证码"
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<SafetyOutlined />} placeholder="6 位验证码" />
              <Button onClick={send}>获取验证码</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
          </Form.Item>
          {err && (
            <Alert
              type={err.includes('已发送') ? 'success' : 'error'}
              message={err}
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          <Button type="primary" htmlType="submit" loading={submitting} block>
            重置密码
          </Button>
        </Form>
      )}
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
function TrustedOAuthModal({
  open,
  defaultTenant,
  defaultUsername,
  onClose,
  onSuccess,
}: {
  open: boolean;
  defaultTenant?: string;
  defaultUsername?: string;
  onClose: () => void;
  onSuccess: (token: ReturnType<typeof oauthToken> extends Promise<infer T> ? T : never) => void;
}) {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [provider, setProvider] = useState('chatgpt');
  const [memberUsername, setMemberUsername] = useState(defaultUsername ?? 'admin');
  const [tenantCode, setTenantCode] = useState(defaultTenant ?? '');
  const [step, setStep] = useState<'authorize' | 'exchanging'>('authorize');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  const openModal = useCallback(async () => {
    setErr(null);
    setSessionMsg(null);
    setStep('authorize');
    try {
      setProviders(await oauthProviders());
    } catch {
      setProviders([]);
    }
  }, []);

  // open 变化时预加载通道列表（演示数据）
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) void openModal();
  }

  const authorize = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      const tenant = tenantCode.trim() || undefined;
      const result = await oauthAuthorize(provider, memberUsername.trim(), tenant);
      // 组织成员核验通过（VERIFIED）→ 授权码换会话
      setStep('exchanging');
      const token = await oauthToken(result.code, tenant);
      setSessionMsg(
        `组织成员核验通过（${result.memberStatus}）· 安全会话已建立 · 上次安全登录：刚刚`,
      );
      onSuccess(token);
    } catch (e) {
      if (e instanceof AuthError) {
        setErr(
          e.code === 'OAUTH_AUTHORIZE_FAILED' ? `授权失败：${e.message}` : `登录失败：${e.message}`,
        );
      } else {
        setErr(`可信身份登录失败: ${String(e)}`);
      }
      setStep('authorize');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProvider = providers.find((p) => p.provider === provider);

  return (
    <Modal
      title="可信身份登录"
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 理念区 */}
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 14px' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
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
          </Space>
        </div>

        {/* 通道选择 */}
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            选择可信身份通道
          </Text>
          <Space wrap>
            {providers.length === 0 && <Spin size="small" />}
            {providers.map((p) => (
              <Button
                key={p.provider}
                type={provider === p.provider ? 'primary' : 'default'}
                onClick={() => setProvider(p.provider)}
              >
                {p.name}
              </Button>
            ))}
          </Space>
        </Space>

        {/* 成员绑定 */}
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            组织成员账号（{selectedProvider?.hint ?? '演示通道'}）
          </Text>
          <Input
            value={memberUsername}
            onChange={(e) => setMemberUsername(e.target.value)}
            placeholder="组织成员用户名，如 admin"
            data-testid="oauth-member-input"
          />
          <Input
            value={tenantCode}
            onChange={(e) => setTenantCode(e.target.value)}
            placeholder="租户编码（留空使用默认）"
            data-testid="oauth-tenant-input"
          />
        </Space>

        {err && <Alert type="error" showIcon message={err} />}
        {sessionMsg && <Alert type="success" showIcon message={sessionMsg} />}

        <Button
          type="primary"
          block
          loading={submitting}
          disabled={!memberUsername.trim()}
          onClick={() => void authorize()}
          data-testid="oauth-authorize-button"
        >
          {step === 'exchanging' ? '正在建立安全会话…' : '授权并登录'}
        </Button>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center' }}>
          演示通道：可信身份 provider 已完成身份验证；正式环境由真实 OAuth provider 接管。
        </Text>
      </Space>
    </Modal>
  );
}
