"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockLevel = stockLevel;
exports.default = InventoryList;
/**
 * 进销存 · 商品管理页（Phase 9）.
 *
 * 商品 CRUD + 出入库 Modal + 流水抽屉。库存由后端事务内自动增减（IN + / OUT -）。
 */
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var editions_1 = require("../../config/editions");
var inventory_1 = require("../../services/inventory");
var quality_1 = require("../../services/quality");
var inventory_2 = require("@lieshoucloud/contract-types/business/inventory");
var csv_1 = require("../../utils/csv");
var ImportModal_1 = require("../../components/ImportModal");
/** 教育供应商模式（zhiye · B2B2C）：商品即课程产品，展示课时包/教案字段 */
var eduSupplier = (0, editions_1.getEdition)().eduSupplier === true;
/** 低库存阈值 */
var LOW_STOCK_THRESHOLD = 5;
/** 库存状态（用于 Tag 色 + 筛选） */
function stockLevel(qty) {
    if (qty <= 0)
        return 'OUT';
    if (qty <= LOW_STOCK_THRESHOLD)
        return 'LOW';
    return 'OK';
}
function InventoryList() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var actionRef = (0, react_1.useRef)(undefined);
    var navigate = (0, react_router_dom_1.useNavigate)();
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _p = (0, react_1.useState)(false), modalOpen = _p[0], setModalOpen = _p[1];
    var _q = (0, react_1.useState)(false), importOpen = _q[0], setImportOpen = _q[1];
    var _r = (0, react_1.useState)(null), editing = _r[0], setEditing = _r[1];
    var _s = (0, react_1.useState)(false), stockOpen = _s[0], setStockOpen = _s[1];
    var _t = (0, react_1.useState)(null), stockProduct = _t[0], setStockProduct = _t[1];
    var _u = (0, react_1.useState)('IN'), stockType = _u[0], setStockType = _u[1];
    var _v = (0, react_1.useState)([]), movements = _v[0], setMovements = _v[1];
    var _w = (0, react_1.useState)(false), movementOpen = _w[0], setMovementOpen = _w[1];
    // ADR-0037：出入库可选挂批次（追溯链路）
    var _x = (0, react_1.useState)([]), stockBatches = _x[0], setStockBatches = _x[1];
    var _y = (0, react_1.useState)('ALL'), stockFilter = _y[0], setStockFilter = _y[1];
    var _z = (0, react_1.useState)(0), lowCount = _z[0], setLowCount = _z[1];
    var _0 = (0, react_1.useState)(0), outCount = _0[0], setOutCount = _0[1];
    var reload = function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); };
    var columns = __spreadArray(__spreadArray([
        { title: 'ID', dataIndex: 'id', width: 60, search: false },
        { title: '商品名称', dataIndex: 'name', width: 200 },
        {
            title: '编码',
            dataIndex: 'code',
            width: 100,
            search: false,
            render: function (_, r) { var _a; return (_a = r.code) !== null && _a !== void 0 ? _a : '—'; },
        },
        { title: '单位', dataIndex: 'unit', width: 70, search: false, render: function (_, r) { var _a; return (_a = r.unit) !== null && _a !== void 0 ? _a : '—'; } },
        {
            title: '单价',
            dataIndex: 'price',
            width: 100,
            search: false,
            render: function (_, r) {
                var price = r.price;
                return price !== undefined && price !== null ? "\u00A5 ".concat(price.toFixed(2)) : '—';
            },
        },
        {
            title: '库存',
            dataIndex: 'stockQuantity',
            width: 100,
            search: false,
            sorter: function (a, b) { return a.stockQuantity - b.stockQuantity; },
            render: function (_, r) {
                var level = stockLevel(r.stockQuantity);
                if (level === 'OUT')
                    return <antd_1.Tag color="red">缺货 {r.stockQuantity}</antd_1.Tag>;
                if (level === 'LOW')
                    return <antd_1.Tag color="orange">低库存 {r.stockQuantity}</antd_1.Tag>;
                return <antd_1.Tag color="blue">{r.stockQuantity}</antd_1.Tag>;
            },
        }
    ], (eduSupplier
        ? [
            {
                title: '课时',
                dataIndex: 'lessonCount',
                width: 80,
                search: false,
                render: function (_, r) {
                    return r.lessonCount !== undefined && r.lessonCount !== null ? "".concat(r.lessonCount, " \u8BFE\u65F6") : '—';
                },
            },
            {
                title: '单课时价',
                dataIndex: 'lessonPrice',
                width: 110,
                search: false,
                render: function (_, r) {
                    return r.lessonPrice !== undefined && r.lessonPrice !== null
                        ? "\u00A5 ".concat(r.lessonPrice.toFixed(2))
                        : '—';
                },
            },
            {
                title: '年龄 / 班型',
                dataIndex: 'ageGroup',
                width: 120,
                search: false,
                render: function (_, r) {
                    return [r.ageGroup, r.classMode].filter(Boolean).join(' · ') || '—';
                },
            },
        ]
        : []), true), [
        {
            title: '备注',
            dataIndex: 'remark',
            search: false,
            ellipsis: true,
            render: function (_, r) {
                return r.remark ? (<antd_1.Tooltip title={r.remark}>
            <span>{r.remark}</span>
          </antd_1.Tooltip>) : ('—');
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            width: 160,
            search: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 280,
            render: function (_, row) { return [
                <antd_1.Button key="in" type="link" size="small" icon={<icons_1.ImportOutlined />} onClick={function () {
                        openStockModal(row, 'IN');
                    }}>
          入库
        </antd_1.Button>,
                <antd_1.Button key="out" type="link" size="small" icon={<icons_1.ExportOutlined />} disabled={row.stockQuantity <= 0} onClick={function () {
                        openStockModal(row, 'OUT');
                    }}>
          出库
        </antd_1.Button>,
                <antd_1.Button key="log" type="link" size="small" icon={<icons_1.SwapOutlined />} onClick={function () {
                        setStockProduct(row);
                        setMovementOpen(true);
                        void (0, inventory_1.listMovements)(row.id).then(setMovements).catch(handleError);
                    }}>
          流水
        </antd_1.Button>,
                <antd_1.Button key="trace" type="link" size="small" icon={<icons_1.ExperimentOutlined />} onClick={function () { return navigate("/quality/list?trace=".concat(row.id)); }}>
          追溯
        </antd_1.Button>,
                <antd_1.Button key="edit" type="link" size="small" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除该商品？" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, inventory_1.deleteProduct)(row.id)];
                                case 1:
                                    _a.sent();
                                    messageApi.success('已删除');
                                    reload();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _a.sent();
                                    handleError(e_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}>
          <antd_1.Button type="link" size="small" danger icon={<icons_1.DeleteOutlined />}>
            删除
          </antd_1.Button>
        </antd_1.Popconfirm>,
            ]; },
        },
    ], false);
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, e_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    payload = {
                        name: String(values.name),
                        code: values.code ? String(values.code) : undefined,
                        unit: values.unit ? String(values.unit) : undefined,
                        price: values.price,
                        remark: values.remark ? String(values.remark) : undefined,
                        // 教育版（zhiye · 课程产品）扩展字段
                        lessonCount: (_a = values.lessonCount) !== null && _a !== void 0 ? _a : undefined,
                        lessonPrice: (_b = values.lessonPrice) !== null && _b !== void 0 ? _b : undefined,
                        curriculumUrl: values.curriculumUrl ? String(values.curriculumUrl) : undefined,
                        ageGroup: values.ageGroup ? String(values.ageGroup) : undefined,
                        classMode: values.classMode ? String(values.classMode) : undefined,
                    };
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, inventory_1.updateProduct)(editing.id, payload)];
                case 1:
                    _c.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, inventory_1.createProduct)(payload)];
                case 3:
                    _c.sent();
                    messageApi.success('已创建');
                    _c.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    reload();
                    return [2 /*return*/, true];
                case 5:
                    e_2 = _c.sent();
                    handleError(e_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var onStock = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var batchId, e_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!stockProduct)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    batchId = (_a = values.batchId) !== null && _a !== void 0 ? _a : undefined;
                    if (!(stockType === 'IN')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, inventory_1.stockIn)(stockProduct.id, {
                            quantity: values.quantity,
                            batchId: batchId,
                            remark: values.remark,
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, inventory_1.stockOut)(stockProduct.id, {
                        quantity: values.quantity,
                        batchId: batchId,
                        remark: values.remark,
                    })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    messageApi.success(stockType === 'IN' ? "\u5165\u5E93 ".concat(values.quantity) : "\u51FA\u5E93 ".concat(values.quantity));
                    setStockOpen(false);
                    reload();
                    return [2 /*return*/, true];
                case 6:
                    e_3 = _b.sent();
                    handleError(e_3);
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // ADR-0037：打开出入库 Modal 时预载该商品批次（供挂批次）
    var openStockModal = function (row, type) {
        setStockProduct(row);
        setStockType(type);
        setStockBatches([]);
        setStockOpen(true);
        void (0, quality_1.listBatches)(row.id)
            .then(setStockBatches)
            .catch(function () { });
    };
    return (<pro_components_1.PageContainer title="库存管理" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reload}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          新建商品
        </antd_1.Button>,
        ]}>
      {/* 低库存预警横幅 */}
      {(lowCount > 0 || outCount > 0) && (<antd_1.Alert style={{ marginBottom: 12 }} type="warning" showIcon message={"\u5E93\u5B58\u9884\u8B66\uFF1A".concat(lowCount, " \u4E2A\u5546\u54C1\u4F4E\u5E93\u5B58\uFF08\u2264").concat(LOW_STOCK_THRESHOLD, "\uFF09\uFF0C").concat(outCount, " \u4E2A\u7F3A\u8D27")} action={<antd_1.Space size={4}>
              {lowCount > 0 && (<antd_1.Button size="small" onClick={function () {
                        var _a;
                        setStockFilter('LOW');
                        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                    }}>
                  查看低库存
                </antd_1.Button>)}
              {outCount > 0 && (<antd_1.Button size="small" danger onClick={function () {
                        var _a;
                        setStockFilter('OUT');
                        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                    }}>
                  查看缺货
                </antd_1.Button>)}
            </antd_1.Space>}/>)}
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var keyword, data, filtered, e_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        keyword = (_a = params.keyword) !== null && _a !== void 0 ? _a : params.name;
                        return [4 /*yield*/, (0, inventory_1.listProducts)(keyword)];
                    case 1:
                        data = _b.sent();
                        // 预警统计（全量，不受筛选影响）
                        setLowCount(data.filter(function (p) { return stockLevel(p.stockQuantity) === 'LOW'; }).length);
                        setOutCount(data.filter(function (p) { return stockLevel(p.stockQuantity) === 'OUT'; }).length);
                        filtered = stockFilter === 'ALL'
                            ? data
                            : data.filter(function (p) {
                                var level = stockLevel(p.stockQuantity);
                                return stockFilter === 'LOW'
                                    ? level === 'LOW' || level === 'OUT'
                                    : level === 'OUT';
                            });
                        return [2 /*return*/, { data: filtered, success: true, total: filtered.length }];
                    case 2:
                        e_4 = _b.sent();
                        handleError(e_4);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="商品列表（库存实时同步，租户内数据）" toolBarRender={function () { return [
            <antd_1.Segmented key="stock-filter" value={stockFilter} onChange={function (v) {
                    var _a;
                    setStockFilter(v);
                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                }} options={[
                    { label: '全部', value: 'ALL' },
                    { label: '低库存', value: 'LOW' },
                    { label: '缺货', value: 'OUT' },
                ]}/>,
            <antd_1.Button key="import" icon={<icons_1.UploadOutlined />} onClick={function () { return setImportOpen(true); }}>
            CSV 导入
          </antd_1.Button>,
        ]; }} options={{ setting: { draggable: true, checkable: true } }} cardBordered/>

      {/* CSV 导入 */}
      <ImportModal_1.default open={importOpen} title="CSV 导入商品" template={csv_1.PRODUCT_TEMPLATE} onImport={function (file) { return (0, inventory_1.importProducts)(file); }} onClose={function () { return setImportOpen(false); }}/>

      {/* 新建 / 编辑商品 */}
      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u5546\u54C1\uFF1A".concat(editing.name) : '新建商品'} width={480} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                name: editing.name,
                code: (_b = editing.code) !== null && _b !== void 0 ? _b : undefined,
                unit: (_c = editing.unit) !== null && _c !== void 0 ? _c : undefined,
                price: (_d = editing.price) !== null && _d !== void 0 ? _d : undefined,
                remark: (_e = editing.remark) !== null && _e !== void 0 ? _e : undefined,
                // 教育版（zhiye · 课程产品）扩展字段
                lessonCount: (_f = editing.lessonCount) !== null && _f !== void 0 ? _f : undefined,
                lessonPrice: (_g = editing.lessonPrice) !== null && _g !== void 0 ? _g : undefined,
                curriculumUrl: (_h = editing.curriculumUrl) !== null && _h !== void 0 ? _h : undefined,
                ageGroup: (_j = editing.ageGroup) !== null && _j !== void 0 ? _j : undefined,
                classMode: (_k = editing.classMode) !== null && _k !== void 0 ? _k : undefined,
            }
            : {}} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormText name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]} placeholder="如：联想 ThinkPad X1"/>
        <pro_components_1.ProFormText name="code" label="商品编码（SKU）" placeholder="如：SKU-001"/>
        <pro_components_1.ProFormText name="unit" label="单位" placeholder="台 / 件 / kg"/>
        <pro_components_1.ProFormText name="price" label="单价（元）" placeholder="8999"/>
        <pro_components_1.ProFormTextArea name="remark" label="备注" placeholder="选填"/>
        {/* 教育版（zhiye · 课程产品）扩展字段：仅 eduSupplier 版别渲染 */}
        {eduSupplier && (<>
            <pro_components_1.ProFormText name="lessonCount" label="课时数" placeholder="如：32" rules={[{ pattern: /^\d+$/, message: '请输入正整数' }]}/>
            <pro_components_1.ProFormText name="lessonPrice" label="单课时价（元）" placeholder="如：120" rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: '请输入金额' }]}/>
            <pro_components_1.ProFormText name="curriculumUrl" label="标准教案 / 大纲" placeholder="教案文档 URL / 文件名"/>
            <pro_components_1.ProFormText name="ageGroup" label="适用年龄" placeholder="如：6-12"/>
            <pro_components_1.ProFormSelect name="classMode" label="班型" options={[
                { label: '小班', value: '小班' },
                { label: '1v1', value: '1v1' },
                { label: '营地', value: '营地' },
            ]} placeholder="选择班型" allowClear/>
          </>)}
      </pro_components_1.ModalForm>

      {/* 出入库 Modal */}
      <pro_components_1.ModalForm open={stockOpen} onOpenChange={setStockOpen} title={"".concat(stockType === 'IN' ? '入库' : '出库', "\uFF1A").concat((_l = stockProduct === null || stockProduct === void 0 ? void 0 : stockProduct.name) !== null && _l !== void 0 ? _l : '')} width={400} modalProps={{ destroyOnClose: true, maskClosable: false }} onFinish={onStock} submitter={{ searchConfig: { submitText: '确认', resetText: '取消' } }}>
        <antd_1.Space direction="vertical" size="small" style={{ width: '100%' }}>
          <antd_1.Typography.Text type="secondary">
            当前库存：<antd_1.Tag color="blue">{(_m = stockProduct === null || stockProduct === void 0 ? void 0 : stockProduct.stockQuantity) !== null && _m !== void 0 ? _m : 0}</antd_1.Tag>
            {stockType === 'OUT' && '（不能超过当前库存）'}
          </antd_1.Typography.Text>
          <pro_components_1.ProFormText name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]} fieldProps={{ type: 'number', min: 1 }} placeholder="正整数" transform={function (v) { return Number(v); }}/>
          <antd_1.Form.Item name="batchId" label="批次(可选)" style={{ marginBottom: 12 }}>
            <antd_1.Select virtual={false} allowClear showSearch placeholder={stockBatches.length ? '挂批次可追溯（选填）' : '该商品暂无批次，可不选'} options={stockBatches.map(function (b) { return ({
            label: "".concat(b.batchNo).concat(b.supplier ? " \u00B7 ".concat(b.supplier) : '', "\uFF08").concat(b.quantity, "\uFF09"),
            value: b.id,
        }); })}/>
          </antd_1.Form.Item>
          <pro_components_1.ProFormTextArea name="remark" label="备注" placeholder="选填"/>
        </antd_1.Space>
      </pro_components_1.ModalForm>

      {/* 出入库流水抽屉 */}
      <antd_1.Drawer open={movementOpen} onClose={function () { return setMovementOpen(false); }} width={420} title={"\u51FA\u5165\u5E93\u6D41\u6C34\uFF1A".concat((_o = stockProduct === null || stockProduct === void 0 ? void 0 : stockProduct.name) !== null && _o !== void 0 ? _o : '')}>
        {movements.length === 0 ? (<antd_1.Typography.Text type="secondary">暂无流水记录</antd_1.Typography.Text>) : (movements.map(function (m) { return (<antd_1.Space key={m.id} style={{ width: '100%', justifyContent: 'space-between', padding: '8px 0' }}>
              <antd_1.Space>
                <antd_1.Tag color={inventory_2.MOVEMENT_META[m.type].color}>{inventory_2.MOVEMENT_META[m.type].text}</antd_1.Tag>
                <antd_1.Typography.Text strong>{m.quantity}</antd_1.Typography.Text>
                {m.remark && <antd_1.Typography.Text type="secondary">{m.remark}</antd_1.Typography.Text>}
              </antd_1.Space>
              <antd_1.Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {m.createdAt}
              </antd_1.Typography.Text>
            </antd_1.Space>); }))}
      </antd_1.Drawer>
    </pro_components_1.PageContainer>);
}
