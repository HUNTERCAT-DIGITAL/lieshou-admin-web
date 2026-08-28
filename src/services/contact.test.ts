/**
 * 联系人 service 单测（CRM V5 补齐 · 2026-10 上收 core-web 后改测 ApiPort 传输）.
 *
 * 上收后 services/contact.ts 为 core-web 薄 re-export，实现走 requestApi →
 * 注入的 ApiPort（token/refresh/错误体由各端桥接层承担）。本测试注入 portRequest spy，
 * 验证 URL path / query / body 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import {
  countContacts,
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
} from './contact';

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

describe('contact service（core-web 上收 · ApiPort 传输）', () => {
  it('listContacts 无参数 → GET /api/contacts', async () => {
    portRequest.mockResolvedValue([]);
    await listContacts();
    expect(portRequest).toHaveBeenCalledWith('/api/contacts', undefined);
  });

  it('listContacts 带 customerId + keyword → query 编码', async () => {
    portRequest.mockResolvedValue([]);
    await listContacts(10, '王经理');
    expect(portRequest).toHaveBeenCalledWith(
      '/api/contacts?customerId=10&keyword=%E7%8E%8B%E7%BB%8F%E7%90%86',
      undefined,
    );
  });

  it('countContacts → GET /api/contacts/count', async () => {
    portRequest.mockResolvedValue(5);
    await expect(countContacts()).resolves.toBe(5);
    expect(portRequest).toHaveBeenCalledWith('/api/contacts/count', undefined);
  });

  it('getContact 动态 id', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await getContact(3);
    expect(portRequest).toHaveBeenCalledWith('/api/contacts/3', undefined);
  });

  it('createContact body 透传', async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createContact({ customerId: 10, name: '王经理', primary: true });
    expect(portRequest).toHaveBeenCalledWith('/api/contacts', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ customerId: 10, name: '王经理', primary: true }),
    });
  });

  it('updateContact 动态 id + body', async () => {
    portRequest.mockResolvedValue({ id: 3 });
    await updateContact(3, { position: '采购经理' });
    expect(portRequest).toHaveBeenCalledWith('/api/contacts/3', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ position: '采购经理' }),
    });
  });

  it('deleteContact → DELETE /api/contacts/{id}', async () => {
    portRequest.mockResolvedValue(undefined);
    await deleteContact(3);
    expect(portRequest).toHaveBeenCalledWith('/api/contacts/3', { method: 'DELETE' });
  });
});
