import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Phase 4 monorepo 升级：apps/admin 通过 workspace 引用 @lieshoucloud/*
// 见 .ai/decisions/0012-monorepo-upgrade.md。
//
// 客户聚合仓模式（2026-09）：客户包 @lieshoucloud/<client> 由客户仓
// deploy:prepare 生成 tsconfig.<client>.json（paths → ../packages/<client>/src），
// 此处补充 Vite 运行时 alias（顺序：具体包在前，客户包正则兜底）。
// 独立仓库（无客户仓）不 import 客户包，正则兜底不会命中，安全。

export default defineConfig({
  plugins: [react()],
  // 浏览器端 shim process.env（@lieshoucloud/contract-config.readEnv 在 vite 下回落 process.env）
  define: {
    'process.env': {},
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        find: '@lieshoucloud/contract-api',
        replacement: path.resolve(__dirname, 'open/contract-api/src'),
      },
      {
        find: '@lieshoucloud/contract-types',
        replacement: path.resolve(__dirname, 'open/contract-types/src'),
      },
      {
        find: '@lieshoucloud/ui',
        replacement: path.resolve(__dirname, 'open/ui/src'),
      },
      // @lieshoucloud/contract-config 经 pnpm workspace 链接解析(入口 runtime.ts,无 src/index)
      // 客户包兜底：@lieshoucloud/<client>[/<subpath>] → ../packages/<client>/src[/<subpath>]
      // （正则捕获组 + $1/$2 由 String.replace 展开）
      {
        find: /^@lieshoucloud\/(?!api-client|config|types|ui)([a-z-]+)(\/.*)?$/,
        replacement: path.resolve(__dirname, '../packages/$1/src$2'),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 允许通过域名访问（入口 nginx 反代时 Host 为 dev 域名，vite 默认会拒绝非 localhost Host）
    allowedHosts: [
      'lieshouboot.huntercat.cn',
      'dev.lieshoucloud.huntercat.cn',
      'dev.zhiye.lieshoucloud.huntercat.cn',
      'layer.dev.lieshoucloud.huntercat.cn',
      'dev.dwjk.iot.lieshoucloud.huntercat.cn',
      'zhiye.dev.lieshoucloud.huntercat.cn',
      'zhiye.lieshoucloud.huntercat.cn',
      'legalmind.layer.lieshoucloud.huntercat.cn',
      'dwjk.dev.lieshoucloud.huntercat.cn',
      'dwjk.iot.lieshoucloud.huntercat.cn',
      'jmzz.dev.lieshoucloud.huntercat.cn',
      'dev.jmzz.lieshoucloud.huntercat.cn',
      'localhost',
      '127.0.0.1',
    ],
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
    proxy: {
      // 前端开发期通过代理转发到 Spring Cloud Gateway（Phase 3）
      // 本机跑默认 http://localhost:9000; 容器跑通过 VITE_DEV_PROXY_TARGET 覆盖
      // (容器内 localhost 指向自身, 必须用 gateway service name + 容器内端口 9000)
      //
      // 注意: 不 rewrite —— gateway 的路由就是 /api/auth/**、/api/users/**,
      // 前端请求 /api/auth/login, vite 原样转发给 gateway 即可匹配路由.
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Phase 9 · 包体积优化：路由懒加载后，再按依赖拆分 vendor，
    // react/antd/pro-components 各自独立 chunk，享受浏览器长缓存；
    // 未知依赖（zustand 等）自动进共享/入口 chunk。
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons', 'dayjs'],
          pro: ['@ant-design/pro-components'],
        },
      },
    },
  },
});
