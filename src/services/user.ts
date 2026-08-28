/**
 * User API service — 调 Spring Cloud gateway → user-service（/api/users/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/user/user.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * Phase 7 · 用户管理 CRUD。基于 services/api.ts 的通用封装（自动带 JWT）。
 * @see .ai/decisions/0021-flyway-schema.md
 */
export {
  listUsers,
  countUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '@lieshoucloud/core-web';
export type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '@lieshoucloud/contract-types/business/user';
