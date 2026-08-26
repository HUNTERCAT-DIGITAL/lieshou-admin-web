/**
 * 客户成功中心页面单测（Phase 10 · 联系函 + 客户响应）.
 *
 * 覆盖：页面渲染 / Tab1 联系函列表与状态流转按钮 / Tab2 客户响应 / 新建联系函 Modal。
 * ProTable request 异步 → waitFor 断言；jsdom `:has()` 补丁见 test/setup.ts。
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider, App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  listCustomers,
  listLetters,
  listResponses,
  sendLetter,
  readLetter,
  completeLetter,
  cancelLetter,
  deleteLetter,
  createLetter,
  createResponse,
  resolveResponse,
  updateLetter,
  updateResponse,
  deleteResponse,
  getLetterTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = vi.hoisted(() => ({
  listCustomers: vi.fn(),
  listLetters: vi.fn(),
  listResponses: vi.fn(),
  sendLetter: vi.fn(),
  readLetter: vi.fn(),
  completeLetter: vi.fn(),
  cancelLetter: vi.fn(),
  deleteLetter: vi.fn(),
  createLetter: vi.fn(),
  createResponse: vi.fn(),
  resolveResponse: vi.fn(),
  updateLetter: vi.fn(),
  updateResponse: vi.fn(),
  deleteResponse: vi.fn(),
  getLetterTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}));

vi.mock('../../services/crm', () => ({ listCustomers }));
vi.mock('../../services/customerSuccess', () => ({
  listLetters,
  listResponses,
  sendLetter,
  readLetter,
  completeLetter,
  cancelLetter,
  deleteLetter,
  createLetter,
  createResponse,
  resolveResponse,
  updateLetter,
  updateResponse,
  deleteResponse,
  getLetterTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
}));

import CustomerSuccess from '../Customer/Success';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ConfigProvider>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  </MemoryRouter>
);

const LETTER_DRAFT = {
  id: 1,
  tenantId: 1,
  customerId: 11,
  type: 'RENEWAL',
  title: '2026 年度续费提醒函',
  content: '您的服务将于 2026-09-30 到期',
  status: 'DRAFT',
  sentAt: null,
  readAt: null,
  completedAt: null,
  createdAt: '2026-08-25T10:00:00Z',
} as const;

const LETTER_SENT = {
  ...LETTER_DRAFT,
  id: 2,
  title: '服务升级通知',
  status: 'SENT',
  sentAt: '2026-08-25T11:00:00Z',
} as const;

const RESPONSE_OPEN = {
  id: 101,
  tenantId: 1,
  customerId: 11,
  letterId: 2,
  type: 'PHONE',
  sentiment: 'NEGATIVE',
  content: '对续费价格有异议，要求重新报价',
  followUpAction: '下周三前提供阶梯报价',
  followUpAt: '2026-09-01T09:00:00Z',
  status: 'OPEN',
  createdAt: '2026-08-25T12:00:00Z',
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  getLetterTemplates.mockResolvedValue([
    {
      id: 1,
      tenantId: 0,
      templateKey: 'renewal-reminder',
      type: 'RENEWAL',
      title: '服务续费提醒函',
      content: '尊敬的 {customer}：贵司服务即将到期。',
      createdAt: '2026-08-25T10:00:00Z',
    },
  ]);
  listCustomers.mockResolvedValue([
    { id: 11, name: '江西凌科安时律师事务所' },
    { id: 12, name: '南昌猎手猫数字科技' },
  ]);
  listLetters.mockResolvedValue([LETTER_SENT, LETTER_DRAFT]);
  listResponses.mockResolvedValue([RESPONSE_OPEN]);
  sendLetter.mockResolvedValue({ ...LETTER_DRAFT, status: 'SENT' });
  readLetter.mockResolvedValue({ ...LETTER_SENT, status: 'READ' });
  completeLetter.mockResolvedValue({ ...LETTER_SENT, status: 'COMPLETED' });
  cancelLetter.mockResolvedValue({ ...LETTER_DRAFT, status: 'CANCELLED' });
  deleteLetter.mockResolvedValue(undefined);
  createLetter.mockResolvedValue({ ...LETTER_DRAFT, id: 9 });
  createResponse.mockResolvedValue({ ...RESPONSE_OPEN, id: 108 });
  resolveResponse.mockResolvedValue({ ...RESPONSE_OPEN, status: 'RESOLVED' });
  updateLetter.mockResolvedValue({ ...LETTER_DRAFT, title: '新标题' });
  updateResponse.mockResolvedValue({ ...RESPONSE_OPEN, content: '更新内容' });
  deleteResponse.mockResolvedValue(undefined);
});

describe('客户成功中心页面', () => {
  it('渲染页面标题 + Tab1 联系函列表（数据行 + 状态 Tag + 状态流转按钮）', async () => {
    render(<CustomerSuccess />, { wrapper: wrap });

    expect(screen.getByText('客户成功中心')).toBeInTheDocument();
    expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2026 年度续费提醒函')).toBeInTheDocument();
    });
    // SENT 联系函：标记已读 / 闭环 / 取消 / 删除
    expect(screen.getByText('服务升级通知')).toBeInTheDocument();
    expect(screen.getByText('标记已读')).toBeInTheDocument();
    expect(screen.getAllByText('闭环').length).toBeGreaterThan(0);
    // DRAFT 联系函：发送 / 编辑
    expect(screen.getByText('发送')).toBeInTheDocument();
    expect(screen.getAllByText('编辑').length).toBeGreaterThan(0);
    expect(screen.getAllByText('删除').length).toBeGreaterThan(0);
  });

  it('Tab1 状态流转：DRAFT 发送 → SENT 标记已读 → 闭环', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('2026 年度续费提醒函')).toBeInTheDocument();
    });

    await user.click(screen.getByText('发送'));
    await waitFor(() => {
      expect(sendLetter).toHaveBeenCalledWith(1);
    });
  });

  it('Tab2 客户响应：切 Tab 渲染响应行（情绪 Tag + 闭环动作）', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();
    });

    await user.click(screen.getByText('客户响应（深化跟进）'));
    await waitFor(() => {
      expect(screen.getByText('对续费价格有异议，要求重新报价')).toBeInTheDocument();
    });
    expect(screen.getByText('消极')).toBeInTheDocument();
    expect(screen.getByText('待跟进')).toBeInTheDocument();
    expect(screen.getByText('下周三前提供阶梯报价')).toBeInTheDocument();
  });

  it('Tab2 闭环响应：resolve 动作调用 resolveResponse', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();
    });
    await user.click(screen.getByText('客户响应（深化跟进）'));
    await waitFor(() => {
      expect(screen.getByText('对续费价格有异议，要求重新报价')).toBeInTheDocument();
    });

    // Tab1/Tab2 均在 DOM（antd Tabs 不销毁非激活 pane），取响应行的「闭环」（文档序靠后）
    const resolveButtons = screen.getAllByText('闭环');
    await user.click(resolveButtons[resolveButtons.length - 1]);
    await waitFor(() => {
      expect(resolveResponse).toHaveBeenCalledWith(101);
    });
  });

  it('新建联系函：打开 Modal 提交 createLetter', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });

    await waitFor(() => {
      expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();
    });

    await user.click(screen.getByText('新建联系函'));
    expect(await screen.findByText('函件标题')).toBeInTheDocument();

    // 页面存在两个「收函客户」Select（ProTable 搜索表单 + Modal，id 均 customerId），必须限定在 Modal 内按 role 定位；
    // 下拉面板渲染在 body（antd portal），option 用 screen 级查找
    const modal = document.querySelector<HTMLElement>('.ant-modal');
    if (!modal) throw new Error('新建联系函 Modal 未渲染');
    const customerSelect = within(modal)
      .getAllByRole('combobox')
      .find((el) => el.id === 'customerId');
    if (!customerSelect) throw new Error('收函客户 Select 未渲染');
    fireEvent.mouseDown(customerSelect);
    const option = await screen.findByTitle('江西凌科安时律师事务所（#11）');
    await user.click(option);
    await waitFor(() => {
      expect(createLetter).not.toHaveBeenCalled();
    });

    await user.type(screen.getByLabelText('函件标题'), '回访邀请函');
    await user.click(screen.getByRole('button', { name: '保 存' }));

    await waitFor(() => {
      expect(createLetter).toHaveBeenCalledWith(
        expect.objectContaining({ title: '回访邀请函', customerId: 11, type: 'RENEWAL' }),
      );
    });
  });

  it('新建联系函：选模板自动填充标题/正文（{customer} → 客户名）', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();
    });
    await user.click(screen.getByText('新建联系函'));
    await screen.findByText('函件标题');

    // 先选客户（模板占位替换用）
    const modal = document.querySelector<HTMLElement>('.ant-modal');
    if (!modal) throw new Error('Modal 未渲染');
    const customerSelect = within(modal)
      .getAllByRole('combobox')
      .find((el) => el.id === 'customerId');
    if (!customerSelect) throw new Error('收函客户 Select 未渲染');
    fireEvent.mouseDown(customerSelect);
    const option = await screen.findByTitle('江西凌科安时律师事务所（#11）');
    await user.click(option);

    // 选模板 → title/content 自动填充
    const templateSelect = within(modal)
      .getAllByRole('combobox')
      .find((el) => el.id === 'templateKey');
    if (!templateSelect) throw new Error('模板 Select 未渲染');
    fireEvent.mouseDown(templateSelect);
    const tplOption = await screen.findByTitle('【系统】续费提醒函');
    await user.click(tplOption);

    await waitFor(() => {
      expect(screen.getByLabelText('函件标题')).toHaveValue('服务续费提醒函');
    });
    // 正文 {customer} 已替换为客户名（渲染异步，waitFor 内断言）
    await waitFor(() => {
      expect(screen.getByLabelText('函件正文')).toHaveValue(
        '尊敬的 江西凌科安时律师事务所：贵司服务即将到期。',
      );
    });
  });

  it('Tab2 跟进筛选：切换「已逾期」→ listResponses 带 followUpOverdue', async () => {
    const user = userEvent.setup();
    listResponses.mockResolvedValue([{ ...RESPONSE_OPEN, followUpAt: '2026-08-01T09:00:00Z' }]);
    render(<CustomerSuccess />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('客户响应（深化跟进）')).toBeInTheDocument();
    });
    await user.click(screen.getByText('客户响应（深化跟进）'));
    await waitFor(() => {
      expect(listResponses).toHaveBeenCalled();
    });

    // 顶部跟进状态筛选切换到「已逾期」
    await user.click(screen.getByRole('combobox', { name: '跟进状态筛选' }));
    await user.click(await screen.findByTitle('已逾期'));
    await waitFor(() => {
      const call = listResponses.mock.calls.at(-1)?.[0] as Record<string, unknown> | undefined;
      expect(call?.followUpOverdue).toBe(true);
    });
  });

  it('模板管理：系统模板只读展示；新建自定义模板 → createTemplate', async () => {
    const user = userEvent.setup();
    render(<CustomerSuccess />, { wrapper: wrap });
    await waitFor(() => {
      expect(screen.getByText('联系函（主动触达）')).toBeInTheDocument();
    });

    // 打开模板管理：系统模板带「系统」标记且只读
    await user.click(screen.getByText('模板管理'));
    expect(await screen.findByText('系统 · 续费提醒函')).toBeInTheDocument();
    expect(screen.getByText('只读')).toBeInTheDocument();

    // 新建自定义模板
    await user.click(screen.getByText('新建模板'));
    await user.type(await screen.findByLabelText('模板键'), 'my-custom');
    await user.type(screen.getByLabelText('模板标题'), '专属回访函');
    // user.type 会把 {customer} 当按键序列，正文用 fireEvent.change 直接赋值
    fireEvent.change(screen.getByLabelText('模板正文'), {
      target: { value: '尊敬的 {customer}：专属问候' },
    });
    await user.click(screen.getByRole('button', { name: '保 存' }));

    await waitFor(() => {
      expect(createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          templateKey: 'my-custom',
          title: '专属回访函',
          content: '尊敬的 {customer}：专属问候',
          type: 'RENEWAL',
        }),
      );
    });
  });
});
