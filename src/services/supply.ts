/**
 * 供应结算 API service — 调 Spring Cloud gateway → edu-service（/api/supplies、/api/consumptions、/api/settlements）.
 *
 * 2026-10 P0 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/supply/supply.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试。
 * zhiye 教育行业版（智野 B2B2C 供应侧 · 供应单/消课/结算）：后端强制 X-Tenant-Id（来自 JWT），
 * 跨租户访问返回 404；消课超额返回 409 BALANCE_INSUFFICIENT；结算周期重复返回 409 SETTLEMENT_PERIOD_CONFLICT。
 */
export {
  listSupplyOrders,
  countSupplyOrders,
  getSupplyOrder,
  createSupplyOrder,
  completeSupplyOrder,
  cancelSupplyOrder,
  deleteSupplyOrder,
  listConsumptions,
  countConsumptions,
  getConsumption,
  createConsumption,
  listSettlements,
  countSettlements,
  getSettlement,
  createSettlement,
  approveSettlement,
  rejectSettlement,
  deleteSettlement,
} from '@lieshoucloud/core-web';
export type {
  ConsumptionRecord,
  CreateConsumptionRequest,
  CreateSettlementRequest,
  CreateSupplyOrderRequest,
  Settlement,
  SettlementStatus,
  SupplyOrder,
  SupplyOrderStatus,
} from '@lieshoucloud/contract-types/business/supply';
