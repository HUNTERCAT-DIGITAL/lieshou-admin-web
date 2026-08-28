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

  test('工作台首页：可访问（useNavigate 单实例）', async ({ page }) => {
    await login(page);
    await page.getByText('电子账务工作台').click();
    await expect(page).toHaveURL(/\/daizhang\/workspace/, { timeout: 10_000 });
    // 页面渲染成功（无 Router context 报错）
    await expect(page.getByText('银行流水', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('银行账户', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('银行回单', { exact: true }).first()).toBeVisible();
  });

  test('银行账户页：新增账户并出现在列表', async ({ page }) => {
    await login(page);
    await page.getByText('银行账户', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/accounts/, { timeout: 10_000 });

    const stamp = Date.now().toString().slice(-8);
    await page.getByRole('button', { name: /新增账户/ }).click();
    // 等 Modal 打开（antd okText 受 locale 影响：OK / 确 定 均兼容）
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 10_000 });
    await page.getByLabel('户名').fill(`E2E测试公司${stamp}`);
    await page.getByLabel('开户行').fill('招商银行南昌分行');
    await page.getByLabel('银行账号').fill(`1109${stamp}`);
    await page.locator('.ant-modal-footer .ant-btn-primary').click();

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

  test('银行流水页：勾选流水可一键转记账', async ({ page }) => {
    await login(page);
    await page.getByText('银行流水', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/transactions/, { timeout: 10_000 });
    // 勾选第一行（antd Table rowSelection checkbox）
    const firstCheckbox = page.locator('.ant-table-tbody input[type="checkbox"]').first();
    await firstCheckbox.check({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /转记账\(1\)/ })).toBeEnabled();
    await page.getByRole('button', { name: /转记账\(1\)/ }).click();
    await expect(page.getByText(/已转记账 \d+ 笔/)).toBeVisible({ timeout: 10_000 });
  });

  test('银行流水页：CSV 导入预览后确认', async ({ page }) => {
    await login(page);
    await page.getByText('银行流水', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/transactions/, { timeout: 10_000 });
    // 选目标账户（筛选区第一个下拉，选已有账户）
    await page.locator('.ant-select').first().click();
    await page.locator('.ant-select-item-option').first().click();
    // 上传 CSV（内嵌解析测试数据）
    await page.locator('input[type="file"]').setInputFiles({
      name: '流水测试.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        [
          '交易日期,收支,金额,对方户名,摘要',
          '2026-08-01 09:00,收入,12800.00,客户A,货款',
          '2026-08-02 10:00,支出,3600.00,物业,房租',
        ].join('\n'),
      ),
    });
    // 预览 Modal：识别 2 笔，可确认导入
    await expect(page.getByText(/解析 .*识别 2 笔流水/)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /确认导入 2 笔/ }).click();
    await expect(page.getByText(/成功导入 2 笔流水/)).toBeVisible({ timeout: 10_000 });
  });

  test('银行回单页：可访问并展示回单数据', async ({ page }) => {
    await login(page);
    await page.getByText('银行回单', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/receipts/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /上传回单/ })).toBeVisible();
  });
});
