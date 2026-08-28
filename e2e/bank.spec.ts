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

test.describe('电子账务平台 · 银行功能', () => {
  test('登录后侧边栏显示客户银行菜单', async ({ page }) => {
    await page.goto('/welcome');
    // 客户专属菜单（extraRoutes.menu · BasicLayout 合并）
    await expect(page.getByText('电子账务工作台')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('银行账户', { exact: true })).toBeVisible();
    await expect(page.getByText('银行流水', { exact: true })).toBeVisible();
    await expect(page.getByText('银行回单', { exact: true })).toBeVisible();
  });

  test('工作台首页：可访问（useNavigate 单实例）', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('电子账务工作台').click();
    await expect(page).toHaveURL(/\/daizhang\/workspace/, { timeout: 10_000 });
    // 页面渲染成功（无 Router context 报错）
    await expect(page.getByText('银行流水', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('银行账户', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('银行回单', { exact: true }).first()).toBeVisible();
  });

  test('银行账户页：新增账户并出现在列表', async ({ page }) => {
    await page.goto('/welcome');
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
    await page.goto('/welcome');
    await page.getByText('银行流水', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/transactions/, { timeout: 10_000 });
    // 页面标题 + 导入入口存在
    await expect(page.getByText('银行流水', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /记一笔/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /CSV 导入/ })).toBeVisible();
  });

  test('银行流水页：勾选流水可一键转记账', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('银行流水', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/transactions/, { timeout: 10_000 });
    // 勾选第一行（antd Table rowSelection checkbox）
    const firstCheckbox = page.locator('.ant-table-tbody input[type="checkbox"]').first();
    await firstCheckbox.check({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /转记账\(1\)/ })).toBeEnabled();
    await page.getByRole('button', { name: /转记账\(1\)/ }).click();
    // 分类模板弹窗 → 确认转记账
    await expect(page.getByText('转记账 · 选择分类')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /确认转记账/ }).click();
    await expect(page.getByText(/已转记账 \d+ 笔/)).toBeVisible({ timeout: 10_000 });
  });

  test('银行流水页：CSV 导入预览后确认', async ({ page }) => {
    await page.goto('/welcome');
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

  test('收支报表页：可访问并展示汇总', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('收支报表', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/reports/, { timeout: 10_000 });
    // 汇总卡 + 月度明细表渲染
    await expect(page.getByText('累计收入')).toBeVisible();
    await expect(page.getByText('累计支出')).toBeVisible();
    await expect(page.getByText('月度明细')).toBeVisible();
  });

  test('银行回单页：可访问并展示回单数据', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('银行回单', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/receipts/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /上传回单/ })).toBeVisible();
  });

  test('应收应付页：台账按往来单位展示（余额卡 + 账龄表）', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('应收应付', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/receivable-payable/, { timeout: 10_000 });
    // 余额卡
    await expect(page.getByText('应收未核销（未收）')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('应付未核销（未付）')).toBeVisible();
    // 账龄表列（往来单位 / 挂账总额 / 未核销余额）
    await expect(page.getByText('往来单位').first()).toBeVisible();
    await expect(page.getByText('挂账总额').first()).toBeVisible();
    await expect(page.getByText('未核销余额').first()).toBeVisible();
    // E2E 转记账数据已在台账（客户A）
    await expect(page.getByText('客户A').first()).toBeVisible();
  });

  test('应收应付页：核销 → 记录出现 → 撤销恢复', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('应收应付', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/receivable-payable/, { timeout: 10_000 });
    // 客户A 有未核销余额（E2E 转记账数据）→ 核销 1000
    const row = page.locator('tr', { hasText: '客户A' }).first();
    await row.getByRole('button', { name: /核销/ }).first().click();
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 10_000 });
    await page.getByLabel('核销金额').fill('1000');
    await page.getByLabel('备注').fill('E2E 回款核销');
    await page.locator('.ant-modal-footer .ant-btn-primary').click();
    // 核销记录出现
    await expect(page.getByText('E2E 回款核销')).toBeVisible({ timeout: 10_000 });
    // 撤销核销 → 记录消失
    await page.locator('tr', { hasText: 'E2E 回款核销' }).getByRole('button', { name: /撤销/ }).click();
    await page.locator('.ant-popover .ant-popconfirm-buttons .ant-btn-primary').click();
    await expect(page.getByText('E2E 回款核销')).toHaveCount(0, { timeout: 10_000 });
  });

  test('收支报表页：分类汇总展示 + 联查凭证', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('收支报表', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/bank\/reports/, { timeout: 10_000 });
    // 汇总卡 + 月度明细（既有）
    await expect(page.getByText('累计收入')).toBeVisible();
    // 分类汇总区块（V8）：收入分类 / 支出分类
    await expect(page.getByText('收入分类', { exact: false })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('支出分类', { exact: false })).toBeVisible();
    // 点击分类（应收账款）→ 联查凭证页带 category
    await page.getByText('应收账款', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/vouchers\?category=/, { timeout: 10_000 });
    // 凭证页展示分类筛选标签
    await expect(page.getByText(/分类筛选：应收账款/)).toBeVisible({ timeout: 10_000 });
  });

  test('记账本页：补录记账 → 列表可见 → 编辑 → 删除', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('记账本', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/book/, { timeout: 10_000 });
    // 补录：销售收入模板（带出科目）
    await page.getByRole('button', { name: /补录记账/ }).click();
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 10_000 });
    const stamp = Date.now().toString().slice(-6);
    await page.getByLabel('金额').fill('6666');
    await page.getByLabel('备注').fill(`E2E补录${stamp}`);
    // 选分类模板：销售收入
    await page.locator('.ant-modal').locator('.ant-select').click();
    await page.locator('.ant-select-item-option', { hasText: '销售收入' }).first().click();
    await page.locator('.ant-modal-footer .ant-btn-primary').click();
    // 列表出现 + 科目带出
    await expect(page.getByText(`E2E补录${stamp}`)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('借 银行存款 / 贷 主营业务收入').first()).toBeVisible();

    // 编辑：改备注
    await page.locator('tr', { hasText: `E2E补录${stamp}` }).getByRole('button', { name: /编辑/ }).click();
    await page.getByLabel('备注').fill(`E2E补录${stamp}-改`);
    await page.locator('.ant-modal-footer .ant-btn-primary').click();
    await expect(page.getByText(`E2E补录${stamp}-改`)).toBeVisible({ timeout: 10_000 });

    // 删除
    await page.locator('tr', { hasText: `E2E补录${stamp}` }).getByRole('button', { name: /删除/ }).click();
    await page.locator('.ant-popover .ant-popconfirm-buttons .ant-btn-primary').click();
    await expect(page.locator('tr', { hasText: `E2E补录${stamp}` })).toHaveCount(0, { timeout: 10_000 });
  });

  test('账龄预警：顶栏红点 + 应收应付页逾期横幅', async ({ page }) => {
    // 进入页面（storageState 已登录）→ 取 JWT 供 API 造数
    await page.goto('/welcome');
    const token = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('lieshoucloud:auth');
        return raw ? (JSON.parse(raw).state?.accessToken as string) : '';
      } catch {
        return '';
      }
    });
    const authHeaders = { 'X-Tenant-Id': '1', Authorization: `Bearer ${token}` };

    // 造一笔 45 天前的应收账款挂账（经 API，避免 UI 造数）
    const old = new Date();
    old.setDate(old.getDate() - 45);
    const oldDate = old.toISOString().slice(0, 10);
    const stamp = Date.now().toString().slice(-6);
    const acc = await page.request.post('/api/bank/accounts', {
      headers: authHeaders,
      data: { accountName: `逾期${stamp}`, bankName: 'E2E银行', accountNo: `99${stamp}` },
    });
    const accId = (await acc.json()).id;
    const tx = await page.request.post('/api/bank/transactions', {
      headers: authHeaders,
      data: {
        accountId: accId,
        direction: 'INCOME',
        amount: 15000,
        summary: 'E2E逾期货款',
        counterparty: `逾期客户${stamp}`,
        transactedAt: `${oldDate}T06:00:00Z`,
      },
    });
    const txId = (await tx.json()).id;
    const cats = await page.request.get('/api/ledger/categories?enabledOnly=true', {
      headers: authHeaders,
    });
    const catId = (await cats.json()).find((c: { name: string }) => c.name === '应收账款').id;
    await page.request.post('/api/bank/transactions/to-ledger', {
      headers: authHeaders,
      data: { transactionIds: [txId], categoryId: catId },
    });

    // 刷新 → 顶栏红点（AlertBadge 进入后立即拉一次）
    await page.reload();
    const alertBtn = page.getByTestId('alert-逾期应收应付');
    await expect(alertBtn).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.ant-badge-count').first()).toContainText(/[1-9]/, { timeout: 10_000 });

    // 点击 → 应收应付页 → 逾期横幅可见
    await alertBtn.click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/receivable-payable/, { timeout: 10_000 });
    await expect(page.getByText(/账龄预警：应收逾期/)).toBeVisible({ timeout: 10_000 });
  });

  test('记账凭证页：预览统计 + 凭证表 + 导出按钮', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('记账凭证', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/vouchers/, { timeout: 10_000 });
    // 统计卡
    await expect(page.getByText('凭证数')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('完整凭证')).toBeVisible();
    await expect(page.getByText('待完善（缺科目）')).toBeVisible();
    // 凭证表渲染（凭证号 + 摘要列）
    await expect(page.getByText('凭证号').first()).toBeVisible();
    await expect(page.getByText('摘要').first()).toBeVisible();
    // E2E 转记账数据已在凭证（V20260828-00x）
    await expect(page.getByText(/^V2026\d{4}-\d{3}$/).first()).toBeVisible();
    // 导出按钮
    await expect(page.getByRole('button', { name: /导出 CSV/ })).toBeVisible();
  });

  test('记账科目页：新增模板 → 列表可见 → 删除', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByText('记账科目', { exact: true }).click();
    await expect(page).toHaveURL(/\/daizhang\/ledger\/categories/, { timeout: 10_000 });
    // 种子模板已存在（销售收入 …）
    await expect(page.getByText('销售收入')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('借 银行存款 / 贷 主营业务收入')).toBeVisible();

    // 新增模板（名称唯一避免重复）
    const stamp = Date.now().toString().slice(-6);
    await page.getByRole('button', { name: /新增科目/ }).click();
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 10_000 });
    await page.getByLabel('分类名称').fill(`E2E科目${stamp}`);
    await page.getByLabel('借方科目').fill('管理费用-E2E');
    await page.getByLabel('贷方科目').fill('银行存款');
    await page.locator('.ant-modal-footer .ant-btn-primary').click();
    await expect(page.getByText(`E2E科目${stamp}`)).toBeVisible({ timeout: 10_000 });

    // 删除刚创建的模板（Popconfirm 确定按钮）
    await page.locator('tr', { hasText: `E2E科目${stamp}` }).getByRole('button', { name: /删除/ }).click();
    await page.locator('.ant-popover .ant-popconfirm-buttons .ant-btn-primary').click();
    await expect(page.locator('tr', { hasText: `E2E科目${stamp}` })).toHaveCount(0, { timeout: 10_000 });
  });
});
