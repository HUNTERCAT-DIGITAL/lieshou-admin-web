/**
 * 客户成功中心 API service — 调 Spring Cloud gateway → crm-service.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/customer-success/customerSuccess.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * 售后闭环：联系函（/api/letters/**）+ 客户响应（/api/responses/**）+ 工作台汇总
 * （/api/customer-success/summary）。与 crm.ts 同构：后端强制 X-Tenant-Id，跨租户 404。
 */
export {
  listLetters,
  countLetters,
  getLetterTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createLetter,
  updateLetter,
  deleteLetter,
  sendLetter,
  readLetter,
  completeLetter,
  cancelLetter,
  listResponses,
  countResponses,
  createResponse,
  updateResponse,
  resolveResponse,
  deleteResponse,
  getCustomerSuccessSummary,
} from '@lieshoucloud/core-web';
export type {
  ContactLetter,
  CreateLetterRequest,
  CreateResponseRequest,
  CreateTemplateRequest,
  CustomerResponse,
  CustomerSuccessSummary,
  LetterStatus,
  LetterTemplate,
  LetterType,
  ResponseSentiment,
  ResponseStatus,
  UpdateLetterRequest,
  UpdateResponseRequest,
  UpdateTemplateRequest,
} from '@lieshoucloud/contract-types/business/customerSuccess';
