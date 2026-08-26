/**
 * Legal 案件/时间线 service 单测（ADR-0036/0016 · openapi-fetch typed client）.
 *
 * 验证 GET/POST/PUT/DELETE 的 path / params / body 透传（legalClient 封装）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { clientGet, clientPost, clientPut, clientDelete } = vi.hoisted(() => ({
  clientGet: vi.fn(),
  clientPost: vi.fn(),
  clientPut: vi.fn(),
  clientDelete: vi.fn(),
}));

vi.mock('./legalClient', () => ({
  legalClient: { GET: clientGet, POST: clientPost, PUT: clientPut, DELETE: clientDelete },
}));

import {
  caseStatusCounts,
  confirmCaseLetter,
  countCases,
  createCase,
  createCaseDocument,
  createCaseEvent,
  createCaseExpense,
  createCaseLetter,
  createCaseTimeEntry,
  confirmTimeEntry,
  deleteCase,
  deleteCaseDocument,
  deleteCaseEvent,
  deleteCaseExpense,
  deleteCaseLetter,
  deleteCaseTimeEntry,
  expenseSummary,
  getCase,
  letterSummary,
  listCaseDocuments,
  listCaseEvents,
  listCaseExpenses,
  listCaseLetters,
  listCaseTimeEntries,
  listCases,
  timeEntrySummary,
  updateCase,
  updateCaseDocument,
  updateCaseEvent,
  updateCaseExpense,
  updateCaseLetter,
  updateCaseTimeEntry,
} from './legal';

beforeEach(() => {
  clientGet.mockReset();
  clientPost.mockReset();
  clientPut.mockReset();
  clientDelete.mockReset();
});

describe('admin legal service (openapi-fetch)', () => {
  it('listCases 无过滤 → GET /api/legal/cases 带默认分页 query', async () => {
    clientGet.mockResolvedValue({ data: { items: [], total: 0, page: 1, size: 20 } });
    await listCases();
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases', {
      params: {
        query: {
          keyword: undefined,
          status: undefined,
          caseType: undefined,
          lawyer: undefined,
          page: 1,
          size: 20,
        },
      },
    });
  });

  it('listCases 带过滤 + 页码 → query 透传', async () => {
    clientGet.mockResolvedValue({ data: { items: [], total: 0, page: 2, size: 10 } });
    await listCases(
      { keyword: '赵某', status: 'IN_TRIAL', caseType: 'CIVIL', lawyer: '张律师' },
      2,
      10,
    );
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases', {
      params: {
        query: {
          keyword: '赵某',
          status: 'IN_TRIAL',
          caseType: 'CIVIL',
          lawyer: '张律师',
          page: 2,
          size: 10,
        },
      },
    });
  });

  it('countCases / caseStatusCounts → GET 对应端点', async () => {
    clientGet.mockResolvedValueOnce({ data: 3 });
    clientGet.mockResolvedValueOnce({ data: { INTAKE: 1, FILED: 2 } });
    await expect(countCases()).resolves.toBe(3);
    await caseStatusCounts();
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/count', {});
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/status-counts', {});
  });

  it('createCase → POST /api/legal/cases 透传 body', async () => {
    clientPost.mockResolvedValue({ data: { id: 1 } });
    const body = { caseNo: '(2026)赣01民初5678号', title: '测试案件' };
    await createCase(body);
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases', { body });
  });

  it('updateCase / deleteCase → PUT/DELETE /api/legal/cases/{id}', async () => {
    clientPut.mockResolvedValue({ data: { id: 1 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await updateCase(1, { caseNo: 'x', title: 'y', status: 'FILED' });
    await deleteCase(1);
    expect(clientPut).toHaveBeenCalledWith('/api/legal/cases/{id}', {
      params: { path: { id: 1 } },
      body: { caseNo: 'x', title: 'y', status: 'FILED' },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/cases/{id}', {
      params: { path: { id: 1 } },
    });
  });

  it('getCase → GET /api/legal/cases/{id}', async () => {
    clientGet.mockResolvedValue({ data: { id: 1 } });
    await getCase(1);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{id}', {
      params: { path: { id: 1 } },
    });
  });

  it('时间线：list/create/update/delete events', async () => {
    clientGet.mockResolvedValue({ data: [] });
    clientPost.mockResolvedValue({ data: { id: 9 } });
    clientPut.mockResolvedValue({ data: { id: 9 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await listCaseEvents(1);
    await createCaseEvent(1, {
      eventType: 'HEARING',
      occurredAt: '2026-10-15T01:30:00Z',
      title: '开庭',
    });
    await updateCaseEvent(9, {
      eventType: 'HEARING',
      occurredAt: '2026-10-15T01:30:00Z',
      title: '改',
    });
    await deleteCaseEvent(9);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{id}/events', {
      params: { path: { id: 1 } },
    });
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases/{id}/events', {
      params: { path: { id: 1 } },
      body: { eventType: 'HEARING', occurredAt: '2026-10-15T01:30:00Z', title: '开庭' },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/events/{id}', {
      params: { path: { id: 9 } },
      body: { eventType: 'HEARING', occurredAt: '2026-10-15T01:30:00Z', title: '改' },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/events/{id}', {
      params: { path: { id: 9 } },
    });
  });

  it('卷宗文书：list/create/update/delete documents', async () => {
    clientGet.mockResolvedValue({ data: { items: [], total: 0, page: 1, size: 20 } });
    clientPost.mockResolvedValue({ data: { id: 5 } });
    clientPut.mockResolvedValue({ data: { id: 5 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await listCaseDocuments(1);
    await createCaseDocument(1, { title: '委托合同', docType: 'CONTRACT' });
    await updateCaseDocument(5, { title: '改', fileUrl: 'https://x.pdf' });
    await deleteCaseDocument(5);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/documents', {
      params: { path: { caseId: 1 }, query: { page: 1, size: 20 } },
    });
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases/{caseId}/documents', {
      params: { path: { caseId: 1 } },
      body: { title: '委托合同', docType: 'CONTRACT' },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/documents/{id}', {
      params: { path: { id: 5 } },
      body: { title: '改', fileUrl: 'https://x.pdf' },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/documents/{id}', {
      params: { path: { id: 5 } },
    });
  });

  it('计时计费：list/summary/create/update/delete time entries', async () => {
    clientGet.mockResolvedValueOnce({ data: { items: [], total: 0, page: 1, size: 20 } });
    clientGet.mockResolvedValueOnce({
      data: { hours: 3, amount: 1800, count: 2, pendingCount: 1 },
    });
    clientPost.mockResolvedValue({ data: { id: 6 } });
    clientPut.mockResolvedValue({ data: { id: 6 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await listCaseTimeEntries(1);
    await timeEntrySummary(1);
    await createCaseTimeEntry(1, {
      lawyer: '张律师',
      workDate: '2026-09-05',
      hours: 2.5,
      rate: 600,
    });
    await confirmTimeEntry(6);
    await updateCaseTimeEntry(6, { lawyer: '张律师', workDate: '2026-09-05', hours: 3, rate: 600 });
    await deleteCaseTimeEntry(6);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/time-entries', {
      params: { path: { caseId: 1 }, query: { page: 1, size: 20 } },
    });
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/time-entries/summary', {
      params: { path: { caseId: 1 } },
    });
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases/{caseId}/time-entries', {
      params: { path: { caseId: 1 } },
      body: { lawyer: '张律师', workDate: '2026-09-05', hours: 2.5, rate: 600 },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/time-entries/{id}/confirm', {
      params: { path: { id: 6 } },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/time-entries/{id}', {
      params: { path: { id: 6 } },
      body: { lawyer: '张律师', workDate: '2026-09-05', hours: 3, rate: 600 },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/time-entries/{id}', {
      params: { path: { id: 6 } },
    });
  });

  it('联系函：list/summary/create/update/confirm/delete letters', async () => {
    clientGet.mockResolvedValueOnce({ data: { items: [], total: 0, page: 1, size: 20 } });
    clientGet.mockResolvedValueOnce({ data: { count: 2, pendingCount: 1 } });
    clientPost.mockResolvedValue({ data: { id: 9 } });
    clientPut.mockResolvedValue({ data: { id: 9 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await listCaseLetters(1);
    await letterSummary(1);
    await createCaseLetter(1, {
      direction: 'OUTBOUND',
      subject: '关于补充证据材料的通知',
      letterDate: '2026-08-25',
    });
    await confirmCaseLetter(9);
    await updateCaseLetter(9, {
      direction: 'OUTBOUND',
      subject: '更新后的主题',
      letterDate: '2026-08-25',
    });
    await deleteCaseLetter(9);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/letters', {
      params: { path: { caseId: 1 }, query: { page: 1, size: 20 } },
    });
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/letters/summary', {
      params: { path: { caseId: 1 } },
    });
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases/{caseId}/letters', {
      params: { path: { caseId: 1 } },
      body: { direction: 'OUTBOUND', subject: '关于补充证据材料的通知', letterDate: '2026-08-25' },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/letters/{id}/confirm', {
      params: { path: { id: 9 } },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/letters/{id}', {
      params: { path: { id: 9 } },
      body: { direction: 'OUTBOUND', subject: '更新后的主题', letterDate: '2026-08-25' },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/letters/{id}', {
      params: { path: { id: 9 } },
    });
  });

  it('费用条目：list/summary/create/update/delete expenses', async () => {
    clientGet.mockResolvedValueOnce({ data: { items: [], total: 0, page: 1, size: 20 } });
    clientGet.mockResolvedValueOnce({ data: { amount: 1280, count: 1 } });
    clientPost.mockResolvedValue({ data: { id: 7 } });
    clientPut.mockResolvedValue({ data: { id: 7 } });
    clientDelete.mockResolvedValue({ data: undefined });
    await listCaseExpenses(1);
    await expenseSummary(1);
    await createCaseExpense(1, {
      description: '高铁往返',
      expenseType: 'TRAVEL',
      amount: 1280,
      expenseDate: '2026-09-15',
    });
    await updateCaseExpense(7, { description: '改', amount: 500, expenseDate: '2026-09-16' });
    await deleteCaseExpense(7);
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/expenses', {
      params: { path: { caseId: 1 }, query: { page: 1, size: 20 } },
    });
    expect(clientGet).toHaveBeenCalledWith('/api/legal/cases/{caseId}/expenses/summary', {
      params: { path: { caseId: 1 } },
    });
    expect(clientPost).toHaveBeenCalledWith('/api/legal/cases/{caseId}/expenses', {
      params: { path: { caseId: 1 } },
      body: {
        description: '高铁往返',
        expenseType: 'TRAVEL',
        amount: 1280,
        expenseDate: '2026-09-15',
      },
    });
    expect(clientPut).toHaveBeenCalledWith('/api/legal/expenses/{id}', {
      params: { path: { id: 7 } },
      body: { description: '改', amount: 500, expenseDate: '2026-09-16' },
    });
    expect(clientDelete).toHaveBeenCalledWith('/api/legal/expenses/{id}', {
      params: { path: { id: 7 } },
    });
  });
});
