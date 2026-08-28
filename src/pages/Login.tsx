/**
 * Login page (Phase 5 + Phase 8 · ADR-0023).
 *
 * - 账号密码登录（原有）
 * - 验证码登录（短信 / 邮箱）
 * - 注册（验证码，注册即登录）→ RegisterModal
 * - 忘记密码（验证码重置）→ ResetModal
 * - 可信身份登录（OAuth 演示通道）→ TrustedOAuthModal
 */

import {
  ClusterOutlined,
  IdcardOutlined,
  LinkOutlined,
  LockOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { BeianFooter } from '../components/BeianFooter';
import { getEdition, getEditionHomePath } from '../config/editions';
import { AuthError } from '../services/auth';
import { useAuthStore } from '../stores/auth';
import { getTenantCode, TENANT_CODE_STORAGE_KEY } from '../utils/tenant-code';
import RegisterModal from './login/RegisterModal';
import ResetModal from './login/ResetModal';
import TrustedOAuthModal from './login/TrustedOAuthModal';

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

  const go = () => {
    // 客户版登录默认进客户工作台（Edition.homePath · 2026-10 菜单治理）；
    // 法律版 / 值班员控制台默认进工作台（今日作战台）；通用版进欢迎页
    const fallback = getEditionHomePath(getEdition());
    const from = (location.state as LocationState | null)?.from ?? fallback;
    navigate(from, { replace: true });
  };

  // 已登录 → 直接跳过 login 页（置于所有 hooks 之后，避免条件 hook 数量不一致）
  if (isAuthenticated) {
    const from =
      (location.state as LocationState | null)?.from ?? getEditionHomePath(getEdition());
    return <Navigate to={from} replace />;
  }

  const onPwdFinish = async (values: PwdFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // 先登录后选租户：登录不指定租户（后端默认），登录后多租户可在顶栏切换
      await login(values.username, values.password, undefined);
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
              initialValues={{ username: initialUsername }}
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
      {/* 登录页底部统一署名（开源演示版）+ 备案信息 */}
      <div style={styles.footer}>
        <Text type="secondary">{edition.slogan}</Text>
        <div style={{ marginTop: 4 }}>
          <BeianFooter />
        </div>
      </div>
    </div>
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
