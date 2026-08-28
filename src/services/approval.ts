/**
 * 审批流 API service（ADR-0032 · approval-service）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth 模式）：
 * 实现移至 core-web features/approval/approval.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/approval' 不变）。
 */
export {
  listApprovals,
  getApprovalCounts,
  getApproval,
  createApproval,
  approveApproval,
  rejectApproval,
  cancelApproval,
} from '@lieshoucloud/core-web';
export type {
  ApprovalCounts,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  CreateApprovalRequest,
  DecideRequest,
} from '@lieshoucloud/contract-types/business/approval';
