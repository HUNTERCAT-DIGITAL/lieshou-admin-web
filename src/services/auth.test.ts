/**
 * auth 匿名接口单测（2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/auth.ts 为 core-web re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  loginWithCode,
  oauthAuthorize,
  oauthProviders,
  oauthToken,
  register,
  resetPassword,
  sendCode,
} from './auth';

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

describe('auth 匿名接口（core-web 上收 · ApiPort 传输）', () => {
  it('sendCode → POST /api/auth/send-code + 三参数透传', async () => {
    portRequest.mockResolvedValue(undefined);
    await sendCode('SMS', '13800000000', 'LOGIN');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/auth/send-code',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toEqual({
      channel: 'SMS',
      target: '13800000000',
      purpose: 'LOGIN',
    });
  });

  it('loginWithCode → POST /api/auth/login/code + tenantCode 可选', async () => {
    portRequest.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 1800 });
    await loginWithCode('jxlkas', 'EMAIL', 'a@b.com', '123456');
    expect(portRequest).toHaveBeenCalledWith('/api/auth/login/code', expect.anything());
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toEqual({
      tenantCode: 'jxlkas',
      channel: 'EMAIL',
      target: 'a@b.com',
      code: '123456',
    });
  });

  it('register → POST /api/auth/register 透传全字段', async () => {
    portRequest.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 1800 });
    await register({
      username: 'u',
      displayName: 'U',
      password: 'p',
      channel: 'SMS',
      target: '13800000000',
      code: '1234',
    });
    expect(portRequest).toHaveBeenCalledWith('/api/auth/register', expect.anything());
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toMatchObject({
      username: 'u',
      channel: 'SMS',
    });
  });

  it('resetPassword → POST /api/auth/reset-password + 全参', async () => {
    portRequest.mockResolvedValue(undefined);
    await resetPassword('SMS', '13800000000', '1234', 'new-pass');
    expect(portRequest).toHaveBeenCalledWith('/api/auth/reset-password', expect.anything());
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toEqual({
      channel: 'SMS',
      target: '13800000000',
      code: '1234',
      newPassword: 'new-pass',
    });
  });

  it('oauthProviders → GET /api/auth/oauth/providers', async () => {
    portRequest.mockResolvedValue([{ provider: 'member', name: '会员', hint: '', permissions: [] }]);
    await oauthProviders();
    expect(portRequest).toHaveBeenCalledWith('/api/auth/oauth/providers', undefined);
  });

  it('oauthAuthorize → POST /api/auth/oauth/authorize', async () => {
    portRequest.mockResolvedValue({ code: 'c', state: 's', expiresInSeconds: 60, memberUsername: 'm', tenantCode: 'jxlkas', memberStatus: 'ACTIVE' });
    await oauthAuthorize('member', 'm', 'jxlkas');
    expect(portRequest).toHaveBeenCalledWith('/api/auth/oauth/authorize', expect.anything());
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toEqual({
      provider: 'member',
      memberUsername: 'm',
      tenantCode: 'jxlkas',
    });
  });

  it('oauthToken → POST /api/auth/oauth/token', async () => {
    portRequest.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 1800, provider: 'member', memberStatus: 'ACTIVE', sessionAt: 'x' });
    await oauthToken('code1', 'jxlkas');
    expect(portRequest).toHaveBeenCalledWith('/api/auth/oauth/token', expect.anything());
    expect(JSON.parse(portRequest.mock.calls[0][1].body)).toEqual({ code: 'code1', tenantCode: 'jxlkas' });
  });
});
