/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vitest + Vite 配置（详见 .ai/TESTING.md §2）
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // 消除 AuthError 双实例（symlink/open 路径重复加载）
      '@lieshoucloud/contract-api': path.resolve(__dirname, 'open/contract-api/src'),
    },
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
