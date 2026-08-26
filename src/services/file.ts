/**
 * File 服务 API 封装（core.file · 上传/下载/预览/回收站 · ADR-0025）.
 *
 * - 强制 X-Tenant-Id：gateway 从 JWT 注入，前端无需传
 * - 上传返回文件元数据（FileEntity），certAttach 等业务字段存 fileId
 * - 下载/预览：GET /api/files/{id}/content 强制鉴权 → 走 api.getBlob（带 Authorization），
 *   拿到 Blob 后由调用方生成 objectURL 预览/下载（<a href> 直接打开无法带 header，会 401）
 */

import { api } from './api';

/** FileEntity（与 core.file FileEntity 对齐，敏感字段 storedName 只读不下发语义忽略） */
export interface FileMeta {
  id: number;
  tenantId: number;
  originalName: string;
  contentType?: string | null;
  size: number;
  createdAt: string;
}

/**
 * 上传文件（multipart · ≤20MB · 字段名 file）。
 * @returns 文件元数据（含 id）
 */
export async function uploadFile(file: File): Promise<FileMeta> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<FileMeta>('/files', form);
}

/** 文件下载/预览地址（inline；跨域走 gateway /api/files/{id}/content，BASE 已含 /api 前缀） */
export function fileContentUrl(id: number): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  return `${base}/files/${id}/content`;
}

/** 通过 id 查询文件元数据（租户内） */
export async function getFileMeta(id: number): Promise<FileMeta> {
  return api.get<FileMeta>(`/files/${id}`);
}

/**
 * 下载/预览文件内容（强制鉴权 · 自动带 Authorization）。
 * @returns Blob（调用方 `URL.createObjectURL(blob)` 后预览或触发下载）
 */
export async function fetchFileContent(id: number): Promise<Blob> {
  return api.getBlob(`/files/${id}/content`);
}
