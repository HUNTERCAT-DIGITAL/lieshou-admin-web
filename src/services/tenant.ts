/**
 * Tenant API service — 调 Spring Cloud gateway → user-service（/api/tenants/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/tenant/tenant.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * Phase 8 · 租户管理（开通/停用/列表）运营视角 + 邀请码（ADR-0023 Phase 2）。
 * @see .ai/decisions/0022-multitenant-schema.md
 */
export {
  listTenants,
  registerTenant,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  createInvite,
  listInvites,
  revokeInvite,
} from '@lieshoucloud/core-web';
export type {
  CreateInviteRequest,
  CreateTenantRequest,
  RegisterTenantRequest,
  RegisterTenantResult,
  Tenant,
  TenantInvite,
  UpdateTenantRequest,
} from '@lieshoucloud/contract-types/business/tenant';
