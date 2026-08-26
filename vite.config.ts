import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Phase 4 monorepo 升级：apps/admin 通过 workspace 引用 @lieshoucloud/*
// 见 .ai/decisions/0012-monorepo-upgrade.md。

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lieshoucloud/api-client': path.resolve(
        __dirname,
        'open/packages/api-client/src',
      ),
      '@lieshoucloud/types': path.resolve(__dirname, 'open/packages/types/src'),
      '@lieshoucloud/ui': path.resolve(__dirname, 'open/packages/ui/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 允许通过域名访问（入口 nginx 反代时 Host 为 dev 域名，vite 默认会拒绝非 localhost Host）
    allowedHosts: [
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
