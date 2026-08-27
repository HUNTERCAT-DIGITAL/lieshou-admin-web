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
exports.default = ContactList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var contact_1 = require("../../services/contact");
var crm_1 = require("../../services/crm");
function ContactList() {
    var _this = this;
    var _a, _b, _c, _d, _e;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _f = (0, react_1.useState)(false), modalOpen = _f[0], setModalOpen = _f[1];
    var _g = (0, react_1.useState)(null), editing = _g[0], setEditing = _g[1];
    var _h = (0, react_1.useState)([]), customerOptions = _h[0], setCustomerOptions = _h[1];
    /** 客户下拉（新建/编辑时必选所属客户；表格过滤用） */
    (0, react_1.useEffect)(function () {
        (0, crm_1.listCustomers)()
            .then(function (cs) { return setCustomerOptions(cs.map(function (c) { return ({ label: "".concat(c.name, "\uFF08#").concat(c.id, "\uFF09"), value: c.id }); })); })
            .catch(function () { });
    }, []);
    var reloadAll = function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            title: '姓名 / 关键字',
            dataIndex: 'keyword',
            width: 200,
            render: function (_, row) { return row.name; },
        },
        {
            title: '所属客户',
            dataIndex: 'customerId',
            width: 200,
            valueType: 'select',
            fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
            render: function (_, row) { var _a, _b; return (_b = (_a = customerOptions.find(function (o) { return o.value === row.customerId; })) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : "#".concat(row.customerId); },
        },
        {
            title: '电话',
            dataIndex: 'phone',
            width: 130,
            search: false,
            render: function (_, row) { var _a; return (_a = row.phone) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '职位',
            dataIndex: 'position',
            width: 120,
            search: false,
            render: function (_, row) { var _a; return (_a = row.position) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '主联系人',
            dataIndex: 'primary',
            width: 90,
            search: false,
            render: function (_, row) {
                return row.primary ? <antd_1.Tag color="gold">主</antd_1.Tag> : <span style={{ color: '#999' }}>—</span>;
            },
        },
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
            width: 160,
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
            width: 130,
            render: function (_, row) { return [
                <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除该联系人？" description={"".concat(row.name, " \u5220\u9664\u540E\u5C06\u4ECE\u5217\u8868\u79FB\u9664\uFF08\u8F6F\u5220\uFF09")} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, contact_1.deleteContact)(row.id)];
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
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    payload = {
                        customerId: values.customerId,
                        name: String(values.name),
                        phone: values.phone ? String(values.phone) : undefined,
                        email: values.email ? String(values.email) : undefined,
                        position: values.position ? String(values.position) : undefined,
                        primary: (_a = values.primary) !== null && _a !== void 0 ? _a : false,
                        remark: values.remark ? String(values.remark) : undefined,
                    };
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, contact_1.updateContact)(editing.id, payload)];
                case 1:
                    _b.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, contact_1.createContact)(payload)];
                case 3:
                    _b.sent();
                    messageApi.success('已创建');
                    _b.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    reloadAll();
                    return [2 /*return*/, true];
                case 5:
                    e_2 = _b.sent();
                    handleError(e_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="联系人管理" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reloadAll}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
          新建联系人
        </antd_1.Button>,
        ]}>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var keyword, customerId, data, e_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        keyword = (_a = params.keyword) !== null && _a !== void 0 ? _a : params.name;
                        customerId = params.customerId;
                        return [4 /*yield*/, (0, contact_1.listContacts)(customerId, keyword)];
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
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="联系人列表（租户内数据，跨租户不可见）" options={{ setting: { draggable: true, checkable: true } }} cardBordered/>

      <pro_components_1.ModalForm key={(_a = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _a !== void 0 ? _a : 'create'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u8054\u7CFB\u4EBA\uFF1A".concat(editing.name) : '新建联系人'} width={480} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                customerId: editing.customerId,
                name: editing.name,
                phone: (_b = editing.phone) !== null && _b !== void 0 ? _b : undefined,
                email: (_c = editing.email) !== null && _c !== void 0 ? _c : undefined,
                position: (_d = editing.position) !== null && _d !== void 0 ? _d : undefined,
                primary: editing.primary,
                remark: (_e = editing.remark) !== null && _e !== void 0 ? _e : undefined,
            }
            : { primary: false }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormSelect name="customerId" label="所属客户" options={customerOptions} rules={[{ required: true, message: '请选择所属客户' }]} fieldProps={{ showSearch: true, optionFilterProp: 'label' }} placeholder="选择客户（先建客户再挂联系人）"/>
        <pro_components_1.ProFormText name="name" label="姓名" rules={[
            { required: true, message: '请输入姓名' },
            { max: 64, message: '最长 64 字' },
        ]} placeholder="联系人姓名"/>
        <pro_components_1.ProFormText name="phone" label="电话" placeholder="13800000000"/>
        <pro_components_1.ProFormText name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]} placeholder="contact@example.com"/>
        <pro_components_1.ProFormText name="position" label="职位" placeholder="如：采购经理"/>
        <pro_components_1.ProFormSwitch name="primary" label="主联系人"/>
        <pro_components_1.ProFormTextArea name="remark" label="备注" placeholder="备注信息"/>
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
