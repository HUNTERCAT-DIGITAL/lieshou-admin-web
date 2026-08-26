/**
 * core.file 文件服务 wrapper 单测（上传/元数据/强制鉴权 blob 下载）.
 *
 * 验证 URL path / multipart 表单 / blob 通道正确（api 层本身有独立测试）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPostForm, apiGetBlob } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPostForm: vi.fn(),
  apiGetBlob: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    postForm: apiPostForm,
    getBlob: apiGetBlob,
  },
}));

import { fetchFileContent, fileContentUrl, getFileMeta, uploadFile } from './file';

describe('file service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadFile → POST /files（multipart FormData，字段名 file）', async () => {
    apiPostForm.mockResolvedValue({ id: 7, originalName: '证书.pdf' });
    const file = new File(['bytes'], '证书.pdf', { type: 'application/pdf' });
    await uploadFile(file);
    const [path, form] = apiPostForm.mock.calls[0] as [string, FormData];
    expect(path).toBe('/files');
    expect(form.get('file')).toBe(file);
  });

  it('getFileMeta → GET /files/{id}', async () => {
    apiGet.mockResolvedValue({ id: 7, originalName: '证书.pdf' });
    await getFileMeta(7);
    expect(apiGet).toHaveBeenCalledWith('/files/7');
  });

  it('fetchFileContent → GET /files/{id}/content（强制鉴权 blob）', async () => {
    const fakeBlob = { size: 3 } as Blob;
    apiGetBlob.mockResolvedValue(fakeBlob);
    const blob = await fetchFileContent(7);
    expect(apiGetBlob).toHaveBeenCalledWith('/files/7/content');
    expect(blob).toBe(fakeBlob);
  });

  it('fileContentUrl 无 BASE → /files/{id}/content', () => {
    expect(fileContentUrl(7)).toBe('/files/7/content');
  });

  it('fileContentUrl 带 VITE_API_BASE_URL=/api → /api/files/{id}/content（BASE 已含 /api 前缀）', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/api');
    expect(fileContentUrl(7)).toBe('/api/files/7/content');
    vi.unstubAllEnvs();
  });
});
