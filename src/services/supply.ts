/**
 * 供应结算 API service — 调 Spring Cloud gateway → edu-service（/api/supplies、/api/consumptions、/api/settlements）.
 *
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 供应单/消课/结算）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404；消课超额返回 409 BALANCE_INSUFFICIENT；结算周期重复返回 409 SETTLEMENT_PERIOD_CONFLICT。
 * 基于 services/api.ts 的通用封装（自动带 JWT）。
 */

import { api } from './api';
import type {
  ConsumptionRecord,
  CreateConsumptionRequest,
  CreateSettlementRequest,
  CreateSupplyOrderRequest,
  Settlement,
  SettlementStatus,
  SupplyOrder,
  SupplyOrderStatus,
} from '@lieshoucloud/types/business/supply';

// ---------- 供应单 ----------

/** GET /api/supplies — 租户内供应单列表（可选 keyword / status / partnerCustomerId 过滤；后端未分页） */
export async function listSupplyOrders(
  keyword?: string,
  status?: SupplyOrderStatus,
  partnerCustomerId?: number,
): Promise<SupplyOrder[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  if (partnerCustomerId) params.push(`partnerCustomerId=${partnerCustomerId}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<SupplyOrder[]>(`/supplies${qs}`);
}

/** GET /api/supplies/count — 租户内未删供应单数 */
export async function countSupplyOrders(): Promise<number> {
  return api.get<number>('/supplies/count');
}

/** GET /api/supplies/{id} */
export async function getSupplyOrder(id: number): Promise<SupplyOrder> {
  return api.get<SupplyOrder>(`/supplies/${id}`);
}

/** POST /api/supplies — 创建（amount 由后端计算） */
export async function createSupplyOrder(body: CreateSupplyOrderRequest): Promise<SupplyOrder> {
  return api.post<SupplyOrder>('/supplies', body);
}

/** POST /api/supplies/{id}/complete — 完成（ACTIVE → COMPLETED） */
export async function completeSupplyOrder(id: number): Promise<SupplyOrder> {
  return api.post<SupplyOrder>(`/supplies/${id}/complete`, {});
}

/** POST /api/supplies/{id}/cancel — 取消（有消课记录不可取消 → 409） */
export async function cancelSupplyOrder(id: number): Promise<SupplyOrder> {
  return api.post<SupplyOrder>(`/supplies/${id}/cancel`, {});
}

/** DELETE /api/supplies/{id} — 软删（仅终态 COMPLETED / CANCELLED） */
export async function deleteSupplyOrder(id: number): Promise<void> {
  return api.delete<void>(`/supplies/${id}`);
}

// ---------- 消课明细 ----------

/** GET /api/consumptions — 租户内消课明细（可选 supplyOrderId / keyword 过滤） */
export async function listConsumptions(
  keyword?: string,
  supplyOrderId?: number,
): Promise<ConsumptionRecord[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (supplyOrderId) params.push(`supplyOrderId=${supplyOrderId}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<ConsumptionRecord[]>(`/consumptions${qs}`);
}

/** GET /api/consumptions/count */
export async function countConsumptions(): Promise<number> {
  return api.get<number>('/consumptions/count');
}

/** GET /api/consumptions/{id} */
export async function getConsumption(id: number): Promise<ConsumptionRecord> {
  return api.get<ConsumptionRecord>(`/consumptions/${id}`);
}

/** POST /api/consumptions — 创建（快照由后端从供应单取；余额不足 → 409；审计流水不可删除） */
export async function createConsumption(
  body: CreateConsumptionRequest,
): Promise<ConsumptionRecord> {
  return api.post<ConsumptionRecord>('/consumptions', body);
}

// ---------- 结算单 ----------

/** GET /api/settlements — 租户内结算单列表（可选 keyword / status / partnerCustomerId 过滤） */
export async function listSettlements(
  keyword?: string,
  status?: SettlementStatus,
  partnerCustomerId?: number,
): Promise<Settlement[]> {
  const params: string[] = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (status) params.push(`status=${status}`);
  if (partnerCustomerId) params.push(`partnerCustomerId=${partnerCustomerId}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Settlement[]>(`/settlements${qs}`);
}

/** GET /api/settlements/count */
export async function countSettlements(): Promise<number> {
  return api.get<number>('/settlements/count');
}

/** GET /api/settlements/{id} */
export async function getSettlement(id: number): Promise<Settlement> {
  return api.get<Settlement>(`/settlements/${id}`);
}

/** POST /api/settlements — 创建（服务端聚合金额；周期重复 → 409） */
export async function createSettlement(body: CreateSettlementRequest): Promise<Settlement> {
  return api.post<Settlement>('/settlements', body);
}

/** POST /api/settlements/{id}/approve — 审批通过（PENDING → APPROVED） */
export async function approveSettlement(id: number): Promise<Settlement> {
  return api.post<Settlement>(`/settlements/${id}/approve`, {});
}

/** POST /api/settlements/{id}/reject — 驳回（PENDING → REJECTED） */
export async function rejectSettlement(id: number): Promise<Settlement> {
  return api.post<Settlement>(`/settlements/${id}/reject`, {});
}

/** DELETE /api/settlements/{id} — 软删（仅 PENDING） */
export async function deleteSettlement(id: number): Promise<void> {
  return api.delete<void>(`/settlements/${id}`);
}
