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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QualityList;
/**
 * 质检追溯页（ADR-0037 · jmzz 制造版能力）.
 *
 * 两个 Tab：
 *  - 质检记录：IQC 来料 / IPQC 制程 / FQC 成品检验记录（新建 Modal + 筛选）
 *  - 批次追溯：批次列表（新建 Modal）+ 详情抽屉（该批次质检 + 出入库流水链路）
 * 商品追溯入口：库存列表操作列「追溯」按钮 → 本页批次 Tab 打开商品追溯抽屉。
 */
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var quality_1 = require("../../services/quality");
var inventory_1 = require("../../services/inventory");
var quality_2 = require("@lieshoucloud/contract-types/business/quality");
function QualityList() {
    var _this = this;
    var _a, _b, _c;
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var searchParams = (0, react_router_dom_1.useSearchParams)()[0];
    var inspectionRef = (0, react_1.useRef)(undefined);
    var batchRef = (0, react_1.useRef)(undefined);
    var _d = (0, react_1.useState)('inspections'), tab = _d[0], setTab = _d[1];
    var _e = (0, react_1.useState)(false), inspectionOpen = _e[0], setInspectionOpen = _e[1];
    var _f = (0, react_1.useState)(false), batchOpen = _f[0], setBatchOpen = _f[1];
    var _g = (0, react_1.useState)([]), products = _g[0], setProducts = _g[1];
    var _h = (0, react_1.useState)(null), batchDetail = _h[0], setBatchDetail = _h[1];
    var _j = (0, react_1.useState)(null), trace = _j[0], setTrace = _j[1];
    var _k = (0, react_1.useState)(null), traceProduct = _k[0], setTraceProduct = _k[1];
    var _l = (0, react_1.useState)(false), traceOpen = _l[0], setTraceOpen = _l[1];
    // 新建质检：商品 → 批次联动
    var _m = (0, react_1.useState)([]), inspectionBatches = _m[0], setInspectionBatches = _m[1];
    // 商品下拉（新建质检/批次共用，加载一次）
    var loadProducts = function () {
        void (0, inventory_1.listProducts)()
            .then(setProducts)
            .catch(handleError);
    };
    (0, react_1.useEffect)(loadProducts, []);
    // 来自库存列表「追溯」按钮：/quality/list?trace=<productId> 自动打开商品追溯抽屉
    (0, react_1.useEffect)(function () {
        var traceId = searchParams.get('trace');
        if (!traceId)
            return;
        var id = Number(traceId);
        if (!Number.isFinite(id) || id <= 0)
            return;
        void (0, inventory_1.listProducts)()
            .then(function (list) {
            var p = list.find(function (x) { return x.id === id; });
            if (!p) {
                messageApi.warning('商品不存在或不在当前租户');
                return;
            }
            void (0, quality_1.getProductTrace)(p.id)
                .then(function (t) {
                setTraceProduct(p);
                setTrace(t);
                setTraceOpen(true);
            })
                .catch(handleError);
        })
            .catch(handleError);
    }, [searchParams]);
    var reloadActive = function () {
        var _a, _b;
        if (tab === 'inspections')
            (_a = inspectionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
        else
            (_b = batchRef.current) === null || _b === void 0 ? void 0 : _b.reload();
    };
    var inspectionColumns = [
        { title: 'ID', dataIndex: 'id', width: 60, search: false },
        { title: '商品 ID', dataIndex: 'productId', width: 90, search: false },
        { title: '检验类型', dataIndex: 'type', width: 110, valueType: 'select', valueEnum: {
                IQC: { text: '来料检验', status: 'Processing' },
                IPQC: { text: '制程检验', status: 'Processing' },
                FQC: { text: '成品检验', status: 'Processing' },
            }, render: function (_, r) { return <antd_1.Tag color={quality_2.INSPECTION_TYPE_META[r.type].color}>{quality_2.INSPECTION_TYPE_META[r.type].text}</antd_1.Tag>; } },
        {
            title: '结果',
            dataIndex: 'result',
            width: 100,
            valueType: 'select',
            valueEnum: {
                PASS: { text: '合格', status: 'Success' },
                FAIL: { text: '不合格', status: 'Error' },
            },
            render: function (_, r) { return <antd_1.Tag color={quality_2.INSPECTION_RESULT_META[r.result].color}>{quality_2.INSPECTION_RESULT_META[r.result].text}</antd_1.Tag>; },
        },
        { title: '数量', dataIndex: 'quantity', width: 90, search: false },
        { title: '检验员', dataIndex: 'inspector', width: 110, search: false, render: function (_, r) { var _a; return (_a = r.inspector) !== null && _a !== void 0 ? _a : '—'; } },
        { title: '检验日期', dataIndex: 'inspectedAt', valueType: 'dateTime', width: 160, search: false },
        { title: '备注', dataIndex: 'remark', ellipsis: true, search: false, render: function (_, r) { var _a; return (_a = r.remark) !== null && _a !== void 0 ? _a : '—'; } },
    ];
    var batchColumns = [
        { title: 'ID', dataIndex: 'id', width: 60, search: false },
        { title: '批次号', dataIndex: 'batchNo', width: 170 },
        { title: '商品 ID', dataIndex: 'productId', width: 90, search: false },
        { title: '供应商', dataIndex: 'supplier', width: 170, search: false, render: function (_, r) { var _a; return (_a = r.supplier) !== null && _a !== void 0 ? _a : '—'; } },
        { title: '批次数量', dataIndex: 'quantity', width: 100, search: false },
        { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            render: function (_, row) { return [
                <antd_1.Button key="detail" type="link" size="small" onClick={function () { return openBatchDetail(row.id); }}>
          追溯
        </antd_1.Button>,
            ]; },
        },
    ];
    var openBatchDetail = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = setBatchDetail;
                    return [4 /*yield*/, (0, quality_1.getBatchDetail)(id)];
                case 1:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _b.sent();
                    handleError(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var openProductTrace = function (p) { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    setTraceProduct(p);
                    _a = setTrace;
                    return [4 /*yield*/, (0, quality_1.getProductTrace)(p.id)];
                case 1:
                    _a.apply(void 0, [_b.sent()]);
                    setTraceOpen(true);
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _b.sent();
                    handleError(e_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    void openProductTrace;
    var productSelectOptions = products.map(function (p) { return ({
        label: "".concat(p.name).concat(p.code ? " (".concat(p.code, ")") : '', " #").concat(p.id),
        value: p.id,
    }); });
    var batchSelectOptions = inspectionBatches.map(function (b) { return ({
        label: "".concat(b.batchNo).concat(b.supplier ? " \u00B7 ".concat(b.supplier) : '', "\uFF08").concat(b.quantity, "\uFF09"),
        value: b.id,
    }); });
    var onInspectionProductChange = function (productId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setInspectionBatches([]);
                    if (!productId)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = setInspectionBatches;
                    return [4 /*yield*/, (0, quality_1.listBatches)(productId)];
                case 2:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _b.sent();
                    handleError(e_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="质检追溯" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reloadActive}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="inspection" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () { return setInspectionOpen(true); }}>
          新建质检
        </antd_1.Button>,
            <antd_1.Button key="batch" icon={<icons_1.ExperimentOutlined />} onClick={function () { return setBatchOpen(true); }}>
          新建批次
        </antd_1.Button>,
        ]}>
      <antd_1.Tabs activeKey={tab} onChange={function (k) { return setTab(k); }} items={[
            {
                key: 'inspections',
                label: '质检记录',
                children: (<pro_components_1.ProTable actionRef={inspectionRef} rowKey="id" columns={inspectionColumns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var data, e_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, quality_1.listInspections)({
                                            type: params.type,
                                            result: params.result,
                                        })];
                                case 1:
                                    data = _a.sent();
                                    return [2 /*return*/, { data: data, success: true, total: data.length }];
                                case 2:
                                    e_4 = _a.sent();
                                    handleError(e_4);
                                    return [2 /*return*/, { data: [], success: false }];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}/>),
            },
            {
                key: 'batches',
                label: '批次追溯',
                children: (<pro_components_1.ProTable actionRef={batchRef} rowKey="id" columns={batchColumns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var keyword, data, e_5;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    keyword = (_a = params.batchNo) !== null && _a !== void 0 ? _a : undefined;
                                    return [4 /*yield*/, (0, quality_1.listBatches)(undefined, keyword)];
                                case 1:
                                    data = _b.sent();
                                    return [2 /*return*/, { data: data, success: true, total: data.length }];
                                case 2:
                                    e_5 = _b.sent();
                                    handleError(e_5);
                                    return [2 /*return*/, { data: [], success: false }];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}/>),
            },
        ]}/>

      {/* 新建质检记录 */}
      <pro_components_1.ModalForm title="新建质检记录" open={inspectionOpen} onOpenChange={setInspectionOpen} modalProps={{ destroyOnClose: true }} onFinish={function (values) { return __awaiter(_this, void 0, void 0, function () {
            var e_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, quality_1.createInspection)({
                                productId: values.productId,
                                batchId: (_a = values.batchId) !== null && _a !== void 0 ? _a : undefined,
                                type: values.type,
                                result: values.result,
                                quantity: values.quantity,
                                inspector: values.inspector,
                                inspectedAt: values.inspectedAt ? values.inspectedAt.toISOString() : undefined,
                                remark: values.remark,
                            })];
                    case 1:
                        _b.sent();
                        messageApi.success('质检记录已创建');
                        reloadActive();
                        return [2 /*return*/, true];
                    case 2:
                        e_6 = _b.sent();
                        handleError(e_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); }}>
        <antd_1.Form.Item name="productId" label="商品" rules={[{ required: true, message: '请选择商品' }]}>
          <antd_1.Select virtual={false} showSearch options={productSelectOptions} placeholder="选择商品" onChange={onInspectionProductChange}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="batchId" label="批次(可选)">
          <antd_1.Select virtual={false} allowClear showSearch placeholder="IQC 建议关联批次（先选商品）" options={batchSelectOptions}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="type" label="检验类型" rules={[{ required: true }]}>
          <antd_1.Select virtual={false} options={[
            { label: '来料检验 (IQC)', value: 'IQC' },
            { label: '制程检验 (IPQC)', value: 'IPQC' },
            { label: '成品检验 (FQC)', value: 'FQC' },
        ]}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="result" label="检验结果" rules={[{ required: true }]}>
          <antd_1.Select virtual={false} options={[
            { label: '合格 (PASS)', value: 'PASS' },
            { label: '不合格 (FAIL)', value: 'FAIL' },
        ]}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="quantity" label="检验数量" rules={[{ required: true, message: '请填写数量' }]}>
          <pro_components_1.ProFormText fieldProps={{ type: 'number' }} placeholder=">0"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="inspector" label="检验员">
          <pro_components_1.ProFormText placeholder="检验员姓名"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="inspectedAt" label="检验日期">
          <antd_1.DatePicker showTime style={{ width: '100%' }}/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="remark" label="备注">
          <pro_components_1.ProFormTextArea placeholder="不合格原因等"/>
        </antd_1.Form.Item>
      </pro_components_1.ModalForm>

      {/* 新建批次 */}
      <pro_components_1.ModalForm title="新建批次" open={batchOpen} onOpenChange={setBatchOpen} modalProps={{ destroyOnClose: true }} onFinish={function (values) { return __awaiter(_this, void 0, void 0, function () {
            var e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, quality_1.createBatch)({
                                productId: values.productId,
                                batchNo: values.batchNo,
                                supplier: values.supplier,
                                quantity: values.quantity,
                                remark: values.remark,
                            })];
                    case 1:
                        _a.sent();
                        messageApi.success('批次已创建（注意：批次仅作追溯，需另做出入库入库）');
                        reloadActive();
                        return [2 /*return*/, true];
                    case 2:
                        e_7 = _a.sent();
                        handleError(e_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); }}>
        <antd_1.Form.Item name="productId" label="商品" rules={[{ required: true, message: '请选择商品' }]}>
          <antd_1.Select virtual={false} showSearch options={productSelectOptions} placeholder="选择商品"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请填写批次号' }]}>
          <pro_components_1.ProFormText placeholder="如 B20260826-001（租户内唯一）"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="supplier" label="供应商">
          <pro_components_1.ProFormText placeholder="供应商名称"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="quantity" label="批次数量" rules={[{ required: true, message: '请填写数量' }]}>
          <pro_components_1.ProFormText fieldProps={{ type: 'number' }} placeholder=">0"/>
        </antd_1.Form.Item>
        <antd_1.Form.Item name="remark" label="备注">
          <pro_components_1.ProFormTextArea />
        </antd_1.Form.Item>
      </pro_components_1.ModalForm>

      {/* 批次追溯抽屉 */}
      <antd_1.Drawer title={batchDetail ? "\u6279\u6B21\u8FFD\u6EAF \u00B7 ".concat(batchDetail.batch.batchNo) : '批次追溯'} open={!!batchDetail} onClose={function () { return setBatchDetail(null); }} width={560}>
        {batchDetail && (<>
            <antd_1.Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <antd_1.Descriptions.Item label="商品">
                {(_a = batchDetail.productName) !== null && _a !== void 0 ? _a : "#".concat(batchDetail.batch.productId)}
              </antd_1.Descriptions.Item>
              <antd_1.Descriptions.Item label="供应商">{(_b = batchDetail.batch.supplier) !== null && _b !== void 0 ? _b : '—'}</antd_1.Descriptions.Item>
              <antd_1.Descriptions.Item label="批次数量">{batchDetail.batch.quantity}</antd_1.Descriptions.Item>
              <antd_1.Descriptions.Item label="创建时间">{new Date(batchDetail.batch.createdAt).toLocaleString()}</antd_1.Descriptions.Item>
              {batchDetail.batch.remark && (<antd_1.Descriptions.Item label="备注">{batchDetail.batch.remark}</antd_1.Descriptions.Item>)}
            </antd_1.Descriptions>
            <antd_1.Typography.Title level={5}>质检记录</antd_1.Typography.Title>
            {batchDetail.inspections.length === 0 ? (<antd_1.Typography.Text type="secondary">该批次暂无质检记录</antd_1.Typography.Text>) : (<antd_1.Table size="small" rowKey="id" pagination={false} dataSource={batchDetail.inspections} columns={[
                    { title: '类型', dataIndex: 'type', width: 100, render: function (_, r) { return (<antd_1.Tag color={quality_2.INSPECTION_TYPE_META[r.type].color}>{quality_2.INSPECTION_TYPE_META[r.type].text}</antd_1.Tag>); } },
                    { title: '结果', dataIndex: 'result', width: 90, render: function (_, r) { return (<antd_1.Tag color={quality_2.INSPECTION_RESULT_META[r.result].color}>{quality_2.INSPECTION_RESULT_META[r.result].text}</antd_1.Tag>); } },
                    { title: '数量', dataIndex: 'quantity', width: 70 },
                    { title: '检验员', dataIndex: 'inspector', render: function (_, r) { var _a; return (_a = r.inspector) !== null && _a !== void 0 ? _a : '—'; } },
                ]}/>)}
            <antd_1.Typography.Title level={5} style={{ marginTop: 16 }}>
              出入库流水
            </antd_1.Typography.Title>
            {batchDetail.movements.length === 0 ? (<antd_1.Typography.Text type="secondary">该批次暂无出入库流水</antd_1.Typography.Text>) : (<antd_1.Timeline items={batchDetail.movements.map(function (m) { return ({
                    color: m.type === 'IN' ? 'green' : 'orange',
                    children: (<>
                      <antd_1.Tag color={m.type === 'IN' ? 'green' : 'orange'}>{m.type === 'IN' ? '入库' : '出库'}</antd_1.Tag>
                      {m.quantity} {new Date(m.createdAt).toLocaleString()}
                      {m.remark ? " \u00B7 ".concat(m.remark) : ''}
                    </>),
                }); })}/>)}
          </>)}
      </antd_1.Drawer>

      {/* 商品追溯抽屉 */}
      <antd_1.Drawer title={traceProduct ? "\u5546\u54C1\u8FFD\u6EAF \u00B7 ".concat(traceProduct.name) : '商品追溯'} open={traceOpen} onClose={function () { return setTraceOpen(false); }} width={620}>
        {trace && (<>
            <antd_1.Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <antd_1.Descriptions.Item label="商品编码">{(_c = trace.product.code) !== null && _c !== void 0 ? _c : '—'}</antd_1.Descriptions.Item>
              <antd_1.Descriptions.Item label="当前库存">{trace.product.stockQuantity}</antd_1.Descriptions.Item>
            </antd_1.Descriptions>
            <antd_1.Typography.Title level={5}>批次（{trace.batches.length}）</antd_1.Typography.Title>
            {trace.batches.length === 0 ? (<antd_1.Typography.Text type="secondary">该商品暂无批次</antd_1.Typography.Text>) : (<antd_1.Table size="small" rowKey="id" pagination={false} dataSource={trace.batches} columns={[
                    { title: '批次号', dataIndex: 'batchNo' },
                    { title: '供应商', dataIndex: 'supplier', render: function (_, r) { var _a; return (_a = r.supplier) !== null && _a !== void 0 ? _a : '—'; } },
                    { title: '数量', dataIndex: 'quantity', width: 80 },
                    { title: '操作', width: 80, render: function (_, r) { return (<antd_1.Button type="link" size="small" onClick={function () { return openBatchDetail(r.id); }}>
                        追溯
                      </antd_1.Button>); } },
                ]}/>)}
            <antd_1.Typography.Title level={5} style={{ marginTop: 16 }}>
              质检记录（{trace.inspections.length}）
            </antd_1.Typography.Title>
            {trace.inspections.length === 0 ? (<antd_1.Typography.Text type="secondary">该商品暂无质检记录</antd_1.Typography.Text>) : (<antd_1.Table size="small" rowKey="id" pagination={false} dataSource={trace.inspections} columns={[
                    { title: '类型', dataIndex: 'type', width: 90, render: function (_, r) { return (<antd_1.Tag color={quality_2.INSPECTION_TYPE_META[r.type].color}>{quality_2.INSPECTION_TYPE_META[r.type].text}</antd_1.Tag>); } },
                    { title: '结果', dataIndex: 'result', width: 80, render: function (_, r) { return (<antd_1.Tag color={quality_2.INSPECTION_RESULT_META[r.result].color}>{quality_2.INSPECTION_RESULT_META[r.result].text}</antd_1.Tag>); } },
                    { title: '数量', dataIndex: 'quantity', width: 70 },
                    { title: '检验员', dataIndex: 'inspector', render: function (_, r) { var _a; return (_a = r.inspector) !== null && _a !== void 0 ? _a : '—'; } },
                ]}/>)}
          </>)}
      </antd_1.Drawer>
    </pro_components_1.PageContainer>);
}
