/**
 * 师资档案 service wrapper 单测（zhiye 教育行业版 · edu-service）.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost, apiPut, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
  },
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

describe('teacher service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listTeachers 无过滤 → /teachers', async () => {
    apiGet.mockResolvedValue([]);
    await listTeachers();
    expect(apiGet).toHaveBeenCalledWith('/teachers');
  });

  it('listTeachers 带 keyword + status → 拼接 query', async () => {
    apiGet.mockResolvedValue([]);
    await listTeachers('机器人', 'AVAILABLE');
    expect(apiGet).toHaveBeenCalledWith(
      '/teachers?keyword=%E6%9C%BA%E5%99%A8%E4%BA%BA&status=AVAILABLE',
    );
  });

  it('countTeachers → /teachers/count', async () => {
    apiGet.mockResolvedValue(3);
    await expect(countTeachers()).resolves.toBe(3);
    expect(apiGet).toHaveBeenCalledWith('/teachers/count');
  });

  it('getTeacher → /teachers/{id}', async () => {
    apiGet.mockResolvedValue({ id: 1 });
    await getTeacher(1);
    expect(apiGet).toHaveBeenCalledWith('/teachers/1');
  });

  it('createTeacher → POST /teachers 且 body 原样透传（含 idCard 只写字段）', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    const body = {
      name: '张老师',
      subject: '机器人编程',
      weeklyCap: 20,
      idCard: '360100199001011234',
    };
    await createTeacher(body);
    expect(apiPost).toHaveBeenCalledWith('/teachers', body);
  });

  it('updateTeacher → PUT /teachers/{id}', async () => {
    apiPut.mockResolvedValue({ id: 1 });
    await updateTeacher(1, { status: 'DISPATCHING', weeklyCap: 16 });
    expect(apiPut).toHaveBeenCalledWith('/teachers/1', { status: 'DISPATCHING', weeklyCap: 16 });
  });

  it('deleteTeacher → DELETE /teachers/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteTeacher(9);
    expect(apiDelete).toHaveBeenCalledWith('/teachers/9');
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
