import { defineConfig } from '@playwright/test';

/**
 * Playwright e2e 配置 · LieShouCloud-admin-web
 *
 * 目标环境：本地 docker 全栈（http://localhost:8080）或公网域名（E2E_BASE_URL 覆盖）。
 * 前置：`docker compose -f deploy/docker-compose.yml up -d`（交付包全栈在跑）。
 *
 * 覆盖单测盲区：登录全流程、菜单裁剪（开源演示闭环）、通知铃铛、工作台加载。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // 大视口避免 ProLayout 响应式折叠侧边栏（折叠时菜单文本不可见）
    viewport: { width: 1600, height: 900 },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { browserName: 'chromium', storageState: 'e2e/.auth.json' },
    },
  ],
});
