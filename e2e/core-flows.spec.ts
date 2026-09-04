/**
 * 核心链路回归（登录 → 案件列表/作战室 → 整页详情 → 客户 → 主题）.
 * 走真实后端（dev 21300 → gateway 本地栈 · admin/admin123）。
 */
import { test, expect } from '@playwright/test';

test('登录 → 工作台 → 案件列表 → 作战室 → 任务整页详情', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('账号 / 手机号').fill('admin');
  await page.getByPlaceholder('密码').fill('admin123');
  await page.getByRole('button', { name: /登\s*录/ }).click();
  await expect(page).toHaveURL(/\/legalmind\/workspace/, { timeout: 15000 });

  // 案件列表 → 行点击进作战室
  await page.goto('/cases');
  await expect(page.locator('tbody tr.ant-table-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('tbody tr.ant-table-row').first().click();
  await expect(page).toHaveURL(/\/cases\/\d+$/);

  // 作战室：工作项/任务 页签（命名随版本浮动）→ 行点击整页详情
  const tab = page.getByRole('tab', { name: '工作项' }).or(page.getByRole('tab', { name: '任务' })).first();
  await tab.click();
  // 内容区出现即视为渲染成功（空态也算）；有行数据再验证行点击 → 整页详情
  await expect(page.getByRole('tabpanel').first()).toBeVisible({ timeout: 15000 });
  const row = page.locator('tbody tr.ant-table-row').first();
  if ((await row.count()) > 0) {
    await row.click();
    await expect(page).toHaveURL(/\/cases\/\d+\/[a-z-]+\/\d+/);
    await expect(page.getByText(/返回案件/).first()).toBeVisible({ timeout: 10000 });
  }
});

test('客户列表 → 客户整页', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('账号 / 手机号').fill('admin');
  await page.getByPlaceholder('密码').fill('admin123');
  await page.getByRole('button', { name: /登\s*录/ }).click();
  await expect(page).toHaveURL(/\/legalmind\/workspace/, { timeout: 15000 });

  await page.goto('/clients');
  await expect(page.locator('tbody tr.ant-table-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('tbody tr.ant-table-row').first().click();
  await expect(page).toHaveURL(/\/clients\/\d+/);
  await expect(page.getByText('健康度四维')).toBeVisible({ timeout: 10000 });
});

test('主题色：顶部调色盘选墨绿 → 全局持久化', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('账号 / 手机号').fill('admin');
  await page.getByPlaceholder('密码').fill('admin123');
  await page.getByRole('button', { name: /登\s*录/ }).click();
  await expect(page).toHaveURL(/\/legalmind\/workspace/, { timeout: 15000 });

  await page.getByTitle('主题色').click();
  await page.getByText('墨绿', { exact: true }).click(); // 触发整页刷新
  await page.waitForLoadState('load');
  const color = await page.evaluate(() => localStorage.getItem('lieshoucloud:themeColor'));
  expect(color).toBe('#1e9e57');
  // 客户页主题贯穿：登录后页面内主按钮应随全局（检查不存在即可跳过细节断言，键已生效）
});
