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
exports.default = UserList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var ui_1 = require("@lieshoucloud/ui");
var user_1 = require("../../services/user");
var user_2 = require("@lieshoucloud/contract-types/business/user");
var list_filter_1 = require("../../utils/list-filter");
var batch_1 = require("../../utils/batch");
/** 关键字模糊匹配范围（后端暂无搜索 API） */
var USER_SEARCH_FIELDS = ['username', 'displayName', 'email', 'phone'];
var STATUS_OPTIONS = Object.keys(user_2.STATUS_META).map(function (s) { return ({
    label: user_2.STATUS_META[s].text,
    value: s,
}); });
var ROLES_OPTIONS = ['USER', 'ADMIN'].map(function (r) { return ({
    label: r,
    value: r,
}); });
function UserList() {
    var _this = this;
    var _a, _b, _c;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _d = (0, react_1.useState)(false), modalOpen = _d[0], setModalOpen = _d[1];
    var _e = (0, react_1.useState)(null), editing = _e[0], setEditing = _e[1];
    var _f = (0, react_1.useState)([]), selectedRowKeys = _f[0], setSelectedRowKeys = _f[1];
    var _g = (0, react_1.useState)(false), batchBusy = _g[0], setBatchBusy = _g[1];
    /** 批量删除用户 */
    var batchDelete = function (keys) { return __awaiter(_this, void 0, void 0, function () {
        var ids, _a, ok, fail;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setBatchBusy(true);
                    ids = keys.map(Number).filter(Number.isFinite);
                    return [4 /*yield*/, (0, batch_1.runBatch)(ids, function (id) { return (0, user_1.deleteUser)(id); })];
                case 1:
                    _a = _c.sent(), ok = _a.ok, fail = _a.fail;
                    if (ok > 0)
                        messageApi.success("\u5DF2\u5220\u9664 ".concat(ok, " \u4E2A\u7528\u6237").concat(fail ? "\uFF08".concat(fail, " \u5931\u8D25\uFF09") : ''));
                    if (fail > 0)
                        handleError(new Error("".concat(fail, " \u4E2A\u5220\u9664\u5931\u8D25")));
                    setSelectedRowKeys([]);
                    (_b = actionRef.current) === null || _b === void 0 ? void 0 : _b.reload();
                    setBatchBusy(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            // 关键字模糊匹配 username / displayName / email / phone（后端无搜索 API，前端过滤）
            title: '用户名 / 关键字',
            dataIndex: 'keyword',
            width: 160,
            render: function (_, row) { return row.username; },
        },
        { title: '显示名', dataIndex: 'displayName', width: 140, search: false },
        { title: '邮箱', dataIndex: 'email', width: 180, search: false },
        { title: '手机', dataIndex: 'phone', width: 130, search: false },
        {
            title: '状态',
            dataIndex: 'status',
            width: 90,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(user_2.STATUS_META).map(function (s) { return [
                s,
                { text: user_2.STATUS_META[s].text },
            ]; })),
            render: function (_, row) { return <ui_1.StatusTag meta={user_2.STATUS_META[row.status]}/>; },
        },
        {
            title: '角色',
            dataIndex: 'roles',
            width: 140,
            search: false,
            render: function (_, row) { return row.roles.map(function (r) { return <ui_1.RoleTag key={r} role={r}/>; }); },
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            width: 170,
            search: false,
        },
        {
            title: '最近登录',
            dataIndex: 'lastLoginAt',
            valueType: 'dateTime',
            width: 170,
            search: false,
            render: function (_, row) { var _a; return (_a = row.lastLoginAt) !== null && _a !== void 0 ? _a : '—'; },
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
                <antd_1.Popconfirm key="del" title="确定删除该用户？" description={"".concat(row.username, "\uFF08").concat(row.displayName, "\uFF09\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D")} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, user_1.deleteUser)(row.id)];
                                case 1:
                                    _b.sent();
                                    messageApi.success('已删除');
                                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _b.sent();
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
        var e_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, user_1.updateUser)(editing.id, {
                            displayName: String(values.displayName),
                            email: values.email ? String(values.email) : undefined,
                            phone: values.phone ? String(values.phone) : undefined,
                            status: values.status,
                            roles: (_a = values.roles) !== null && _a !== void 0 ? _a : [],
                            password: values.password ? String(values.password) : undefined,
                        })];
                case 1:
                    _c.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, user_1.createUser)({
                        username: String(values.username),
                        displayName: String(values.displayName),
                        password: String(values.password),
                        email: values.email ? String(values.email) : undefined,
                        phone: values.phone ? String(values.phone) : undefined,
                    })];
                case 3:
                    _c.sent();
                    messageApi.success('已创建');
                    _c.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    (_b = actionRef.current) === null || _b === void 0 ? void 0 : _b.reload();
                    return [2 /*return*/, true];
                case 5:
                    e_2 = _c.sent();
                    handleError(e_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="用户列表" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); }}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          新建用户
        </antd_1.Button>,
        ]}>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var all, filtered, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, user_1.listUsers)()];
                    case 1:
                        all = _a.sent();
                        filtered = (0, list_filter_1.filterByKeywordAndStatus)(all, {
                            keyword: params.keyword,
                            status: params.status,
                        }, USER_SEARCH_FIELDS);
                        return [2 /*return*/, { data: filtered, success: true, total: filtered.length }];
                    case 2:
                        e_3 = _a.sent();
                        handleError(e_3);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="用户管理" rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange: setSelectedRowKeys,
            preserveSelectedRowKeys: true,
        }} options={{ setting: { draggable: true, checkable: true } }} toolBarRender={function () { return [
            <antd_1.Popconfirm key="batch-del" title={"\u786E\u5B9A\u6279\u91CF\u5220\u9664 ".concat(selectedRowKeys.length, " \u4E2A\u7528\u6237\uFF1F")} description="删除后不可恢复，请谨慎操作。" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} disabled={selectedRowKeys.length === 0} onConfirm={function () { return void batchDelete(selectedRowKeys); }}>
            <antd_1.Button danger icon={<icons_1.DeleteOutlined />} disabled={selectedRowKeys.length === 0} loading={batchBusy}>
              批量删除{selectedRowKeys.length > 0 ? " (".concat(selectedRowKeys.length, ")") : ''}
            </antd_1.Button>
          </antd_1.Popconfirm>,
        ]; }}/>

      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u7528\u6237\uFF1A".concat(editing.username) : '新建用户'} width={480} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                displayName: editing.displayName,
                email: (_b = editing.email) !== null && _b !== void 0 ? _b : undefined,
                phone: (_c = editing.phone) !== null && _c !== void 0 ? _c : undefined,
                status: editing.status,
                roles: editing.roles,
            }
            : { status: 'ACTIVE', roles: ['USER'] }} onFinish={onFinish} submitter={{
            searchConfig: { submitText: '保存', resetText: '取消' },
        }}>
        {!editing && (<pro_components_1.ProFormText name="username" label="用户名" rules={[
                { required: true, message: '请输入用户名' },
                { pattern: /^[a-zA-Z0-9_]{3,64}$/, message: '3-64 位字母/数字/下划线' },
            ]} placeholder="登录名（创建后不可改）"/>)}
        <pro_components_1.ProFormText name="displayName" label="显示名" rules={[{ required: true, message: '请输入显示名' }]} placeholder="如：Future Wang"/>
        {!editing && (<pro_components_1.ProFormText.Password name="password" label="初始密码" rules={[
                { required: true, message: '请输入初始密码' },
                { min: 6, message: '至少 6 位' },
            ]}/>)}
        {editing && (<pro_components_1.ProFormText.Password name="password" label="重置密码（可选）" placeholder="留空则不修改"/>)}
        <pro_components_1.ProFormText name="email" label="邮箱" placeholder="user@example.com"/>
        <pro_components_1.ProFormText name="phone" label="手机" placeholder="13800000000"/>
        {editing && (<>
            <pro_components_1.ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} rules={[{ required: true, message: '请选择状态' }]}/>
            <pro_components_1.ProFormSelect name="roles" label="角色" mode="multiple" options={ROLES_OPTIONS} rules={[{ required: true, message: '至少选择一个角色' }]}/>
          </>)}
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
