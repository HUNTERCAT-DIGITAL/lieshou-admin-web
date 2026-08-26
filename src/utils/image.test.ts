/**
 * 图片压缩工具单测（utils/image.ts）.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { compressImage, JPEG_QUALITY, MAX_SIDE_PX, SKIP_COMPRESS_BYTES } from './image';

function makeFile(size: number, name = 'a.jpg', type = 'image/jpeg'): File {
  return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
  // jsdom 无 URL.createObjectURL，mock 掉（压缩路径需要）
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  });
});

describe('compressImage', () => {
  it('≤1MB 不压缩，原样返回', async () => {
    const small = makeFile(SKIP_COMPRESS_BYTES);
    const result = await compressImage(small);
    expect(result).toBe(small);
  });

  it('>1MB 且环境无法解码（jsdom）→ 超时兜底返回原文件', async () => {
    const big = makeFile(SKIP_COMPRESS_BYTES + 100);
    const result = await compressImage(big, MAX_SIDE_PX, JPEG_QUALITY, 50);
    expect(result).toBe(big);
  });
});
