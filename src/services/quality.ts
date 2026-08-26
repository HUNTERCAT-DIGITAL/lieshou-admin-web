/**
 * 质检追溯 API service（ADR-0037 · inventory-service，走统一 api 封装）.
 */
import { api } from './api';
import type {
  Batch,
  BatchDetail,
  CreateBatchRequest,
  CreateInspectionRequest,
  InspectionDetail,
  InspectionResult,
  InspectionType,
  ProductTrace,
  QualityInspection,
} from '../types/quality';

/** GET /api/batches — 批次列表（可选 productId / keyword） */
export async function listBatches(
  productId?: number,
  keyword?: string,
): Promise<Batch[]> {
  const params = new URLSearchParams();
  if (productId) params.set('productId', String(productId));
  if (keyword) params.set('keyword', keyword);
  const qs = params.toString();
  return api.get<Batch[]>(`/batches${qs ? `?${qs}` : ''}`);
}

/** GET /api/batches/count */
export async function countBatches(): Promise<number> {
  return api.get<number>('/batches/count');
}

/** POST /api/batches — 创建批次（追溯维度，不叠加库存） */
export async function createBatch(body: CreateBatchRequest): Promise<Batch> {
  return api.post<Batch>('/batches', body);
}

/** GET /api/batches/{id} — 批次详情（含质检 + 流水追溯链路） */
export async function getBatchDetail(id: number): Promise<BatchDetail> {
  return api.get<BatchDetail>(`/batches/${id}`);
}

/** GET /api/inspections — 质检列表（可选 productId / type / result） */
export async function listInspections(params?: {
  productId?: number;
  type?: InspectionType;
  result?: InspectionResult;
}): Promise<QualityInspection[]> {
  const search = new URLSearchParams();
  if (params?.productId) search.set('productId', String(params.productId));
  if (params?.type) search.set('type', params.type);
  if (params?.result) search.set('result', params.result);
  const qs = search.toString();
  return api.get<QualityInspection[]>(`/inspections${qs ? `?${qs}` : ''}`);
}

/** GET /api/inspections/count */
export async function countInspections(): Promise<number> {
  return api.get<number>('/inspections/count');
}

/** POST /api/inspections — 创建质检记录 */
export async function createInspection(
  body: CreateInspectionRequest,
): Promise<QualityInspection> {
  return api.post<QualityInspection>('/inspections', body);
}

/** GET /api/inspections/{id} — 质检详情（含商品名 + 批次号） */
export async function getInspection(id: number): Promise<InspectionDetail> {
  return api.get<InspectionDetail>(`/inspections/${id}`);
}

/** GET /api/products/{id}/trace — 商品追溯（批次 + 质检 + 流水） */
export async function getProductTrace(id: number): Promise<ProductTrace> {
  return api.get<ProductTrace>(`/products/${id}/trace`);
}
