/**
 * 认证流程 e2e：登录成功 / 登录失败 / 开源演示菜单裁剪 / 通知铃铛。
 *
 * 前置：交付包 docker 全栈在跑（http://localhost:8080），种子账号 admin/admin123。
 */
import { expect, test, type Page } from '@playwright/test';

const USERNAME = process.env.E2E_USERNAME ?? 'admin';
const PASSWORD = process.env.E2E_PASSWORD ?? 'admin123';
/** 种子租户（R__seed_admin.sql：admin 属于 tenant code=huntercat；登录不填默认） */
const TENANT = process.env.E2E_TENANT ?? 'huntercat';

/** 登录并等待进入主界面（工作台/欢迎页）。菜单断言用 DOM 存在性（不依赖侧边栏展开）。 */
async function login(page: Page): Promise<void> {
  await page.goto('/login');
  // 不再手填租户：username 触发查询，单租户直接登录（后端默认 huntercat）
  await page.getByTestId('username-input').fill(USERNAME);
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('submit-button').click();
  // 等待离开登录页（跳转主界面）
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

test.describe('登录流程', () => {
  // 表单流程测试不带 storageState（auth.setup 已登录态会让 /login 直接跳转，见 53f9009）
  test.use({ storageState: { cookies: [], origins: [] } });

  test('admin/admin123 登录成功 → 进入主界面', async ({ page }) => {
    await login(page);
    // 收敛后客户菜单在侧边栏；个人中心等已移入头像下拉，此处断言稳定项
    await expect(page.getByText('电子账务工作台')).not.toHaveCount(0);
    await expect(page.getByText('用户中心')).not.toHaveCount(0);
  });

  test('错误密码 → 提示登录失败', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill(USERNAME);
    await page.getByTestId('password-input').fill('wrong-password-123');
    await page.getByTestId('submit-button').click();
    // antd message 错误提示
    await expect(page.getByText(/账号或密码错误|密码错误|用户不存在|登录失败/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('未登录访问受保护页 → 重定向登录', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('开源演示闭环（菜单裁剪）', () => {
  test('登录后显示客户/开源模块，隐藏闭源商业模块', async ({ page }) => {
    // storageState 已登录，直接进入主界面（菜单裁剪断言）
    await page.goto('/welcome');
    // 客户专属 + 开源模块在菜单（DOM 存在）
    await expect(page.getByText('电子账务工作台')).not.toHaveCount(0);
    await expect(page.getByText('租户管理')).not.toHaveCount(0);
    await expect(page.getByText('用户中心')).not.toHaveCount(0);
    await expect(page.getByText('审批流')).not.toHaveCount(0);
    // 闭源商业模块不在侧边栏菜单（方向 A 演示闭环；exact 匹配避免命中用户下拉"快捷入口"）
    await expect(page.getByText('CRM 客户', { exact: true })).toHaveCount(0);
    await expect(page.getByText('进销存', { exact: true })).toHaveCount(0);
    await expect(page.getByText('财务记账', { exact: true })).toHaveCount(0);
    await expect(page.getByText('物联网', { exact: true })).toHaveCount(0);
    await expect(page.getByText('案件管理', { exact: true })).toHaveCount(0);
  });
});

test.describe('租户切换（先登录后选租户）', () => {
  test('多租户用户登录后顶栏显示租户切换器，可切换到其他租户', async ({ page }) => {
    await page.goto('/welcome');
    // 顶栏租户切换器出现（admin 有两个租户；tenantName 由 fetchMe 异步填充，兼容 code 兜底）
    const switcher = page.getByTestId('tenant-switch');
    await expect(switcher).toBeVisible();
    await expect(switcher).toContainText(/南昌猎手猫|huntercat/);

    // 展开下拉 → 选择 Acme 集团
    await switcher.click();
    await page.getByText('Acme 集团').click();

    // 切换后进入新租户上下文（欢迎页；顶栏显示 Acme）
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId('tenant-switch')).toContainText(/Acme|acme/, { timeout: 15_000 });
  });
});

test.describe('通知铃铛与工作台', () => {
  test('顶栏通知铃铛可见（未读 Badge 或空态）', async ({ page }) => {
    await page.goto('/welcome');
    const bell = page.getByTestId('notification-bell');
    await expect(bell).toBeVisible();
  });

  test('工作台：开源统计卡片加载（用户数等）', async ({ page }) => {
    await page.goto('/welcome');
    await page.goto('/admin');
    await expect(page.getByText('数据看板')).toBeVisible();
    // 统计卡（用户数 / 租户数 / 审批待办）
    await expect(page.getByText('用户数')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('审批待办')).toBeVisible();
  });
});
