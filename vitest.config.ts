/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vitest + Vite 配置（详见 .ai/TESTING.md §2）
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 与 vite.config 对齐：强制 UI 依赖单实例（客户包 devDeps 可能携带副本）
    dedupe: ['antd', 'react', 'react-dom', 'dayjs', '@ant-design/icons'],
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // 消除 AuthError 双实例（symlink/open 路径重复加载）
      { find: '@lieshoucloud/contract-api', replacement: path.resolve(__dirname, 'open/contract-api/src') },
      // lieshou-boot 专属增量包（与 vite.config 正则兜底对齐）
      { find: '@lieshoucloud/boot', replacement: path.resolve(__dirname, '../packages/boot/src') },
      // 客户包兜底（与 vite.config.ts 对齐）：@lieshoucloud/<client>[/<subpath>] → ../packages/<client>/src[/<subpath>]
      {
        find: /^@lieshoucloud\/(?!contract-api|contract-config|contract-types|ui|core-web)([a-z-]+)(\/.*)?$/,
        replacement: path.resolve(__dirname, '../packages/$1/src$2'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      // 起步期（不全阻断，下调；成熟期后改 70/80/70/80 见 ADR-0004）
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/types/**', '**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
