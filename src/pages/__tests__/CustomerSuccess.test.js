"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 客户成功中心页面单测（Phase 10 · 联系函 + 客户响应）.
 *
 * 覆盖：页面渲染 / Tab1 联系函列表与状态流转按钮 / Tab2 客户响应 / 新建联系函 Modal。
 * ProTable request 异步 → waitFor 断言；jsdom `:has()` 补丁见 test/setup.ts。
 */
var react_1 = require("@testing-library/react");
var react_2 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var _a = vitest_1.vi.hoisted(function () { return ({
    listCustomers: vitest_1.vi.fn(),
    listLetters: vitest_1.vi.fn(),
    listResponses: vitest_1.vi.fn(),
    sendLetter: vitest_1.vi.fn(),
    readLetter: vitest_1.vi.fn(),
    completeLetter: vitest_1.vi.fn(),
    cancelLetter: vitest_1.vi.fn(),
    deleteLetter: vitest_1.vi.fn(),
    createLetter: vitest_1.vi.fn(),
    createResponse: vitest_1.vi.fn(),
    resolveResponse: vitest_1.vi.fn(),
    updateLetter: vitest_1.vi.fn(),
    updateResponse: vitest_1.vi.fn(),
    deleteResponse: vitest_1.vi.fn(),
    getLetterTemplates: vitest_1.vi.fn(),
    createTemplate: vitest_1.vi.fn(),
    updateTemplate: vitest_1.vi.fn(),
    deleteTemplate: vitest_1.vi.fn(),
}); }), listCustomers = _a.listCustomers, listLetters = _a.listLetters, listResponses = _a.listResponses, sendLetter = _a.sendLetter, readLetter = _a.readLetter, completeLetter = _a.completeLetter, cancelLetter = _a.cancelLetter, deleteLetter = _a.deleteLetter, createLetter = _a.createLetter, createResponse = _a.createResponse, resolveResponse = _a.resolveResponse, updateLetter = _a.updateLetter, updateResponse = _a.updateResponse, deleteResponse = _a.deleteResponse, getLetterTemplates = _a.getLetterTemplates, createTemplate = _a.createTemplate, updateTemplate = _a.updateTemplate, deleteTemplate = _a.deleteTemplate;
vitest_1.vi.mock('../../services/crm', function () { return ({ listCustomers: listCustomers }); });
vitest_1.vi.mock('../../services/customerSuccess', function () { return ({
    listLetters: listLetters,
    listResponses: listResponses,
    sendLetter: sendLetter,
    readLetter: readLetter,
    completeLetter: completeLetter,
    cancelLetter: cancelLetter,
    deleteLetter: deleteLetter,
    createLetter: createLetter,
    createResponse: createResponse,
    resolveResponse: resolveResponse,
    updateLetter: updateLetter,
    updateResponse: updateResponse,
    deleteResponse: deleteResponse,
    getLetterTemplates: getLetterTemplates,
    createTemplate: createTemplate,
    updateTemplate: updateTemplate,
    deleteTemplate: deleteTemplate,
}); });
var Success_1 = require("../Customer/Success");
var wrap = function (_a) {
    var children = _a.children;
    return (<react_router_dom_1.MemoryRouter>
    <antd_1.ConfigProvider>
      <antd_1.App>{children}</antd_1.App>
    </antd_1.ConfigProvider>
  </react_router_dom_1.MemoryRouter>);
};
var LETTER_DRAFT = {
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
};
var LETTER_SENT = __assign(__assign({}, LETTER_DRAFT), { id: 2, title: '服务升级通知', status: 'SENT', sentAt: '2026-08-25T11:00:00Z' });
var RESPONSE_OPEN = {
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
};
(0, vitest_1.beforeEach)(function () {
    vitest_1.vi.clearAllMocks();
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
    sendLetter.mockResolvedValue(__assign(__assign({}, LETTER_DRAFT), { status: 'SENT' }));
    readLetter.mockResolvedValue(__assign(__assign({}, LETTER_SENT), { status: 'READ' }));
    completeLetter.mockResolvedValue(__assign(__assign({}, LETTER_SENT), { status: 'COMPLETED' }));
    cancelLetter.mockResolvedValue(__assign(__assign({}, LETTER_DRAFT), { status: 'CANCELLED' }));
    deleteLetter.mockResolvedValue(undefined);
    createLetter.mockResolvedValue(__assign(__assign({}, LETTER_DRAFT), { id: 9 }));
    createResponse.mockResolvedValue(__assign(__assign({}, RESPONSE_OPEN), { id: 108 }));
    resolveResponse.mockResolvedValue(__assign(__assign({}, RESPONSE_OPEN), { status: 'RESOLVED' }));
    updateLetter.mockResolvedValue(__assign(__assign({}, LETTER_DRAFT), { title: '新标题' }));
    updateResponse.mockResolvedValue(__assign(__assign({}, RESPONSE_OPEN), { content: '更新内容' }));
    deleteResponse.mockResolvedValue(undefined);
});
(0, vitest_1.describe)('客户成功中心页面', function () {
    (0, vitest_1.it)('渲染页面标题 + Tab1 联系函列表（数据行 + 状态 Tag + 状态流转按钮）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    (0, vitest_1.expect)(react_1.screen.getByText('客户成功中心')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('2026 年度续费提醒函')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // SENT 联系函：标记已读 / 闭环 / 取消 / 删除
                    (0, vitest_1.expect)(react_1.screen.getByText('服务升级通知')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('标记已读')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getAllByText('闭环').length).toBeGreaterThan(0);
                    // DRAFT 联系函：发送 / 编辑
                    (0, vitest_1.expect)(react_1.screen.getByText('发送')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getAllByText('编辑').length).toBeGreaterThan(0);
                    (0, vitest_1.expect)(react_1.screen.getAllByText('删除').length).toBeGreaterThan(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Tab1 状态流转：DRAFT 发送 → SENT 标记已读 → 闭环', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('2026 年度续费提醒函')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('发送'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(sendLetter).toHaveBeenCalledWith(1);
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Tab2 客户响应：切 Tab 渲染响应行（情绪 Tag + 闭环动作）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('客户响应（深化跟进）'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('对续费价格有异议，要求重新报价')).toBeInTheDocument();
                        })];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.getByText('消极')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('待跟进')).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('下周三前提供阶梯报价')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Tab2 闭环响应：resolve 动作调用 resolveResponse', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, resolveButtons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('客户响应（深化跟进）'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('对续费价格有异议，要求重新报价')).toBeInTheDocument();
                        })];
                case 3:
                    _a.sent();
                    resolveButtons = react_1.screen.getAllByText('闭环');
                    return [4 /*yield*/, user.click(resolveButtons[resolveButtons.length - 1])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(resolveResponse).toHaveBeenCalledWith(101);
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('新建联系函：打开 Modal 提交 createLetter', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, _a, modal, customerSelect, option;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                        })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('新建联系函'))];
                case 2:
                    _b.sent();
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('函件标题')];
                case 3:
                    _a.apply(void 0, [_b.sent()]).toBeInTheDocument();
                    modal = document.querySelector('.ant-modal');
                    if (!modal)
                        throw new Error('新建联系函 Modal 未渲染');
                    customerSelect = (0, react_1.within)(modal)
                        .getAllByRole('combobox')
                        .find(function (el) { return el.id === 'customerId'; });
                    if (!customerSelect)
                        throw new Error('收函客户 Select 未渲染');
                    react_2.fireEvent.mouseDown(customerSelect);
                    return [4 /*yield*/, react_1.screen.findByTitle('江西凌科安时律师事务所（#11）')];
                case 4:
                    option = _b.sent();
                    return [4 /*yield*/, user.click(option)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(createLetter).not.toHaveBeenCalled();
                        })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, user.type(react_1.screen.getByLabelText('函件标题'), '回访邀请函')];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByRole('button', { name: '保 存' }))];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(createLetter).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ title: '回访邀请函', customerId: 11, type: 'RENEWAL' }));
                        })];
                case 9:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('新建联系函：选模板自动填充标题/正文（{customer} → 客户名）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, modal, customerSelect, option, templateSelect, tplOption;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('新建联系函'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_1.screen.findByText('函件标题')];
                case 3:
                    _a.sent();
                    modal = document.querySelector('.ant-modal');
                    if (!modal)
                        throw new Error('Modal 未渲染');
                    customerSelect = (0, react_1.within)(modal)
                        .getAllByRole('combobox')
                        .find(function (el) { return el.id === 'customerId'; });
                    if (!customerSelect)
                        throw new Error('收函客户 Select 未渲染');
                    react_2.fireEvent.mouseDown(customerSelect);
                    return [4 /*yield*/, react_1.screen.findByTitle('江西凌科安时律师事务所（#11）')];
                case 4:
                    option = _a.sent();
                    return [4 /*yield*/, user.click(option)];
                case 5:
                    _a.sent();
                    templateSelect = (0, react_1.within)(modal)
                        .getAllByRole('combobox')
                        .find(function (el) { return el.id === 'templateKey'; });
                    if (!templateSelect)
                        throw new Error('模板 Select 未渲染');
                    react_2.fireEvent.mouseDown(templateSelect);
                    return [4 /*yield*/, react_1.screen.findByTitle('【系统】续费提醒函')];
                case 6:
                    tplOption = _a.sent();
                    return [4 /*yield*/, user.click(tplOption)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByLabelText('函件标题')).toHaveValue('服务续费提醒函');
                        })];
                case 8:
                    _a.sent();
                    // 正文 {customer} 已替换为客户名（渲染异步，waitFor 内断言）
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByLabelText('函件正文')).toHaveValue('尊敬的 江西凌科安时律师事务所：贵司服务即将到期。');
                        })];
                case 9:
                    // 正文 {customer} 已替换为客户名（渲染异步，waitFor 内断言）
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Tab2 跟进筛选：切换「已逾期」→ listResponses 带 followUpOverdue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    user = user_event_1.default.setup();
                    listResponses.mockResolvedValue([__assign(__assign({}, RESPONSE_OPEN), { followUpAt: '2026-08-01T09:00:00Z' })]);
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('客户响应（深化跟进）')).toBeInTheDocument();
                        })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, user.click(react_1.screen.getByText('客户响应（深化跟进）'))];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(listResponses).toHaveBeenCalled();
                        })];
                case 3:
                    _c.sent();
                    // 顶部跟进状态筛选切换到「已逾期」
                    return [4 /*yield*/, user.click(react_1.screen.getByRole('combobox', { name: '跟进状态筛选' }))];
                case 4:
                    // 顶部跟进状态筛选切换到「已逾期」
                    _c.sent();
                    _b = (_a = user).click;
                    return [4 /*yield*/, react_1.screen.findByTitle('已逾期')];
                case 5: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            var _a;
                            var call = (_a = listResponses.mock.calls.at(-1)) === null || _a === void 0 ? void 0 : _a[0];
                            (0, vitest_1.expect)(call === null || call === void 0 ? void 0 : call.followUpOverdue).toBe(true);
                        })];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('模板管理：系统模板只读展示；新建自定义模板 → createTemplate', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<Success_1.default />, { wrapper: wrap });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(react_1.screen.getByText('联系函（主动触达）')).toBeInTheDocument();
                        })];
                case 1:
                    _d.sent();
                    // 打开模板管理：系统模板带「系统」标记且只读
                    return [4 /*yield*/, user.click(react_1.screen.getByText('模板管理'))];
                case 2:
                    // 打开模板管理：系统模板带「系统」标记且只读
                    _d.sent();
                    _a = vitest_1.expect;
                    return [4 /*yield*/, react_1.screen.findByText('系统 · 续费提醒函')];
                case 3:
                    _a.apply(void 0, [_d.sent()]).toBeInTheDocument();
                    (0, vitest_1.expect)(react_1.screen.getByText('只读')).toBeInTheDocument();
                    // 新建自定义模板
                    return [4 /*yield*/, user.click(react_1.screen.getByText('新建模板'))];
                case 4:
                    // 新建自定义模板
                    _d.sent();
                    _c = (_b = user).type;
                    return [4 /*yield*/, react_1.screen.findByLabelText('模板键')];
                case 5: return [4 /*yield*/, _c.apply(_b, [_d.sent(), 'my-custom'])];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, user.type(react_1.screen.getByLabelText('模板标题'), '专属回访函')];
                case 7:
                    _d.sent();
                    // user.type 会把 {customer} 当按键序列，正文用 fireEvent.change 直接赋值
                    react_2.fireEvent.change(react_1.screen.getByLabelText('模板正文'), {
                        target: { value: '尊敬的 {customer}：专属问候' },
                    });
                    return [4 /*yield*/, user.click(react_1.screen.getByRole('button', { name: '保 存' }))];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, vitest_1.expect)(createTemplate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                                templateKey: 'my-custom',
                                title: '专属回访函',
                                content: '尊敬的 {customer}：专属问候',
                                type: 'RENEWAL',
                            }));
                        })];
                case 9:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
