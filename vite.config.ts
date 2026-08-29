import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// admin-web · 端自身最小骨架（React 化重建）
// 客户聚合仓模式（2026-08 恢复）：客户包 @lieshoucloud/<client> 由客户仓
// deploy:prepare 生成 tsconfig.<client>.json（paths → ../packages/<client>/src），
// 此处补充 Vite 运行时 alias（顺序：具体包在前，客户包正则兜底）。
// 独立仓库（无客户仓）不 import 客户包，正则兜底不会命中，安全。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // 共享包显式 alias（嵌套 workspace（客户仓 submodule）场景 symlink 解析漂移 → 强制端内 open/*）
      { find: '@lieshoucloud/contract-api', replacement: path.resolve(__dirname, 'open/contract-api/src') },
      { find: '@lieshoucloud/contract-config', replacement: path.resolve(__dirname, 'open/contract-config/src') },
      { find: '@lieshoucloud/contract-types', replacement: path.resolve(__dirname, 'open/contract-types/src') },
      { find: '@lieshoucloud/core-web', replacement: path.resolve(__dirname, 'open/core-web/src') },
      { find: '@lieshoucloud/i18n', replacement: path.resolve(__dirname, 'open/i18n/src') },
      // 客户包兜底：@lieshoucloud/<client>[/<subpath>] → ../packages/<client>/src[/<subpath>]
      // （正则捕获组 + $1/$2 由 Vite alias 字符串替换展开；共享包走 workspace，排除避免误命中）
      {
        find: /^@lieshoucloud\/(?!contract-api|contract-config|contract-types|ui|core-web|charts|hooks|i18n|ui-native)([a-z-]+)(\/.*)?$/,
        replacement: path.resolve(__dirname, '../packages/$1/src$2'),
      },
    ],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:9001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
