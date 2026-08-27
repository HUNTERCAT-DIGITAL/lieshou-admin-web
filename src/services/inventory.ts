/**
 * 进销存 API service（Phase 9 · inventory-service，走统一 api 封装）.
 */
import { api } from './api';
import type {
  CreateProductRequest,
  Product,
  StockChangeRequest,
  StockMovement,
  StockMovementType,
  UpdateProductRequest,
} from '@lieshoucloud/contract-types/business/inventory';

/** GET /api/products — 租户内商品列表（可选 keyword） */
export async function listProducts(keyword?: string): Promise<Product[]> {
  const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  return api.get<Product[]>(`/products${qs}`);
}

/** GET /api/products/count */
export async function countProducts(): Promise<number> {
  return api.get<number>('/products/count');
}

/** GET /api/products/{id} */
export async function getProduct(id: number): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
}

/** POST /api/products */
export async function createProduct(body: CreateProductRequest): Promise<Product> {
  return api.post<Product>('/products', body);
}

/** PUT /api/products/{id} */
export async function updateProduct(id: number, body: UpdateProductRequest): Promise<Product> {
  return api.put<Product>(`/products/${id}`, body);
}

/** DELETE /api/products/{id} */
export async function deleteProduct(id: number): Promise<void> {
  return api.delete<void>(`/products/${id}`);
}

/** POST /api/products/{id}/stock-in — 入库（库存 +） */
export async function stockIn(id: number, body: StockChangeRequest): Promise<Product> {
  return api.post<Product>(`/products/${id}/stock-in`, body);
}

/** POST /api/products/{id}/stock-out — 出库（库存 -） */
export async function stockOut(id: number, body: StockChangeRequest): Promise<Product> {
  return api.post<Product>(`/products/${id}/stock-out`, body);
}

/** GET /api/products/{id}/movements — 某商品出入库流水 */
export async function listMovements(
  id: number,
  type?: StockMovementType,
): Promise<StockMovement[]> {
  const qs = type ? `?type=${type}` : '';
  return api.get<StockMovement[]>(`/products/${id}/movements${qs}`);
}

/** POST /api/products/import — CSV 批量导入（multipart） */
export async function importProducts(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<ImportResult>('/products/import', form);
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}
