/**
 * 师资档案 service wrapper 单测（zhiye 教育行业版 · edu-service · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/teacher.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countTeachers,
  createTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  updateTeacher,
} from './teacher';
import { STATUS_META, SUBJECT_OPTIONS } from '@lieshoucloud/contract-types/business/teacher';

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

describe('teacher service（core-web 上收 · ApiPort 传输）', () => {
  it('listTeachers 无过滤 → /api/teachers', async () => {
    portRequest.mockResolvedValue([]);
    await listTeachers();
    expect(portRequest).toHaveBeenCalledWith('/api/teachers', undefined);
  });

  it('listTeachers 带 keyword + status → 拼接 query', async () => {
    portRequest.mockResolvedValue([]);
    await listTeachers('机器人', 'AVAILABLE');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/teachers?keyword=%E6%9C%BA%E5%99%A8%E4%BA%BA&status=AVAILABLE',
      undefined,
    );
  });

  it('countTeachers → /api/teachers/count', async () => {
    portRequest.mockResolvedValue(3);
    await expect(countTeachers()).resolves.toBe(3);
    expect(portRequest).toHaveBeenCalledWith('/api/teachers/count', undefined);
  });

  it('getTeacher → /api/teachers/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getTeacher(1);
    expect(portRequest).toHaveBeenCalledWith('/api/teachers/1', undefined);
  });

  it('createTeacher → POST /api/teachers 且 body 原样透传（含 idCard 只写字段）', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    const body = {
      name: '张老师',
      subject: '机器人编程',
      weeklyCap: 20,
      idCard: '360100199001011234',
    };
    await createTeacher(body);
    expect(portRequest).toHaveBeenCalledWith('/api/teachers', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
  });

  it('updateTeacher → PUT /api/teachers/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await updateTeacher(1, { status: 'DISPATCHING', weeklyCap: 16 });
    expect(portRequest).toHaveBeenCalledWith('/api/teachers/1', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status: 'DISPATCHING', weeklyCap: 16 }),
    });
  });

  it('deleteTeacher → DELETE /api/teachers/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteTeacher(9);
    expect(portRequest).toHaveBeenCalledWith('/api/teachers/9', { method: 'DELETE' });
  });

  it('STATUS_META 覆盖三态且中文文案正确', () => {
    expect(STATUS_META.AVAILABLE.text).toBe('可用');
    expect(STATUS_META.DISPATCHING.text).toBe('派遣中');
    expect(STATUS_META.DISABLED.text).toBe('停用');
  });

  it('SUBJECT_OPTIONS 提供常用授课方向', () => {
    expect(SUBJECT_OPTIONS).toContain('机器人编程');
    expect(SUBJECT_OPTIONS).toContain('科学实验');
  });
});
