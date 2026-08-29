import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e 配置（admin-web 值班控制台链路）.
 *
 * webServer 起 vite dev（端口 21300，与 vite.config.ts 对齐）；
 * 后端 API 由测试内 page.route 拦截 mock（不依赖真实后端）。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:21300',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx vite --port 21300 --strictPort',
    url: 'http://localhost:21300',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
