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
exports.default = TenantList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var ui_1 = require("@lieshoucloud/ui");
var tenant_1 = require("../../services/tenant");
var tenant_2 = require("@lieshoucloud/contract-types/business/tenant");
var list_filter_1 = require("../../utils/list-filter");
/** 关键字模糊匹配范围（后端暂无搜索 API） */
var TENANT_SEARCH_FIELDS = ['name', 'code'];
var STATUS_OPTIONS = Object.keys(tenant_2.TENANT_STATUS_META).map(function (s) { return ({
    label: tenant_2.TENANT_STATUS_META[s].text,
    value: s,
}); });
function TenantList() {
    var _this = this;
    var _a;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _b = (0, react_1.useState)(false), modalOpen = _b[0], setModalOpen = _b[1];
    var _c = (0, react_1.useState)(null), editing = _c[0], setEditing = _c[1];
    var _d = (0, react_1.useState)(null), inviteTenant = _d[0], setInviteTenant = _d[1];
    var toggleStatus = function (row) { return __awaiter(_this, void 0, void 0, function () {
        var next, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    next = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                    return [4 /*yield*/, (0, tenant_1.updateTenant)(row.id, { status: next })];
                case 1:
                    _b.sent();
                    messageApi.success(next === 'ACTIVE' ? '已启用' : '已停用');
                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _b.sent();
                    handleError(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            // 关键字模糊匹配 name / code（后端无搜索 API，前端过滤）
            title: '企业名称 / 关键字',
            dataIndex: 'keyword',
            width: 240,
            render: function (_, row) { return row.name; },
        },
        { title: '租户编码', dataIndex: 'code', width: 120, search: false },
        {
            title: '状态',
            dataIndex: 'status',
            width: 90,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(tenant_2.TENANT_STATUS_META).map(function (s) { return [
                s,
                { text: tenant_2.TENANT_STATUS_META[s].text },
            ]; })),
            render: function (_, row) { return <ui_1.StatusTag meta={tenant_2.TENANT_STATUS_META[row.status]}/>; },
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
            width: 240,
            render: function (_, row) { return [
                <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>,
                <antd_1.Button key="invite" type="link" icon={<icons_1.LinkOutlined />} onClick={function () { return setInviteTenant(row); }}>
          邀请
        </antd_1.Button>,
                <antd_1.Button key="toggle" type="link" onClick={function () { return toggleStatus(row); }}>
          {row.status === 'ACTIVE' ? '停用' : '启用'}
        </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除该租户？" description="仅无用户的租户可删除；有用户的租户请用「停用」" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_2;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, tenant_1.deleteTenant)(row.id)];
                                case 1:
                                    _b.sent();
                                    messageApi.success('已删除');
                                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_2 = _b.sent();
                                    handleError(e_2);
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
        var e_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, tenant_1.updateTenant)(editing.id, { name: values.name, status: values.status })];
                case 1:
                    _b.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, tenant_1.createTenant)({ name: values.name, code: String(values.code) })];
                case 3:
                    _b.sent();
                    messageApi.success('租户已开通');
                    _b.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                    return [2 /*return*/, true];
                case 5:
                    e_3 = _b.sent();
                    handleError(e_3);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="租户管理" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); }}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          开通租户
        </antd_1.Button>,
        ]}>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var all, filtered, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, tenant_1.listTenants)()];
                    case 1:
                        all = _a.sent();
                        filtered = (0, list_filter_1.filterByKeywordAndStatus)(all, {
                            keyword: params.keyword,
                            status: params.status,
                        }, TENANT_SEARCH_FIELDS);
                        return [2 /*return*/, { data: filtered, success: true, total: filtered.length }];
                    case 2:
                        e_4 = _a.sent();
                        handleError(e_4);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="租户列表" options={{ setting: { draggable: true, checkable: true } }}/>

      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u79DF\u6237\uFF1A".concat(editing.code) : '开通租户'} width={480} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing ? { name: editing.name, status: editing.status } : { status: 'ACTIVE' }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormText name="name" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]} placeholder="如：深圳市智野教育科技有限公司"/>
        {!editing && (<pro_components_1.ProFormText name="code" label="租户编码" rules={[
                { required: true, message: '请输入租户编码' },
                {
                    pattern: /^[a-z][a-z0-9-]{2,63}$/,
                    message: '小写字母开头，3-64 位小写字母/数字/连字符',
                },
            ]} placeholder="如：huntercat（登录用，创建后不可改）"/>)}
        {editing && (<pro_components_1.ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} rules={[{ required: true, message: '请选择状态' }]}/>)}
      </pro_components_1.ModalForm>

      <InviteModal tenant={inviteTenant} onClose={function () { return setInviteTenant(null); }} onApiError={handleError}/>
    </pro_components_1.PageContainer>);
}
/** 邀请码管理 Modal：生成 / 复制 / 列表 / 撤销（ADR-0023 P2） */
function InviteModal(_a) {
    var _this = this;
    var _b;
    var tenant = _a.tenant, onClose = _a.onClose, onApiError = _a.onApiError;
    var messageApi = antd_1.App.useApp().message;
    var _c = (0, react_1.useState)([]), invites = _c[0], setInvites = _c[1];
    var _d = (0, react_1.useState)('USER'), role = _d[0], setRole = _d[1];
    var _e = (0, react_1.useState)(7), expiresInDays = _e[0], setExpiresInDays = _e[1];
    var _f = (0, react_1.useState)(false), generating = _f[0], setGenerating = _f[1];
    var _g = (0, react_1.useState)(null), lastCode = _g[0], setLastCode = _g[1];
    var load = function (tenantId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = setInvites;
                    return [4 /*yield*/, (0, tenant_1.listInvites)(tenantId)];
                case 1:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    e_5 = _b.sent();
                    onApiError(e_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var generate = function () { return __awaiter(_this, void 0, void 0, function () {
        var inv, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!tenant)
                        return [2 /*return*/];
                    setGenerating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, (0, tenant_1.createInvite)(tenant.id, { role: role, expiresInDays: expiresInDays })];
                case 2:
                    inv = _a.sent();
                    setLastCode(inv.code);
                    messageApi.success('邀请码已生成');
                    return [4 /*yield*/, load(tenant.id)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_6 = _a.sent();
                    onApiError(e_6);
                    return [3 /*break*/, 6];
                case 5:
                    setGenerating(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var copy = function (code) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(code)];
                case 1:
                    _b.sent();
                    messageApi.success('已复制邀请码');
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    messageApi.error('复制失败，请手动复制');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<antd_1.Modal title={"\u9080\u8BF7\u6CE8\u518C\uFF1A".concat((_b = tenant === null || tenant === void 0 ? void 0 : tenant.name) !== null && _b !== void 0 ? _b : '')} open={!!tenant} onCancel={onClose} footer={null} destroyOnClose afterOpenChange={function (open) {
            if (open && tenant)
                load(tenant.id);
        }}>
      <antd_1.Space direction="vertical" style={{ width: '100%' }} size="middle">
        <antd_1.Space wrap>
          <antd_1.Select value={role} onChange={setRole} options={[
            { label: '角色：普通用户', value: 'USER' },
            { label: '角色：管理员', value: 'ADMIN' },
        ]} style={{ width: 160 }}/>
          <antd_1.Select value={expiresInDays} onChange={setExpiresInDays} options={[
            { label: '有效期：7 天', value: 7 },
            { label: '有效期：30 天', value: 30 },
            { label: '有效期：永久', value: 0 },
        ]} style={{ width: 140 }}/>
          <antd_1.Button type="primary" onClick={generate} loading={generating}>
            生成邀请码
          </antd_1.Button>
        </antd_1.Space>

        {lastCode && (<antd_1.Space.Compact style={{ width: '100%' }}>
            <antd_1.Input value={lastCode} readOnly data-testid="invite-code"/>
            <antd_1.Button onClick={function () { return copy(lastCode); }}>复制</antd_1.Button>
          </antd_1.Space.Compact>)}

        <antd_1.Typography.Text type="secondary">
          把邀请码发给受邀人，其在注册页填写邀请码即可自动加入本租户。
        </antd_1.Typography.Text>

        <div>
          <antd_1.Typography.Text strong>历史邀请码</antd_1.Typography.Text>
          <div style={{ marginTop: 8, maxHeight: 260, overflowY: 'auto' }}>
            {invites.map(function (inv) { return (<antd_1.Space key={inv.id} style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderBottom: '1px solid #f0f0f0',
            }}>
                <antd_1.Space>
                  <antd_1.Typography.Text code>{inv.code}</antd_1.Typography.Text>
                  <antd_1.Tag color={inv.role === 'ADMIN' ? 'orange' : 'blue'}>{inv.role}</antd_1.Tag>
                  <antd_1.Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    已用 {inv.usedCount}
                    {inv.maxUses ? "/".concat(inv.maxUses) : ''}
                  </antd_1.Typography.Text>
                  {inv.revokedAt && <antd_1.Tag color="red">已撤销</antd_1.Tag>}
                </antd_1.Space>
                <antd_1.Space>
                  <antd_1.Button size="small" onClick={function () { return copy(inv.code); }}>
                    复制
                  </antd_1.Button>
                  {!inv.revokedAt && tenant && (<antd_1.Popconfirm title="撤销该邀请码？" onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_7;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, (0, tenant_1.revokeInvite)(tenant.id, inv.id)];
                            case 1:
                                _a.sent();
                                messageApi.success('已撤销');
                                return [4 /*yield*/, load(tenant.id)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_7 = _a.sent();
                                onApiError(e_7);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }}>
                      <antd_1.Button size="small" danger>
                        撤销
                      </antd_1.Button>
                    </antd_1.Popconfirm>)}
                </antd_1.Space>
              </antd_1.Space>); })}
            {invites.length === 0 && <antd_1.Typography.Text type="secondary">暂无邀请码</antd_1.Typography.Text>}
          </div>
        </div>
      </antd_1.Space>
    </antd_1.Modal>);
}
