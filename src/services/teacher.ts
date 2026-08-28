/**
 * 师资档案 API service — 调 Spring Cloud gateway → edu-service（/api/teachers/**）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/teacher/teacher.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 师资档案）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404。
 */
export {
  listTeachers,
  countTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '@lieshoucloud/core-web';
export type {
  CreateTeacherRequest,
  Teacher,
  TeacherStatus,
  UpdateTeacherRequest,
} from '@lieshoucloud/contract-types/business/teacher';
