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
exports.default = CustomerList;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var ui_1 = require("@lieshoucloud/ui");
var useApiError_1 = require("../../hooks/useApiError");
var editions_1 = require("../../config/editions");
var crm_1 = require("../../services/crm");
var user_1 = require("../../services/user");
var customer_1 = require("@lieshoucloud/contract-types/business/customer");
var batch_1 = require("../../utils/batch");
var csv_1 = require("../../utils/csv");
var ImportModal_1 = require("../../components/ImportModal");
var STATUS_OPTIONS = Object.keys(customer_1.STATUS_META).map(function (s) { return ({
    label: customer_1.STATUS_META[s].text,
    value: s,
}); });
/** 教育供应商模式（zhiye · B2B2C）：CRM 客户即合作伙伴，展示资质/协议字段 */
var eduSupplier = (0, editions_1.getEdition)().eduSupplier === true;
function CustomerList() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var actionRef = (0, react_1.useRef)(undefined);
    var navigate = (0, react_router_dom_1.useNavigate)();
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _o = (0, react_1.useState)(false), modalOpen = _o[0], setModalOpen = _o[1];
    var _p = (0, react_1.useState)(false), importOpen = _p[0], setImportOpen = _p[1];
    var _q = (0, react_1.useState)(null), editing = _q[0], setEditing = _q[1];
    var _r = (0, react_1.useState)([]), selectedRowKeys = _r[0], setSelectedRowKeys = _r[1];
    var _s = (0, react_1.useState)(false), batchBusy = _s[0], setBatchBusy = _s[1];
    var _t = (0, react_1.useState)({
        total: 0,
        NEW: 0,
        FOLLOWING: 0,
        CONVERTED: 0,
        LOST: 0,
    }), stats = _t[0], setStats = _t[1];
    var _u = (0, react_1.useState)(new Map()), userMap = _u[0], setUserMap = _u[1];
    /** 刷新概览统计（全量拉一次在客户端聚合；起步数据量小） */
    var refreshStats = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var data, s, _i, data_1, c, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, crm_1.listCustomers)()];
                case 1:
                    data = _b.sent();
                    s = { total: data.length, NEW: 0, FOLLOWING: 0, CONVERTED: 0, LOST: 0 };
                    for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                        c = data_1[_i];
                        s[c.status] += 1;
                    }
                    setStats(s);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    /** 拉租户用户用于「负责人」下拉 + 表格显示名（user-service 已按租户过滤） */
    (0, react_1.useEffect)(function () {
        (0, user_1.listUsers)()
            .then(function (users) { return setUserMap(new Map(users.map(function (u) { return [u.id, u.displayName]; }))); })
            .catch(function () { });
        void refreshStats();
    }, [refreshStats]);
    /** 负责人选择项（按显示名排序） */
    var ownerOptions = (0, react_1.useCallback)(function () {
        var entries = __spreadArray([], userMap.entries(), true).sort(function (a, b) { return a[1].localeCompare(b[1]); });
        return entries.map(function (_a) {
            var id = _a[0], name = _a[1];
            return ({ label: "".concat(name, "\uFF08#").concat(id, "\uFF09"), value: id });
        });
    }, [userMap]);
    var reloadAll = function () {
        var _a;
        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
        void refreshStats();
    };
    /** 批量软删（并行执行、部分失败不中断） */
    var batchDelete = function (keys) { return __awaiter(_this, void 0, void 0, function () {
        var ids, _a, ok, fail;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setBatchBusy(true);
                    ids = keys.map(Number).filter(Number.isFinite);
                    return [4 /*yield*/, (0, batch_1.runBatch)(ids, function (id) { return (0, crm_1.deleteCustomer)(id); })];
                case 1:
                    _a = _b.sent(), ok = _a.ok, fail = _a.fail;
                    if (ok > 0)
                        messageApi.success("\u5DF2\u5220\u9664 ".concat(ok, " \u6761").concat(fail ? "\uFF08".concat(fail, " \u5931\u8D25\uFF09") : ''));
                    if (fail > 0)
                        handleError(new Error("".concat(fail, " \u6761\u5220\u9664\u5931\u8D25")));
                    setSelectedRowKeys([]);
                    reloadAll();
                    setBatchBusy(false);
                    return [2 /*return*/];
            }
        });
    }); };
    /** 批量改状态 */
    var batchUpdateStatus = function (keys, status) { return __awaiter(_this, void 0, void 0, function () {
        var ids, _a, ok, fail;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setBatchBusy(true);
                    ids = keys.map(Number).filter(Number.isFinite);
                    return [4 /*yield*/, (0, batch_1.runBatch)(ids, function (id) { return (0, crm_1.updateCustomer)(id, { status: status }); })];
                case 1:
                    _a = _b.sent(), ok = _a.ok, fail = _a.fail;
                    if (ok > 0)
                        messageApi.success("\u5DF2\u66F4\u65B0 ".concat(ok, " \u6761\u4E3A\u300C").concat(customer_1.STATUS_META[status].text, "\u300D").concat(fail ? "\uFF08".concat(fail, " \u5931\u8D25\uFF09") : ''));
                    if (fail > 0)
                        handleError(new Error("".concat(fail, " \u6761\u66F4\u65B0\u5931\u8D25")));
                    setSelectedRowKeys([]);
                    reloadAll();
                    setBatchBusy(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var columns = __spreadArray(__spreadArray([
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            // 后端只支持统一 keyword（名称/联系人/电话模糊），搜索框映射到 keyword
            title: '客户名称 / 关键字',
            dataIndex: 'keyword',
            width: 220,
            render: function (_, row) { return row.name; },
        },
        {
            title: '联系人',
            dataIndex: 'contactName',
            width: 110,
            search: false,
            render: function (_, row) { var _a; return (_a = row.contactName) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '联系电话',
            dataIndex: 'contactPhone',
            width: 130,
            search: false,
            render: function (_, row) { var _a; return (_a = row.contactPhone) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '跟进状态',
            dataIndex: 'status',
            width: 100,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customer_1.STATUS_META).map(function (s) { return [
                s,
                { text: customer_1.STATUS_META[s].text },
            ]; })),
            render: function (_, row) { return <ui_1.StatusTag meta={customer_1.STATUS_META[row.status]}/>; },
        },
        {
            title: '负责人',
            dataIndex: 'ownerId',
            width: 130,
            search: false,
            render: function (_, row) { var _a, _b; return (_b = (_a = (row.ownerId && userMap.get(row.ownerId))) !== null && _a !== void 0 ? _a : row.ownerId) !== null && _b !== void 0 ? _b : '—'; },
        }
    ], (eduSupplier
        ? [
            {
                title: '合作区域',
                dataIndex: 'region',
                width: 120,
                search: false,
                render: function (_, r) { var _a; return (_a = r.region) !== null && _a !== void 0 ? _a : '—'; },
            },
            {
                title: '结算周期',
                dataIndex: 'settleCycle',
                width: 90,
                search: false,
                render: function (_, r) { var _a; return (_a = r.settleCycle) !== null && _a !== void 0 ? _a : '—'; },
            },
        ]
        : []), true), [
        {
            title: '邮箱',
            dataIndex: 'email',
            width: 180,
            search: false,
            ellipsis: true,
            render: function (_, row) { var _a; return (_a = row.email) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            width: 180,
            search: false,
            ellipsis: true,
            render: function (_, row) {
                return row.remark ? (<antd_1.Tooltip title={row.remark}>
            <span>{row.remark}</span>
          </antd_1.Tooltip>) : ('—');
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            width: 170,
            search: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 170,
            render: function (_, row) { return [
                <antd_1.Button key="view" type="link" icon={<icons_1.EyeOutlined />} onClick={function () { return navigate("/customer/detail/".concat(row.id)); }}>
          详情
        </antd_1.Button>,
                <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除该客户？" description={"".concat(row.name, " \u5220\u9664\u540E\u5C06\u4ECE\u5217\u8868\u79FB\u9664\uFF08\u8F6F\u5220\uFF09")} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, crm_1.deleteCustomer)(row.id)];
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
    ], false);
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    payload = {
                        name: String(values.name),
                        contactName: values.contactName ? String(values.contactName) : undefined,
                        contactPhone: values.contactPhone ? String(values.contactPhone) : undefined,
                        email: values.email ? String(values.email) : undefined,
                        address: values.address ? String(values.address) : undefined,
                        ownerId: values.ownerId,
                        status: values.status,
                        remark: values.remark ? String(values.remark) : undefined,
                        // 教育版（zhiye · 合作伙伴）扩展字段
                        licenseNo: values.licenseNo ? String(values.licenseNo) : undefined,
                        licenseAttach: values.licenseAttach ? String(values.licenseAttach) : undefined,
                        region: values.region ? String(values.region) : undefined,
                        contractPeriod: values.contractPeriod ? String(values.contractPeriod) : undefined,
                        settleCycle: values.settleCycle ? String(values.settleCycle) : undefined,
                    };
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, crm_1.updateCustomer)(editing.id, payload)];
                case 1:
                    _a.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, crm_1.createCustomer)(payload)];
                case 3:
                    _a.sent();
                    messageApi.success('已创建');
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
    return (<pro_components_1.PageContainer title="客户管理" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reloadAll}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          新建客户
        </antd_1.Button>,
        ]}>
      {/* 客户概览 */}
      <pro_components_1.ProCard style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 0' }} split="vertical" bordered>
        <pro_components_1.StatisticCard statistic={{ title: '客户总数', value: stats.total }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '新客户',
            value: stats.NEW,
            valueStyle: { color: customer_1.STATUS_META.NEW.color },
        }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '跟进中',
            value: stats.FOLLOWING,
            valueStyle: { color: customer_1.STATUS_META.FOLLOWING.color },
        }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '已转化',
            value: stats.CONVERTED,
            valueStyle: { color: customer_1.STATUS_META.CONVERTED.color },
        }}/>
        <pro_components_1.StatisticCard statistic={{
            title: '已流失',
            value: stats.LOST,
            valueStyle: { color: customer_1.STATUS_META.LOST.color },
        }}/>
      </pro_components_1.ProCard>

      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var keyword, status_1, data, e_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        keyword = (_a = params.keyword) !== null && _a !== void 0 ? _a : params.name;
                        status_1 = params.status;
                        return [4 /*yield*/, (0, crm_1.listCustomers)(keyword, status_1)];
                    case 1:
                        data = _b.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_3 = _b.sent();
                        handleError(e_3);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="客户列表（租户内数据，跨租户不可见）" rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange: setSelectedRowKeys,
            preserveSelectedRowKeys: true,
        }} options={{ setting: { draggable: true, checkable: true } }} toolBarRender={function () { return [
            <antd_1.Space.Compact key="batch" size="small">
            <antd_1.Popconfirm key="del" title={"\u786E\u5B9A\u6279\u91CF\u5220\u9664 ".concat(selectedRowKeys.length, " \u6761\u5BA2\u6237\uFF1F")} description="删除后将从列表移除（软删），请谨慎操作。" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} disabled={selectedRowKeys.length === 0} onConfirm={function () { return void batchDelete(selectedRowKeys); }}>
              <antd_1.Button danger icon={<icons_1.DeleteOutlined />} disabled={selectedRowKeys.length === 0} loading={batchBusy}>
                批量删除{selectedRowKeys.length > 0 ? " (".concat(selectedRowKeys.length, ")") : ''}
              </antd_1.Button>
            </antd_1.Popconfirm>
            <antd_1.Dropdown key="status" menu={{
                    items: Object.keys(customer_1.STATUS_META).map(function (s) { return ({
                        key: s,
                        label: "\u6539\u4E3A\u300C".concat(customer_1.STATUS_META[s].text, "\u300D"),
                        disabled: selectedRowKeys.length === 0 || batchBusy,
                        onClick: function () { return void batchUpdateStatus(selectedRowKeys, s); },
                    }); }),
                }} disabled={selectedRowKeys.length === 0 || batchBusy}>
              <antd_1.Button icon={<icons_1.EditOutlined />} disabled={selectedRowKeys.length === 0}>
                批量改状态
              </antd_1.Button>
            </antd_1.Dropdown>
          </antd_1.Space.Compact>,
            <antd_1.Button key="import" icon={<icons_1.UploadOutlined />} onClick={function () { return setImportOpen(true); }}>
            CSV 导入
          </antd_1.Button>,
        ]; }} cardBordered/>

      {/* CSV 导入 */}
      <ImportModal_1.default open={importOpen} title="CSV 导入客户" template={csv_1.CUSTOMER_TEMPLATE} onImport={function (file) { return (0, crm_1.importCustomers)(file); }} onClose={function () { return setImportOpen(false); }}/>

      {/* 新建 / 编辑 */}
      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u5BA2\u6237\uFF1A".concat(editing.name) : '新建客户'} width={540} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                name: editing.name,
                contactName: (_b = editing.contactName) !== null && _b !== void 0 ? _b : undefined,
                contactPhone: (_c = editing.contactPhone) !== null && _c !== void 0 ? _c : undefined,
                email: (_d = editing.email) !== null && _d !== void 0 ? _d : undefined,
                address: (_e = editing.address) !== null && _e !== void 0 ? _e : undefined,
                ownerId: (_f = editing.ownerId) !== null && _f !== void 0 ? _f : undefined,
                status: editing.status,
                remark: (_g = editing.remark) !== null && _g !== void 0 ? _g : undefined,
                // 教育版（zhiye · 合作伙伴）扩展字段
                licenseNo: (_h = editing.licenseNo) !== null && _h !== void 0 ? _h : undefined,
                licenseAttach: (_j = editing.licenseAttach) !== null && _j !== void 0 ? _j : undefined,
                region: (_k = editing.region) !== null && _k !== void 0 ? _k : undefined,
                contractPeriod: (_l = editing.contractPeriod) !== null && _l !== void 0 ? _l : undefined,
                settleCycle: (_m = editing.settleCycle) !== null && _m !== void 0 ? _m : undefined,
            }
            : { status: 'NEW' }} onFinish={onFinish} submitter={{
            searchConfig: { submitText: '保存', resetText: '取消' },
        }}>
        <pro_components_1.ProFormText name="name" label="客户名称" rules={[
            { required: true, message: '请输入客户名称' },
            { max: 128, message: '最长 128 字' },
        ]} placeholder="公司 / 个人名称"/>
        <pro_components_1.ProFormText name="contactName" label="联系人" placeholder="如：王经理"/>
        <pro_components_1.ProFormText name="contactPhone" label="联系电话" placeholder="13800000000"/>
        <pro_components_1.ProFormText name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]} placeholder="contact@example.com"/>
        <pro_components_1.ProFormText name="address" label="地址" placeholder="所在地区 / 地址"/>
        <pro_components_1.ProFormSelect name="ownerId" label="负责人" options={ownerOptions()} placeholder="选择负责跟进的人（租户内用户）" allowClear fieldProps={{ showSearch: true, optionFilterProp: 'label' }}/>
        <pro_components_1.ProFormSelect name="status" label="跟进状态" options={STATUS_OPTIONS} rules={[{ required: true, message: '请选择跟进状态' }]}/>
        <pro_components_1.ProFormTextArea name="remark" label="备注" placeholder="跟进记录 / 备注信息"/>
        {/* 教育版（zhiye · 合作伙伴）扩展字段：仅 eduSupplier 版别渲染 */}
        {eduSupplier && (<>
            <pro_components_1.ProFormText name="licenseNo" label="办学许可证号" rules={[{ max: 64, message: '最长 64 字' }]} placeholder="教民 + 许可证编号"/>
            <pro_components_1.ProFormText name="licenseAttach" label="办学资质附件" rules={[{ max: 255, message: '最长 255 字' }]} placeholder="资质证书 URL / 文件名"/>
            <pro_components_1.ProFormText name="region" label="合作区域" rules={[{ max: 128, message: '最长 128 字' }]} placeholder="如：江西省南昌市"/>
            <pro_components_1.ProFormText name="contractPeriod" label="合作协议期" rules={[{ max: 64, message: '最长 64 字' }]} placeholder="如：2026-09-01 ~ 2027-08-31"/>
            <pro_components_1.ProFormSelect name="settleCycle" label="结算周期" options={[
                { label: '月结', value: '月' },
                { label: '季结', value: '季' },
                { label: '学期结', value: '学期' },
            ]} placeholder="选择与合作伙伴的结算周期" allowClear/>
          </>)}
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
