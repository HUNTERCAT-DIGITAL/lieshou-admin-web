/**
 * 会员 API service — 调 Spring Cloud gateway → crm-service（/api/members/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/member/member.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * V5 补齐（ADR-0025）：后端强制 X-Tenant-Id（来自 JWT），跨租户访问返回 404；会员号租户内唯一。
 */
export {
  listMembers,
  countMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from '@lieshoucloud/core-web';
export type {
  CreateMemberRequest,
  Member,
  MemberLevel,
  MemberStatus,
  UpdateMemberRequest,
} from '@lieshoucloud/contract-types/business/member';
