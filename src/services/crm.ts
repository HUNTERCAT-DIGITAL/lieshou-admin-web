/**
 * CRM 客户 API service — 调 Spring Cloud gateway → crm-service（/api/customers/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/crm/crm.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * 首个租户内业务模块（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404。
 */
export {
  listCustomers,
  countCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  importCustomers,
  type ImportResult,
} from '@lieshoucloud/core-web';
export type {
  CreateCustomerRequest,
  Customer,
  CustomerStatus,
  UpdateCustomerRequest,
} from '@lieshoucloud/contract-types/business/customer';
