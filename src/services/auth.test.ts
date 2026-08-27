/**
 * auth.ts 未鉴权路径单测（Phase 9 · 覆盖率）.
 *
 * 登录/刷新/me/切租户已上收 lieshou-core-web（auth.api，测试在 core-web 仓）；
 * 此处覆盖仍留在本文件的验证码/注册/OAuth 匿名接口。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as auth from './auth';

beforeEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('services/auth.ts（登录页匿名接口）', () => {
  it('sendCode POST /auth/send-code + 三参数透传', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    await auth.sendCode('SMS', '13800000000', 'LOGIN');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/send-code$/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      channel: 'SMS',
      target: '13800000000',
      purpose: 'LOGIN',
    });
  });

  it('loginWithCode POST /auth/login/code + tenantCode 可选', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 1800,
        tokenType: 'Bearer',
        userId: 1,
        username: 'u',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await auth.loginWithCode(undefined, 'EMAIL', 'a@b.com', '123456');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ channel: 'EMAIL', target: 'a@b.com', code: '123456' });
    expect(body.tenantCode).toBeUndefined();
  });

  it('register POST /auth/register 透传全字段', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 1800,
        tokenType: 'Bearer',
        userId: 1,
        username: 'u',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await auth.register({
      tenantCode: 'h',
      username: 'u',
      displayName: 'd',
      password: 'p',
      channel: 'SMS',
      target: 't',
      code: 'c',
      inviteCode: 'inv',
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/register$/);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ tenantCode: 'h', inviteCode: 'inv' });
  });

  it('resetPassword POST /auth/reset-password + 后端 message 透传为 AuthError', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: 'INVALID_CODE', message: '验证码错误' }, 400));
    vi.stubGlobal('fetch', fetchMock);
    await expect(auth.resetPassword('SMS', 't', 'c', 'new')).rejects.toMatchObject({
      code: 'RESET_FAILED',
      message: '验证码错误',
    });
  });

  it('AuthError 类 export 仍可用', () => {
    const e = new auth.AuthError('X', 'msg', 500);
    expect(e.code).toBe('X');
    expect(e.status).toBe(500);
    expect(e.name).toBe('AuthError');
  });
});
