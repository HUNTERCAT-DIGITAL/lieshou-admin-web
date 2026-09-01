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
      { find: '@lieshoucloud/api-client', replacement: path.resolve(__dirname, 'open/contract-api/src') },
      { find: '@lieshoucloud/contract-config', replacement: path.resolve(__dirname, 'open/contract-config/src') },
      { find: '@lieshoucloud/contract-types', replacement: path.resolve(__dirname, 'open/contract-types/src') },
      { find: '@lieshoucloud/core-web', replacement: path.resolve(__dirname, 'open/core-web/src') },
      { find: /^@lieshoucloud\/ui($|\/)/, replacement: path.resolve(__dirname, 'open/ui/src') + '$1' },
      { find: /^@lieshoucloud\/charts($|\/)/, replacement: path.resolve(__dirname, 'open/charts/src') + '$1' },
      // 设备激活二维码：dwjk 包不在 workspace，qrcode.react 显式 alias 到顶层软链（同 react-router-dom 处理）
      { find: 'qrcode.react', replacement: path.resolve(__dirname, 'node_modules/qrcode.react') },
      { find: '@lieshoucloud/i18n', replacement: path.resolve(__dirname, 'open/i18n/src') },
      // 第三方依赖显式 alias（嵌套 workspace：客户包 packages/dwjk 在仓外，从它向上解析不到端内 node_modules → 强制指向端内顶层软链 · E13）
      { find: /^react($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react') + '$1' },
      { find: /^react-dom($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react-dom') + '$1' },
      { find: /^react-router-dom($|\/)/, replacement: path.resolve(__dirname, 'node_modules/react-router-dom') + '$1' },
      { find: /^antd($|\/)/, replacement: path.resolve(__dirname, 'node_modules/antd') + '$1' },
      { find: /^@ant-design\/icons($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@ant-design/icons') + '$1' },
      { find: /^@ant-design\/pro-components($|\/)/, replacement: path.resolve(__dirname, 'node_modules/@ant-design/pro-components') + '$1' },
      { find: /^dayjs($|\/)/, replacement: path.resolve(__dirname, 'node_modules/dayjs') + '$1' },
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
    // 联调域名/内网 IP 访问 dev 需放行（vite 6 allowedHosts 校验 · 2026-08 E10）
    allowedHosts: true,
    port: 21300,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:21000',
        // ⚠️ changeOrigin 必须 false：gateway CorsConfig「同源放行」依赖 Origin==Host
        // （2026-08 修复），proxy 改 Host 会破坏同源判断 → 浏览器登录 POST 403（对齐 desktop 409f89e）
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 保留旧 chunk：新构建不清空 dist，避免已缓存的旧主 bundle 引用旧 chunk 时
    // 动态导入 404（Failed to fetch dynamically imported module）；旧文件按需手动清理
    emptyOutDir: false,
  },
});
