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
exports.default = RoleList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var role_1 = require("../../services/role");
var role_2 = require("@lieshoucloud/contract-types/business/role");
function RoleList() {
    var _this = this;
    var _a;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _b = (0, react_1.useState)(false), modalOpen = _b[0], setModalOpen = _b[1];
    var _c = (0, react_1.useState)(null), editing = _c[0], setEditing = _c[1];
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        { title: '角色编码', dataIndex: 'code', width: 160 },
        { title: '角色名称', dataIndex: 'name', width: 140 },
        {
            title: '范围',
            dataIndex: 'scope',
            width: 90,
            render: function (_, row) { return (<antd_1.Tag color={role_2.ROLE_SCOPE_META[row.scope].color}>{role_2.ROLE_SCOPE_META[row.scope].text}</antd_1.Tag>); },
        },
        {
            title: '类型',
            dataIndex: 'system',
            width: 90,
            search: false,
            render: function (_, row) { return (row.system ? <antd_1.Tag color="red">系统内置</antd_1.Tag> : <antd_1.Tag>自定义</antd_1.Tag>); },
        },
        { title: '描述', dataIndex: 'description', search: false, ellipsis: true },
        {
            title: '操作',
            valueType: 'option',
            width: 140,
            render: function (_, row) {
                return row.system ? (<antd_1.Tooltip title="系统内置角色不可修改">
            <antd_1.Button type="link" disabled icon={<icons_1.EditOutlined />}>
              只读
            </antd_1.Button>
          </antd_1.Tooltip>) : ([
                    <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                            setEditing(row);
                            setModalOpen(true);
                        }}>
              编辑
            </antd_1.Button>,
                    <antd_1.Popconfirm key="del" title="确定删除该角色？" description={"".concat(row.code, " \u5220\u9664\u540E\u7528\u6237\u5C06\u4E0D\u518D\u62E5\u6709\u6B64\u89D2\u8272")} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, role_1.deleteRole)(row.id)];
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
                ]);
            },
        },
    ];
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var e_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, role_1.updateRole)(editing.id, {
                            name: values.name,
                            scope: values.scope,
                            description: values.description,
                        })];
                case 1:
                    _b.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, role_1.createRole)({
                        code: String(values.code),
                        name: values.name,
                        scope: values.scope,
                        description: values.description,
                    })];
                case 3:
                    _b.sent();
                    messageApi.success('角色已创建');
                    _b.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
                    return [2 /*return*/, true];
                case 5:
                    e_2 = _b.sent();
                    handleError(e_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="角色管理" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); }}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          新建角色
        </antd_1.Button>,
        ]}>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function () { return __awaiter(_this, void 0, void 0, function () {
            var data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, role_1.listRoles)()];
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
        }); }} pagination={false} search={false} headerTitle="角色定义（系统内置只读）" options={{ setting: { draggable: true, checkable: true } }}/>

      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u89D2\u8272\uFF1A".concat(editing.code) : '新建角色'} width={480} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? { name: editing.name, scope: editing.scope, description: editing.description }
            : { scope: 'TENANT' }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        {!editing && (<pro_components_1.ProFormText name="code" label="角色编码" rules={[
                { required: true, message: '请输入角色编码' },
                {
                    pattern: /^[A-Z][A-Z0-9_]{1,31}$/,
                    message: '大写字母开头，2-32 位大写/数字/下划线',
                },
            ]} placeholder="如：FINANCE"/>)}
        <pro_components_1.ProFormText name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]} placeholder="如：财务"/>
        <pro_components_1.ProFormSelect name="scope" label="范围" options={[
            { label: '平台（跨租户运营）', value: 'PLATFORM' },
            { label: '租户（租户内）', value: 'TENANT' },
        ]} rules={[{ required: true, message: '请选择范围' }]}/>
        <pro_components_1.ProFormTextArea name="description" label="描述" placeholder="角色职责说明（可选）"/>
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
