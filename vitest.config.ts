/// <reference types="vitest" />
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Vitest 配置（端自身骨架 + 客户包 packages/dwjk 测试）.
// 客户包测试（../packages/dwjk/src/**）复用端内依赖（antd/react/@testing-library），
// alias 与 vite.config.ts 保持一致（嵌套 workspace 解析坑 · E13）。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // 共享包显式 alias
      { find: '@lieshoucloud/contract-api', replacement: path.resolve(__dirname, 'open/contract-api/src') },
      { find: '@lieshoucloud/contract-config', replacement: path.resolve(__dirname, 'open/contract-config/src') },
      { find: '@lieshoucloud/contract-types', replacement: path.resolve(__dirname, 'open/contract-types/src') },
      { find: '@lieshoucloud/core-web', replacement: path.resolve(__dirname, 'open/core-web/src') },
      { find: /^@lieshoucloud\/ui($|\/)/, replacement: path.resolve(__dirname, 'open/ui/src') + '$1' },
      { find: /^@lieshoucloud\/charts($|\/)/, replacement: path.resolve(__dirname, 'open/charts/src') + '$1' },
      { find: '@lieshoucloud/i18n', replacement: path.resolve(__dirname, 'open/i18n/src') },
      // 客户包
      { find: /^@lieshoucloud\/dwjk($|\/)/, replacement: path.resolve(__dirname, '../packages/dwjk/src') + '$1' },
      // 第三方依赖（客户包文件在仓外，向上解析不到端内 node_modules → 强制指向端内）
      { find: /^react($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react') + '$1' },
      { find: /^react-dom($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react-dom') + '$1' },
      { find: /^react-router-dom($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react-router-dom') + '$1' },
      { find: /^antd($|\/)/, replacement: path.resolve(__dirname, 'node_modules/antd') + '$1' },
      { find: /^@ant-design\/icons($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@ant-design/icons') + '$1' },
      { find: /^@ant-design\/pro-components($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@ant-design/pro-components') + '$1' },
      { find: /^dayjs($|\/)/, replacement: path.resolve(__dirname, 'node_modules/dayjs') + '$1' },
      // 测试库（客户包测试文件在仓外，向上解析不到端内 node_modules）
      { find: /^@testing-library\/react($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@testing-library/react') + '$1' },
      { find: /^@testing-library\/jest-dom($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@testing-library/jest-dom') + '$1' },
      { find: /^@testing-library\/user-event($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@testing-library/user-event') + '$1' },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      '../packages/dwjk/src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    css: false,
  },
  server: {
    fs: {
      // 客户包 packages/dwjk 在 root 之外，需显式放行
      allow: [path.resolve(__dirname, '..'), path.resolve(__dirname)],
    },
  },
});
