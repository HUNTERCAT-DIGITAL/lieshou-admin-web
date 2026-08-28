/**
 * 审计日志 API service — 调 gateway → user-service（/api/audit-logs/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/audit/audit.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * append-only 只读端点；租户作用域由 gateway 注入的 X-Tenant-Id 决定。
 * @see .ai/decisions/0030-audit-log.md
 */
export { listAuditLogs, countAuditLogs, type AuditQuery } from '@lieshoucloud/core-web';
export type { AuditAction, AuditLog } from '@lieshoucloud/contract-types/business/audit';
