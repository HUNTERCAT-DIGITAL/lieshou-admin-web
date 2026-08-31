/**
 * 首次登录激活页（2026-08 · 管理员建用户未设密码）.
 * 验证码登录后 activationRequired=true → 跳本页：短信验证码 + 设置密码 → 完成激活。
 */
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { activate, sendCode, useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';

export default function ActivatePage() {
  const edition = getEdition();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 未登录 → 回登录页
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function sendActivateCode(): Promise<void> {
    if (!phone.trim()) { setError('请先填写手机号'); return; }
    setError(null);
    try {
      await sendCode('SMS', phone.trim(), 'ACTIVATE');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleActivate(): Promise<void> {
    setError(null);
    if (!phone.trim() || !code.trim() || !password) {
      setError('请填写手机号、验证码和新密码');
      return;
    }
    if (password.length < 6) { setError('密码至少 6 位'); return; }
    if (password !== confirm) { setError('两次密码不一致'); return; }
    setSubmitting(true);
    try {
      const token = await activate('SMS', phone.trim(), code.trim(), password);
      const { setSession } = useAuthStore.getState();
      setSession(token);
      window.setTimeout(() => navigate(edition.homePath ?? '/home', { replace: true }), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="activate-page">
      <div className="activate-card">
        <h1 className="activate-title">{edition.brandName}</h1>
        <p className="activate-desc">首次登录，请设置您的登录密码（通过手机验证码验证）</p>
        <div className="activate-field">
          <label>手机号</label>
          <input
            className="activate-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="手机号"
          />
        </div>
        <div className="activate-field">
          <label>短信验证码</label>
          <div className="activate-code-row">
            <input
              className="activate-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="验证码"
            />
            <button type="button" className="activate-send" onClick={sendActivateCode} disabled={countdown > 0}>
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
        </div>
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
