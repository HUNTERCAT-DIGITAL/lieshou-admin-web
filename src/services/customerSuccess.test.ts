/**
 * 客户成功中心 service wrapper 单测（2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * 上收后 services/customerSuccess.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort。注入 portRequest spy，验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

import { fillTemplatePlaceholder, followUpTone } from '@lieshoucloud/contract-types/business/customerSuccess';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
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
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };

describe('customerSuccess service（core-web 上收 · ApiPort 传输）', () => {
  describe('联系函', () => {
    it('listLetters：无过滤参数不带 query', async () => {
      portRequest.mockResolvedValue([]);
      await listLetters();
      expect(portRequest).toHaveBeenCalledWith('/api/letters', undefined);
    });

    it('listLetters：customerId/type/status 过滤参数拼接', async () => {
      portRequest.mockResolvedValue([]);
      await listLetters({ customerId: 10, type: 'RENEWAL', status: 'DRAFT' });
      expect(portRequest).toHaveBeenCalledWith(
        '/api/letters?customerId=10&type=RENEWAL&status=DRAFT',
        undefined,
      );
    });

    it('countLetters / createLetter / updateLetter / deleteLetter', async () => {
      portRequest.mockResolvedValue(3);
      await countLetters();
      expect(portRequest).toHaveBeenCalledWith('/api/letters/count', undefined);

      portRequest.mockResolvedValue({ id: 1 });
      await createLetter({ customerId: 10, type: 'RENEWAL', title: '续费提醒函', content: '正文' });
      expect(portRequest).toHaveBeenCalledWith('/api/letters', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ customerId: 10, type: 'RENEWAL', title: '续费提醒函', content: '正文' }),
      });

      portRequest.mockResolvedValue({ id: 1 });
      await updateLetter(1, { title: '改标题' });
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1', {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ title: '改标题' }),
      });

      portRequest.mockResolvedValue(undefined);
      await deleteLetter(1);
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1', { method: 'DELETE' });
    });

    it('状态流转动作：send / read / complete / cancel 走对应 POST 端点', async () => {
      portRequest.mockResolvedValue({ id: 1 });
      await sendLetter(1);
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1/send', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({}),
      });
      await readLetter(1);
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1/read', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({}),
      });
      await completeLetter(1);
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1/complete', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({}),
      });
      await cancelLetter(1);
      expect(portRequest).toHaveBeenCalledWith('/api/letters/1/cancel', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({}),
      });
    });
  });

  describe('客户响应', () => {
    it('listResponses：过滤参数拼接', async () => {
      portRequest.mockResolvedValue([]);
      await listResponses({ customerId: 10, status: 'OPEN', sentiment: 'NEGATIVE' });
      expect(portRequest).toHaveBeenCalledWith(
        '/api/responses?customerId=10&status=OPEN&sentiment=NEGATIVE',
        undefined,
      );
    });

    it('listResponses：跟进到期筛选 followUpOverdue / followUpDueToday', async () => {
      portRequest.mockResolvedValue([]);
      await listResponses({ followUpOverdue: true });
      expect(portRequest).toHaveBeenCalledWith('/api/responses?followUpOverdue=true', undefined);
      await listResponses({ followUpDueToday: true });
      expect(portRequest).toHaveBeenCalledWith('/api/responses?followUpDueToday=true', undefined);
      await listResponses({ followUpOverdue: true, followUpDueToday: false });
      expect(portRequest).toHaveBeenCalledWith('/api/responses?followUpOverdue=true', undefined);
    });

    it('countResponses / createResponse / updateResponse / resolveResponse / deleteResponse', async () => {
      portRequest.mockResolvedValue(2);
      await countResponses();
      expect(portRequest).toHaveBeenCalledWith('/api/responses/count', undefined);

      portRequest.mockResolvedValue({ id: 1 });
      await createResponse({
        customerId: 10,
        letterId: 3,
        type: 'PHONE',
        sentiment: 'NEGATIVE',
        content: '客户不满',
        followUpAction: '跟进',
      });
      expect(portRequest).toHaveBeenCalledWith('/api/responses', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
          customerId: 10,
          letterId: 3,
          type: 'PHONE',
          sentiment: 'NEGATIVE',
          content: '客户不满',
          followUpAction: '跟进',
        }),
      });

      portRequest.mockResolvedValue({ id: 1 });
      await updateResponse(1, { status: 'RESOLVED' });
      expect(portRequest).toHaveBeenCalledWith('/api/responses/1', {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      portRequest.mockResolvedValue({ id: 1 });
      await resolveResponse(1);
      expect(portRequest).toHaveBeenCalledWith('/api/responses/1/resolve', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({}),
      });

      portRequest.mockResolvedValue(undefined);
      await deleteResponse(1);
      expect(portRequest).toHaveBeenCalledWith('/api/responses/1', { method: 'DELETE' });
    });
  });

  describe('工作台汇总', () => {
    it('getCustomerSuccessSummary：GET /api/customer-success/summary', async () => {
      portRequest.mockResolvedValue({ totalLetters: 6, draftLetters: 2 });
      const s = await getCustomerSuccessSummary();
      expect(portRequest).toHaveBeenCalledWith('/api/customer-success/summary', undefined);
      expect(s.totalLetters).toBe(6);
      expect(s.draftLetters).toBe(2);
    });
  });

  describe('联系函模板', () => {
    it('getLetterTemplates：GET /api/letter-templates', async () => {
      portRequest.mockResolvedValue([{ templateKey: 'renewal-reminder', title: '续费提醒函' }]);
      const tpl = await getLetterTemplates();
      expect(portRequest).toHaveBeenCalledWith('/api/letter-templates', undefined);
      expect(tpl[0].templateKey).toBe('renewal-reminder');
    });
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
