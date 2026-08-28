/**
 * 师资派遣 service wrapper 单测（zhiye 教育行业版 · edu-service · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/dispatch.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  cancelDispatch,
  completeDispatch,
  countDispatches,
  createDispatch,
  deleteDispatch,
  getDispatch,
  listDispatches,
} from './dispatch';
import { STATUS_META, formatSlot } from '@lieshoucloud/contract-types/business/dispatch';

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };

describe('dispatch service（core-web 上收 · ApiPort 传输）', () => {
  it('listDispatches 无过滤 → /api/dispatches', async () => {
    portRequest.mockResolvedValue([]);
    await listDispatches();
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches', undefined);
  });

  it('listDispatches 带 keyword/status/teacherId → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listDispatches('启蒙', 'DISPATCHED', 2);
    expect(portRequest).toHaveBeenCalledWith(
      '/api/dispatches?keyword=%E5%90%AF%E8%92%99&status=DISPATCHED&teacherId=2',
      undefined,
    );
  });

  it('countDispatches → /api/dispatches/count', async () => {
    portRequest.mockResolvedValue(3);
    await expect(countDispatches()).resolves.toBe(3);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches/count', undefined);
  });

  it('getDispatch → /api/dispatches/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getDispatch(1);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches/1', undefined);
  });

  it('createDispatch → POST /api/dispatches + body 透传', async () => {
    portRequest.mockResolvedValue({ id: 9 });
    const body = {
      teacherId: 1,
      partnerCustomerId: 3,
      courseId: 5,
      slotStart: '2026-09-01T10:00:00.000Z',
      slotEnd: '2026-09-01T12:00:00.000Z',
      lessonCount: 2,
    };
    await createDispatch(body);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
  });

  it('completeDispatch / cancelDispatch → POST 动作端点', async () => {
    portRequest.mockResolvedValue({ id: 1, status: 'COMPLETED' });
    await completeDispatch(1);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches/1/complete', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });

    portRequest.mockResolvedValue({ id: 1, status: 'CANCELLED' });
    await cancelDispatch(1);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches/1/cancel', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({}),
    });
  });

  it('deleteDispatch → DELETE /api/dispatches/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteDispatch(1);
    expect(portRequest).toHaveBeenCalledWith('/api/dispatches/1', { method: 'DELETE' });
  });

  it('STATUS_META 覆盖三种状态', () => {
    expect(Object.keys(STATUS_META)).toEqual(['DISPATCHED', 'COMPLETED', 'CANCELLED']);
    expect(STATUS_META.DISPATCHED.text).toBe('派遣中');
  });

  it('formatSlot 格式化起止时间为本地短时间', () => {
    // 起止都解析为本地 9月1日（任何常规时区）；小时段按时区折算，用正则断言格式
    expect(formatSlot('2026-09-01T10:00:00+08:00', '2026-09-01T12:00:00+08:00')).toMatch(
      /^9月1日 \d{2}:\d{2} - 9月1日 \d{2}:\d{2}$/,
    );
  });

  it('formatSlot 非法日期兜底原样返回', () => {
    expect(formatSlot('nope', 'also-nope')).toBe('nope ~ also-nope');
  });
});
