/**
 * E2E 登录 setup：登录一次，把认证态（storageState）保存给所有测试复用。
 *
 * 避免每个测试独立登录触发 auth-service 限流（authLogin 10 次/分钟）。
 */
import { expect, test as setup } from '@playwright/test';

const AUTH_FILE = 'e2e/.auth.json';
const USERNAME = process.env.E2E_USERNAME ?? 'admin';
const PASSWORD = process.env.E2E_PASSWORD ?? 'admin123';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('username-input').fill(USERNAME);
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('submit-button').click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await page.context().storageState({ path: AUTH_FILE });
});
