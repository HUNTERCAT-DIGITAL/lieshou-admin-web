/**
 * CSV 模板下载与导入工具（Phase 9 · 数据导入工具）.
 */

/** 下载 CSV 模板（浏览器 Blob） */
export function downloadCsvTemplate(filename: string, header: string[], sampleRows: string[][]) {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [header.map(esc).join(',')];
  for (const row of sampleRows) lines.push(row.map(esc).join(','));
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
