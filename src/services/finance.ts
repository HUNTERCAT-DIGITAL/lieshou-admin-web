/**
 * 财务记账 API service（Phase 9 · finance-service，走统一 api 封装）.
 */
import { api } from './api';
import type {
  CreateLedgerRequest,
  LedgerEntry,
  LedgerSummary,
  LedgerType,
  MonthlySummary,
  UpdateLedgerRequest,
} from '../types/finance';

/** GET /api/ledger — 租户内流水（可选 type/category/from/to 过滤） */
export async function listLedger(params?: {
  type?: LedgerType;
  category?: string;
  from?: string;
  to?: string;
}): Promise<LedgerEntry[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.category) qs.set('category', params.category);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const s = qs.toString();
  return api.get<LedgerEntry[]>(`/ledger${s ? `?${s}` : ''}`);
}

/** GET /api/ledger/summary — 收支汇总（可选日期区间） */
export async function getLedgerSummary(params?: {
  from?: string;
  to?: string;
}): Promise<LedgerSummary> {
  const qs = new URLSearchParams();
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const s = qs.toString();
  return api.get<LedgerSummary>(`/ledger/summary${s ? `?${s}` : ''}`);
}

/** GET /api/ledger/summary/monthly — 月度收支（默认最近 6 个月） */
export async function getMonthlySummary(months = 6): Promise<MonthlySummary[]> {
  return api.get<MonthlySummary[]>(`/ledger/summary/monthly?months=${months}`);
}

/** GET /api/ledger/{id} */
export async function getLedger(id: number): Promise<LedgerEntry> {
  return api.get<LedgerEntry>(`/ledger/${id}`);
}

/** POST /api/ledger */
export async function createLedger(body: CreateLedgerRequest): Promise<LedgerEntry> {
  return api.post<LedgerEntry>('/ledger', body);
}

/** PUT /api/ledger/{id} */
export async function updateLedger(id: number, body: UpdateLedgerRequest): Promise<LedgerEntry> {
  return api.put<LedgerEntry>(`/ledger/${id}`, body);
}

/** DELETE /api/ledger/{id} */
export async function deleteLedger(id: number): Promise<void> {
  return api.delete<void>(`/ledger/${id}`);
}
