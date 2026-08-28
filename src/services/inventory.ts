/**
 * 进销存 API service —— 2026-10 上收 lieshou-core-web（业务逻辑唯一源）.
 * 本文件保留导出路径兼容既有页面/测试（实现已移至 core-web）。
 */
export {
  listProducts,
  countProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
  listMovements,
  importProducts,
  type ImportResult,
} from '@lieshoucloud/core-web';

export type {
  CreateProductRequest,
  Product,
  StockChangeRequest,
  StockMovement,
  StockMovementType,
  UpdateProductRequest,
} from '@lieshoucloud/contract-types/business/inventory';
