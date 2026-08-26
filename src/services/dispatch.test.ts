/**
 * 师资派遣 service wrapper 单测（zhiye 教育行业版 · edu-service）.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    post: apiPost,
    delete: apiDelete,
  },
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
import { STATUS_META, formatSlot } from '../types/dispatch';

describe('dispatch service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listDispatches 无过滤 → /dispatches', async () => {
    apiGet.mockResolvedValue([]);
    await listDispatches();
    expect(apiGet).toHaveBeenCalledWith('/dispatches');
  });

  it('listDispatches 带 keyword/status/teacherId → query string', async () => {
    apiGet.mockResolvedValue([]);
    await listDispatches('启蒙', 'DISPATCHED', 2);
    expect(apiGet).toHaveBeenCalledWith(
      '/dispatches?keyword=%E5%90%AF%E8%92%99&status=DISPATCHED&teacherId=2',
    );
  });

  it('countDispatches → /dispatches/count', async () => {
    apiGet.mockResolvedValue(3);
    await expect(countDispatches()).resolves.toBe(3);
    expect(apiGet).toHaveBeenCalledWith('/dispatches/count');
  });

  it('getDispatch → /dispatches/{id}', async () => {
    apiGet.mockResolvedValue({ id: 1 });
    await getDispatch(1);
    expect(apiGet).toHaveBeenCalledWith('/dispatches/1');
  });

  it('createDispatch → POST /dispatches + body 透传', async () => {
    apiPost.mockResolvedValue({ id: 9 });
    const body = {
      teacherId: 1,
      partnerCustomerId: 3,
      courseId: 5,
      slotStart: '2026-09-01T10:00:00.000Z',
      slotEnd: '2026-09-01T12:00:00.000Z',
      lessonCount: 2,
    };
    await createDispatch(body);
    expect(apiPost).toHaveBeenCalledWith('/dispatches', body);
  });

  it('completeDispatch / cancelDispatch → POST 动作端点', async () => {
    apiPost.mockResolvedValue({ id: 1, status: 'COMPLETED' });
    await completeDispatch(1);
    expect(apiPost).toHaveBeenCalledWith('/dispatches/1/complete', {});

    apiPost.mockResolvedValue({ id: 1, status: 'CANCELLED' });
    await cancelDispatch(1);
    expect(apiPost).toHaveBeenCalledWith('/dispatches/1/cancel', {});
  });

  it('deleteDispatch → DELETE /dispatches/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteDispatch(1);
    expect(apiDelete).toHaveBeenCalledWith('/dispatches/1');
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
