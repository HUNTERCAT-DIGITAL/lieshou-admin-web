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
exports.default = FinanceList;
/**
 * 财务 · 记账本页（Phase 9）.
 *
 * 收支汇总卡（收入/支出/结余）+ 流水列表 + 记一笔 / 编辑 / 删除。
 */
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var dayjs_1 = require("dayjs");
var useApiError_1 = require("../../hooks/useApiError");
var finance_1 = require("../../services/finance");
var finance_2 = require("@lieshoucloud/contract-types/business/finance");
var TYPE_OPTIONS = Object.keys(finance_2.LEDGER_TYPE_META).map(function (t) { return ({
    label: finance_2.LEDGER_TYPE_META[t].text,
    value: t,
}); });
function FinanceList() {
    var _this = this;
    var _a, _b, _c;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _d = (0, react_1.useState)(false), modalOpen = _d[0], setModalOpen = _d[1];
    var _e = (0, react_1.useState)(null), editing = _e[0], setEditing = _e[1];
    var _f = (0, react_1.useState)({
        income: 0,
        expense: 0,
        balance: 0,
        count: 0,
    }), summary = _f[0], setSummary = _f[1];
    var _g = (0, react_1.useState)([]), monthly = _g[0], setMonthly = _g[1];
    var refreshSummary = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, s, m, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([(0, finance_1.getLedgerSummary)(), (0, finance_1.getMonthlySummary)(6)])];
                case 1:
                    _a = _c.sent(), s = _a[0], m = _a[1];
                    setSummary(s);
                    setMonthly(m);
                    return [3 /*break*/, 3];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var reloadAll = function () {
        var _a;
        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
        void refreshSummary();
    };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 60, search: false },
        {
            title: '类型',
            dataIndex: 'type',
            width: 90,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(finance_2.LEDGER_TYPE_META).map(function (t) { return [
                t,
                { text: finance_2.LEDGER_TYPE_META[t].text },
            ]; })),
            render: function (_, row) { return (<antd_1.Tag color={finance_2.LEDGER_TYPE_META[row.type].color}>{finance_2.LEDGER_TYPE_META[row.type].text}</antd_1.Tag>); },
        },
        {
            title: '金额',
            dataIndex: 'amount',
            width: 120,
            search: false,
            render: function (_, row) { return (<antd_1.Typography.Text strong style={{ color: row.type === 'INCOME' ? '#52c41a' : '#f5222d' }}>
          {row.type === 'INCOME' ? '+' : '-'}¥ {row.amount.toFixed(2)}
        </antd_1.Typography.Text>); },
        },
        {
            title: '分类',
            dataIndex: 'category',
            width: 110,
            search: false,
            render: function (_, r) { var _a; return (_a = r.category) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '发生日期',
            dataIndex: 'occurredAt',
            valueType: 'date',
            width: 120,
            search: false,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            search: false,
            ellipsis: true,
            render: function (_, r) { var _a; return (_a = r.remark) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '操作',
            valueType: 'option',
            width: 140,
            render: function (_, row) { return [
                <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除这笔记录？" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, finance_1.deleteLedger)(row.id)];
                                case 1:
                                    _a.sent();
                                    messageApi.success('已删除');
                                    reloadAll();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _a.sent();
                                    handleError(e_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}>
          <antd_1.Button type="link" danger icon={<icons_1.DeleteOutlined />}>
            删除
          </antd_1.Button>
        </antd_1.Popconfirm>,
            ]; },
        },
    ];
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    payload = {
                        type: values.type,
                        amount: Number(values.amount),
                        category: values.category ? String(values.category) : undefined,
                        occurredAt: values.occurredAt.format('YYYY-MM-DD'),
                        remark: values.remark ? String(values.remark) : undefined,
                    };
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, finance_1.updateLedger)(editing.id, payload)];
                case 1:
                    _a.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, finance_1.createLedger)(payload)];
                case 3:
                    _a.sent();
                    messageApi.success('已记一笔');
                    _a.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    reloadAll();
                    return [2 /*return*/, true];
                case 5:
                    e_2 = _a.sent();
                    handleError(e_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="记账本" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reloadAll}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          记一笔
        </antd_1.Button>,
        ]}>
      {/* 收支汇总 */}
      <pro_components_1.ProCard split="vertical" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 0' }} bordered>
        <pro_components_1.StatisticCard statistic={{
            title: '总收入',
            value: summary.income,
            prefix: '¥',
            valueStyle: { color: '#52c41a' },
        }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '总支出',
            value: summary.expense,
            prefix: '¥',
            valueStyle: { color: '#f5222d' },
        }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '结余',
            value: summary.balance,
            prefix: '¥',
            valueStyle: { color: summary.balance >= 0 ? '#1677ff' : '#f5222d' },
        }}/>
        <pro_components_1.StatisticCard statistic={{ title: '记录数', value: summary.count }}/>
      </pro_components_1.ProCard>

      {/* 月度收支报表（最近 6 个月，双柱对比） */}
      <pro_components_1.ProCard title="月度收支" style={{ marginBottom: 16 }} bordered extra={<antd_1.Tag color="blue">最近 6 个月</antd_1.Tag>}>
        {monthly.length === 0 ? (<antd_1.Typography.Text type="secondary">暂无月度数据（记几笔后这里会出现趋势）</antd_1.Typography.Text>) : (<MonthlyBars data={monthly}/>)}
      </pro_components_1.ProCard>

      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, finance_1.listLedger)({
                                type: params.type,
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_3 = _a.sent();
                        handleError(e_3);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="收支流水（租户内数据）" options={{ setting: { draggable: true, checkable: true } }} cardBordered/>

      {/* 记一笔 / 编辑 */}
      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u8BB0\u5F55 #".concat(editing.id) : '记一笔'} width={460} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                type: editing.type,
                amount: editing.amount,
                category: (_b = editing.category) !== null && _b !== void 0 ? _b : undefined,
                occurredAt: (0, dayjs_1.default)(editing.occurredAt),
                remark: (_c = editing.remark) !== null && _c !== void 0 ? _c : undefined,
            }
            : { type: 'INCOME', occurredAt: (0, dayjs_1.default)() }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormSelect name="type" label="类型" options={TYPE_OPTIONS} rules={[{ required: true, message: '请选择类型' }]}/>
        <pro_components_1.ProFormText name="amount" label="金额（元）" rules={[{ required: true, message: '请输入金额' }]} fieldProps={{ type: 'number', min: 0.01, step: 0.01 }} placeholder="12800" transform={function (v) { return Number(v); }}/>
        <pro_components_1.ProFormSelect name="category" label="分类" options={finance_2.LEDGER_CATEGORIES.map(function (c) { return ({ label: c, value: c }); })} allowClear placeholder="选择分类"/>
        <pro_components_1.ProFormDatePicker name="occurredAt" label="发生日期" rules={[{ required: true, message: '请选择日期' }]} fieldProps={{ style: { width: '100%' } }}/>
        <pro_components_1.ProFormTextArea name="remark" label="备注" placeholder="选填"/>
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
/**
 * 月度收支双柱图（自绘 CSS，无图表依赖）.
 * 每根柱由收入(绿) + 支出(红) 两段组成，柱顶标注当月结余。
 */
function MonthlyBars(_a) {
    var data = _a.data;
    var max = Math.max.apply(Math, __spreadArray([1], data.map(function (d) { return Math.max(d.income, d.expense); }), false));
    // 倒序 → 时间正序（后端 newest first）
    var asc = __spreadArray([], data, true).reverse();
    return (<div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', minHeight: 160, paddingTop: 8 }}>
      {asc.map(function (d) {
            var incomeH = (d.income / max) * 120;
            var expenseH = (d.expense / max) * 120;
            var totalH = incomeH + expenseH;
            return (<div key={d.month} style={{ flex: 1, textAlign: 'center' }}>
            <antd_1.Typography.Text style={{ fontSize: 11, color: d.balance >= 0 ? '#1677ff' : '#f5222d' }}>
              {d.balance >= 0 ? '+' : ''}
              {Number(d.balance).toFixed(0)}
            </antd_1.Typography.Text>
            <div style={{
                    height: 130,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                }}>
              <div style={{
                    height: incomeH,
                    width: 22,
                    background: '#52c41a',
                    borderRadius: '3px 3px 0 0',
                }} title={"".concat(d.month, " \u6536\u5165 \u00A5").concat(Number(d.income).toFixed(2))}/>
              <div style={{
                    height: expenseH,
                    width: 22,
                    background: '#f5222d',
                    borderRadius: totalH === expenseH ? 3 : 0,
                }} title={"".concat(d.month, " \u652F\u51FA \u00A5").concat(Number(d.expense).toFixed(2))}/>
            </div>
            <antd_1.Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {d.month.slice(5)}
            </antd_1.Typography.Text>
          </div>);
        })}
    </div>);
}
