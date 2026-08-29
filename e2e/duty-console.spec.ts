/**
 * 值班控制台 e2e：登录 → 工作台异常卡 → 处置页 query 预置筛选（P3 链路）.
 *
 * 后端 API 全部 page.route 拦截 mock，不依赖真实后端/数据库。
 */
import { expect, test, type Page } from '@playwright/test';

/** mock 后端 API：登录 + 工作台总览（含 CRITICAL 告警）+ 设备/告警列表；roles 可参数化（验收角色裁剪差异） */
async function mockApi(page: Page, roles: string[] = ['PLATFORM_ADMIN']): Promise<void> {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-token',
        refreshToken: 'e2e-refresh-token',
        userId: 1,
        username: roles.includes('DUTY_OFFICER') ? 'duty' : 'admin',
        tenantCode: 'default',
        tenantName: '默认租户',
        availableTenants: [],
      }),
    }),
  );

  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId: 1,
        tenantId: 1,
        tenantCode: 'default',
        tenantName: '默认租户',
        username: roles.includes('DUTY_OFFICER') ? 'duty' : 'admin',
        roles,
      }),
    }),
  );

  await page.route('**/api/iot/devices/overview', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        deviceCount: { total: 10, online: 8, offline: 2 },
        alertsToday: 5,
        pendingAlerts: 3,
        maxTemperature: { deviceId: 1, name: '电缆井 A-01', value: 78 },
        offlineDevices: [
          { id: 2, name: '设备 B', deviceKey: 'dev-b', lastOfflineAt: '2026-08-29T10:00:00Z' },
        ],
        alertDevices: [
          {
            alertId: 100,
            deviceId: 1,
            name: '电缆井 A-01',
            ruleName: '高温阈值',
            severity: 'CRITICAL',
            propertyKey: 'node1_temperature',
            actualValue: '78',
            threshold: '70',
            message: '节点温度超限',
            createdAt: '2026-08-29T10:00:00Z',
          },
        ],
      }),
    }),
  );

  await page.route('**/api/iot/devices*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );

  await page.route('**/api/iot/alerts*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 100,
          tenantId: 1,
          deviceId: 1,
          ruleId: 1,
          ruleName: '高温阈值',
          severity: 'CRITICAL',
          triggerType: 'PROPERTY',
          propertyKey: 'node1_temperature',
          actualValue: '78',
          threshold: '70',
          message: '节点温度超限',
          status: 'PENDING',
          createdAt: '2026-08-29T10:00:00Z',
        },
      ]),
    }),
  );
}

test('值班员登录 → 工作台严重告警卡 → 告警页 severity 预置筛选', async ({ page }) => {
  await mockApi(page);

  // 登录（开发种子 admin / admin123）
  await page.goto('/login');
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  await page.click('button:has-text("登 录")');

  // 落地值班工作台（dutyConsole homePath='/')
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('严重告警')).toBeVisible();

  // 点击「严重告警」行动卡 → 跳转告警页带 severity query
  await page.getByText('严重告警').click();
  await expect(page).toHaveURL(/\/iot\/alerts\?severity=CRITICAL/);

  // 告警中心页可达（P3 预置筛选的落地页）
  await expect(page.getByText('告警中心')).toBeVisible();
});

test('工作台离线设备卡 → 设备页 status 预置筛选', async ({ page }) => {
  await mockApi(page);

  await page.goto('/login');
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  await page.click('button:has-text("登 录")');

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('离线设备')).toBeVisible();

  // 点击「离线设备」行动卡 → 跳转设备页带 status query
  await page.getByText('离线设备').click();
  await expect(page).toHaveURL(/\/iot\/devices\?status=OFFLINE/);

  // 设备管理页可达
  await expect(page.getByText('设备管理')).toBeVisible();
});

test('duty 值班员（DUTY_OFFICER）→ 菜单裁剪：隐藏设备/配置，保留只读监控', async ({ page }) => {
  await mockApi(page, ['DUTY_OFFICER']);

  await page.goto('/login');
  await page.fill('input[placeholder="用户名"]', 'duty');
  await page.fill('input[placeholder="密码"]', 'admin123');
  await page.click('button:has-text("登 录")');

  await expect(page).toHaveURL(/\/$/);

  // 只读监控菜单可见
  await expect(page.getByRole('menuitem', { name: '告警' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: '拓扑' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: '监控总览' })).toBeVisible();

  // 配置类菜单（设备/产品/规则）被角色裁剪隐藏
  await expect(page.getByRole('menuitem', { name: '设备' })).toHaveCount(0);
  await expect(page.getByText('配置', { exact: true })).toHaveCount(0);
});
