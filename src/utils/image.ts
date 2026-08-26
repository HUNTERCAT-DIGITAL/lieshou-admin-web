/**
 * 图片压缩（设备照片上传前 · 移动端大图 → <1MB）.
 *
 * 手机照片普遍 5~12MB，直接上传会超后端限制；压缩到最大边 1600px + JPEG 0.82
 * 后通常 <500KB。≤1MB 或解码/画布不可用（jsdom 无 canvas）时原样返回（兜底）。
 */
export const MAX_SIDE_PX = 1600;
export const JPEG_QUALITY = 0.82;
export const SKIP_COMPRESS_BYTES = 1024 * 1024;

/** 图片文件压缩 → 新 File（jpeg）；≤1MB 或解码失败/环境不支持时返回原文件（后端校验兜底） */
export async function compressImage(
  file: File,
  maxSide = MAX_SIDE_PX,
  quality = JPEG_QUALITY,
  timeoutMs = 8000,
): Promise<File> {
  if (file.size <= SKIP_COMPRESS_BYTES) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url, timeoutMs);
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file; // 环境不支持 canvas（如 jsdom）→ 原样上传
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await toBlob(canvas, quality);
    if (!blob) return file;
    const name = file.name.replace(/\.\w+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    // 解码失败/超时 → 原样上传（后端做类型/大小校验）
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string, timeoutMs: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('图片解码超时'));
    }, timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('图片解码失败'));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}
