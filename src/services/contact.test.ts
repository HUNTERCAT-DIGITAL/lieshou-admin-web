/**
 * 联系人 service 单测（CRM V5 补齐）.
 *
 * 验证 URL path / query / body 透传（contact service 封装）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost, apiPut, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete },
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
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiDelete.mockReset();
});

describe('admin contact service', () => {
  it('listContacts 无参数 → GET /contacts', async () => {
    apiGet.mockResolvedValue([]);
    await listContacts();
    expect(apiGet).toHaveBeenCalledWith('/contacts');
  });

  it('listContacts 带 customerId + keyword → query 编码', async () => {
    apiGet.mockResolvedValue([]);
    await listContacts(10, '王经理');
    expect(apiGet).toHaveBeenCalledWith('/contacts?customerId=10&keyword=%E7%8E%8B%E7%BB%8F%E7%90%86');
  });

  it('countContacts → GET /contacts/count', async () => {
    apiGet.mockResolvedValue(5);
    await expect(countContacts()).resolves.toBe(5);
    expect(apiGet).toHaveBeenCalledWith('/contacts/count');
  });

  it('getContact 动态 id', async () => {
    apiGet.mockResolvedValue({ id: 3 });
    await getContact(3);
    expect(apiGet).toHaveBeenCalledWith('/contacts/3');
  });

  it('createContact body 透传', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createContact({ customerId: 10, name: '王经理', primary: true });
    expect(apiPost).toHaveBeenCalledWith('/contacts', {
      customerId: 10,
      name: '王经理',
      primary: true,
    });
  });

  it('updateContact 动态 id + body', async () => {
    apiPut.mockResolvedValue({ id: 3 });
    await updateContact(3, { position: '采购经理' });
    expect(apiPut).toHaveBeenCalledWith('/contacts/3', { position: '采购经理' });
  });

  it('deleteContact → DELETE /contacts/{id}', async () => {
    apiDelete.mockResolvedValue(undefined);
    await deleteContact(3);
    expect(apiDelete).toHaveBeenCalledWith('/contacts/3');
  });
});
