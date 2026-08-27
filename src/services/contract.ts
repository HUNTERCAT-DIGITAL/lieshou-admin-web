/**
 * 合同 API service — 调 Spring Cloud gateway → crm-service（/api/contracts/**）.
 *
 * V5 补齐（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404；合同编号租户内唯一。
 */

import { api } from './api';
import type {
  Contract,
  ContractStatus,
  CreateContractRequest,
  UpdateContractRequest,
} from '@lieshoucloud/contract-types/business/contract';

/** GET /api/contracts — 租户内合同列表（可选 customerId / status / keyword 过滤） */
export async function listContracts(
  customerId?: number,
  status?: ContractStatus,
  keyword?: string,
): Promise<Contract[]> {
  const params: string[] = [];
  if (customerId) params.push(`customerId=${customerId}`);
  if (status) params.push(`status=${status}`);
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Contract[]>(`/contracts${qs}`);
}

/** GET /api/contracts/count — 租户内未删合同总数 */
export async function countContracts(): Promise<number> {
  return api.get<number>('/contracts/count');
}

/** GET /api/contracts/{id} */
export async function getContract(id: number): Promise<Contract> {
  return api.get<Contract>(`/contracts/${id}`);
}

/** POST /api/contracts — 创建（tenant 强制取请求租户） */
export async function createContract(body: CreateContractRequest): Promise<Contract> {
  return api.post<Contract>('/contracts', body);
}

/** PUT /api/contracts/{id} */
export async function updateContract(id: number, body: UpdateContractRequest): Promise<Contract> {
  return api.put<Contract>(`/contracts/${id}`, body);
}

/** DELETE /api/contracts/{id} — 软删 */
export async function deleteContract(id: number): Promise<void> {
  return api.delete<void>(`/contracts/${id}`);
}
