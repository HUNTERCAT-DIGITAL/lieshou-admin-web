/**
 * 可信身份登录 Modal（SECURE WORKSPACE · OAuth 授权码演示通道）.
 *
 * 从 Login.tsx 拆分（P0 组件化）。
 * 流程：选择可信身份通道 → 组织成员核验（AUTH REQUIRED）→ 授权 →
 * 一次性授权码换组织 JWT 会话（不保存密码）。愿景「Sign in with ChatGPT」。
 */
import { Alert, Button, Input, Modal, Space, Spin, Typography } from 'antd';
import { useCallback, useState } from 'react';

import {
  AuthError,
  oauthAuthorize,
  oauthProviders,
  oauthToken,
  type OAuthProvider,
} from '../../services/auth';
import { getEdition } from '../../config/editions';

const { Text } = Typography;

export interface TrustedOAuthModalProps {
  open: boolean;
  defaultTenant?: string;
  defaultUsername?: string;
  onClose: () => void;
  onSuccess: (token: ReturnType<typeof oauthToken> extends Promise<infer T> ? T : never) => void;
}

export default function TrustedOAuthModal({
  open,
  defaultTenant,
  defaultUsername,
  onClose,
  onSuccess,
}: TrustedOAuthModalProps) {
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
            <Text strong style={{ color: getEdition().primaryColor }}>
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
