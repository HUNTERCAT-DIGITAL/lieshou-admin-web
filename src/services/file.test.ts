/**
 * file service 单测（2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/file.ts 为 core-web re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 path / multipart / asBlob 透传。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import { fetchFileContent, fileContentUrl, getFileMeta, uploadFile } from './file';

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

describe('file service（core-web 上收 · ApiPort 传输）', () => {
  it('uploadFile → POST /api/files（multipart FormData）', async () => {
    portRequest.mockResolvedValue({ id: 1, originalName: 'a.pdf', size: 10, createdAt: 'x' });
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    await uploadFile(file);
    expect(portRequest).toHaveBeenCalledWith('/api/files', expect.anything());
    expect(portRequest.mock.calls[0][1].method).toBe('POST');
    expect(portRequest.mock.calls[0][1].body).toBeInstanceOf(FormData);
  });

  it('getFileMeta → GET /api/files/{id}', async () => {
    portRequest.mockResolvedValue({ id: 1, originalName: 'a.pdf', size: 10, createdAt: 'x' });
    await getFileMeta(1);
    expect(portRequest).toHaveBeenCalledWith('/api/files/1', undefined);
  });

  it('fetchFileContent → GET /api/files/{id}/content（asBlob）', async () => {
    portRequest.mockResolvedValue(new Blob(['pdf']));
    await fetchFileContent(1);
    expect(portRequest).toHaveBeenCalledWith(
      '/api/files/1/content',
      expect.objectContaining({ asBlob: true }),
    );
  });

  it('fileContentUrl → /api/files/{id}/content', () => {
    expect(fileContentUrl(1)).toBe('/api/files/1/content');
  });
});
