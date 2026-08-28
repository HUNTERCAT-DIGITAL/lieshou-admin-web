/**
 * 图片压缩（设备照片上传前 · 移动端大图 → <1MB）.
 *
 * 实现已下沉 @lieshoucloud/ui（2026-10 纯函数族）,本文件保留导出路径兼容既有调用点。
 */
export {
  compressImage,
  JPEG_QUALITY,
  MAX_SIDE_PX,
  SKIP_COMPRESS_BYTES,
} from '@lieshoucloud/ui';
