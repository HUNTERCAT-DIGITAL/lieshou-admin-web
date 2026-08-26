/**
 * customerSuccess service wrapper 单测.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fillTemplatePlaceholder, followUpTone } from '../types/customerSuccess';

const { apiGet, apiPost, apiPut, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
  },
}));

import {
  cancelLetter,
  completeLetter,
  countLetters,
  countResponses,
  createLetter,
  createResponse,
  deleteLetter,
  deleteResponse,
  getCustomerSuccessSummary,
  getLetterTemplates,
  listLetters,
  listResponses,
  readLetter,
  resolveResponse,
  sendLetter,
  updateLetter,
  updateResponse,
} from './customerSuccess';

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiDelete.mockReset();
});

describe('customerSuccess service · 联系函', () => {
  it('listLetters：无过滤参数不带 query', async () => {
    apiGet.mockResolvedValue([]);
    await listLetters();
    expect(apiGet).toHaveBeenCalledWith('/letters');
  });

  it('listLetters：customerId/type/status 过滤参数拼接', async () => {
    apiGet.mockResolvedValue([]);
    await listLetters({ customerId: 10, type: 'RENEWAL', status: 'DRAFT' });
    expect(apiGet).toHaveBeenCalledWith('/letters?customerId=10&type=RENEWAL&status=DRAFT');
  });

  it('countLetters / createLetter / updateLetter / deleteLetter', async () => {
    apiGet.mockResolvedValue(3);
    await countLetters();
    expect(apiGet).toHaveBeenCalledWith('/letters/count');

    apiPost.mockResolvedValue({ id: 1 });
    await createLetter({ customerId: 10, type: 'RENEWAL', title: '续费提醒函', content: '正文' });
    expect(apiPost).toHaveBeenCalledWith('/letters', {
      customerId: 10,
      type: 'RENEWAL',
      title: '续费提醒函',
      content: '正文',
    });

    apiPut.mockResolvedValue({ id: 1 });
    await updateLetter(1, { title: '改标题' });
    expect(apiPut).toHaveBeenCalledWith('/letters/1', { title: '改标题' });

    apiDelete.mockResolvedValue(undefined);
    await deleteLetter(1);
    expect(apiDelete).toHaveBeenCalledWith('/letters/1');
  });

  it('状态流转动作：send / read / complete / cancel 走对应 POST 端点', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await sendLetter(1);
    expect(apiPost).toHaveBeenCalledWith('/letters/1/send', {});
    await readLetter(1);
    expect(apiPost).toHaveBeenCalledWith('/letters/1/read', {});
    await completeLetter(1);
    expect(apiPost).toHaveBeenCalledWith('/letters/1/complete', {});
    await cancelLetter(1);
    expect(apiPost).toHaveBeenCalledWith('/letters/1/cancel', {});
  });
});

describe('customerSuccess service · 客户响应', () => {
  it('listResponses：过滤参数拼接', async () => {
    apiGet.mockResolvedValue([]);
    await listResponses({ customerId: 10, status: 'OPEN', sentiment: 'NEGATIVE' });
    expect(apiGet).toHaveBeenCalledWith('/responses?customerId=10&status=OPEN&sentiment=NEGATIVE');
  });

  it('listResponses：跟进到期筛选 followUpOverdue / followUpDueToday', async () => {
    apiGet.mockResolvedValue([]);
    await listResponses({ followUpOverdue: true });
    expect(apiGet).toHaveBeenCalledWith('/responses?followUpOverdue=true');
    await listResponses({ followUpDueToday: true });
    expect(apiGet).toHaveBeenCalledWith('/responses?followUpDueToday=true');
    await listResponses({ followUpOverdue: true, followUpDueToday: false });
    expect(apiGet).toHaveBeenCalledWith('/responses?followUpOverdue=true');
  });

  it('countResponses / createResponse / updateResponse / resolveResponse / deleteResponse', async () => {
    apiGet.mockResolvedValue(2);
    await countResponses();
    expect(apiGet).toHaveBeenCalledWith('/responses/count');

    apiPost.mockResolvedValue({ id: 1 });
    await createResponse({
      customerId: 10,
      letterId: 3,
      type: 'PHONE',
      sentiment: 'NEGATIVE',
      content: '客户不满',
      followUpAction: '跟进',
    });
    expect(apiPost).toHaveBeenCalledWith('/responses', {
      customerId: 10,
      letterId: 3,
      type: 'PHONE',
      sentiment: 'NEGATIVE',
      content: '客户不满',
      followUpAction: '跟进',
    });

    apiPut.mockResolvedValue({ id: 1 });
    await updateResponse(1, { status: 'RESOLVED' });
    expect(apiPut).toHaveBeenCalledWith('/responses/1', { status: 'RESOLVED' });

    apiPost.mockResolvedValue({ id: 1 });
    await resolveResponse(1);
    expect(apiPost).toHaveBeenCalledWith('/responses/1/resolve', {});

    apiDelete.mockResolvedValue(undefined);
    await deleteResponse(1);
    expect(apiDelete).toHaveBeenCalledWith('/responses/1');
  });
});

describe('customerSuccess service · 工作台汇总', () => {
  it('getCustomerSuccessSummary：GET /customer-success/summary', async () => {
    apiGet.mockResolvedValue({ totalLetters: 6, draftLetters: 2 });
    const s = await getCustomerSuccessSummary();
    expect(apiGet).toHaveBeenCalledWith('/customer-success/summary');
    expect(s.totalLetters).toBe(6);
    expect(s.draftLetters).toBe(2);
  });
});

describe('customerSuccess service · 联系函模板', () => {
  it('getLetterTemplates：GET /letter-templates', async () => {
    apiGet.mockResolvedValue([{ templateKey: 'renewal-reminder', title: '续费提醒函' }]);
    const tpl = await getLetterTemplates();
    expect(apiGet).toHaveBeenCalledWith('/letter-templates');
    expect(tpl[0].templateKey).toBe('renewal-reminder');
  });
});

describe('customerSuccess 纯函数 · 模板占位 + 跟进到期', () => {
  it('fillTemplatePlaceholder：{customer} 替换为客户名；未选客户保留占位', () => {
    expect(fillTemplatePlaceholder('尊敬的 {customer}：您好', '猎手猫公司')).toBe(
      '尊敬的 猎手猫公司：您好',
    );
    expect(fillTemplatePlaceholder('尊敬的 {customer}：您好')).toBe('尊敬的 {customer}：您好');
  });

  it('followUpTone：逾期 / 今日到期 / 未来 分级正确；已闭环不计', () => {
    const now = new Date('2026-08-25T12:00:00');
    const overdue = new Date('2026-08-24T10:00:00').toISOString();
    const dueToday = new Date('2026-08-25T15:00:00').toISOString();
    const future = new Date('2026-08-30T10:00:00').toISOString();
    expect(followUpTone(overdue, 'OPEN', now).tone).toBe('overdue');
    expect(followUpTone(dueToday, 'IN_PROGRESS', now).tone).toBe('dueToday');
    expect(followUpTone(future, 'OPEN', now).tone).toBe('none');
    // 已闭环或无跟进时间不计提醒
    expect(followUpTone(overdue, 'RESOLVED', now).tone).toBe('none');
    expect(followUpTone(null, 'OPEN', now).tone).toBe('none');
  });
});
