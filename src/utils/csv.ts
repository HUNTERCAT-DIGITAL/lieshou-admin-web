/**
 * CSV 模板下载与导入工具（Phase 9 · 数据导入工具）.
 *
 * 通用实现 downloadCsvTemplate 已下沉 @lieshoucloud/ui（2026-10 纯函数族）;
 * 本文件保留业务模板数据（客户/线索/商品字段,待随业务域下沉 core-web features）。
 */
export { downloadCsvTemplate } from '@lieshoucloud/ui';

/** 客户导入模板 */
export const CUSTOMER_TEMPLATE = {
  filename: '客户导入模板.csv',
  header: [
    'name',
    'contactName',
    'contactPhone',
    'email',
    'address',
    'status',
    'ownerId',
    'remark',
  ],
  sample: [
    ['张三', '张三', '13800000000', 'zhang@example.com', '南昌市解放路1号', 'NEW', '', '首次跟进'],
    ['李四', '', '13911112222', '', '', 'FOLLOWING', '', ''],
  ],
};

/** 线索导入模板 */
export const LEAD_TEMPLATE = {
  filename: '线索导入模板.csv',
  header: ['name', 'contactName', 'contactPhone', 'email', 'source', 'remark'],
  sample: [
    ['南昌星火贸易', '李经理', '13900000000', 'lead@xinghuo.cn', 'CHANNEL', '官网留资'],
    ['南昌玖亿科技', '', '', '', '', '展会收集'],
  ],
};

/** 商品导入模板 */
export const PRODUCT_TEMPLATE = {
  filename: '商品导入模板.csv',
  header: ['name', 'code', 'unit', 'price', 'stockQuantity', 'remark'],
  sample: [
    ['阿莫西林', 'AMX-01', '盒', '18.50', '100', '常用药'],
    ['体温计', '', '支', '25', '', ''],
  ],
};
