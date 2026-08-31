/**
 * 首次登录激活页（2026-08 · 管理员建用户未设密码）.
 * 已通过手机验证码登录(token 即身份)→ 本页只需设置新密码,无需再次验证码。
 */
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { activate, useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';

export default function ActivatePage() {
  const edition = getEdition();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const homePath = edition.homePath ?? '/home';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function handleActivate(): Promise<void> {
    setError(null);
    if (!password) { setError('请输入新密码'); return; }
    if (password.length < 6) { setError('密码至少 6 位'); return; }
    if (password !== confirm) { setError('两次密码不一致'); return; }
    setSubmitting(true);
    try {
      const token = await activate(password);
      const { setSession } = useAuthStore.getState();
      setSession(token);
      window.setTimeout(() => navigate(homePath, { replace: true }), 600);
    } catch (err) {
      const e = err as { message?: unknown };
      setError(typeof e?.message === 'string' && e.message ? e.message : '设置失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="activate-page">
      <div className="activate-card">
        <h1 className="activate-title">{edition.brandName}</h1>
        <p className="activate-desc">首次登录，请设置您的登录密码（手机号已验证）</p>
        <div className="activate-field">
          <label>新密码</label>
          <input
            className="activate-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
          />
        </div>
        <div className="activate-field">
          <label>确认密码</label>
          <input
            className="activate-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再次输入密码"
          />
        </div>
        {error && <p className="activate-error">{error}</p>}
        <button type="button" className="activate-submit" onClick={handleActivate} disabled={submitting}>
          {submitting ? '提交中…' : '完成激活并登录'}
        </button>
        <button type="button" className="activate-cancel" onClick={() => { logout(); navigate('/login'); }}>
          返回登录
        </button>
      </div>
    </div>
  );
}
