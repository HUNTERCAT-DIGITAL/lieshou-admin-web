/**
 * auth.ts 未鉴权路径单测（Phase 9 · 覆盖率）.
 *
 * api.test.ts 已覆盖 api.ts（401 重试等）；这里覆盖 services/auth.ts 里
 * 走 raw fetch 的匿名接口（login/register/send-code/login-code/reset-password/refresh）。
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

describe('services/auth.ts（匿名接口）', () => {
  it('login POST /auth/login + 透传 body', async () => {
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
    const tok = await auth.login({ username: 'u', password: 'p' });
    expect(tok.userId).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/login$/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ username: 'u', password: 'p' });
  });

  it('refresh POST /auth/refresh', async () => {
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
    await auth.refreshTokens('old-refresh');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/refresh$/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: 'old-refresh' });
  });

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

  it('login 401 → 抛 AuthError INVALID_CREDENTIALS', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401)));
    await expect(auth.login({ username: 'u', password: 'bad' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('login 404 → 抛 AuthError USER_NOT_FOUND', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 404)));
    await expect(auth.login({ username: 'missing', password: 'p' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('AuthError 类 export 仍可用', () => {
    const e = new auth.AuthError('X', 'msg', 500);
    expect(e.code).toBe('X');
    expect(e.status).toBe(500);
    expect(e.name).toBe('AuthError');
  });
});
