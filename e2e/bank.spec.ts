/**
 * 银行回单模块 e2e：登录 → 侧边栏客户菜单 → 银行账户/流水/回单页面可达。
 *
 * 前置：daizhang 全栈在跑（本机 http://localhost:8082 或公网 E2E_BASE_URL），
 * 种子账号 admin/admin123（租户 huntercat）。跑法：
 *   cd admin-web && E2E_BASE_URL=http://localhost:8082 pnpm e2e
 */
import { expect, test, type Page } from '@playwright/test';

const USERNAME = process.env.E2E_USERNAME ?? 'admin';
const PASSWORD = process.env.E2E_PASSWORD ?? 'admin123';
const TENANT = process.env.E2E_TENANT ?? 'huntercat';

/** 登录并等待进入主界面（侧边栏可见） */
async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('username-input').fill(USERNAME);
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('submit-button').click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

test.describe('电子账务平台 · 银行功能', () => {
  test('登录后侧边栏显示客户银行菜单', async ({ page }) => {
    await login(page);
    // 客户专属菜单（extraRoutes.menu · BasicLayout 合并）
    await expect(page.getByText('电子账务工作台')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('银行账户', { exact: true })).toBeVisible();
    await expect(page.getByText('银行流水', { exact: true })).toBeVisible();
    await expect(page.getByText('银行回单', { exact: true })).toBeVisible();
  });

  test('银行账户页：新增账户并出现在列表', async ({ page }) => {
    await login(page);
    await page.getByText('银行账户', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/accounts/, { timeout: 10_000 });

    const stamp = Date.now().toString().slice(-8);
    await page.getByRole('button', { name: /新增账户/ }).click();
    await page.getByLabel('户名').fill(`E2E测试公司${stamp}`);
    await page.getByLabel('开户行').fill('招商银行南昌分行');
    await page.getByLabel('银行账号').fill(`1109${stamp}`);
    await page.getByRole('button', { name: 'OK' }).click();

    await expect(page.getByText(`E2E测试公司${stamp}`)).toBeVisible({ timeout: 10_000 });
  });

  test('银行流水页：可访问并展示流水数据', async ({ page }) => {
    await login(page);
    await page.getByText('银行流水', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/transactions/, { timeout: 10_000 });
    // 页面标题 + 导入入口存在
    await expect(page.getByText('银行流水', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /记一笔/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /CSV 导入/ })).toBeVisible();
  });

  test('银行回单页：可访问并展示回单数据', async ({ page }) => {
    await login(page);
    await page.getByText('银行回单', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/receipts/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /上传回单/ })).toBeVisible();
  });
});
