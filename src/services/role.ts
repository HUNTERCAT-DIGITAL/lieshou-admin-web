/**
 * Role API service — 调 Spring Cloud gateway → user-service（/api/roles/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/role/role.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * Phase 8 · RBAC（ADR-0024）：写操作需 PLATFORM_ADMIN，读操作平台/租户管理员可。
 */
export { listRoles, createRole, updateRole, deleteRole } from '@lieshoucloud/core-web';
export type {
  CreateRoleRequest,
  Role,
  UpdateRoleRequest,
} from '@lieshoucloud/contract-types/business/role';
