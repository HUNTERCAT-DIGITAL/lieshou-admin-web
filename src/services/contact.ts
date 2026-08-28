/**
 * 联系人 API service — 调 Spring Cloud gateway → crm-service（/api/contacts/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/contact/contact.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * V5 补齐（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404。
 */
export {
  listContacts,
  countContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '@lieshoucloud/core-web';
export type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from '@lieshoucloud/contract-types/business/contact';
