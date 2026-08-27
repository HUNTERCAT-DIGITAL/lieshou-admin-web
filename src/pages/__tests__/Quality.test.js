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
 * 质检追溯页 smoke + 交互单测（ADR-0037）.
 *
 * ProTable 在 jsdom 渲染脆，按项目惯例（Admin/Welcome 等）mock 服务层后
 * 验证：页面不抛错、两个 Tab 渲染、新建 Modal 打开、?trace= 自动打开商品追溯抽屉。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var qualityApi = vitest_1.vi.hoisted(function () { return ({
    listInspections: vitest_1.vi.fn(),
    listBatches: vitest_1.vi.fn(),
    getBatchDetail: vitest_1.vi.fn(),
    getProductTrace: vitest_1.vi.fn(),
    createInspection: vitest_1.vi.fn(),
    createBatch: vitest_1.vi.fn(),
}); });
var inventoryApi = vitest_1.vi.hoisted(function () { return ({ listProducts: vitest_1.vi.fn() }); });
var listInspections = qualityApi.listInspections, listBatches = qualityApi.listBatches, getBatchDetail = qualityApi.getBatchDetail, getProductTrace = qualityApi.getProductTrace;
var listProducts = inventoryApi.listProducts;
vitest_1.vi.mock('../../services/quality', function () { return (__assign(__assign({}, qualityApi), { countBatches: vitest_1.vi.fn(), countInspections: vitest_1.vi.fn(), getInspection: vitest_1.vi.fn() })); });
vitest_1.vi.mock('../../services/inventory', function () { return (__assign(__assign({}, inventoryApi), { createProduct: vitest_1.vi.fn(), updateProduct: vitest_1.vi.fn(), deleteProduct: vitest_1.vi.fn(), stockIn: vitest_1.vi.fn(), stockOut: vitest_1.vi.fn(), listMovements: vitest_1.vi.fn() })); });
var List_1 = require("../Quality/List");
var sampleProduct = { id: 1, name: '精密轴承', code: 'SKF-6204', stockQuantity: 120 };
var sampleBatch = {
    id: 10,
    tenantId: 1,
    productId: 1,
    batchNo: 'B20260826-001',
    supplier: '供应商甲',
    quantity: 500,
    remark: null,
    createdAt: '2026-08-26T02:00:00Z',
};
var sampleInspection = {
    id: 20,
    tenantId: 1,
    productId: 1,
    batchId: 10,
    type: 'IQC',
    result: 'PASS',
    quantity: 500,
    inspector: '张三',
    inspectedAt: '2026-08-26T02:30:00Z',
    remark: null,
    createdAt: '2026-08-26T02:31:00Z',
};
function renderQuality(initialEntry) {
    if (initialEntry === void 0) { initialEntry = '/quality/list'; }
    return (0, react_1.render)(<antd_1.ConfigProvider>
      <antd_1.App>
        <react_router_dom_1.MemoryRouter initialEntries={[initialEntry]}>
          <react_router_dom_1.Routes>
            <react_router_dom_1.Route path="/quality/list" element={<List_1.default />}/>
          </react_router_dom_1.Routes>
        </react_router_dom_1.MemoryRouter>
      </antd_1.App>
    </antd_1.ConfigProvider>);
}
(0, vitest_1.beforeEach)(function () {
    vitest_1.vi.clearAllMocks();
    listProducts.mockResolvedValue([sampleProduct]);
    listInspections.mockResolvedValue([sampleInspection]);
    listBatches.mockResolvedValue([sampleBatch]);
    getBatchDetail.mockResolvedValue({
        batch: sampleBatch,
        productName: sampleProduct.name,
        inspections: [sampleInspection],
        movements: [
            { id: 1, tenantId: 1, productId: 1, type: 'IN', quantity: 500, batchId: 10, remark: null, createdAt: '2026-08-26T02:35:00Z' },
        ],
    });
    getProductTrace.mockResolvedValue({
        product: sampleProduct,
        batches: [sampleBatch],
        inspections: [sampleInspection],
        movements: [
            { id: 1, tenantId: 1, productId: 1, type: 'IN', quantity: 500, batchId: 10, remark: null, createdAt: '2026-08-26T02:35:00Z' },
        ],
    });
});
(0, vitest_1.describe)('Quality 质检追溯页', function () {
    (0, vitest_1.it)('渲染页面不抛错，并预载商品/质检列表', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, vitest_1.expect)(function () { return renderQuality(); }).not.toThrow();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(listProducts).toHaveBeenCalled(); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(listInspections).toHaveBeenCalled(); })];
                case 2:
                    _a.sent();
                    // 两个 Tab 均渲染
                    (0, vitest_1.expect)(react_1.screen.getByText('质检记录')).toBeTruthy();
                    (0, vitest_1.expect)(react_1.screen.getByText('批次追溯')).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('切换到批次追溯 Tab → 拉取批次列表', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderQuality();
                    react_1.fireEvent.click(react_1.screen.getByText('批次追溯'));
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(listBatches).toHaveBeenCalled(); })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.getByText('B20260826-001')).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('新建质检 Modal 打开', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderQuality();
                    react_1.fireEvent.click(react_1.screen.getByText('新建质检'));
                    // Modal 标题（ProTable 搜索栏也有“检验类型” label，用 Modal 特有文本断言）
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getByText('新建质检记录')).toBeTruthy(); })];
                case 1:
                    // Modal 标题（ProTable 搜索栏也有“检验类型” label，用 Modal 特有文本断言）
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('新建批次 Modal 打开', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderQuality();
                    react_1.fireEvent.click(react_1.screen.getByText('新建批次'));
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getByText('批次号')).toBeTruthy(); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('?trace=<id> 自动打开商品追溯抽屉（异常一键定位）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderQuality('/quality/list?trace=1');
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(getProductTrace).toHaveBeenCalledWith(1); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getByText('商品追溯 · 精密轴承')).toBeTruthy(); })];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.getByText('B20260826-001')).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('批次行「追溯」→ 打开批次追溯抽屉（质检 + 流水链路）', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderQuality();
                    react_1.fireEvent.click(react_1.screen.getByText('批次追溯'));
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getByText('B20260826-001')).toBeTruthy(); })];
                case 1:
                    _a.sent();
                    react_1.fireEvent.click(react_1.screen.getAllByText('追溯')[0]);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(getBatchDetail).toHaveBeenCalledWith(10); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getByText('批次追溯 · B20260826-001')).toBeTruthy(); })];
                case 3:
                    _a.sent();
                    // 抽屉内链路：质检记录 + 出入库流水（ProTable 表格可能也有同名文本，用 getAllByText 断言）
                    return [4 /*yield*/, (0, react_1.waitFor)(function () { return (0, vitest_1.expect)(react_1.screen.getAllByText('来料检验').length).toBeGreaterThan(0); })];
                case 4:
                    // 抽屉内链路：质检记录 + 出入库流水（ProTable 表格可能也有同名文本，用 getAllByText 断言）
                    _a.sent();
                    (0, vitest_1.expect)(react_1.screen.getByText('入库')).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
});
