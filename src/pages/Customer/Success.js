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
exports.default = CustomerSuccess;
/**
 * 客户成功中心（售后闭环 · Phase 10）.
 *
 * 路径 `/customer/success`：
 * - Tab1 联系函：主动触达客户（续费提醒/服务通知/回访邀请/满意度调查），
 *   生命周期 草稿 → 已发送 → 客户已读 → 已闭环 / 已取消
 * - Tab2 客户响应：记录客户反馈（方式/情绪/内容）+ 下一步动作 + 下次跟进时间，响应深化闭环
 *
 * 数据：租户内（后端强制 X-Tenant-Id），客户/联系函为下拉引用；软删不可见。
 */
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var dayjs_1 = require("dayjs");
var react_router_dom_1 = require("react-router-dom");
var useApiError_1 = require("../../hooks/useApiError");
var crm_1 = require("../../services/crm");
var customerSuccess_1 = require("../../services/customerSuccess");
var customerSuccess_2 = require("@lieshoucloud/contract-types/business/customerSuccess");
var Text = antd_1.Typography.Text;
function CustomerSuccess() {
    var _a;
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var searchParams = (0, react_router_dom_1.useSearchParams)()[0];
    // 工作台跟进提醒跳转：?tab=responses&followUp=overdue|dueToday
    var initialTab = searchParams.get('tab') === 'responses' ? 'responses' : 'letters';
    var initialFollowUp = (_a = searchParams.get('followUp')) !== null && _a !== void 0 ? _a : null;
    var _b = (0, react_1.useState)(new Map()), customerMap = _b[0], setCustomerMap = _b[1];
    /** 客户下拉选项（客户名 + 联系人） */
    var customerOptions = (0, react_1.useMemo)(function () {
        return __spreadArray([], customerMap.entries(), true).sort(function (a, b) { return a[1].localeCompare(b[1]); })
            .map(function (_a) {
            var id = _a[0], name = _a[1];
            return ({ label: "".concat(name, "\uFF08#").concat(id, "\uFF09"), value: id });
        });
    }, [customerMap]);
    /** 拉租户客户用于「收函客户 / 响应客户」名称与下拉（客户列表轻量，一次性缓存） */
    (0, react_1.useEffect)(function () {
        (0, crm_1.listCustomers)()
            .then(function (list) { return setCustomerMap(new Map(list.map(function (c) { return [c.id, c.name]; }))); })
            .catch(function () { });
    }, []);
    return (<pro_components_1.PageContainer title="客户成功中心">
      <antd_1.Tabs defaultActiveKey={initialTab} items={[
            {
                key: 'letters',
                label: '联系函（主动触达）',
                children: (<LettersTable customerMap={customerMap} customerOptions={customerOptions} messageApi={messageApi} handleError={handleError}/>),
            },
            {
                key: 'responses',
                label: '客户响应（深化跟进）',
                children: (<ResponsesTable customerMap={customerMap} customerOptions={customerOptions} messageApi={messageApi} handleError={handleError} initialFollowUp={initialTab === 'responses' ? initialFollowUp : null}/>),
            },
        ]}/>
    </pro_components_1.PageContainer>);
}
// ============================================================
// Tab1 · 联系函
// ============================================================
function LettersTable(_a) {
    var _this = this;
    var _b, _c, _d;
    var customerMap = _a.customerMap, customerOptions = _a.customerOptions, messageApi = _a.messageApi, handleError = _a.handleError;
    var actionRef = (0, react_1.useRef)(undefined);
    var _e = (0, react_1.useState)(false), modalOpen = _e[0], setModalOpen = _e[1];
    var _f = (0, react_1.useState)(null), editing = _f[0], setEditing = _f[1];
    var letterFormRef = (0, react_1.useRef)(undefined);
    var _g = (0, react_1.useState)([]), templates = _g[0], setTemplates = _g[1];
    var _h = (0, react_1.useState)(false), tplManageOpen = _h[0], setTplManageOpen = _h[1];
    var _j = (0, react_1.useState)(null), tplEditing = _j[0], setTplEditing = _j[1];
    var _k = (0, react_1.useState)(false), tplFormOpen = _k[0], setTplFormOpen = _k[1];
    /** 拉联系函模板（系统预置 + 租户自定义；新建选模板 + 模板管理共用） */
    (0, react_1.useEffect)(function () {
        (0, customerSuccess_1.getLetterTemplates)()
            .then(setTemplates)
            .catch(function () { });
    }, []);
    /** 模板变更后刷新（新建/编辑/删除） */
    var reloadTemplates = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _a = setTemplates;
                    return [4 /*yield*/, (0, customerSuccess_1.getLetterTemplates)()];
                case 1:
                    _a.apply(void 0, [_c.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var reload = function () {
        var _a;
        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
    };
    var customerName = function (id) { var _a; return id ? ((_a = customerMap.get(id)) !== null && _a !== void 0 ? _a : "#".concat(id)) : '—'; };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            title: '收函客户',
            dataIndex: 'customerId',
            valueType: 'select',
            fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
            width: 160,
            render: function (_, row) { return customerName(row.customerId); },
        },
        {
            title: '类型',
            dataIndex: 'type',
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customerSuccess_2.LETTER_TYPE_META).map(function (t) { return [
                t,
                { text: customerSuccess_2.LETTER_TYPE_META[t].text },
            ]; })),
            width: 110,
            render: function (_, row) { return (<antd_1.Tag color={customerSuccess_2.LETTER_TYPE_META[row.type].color}>{customerSuccess_2.LETTER_TYPE_META[row.type].text}</antd_1.Tag>); },
        },
        {
            title: '标题',
            dataIndex: 'title',
            width: 240,
            ellipsis: true,
            search: false,
            render: function (_, row) {
                return row.content ? (<antd_1.Tooltip title={row.content}>
            <Text>{row.title}</Text>
          </antd_1.Tooltip>) : (row.title);
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customerSuccess_2.LETTER_STATUS_META).map(function (s) { return [
                s,
                { text: customerSuccess_2.LETTER_STATUS_META[s].text },
            ]; })),
            width: 100,
            render: function (_, row) { return (<antd_1.Tag color={customerSuccess_2.LETTER_STATUS_META[row.status].color}>
          {customerSuccess_2.LETTER_STATUS_META[row.status].text}
        </antd_1.Tag>); },
        },
        {
            title: '发送时间',
            dataIndex: 'sentAt',
            width: 160,
            search: false,
            render: function (_, r) { var _a; return (_a = r.sentAt) !== null && _a !== void 0 ? _a : '—'; },
        },
        { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
        {
            title: '操作',
            valueType: 'option',
            width: 260,
            render: function (_, row) {
                var actions = [];
                if (row.status === 'DRAFT') {
                    actions.push(<antd_1.Button key="send" type="link" icon={<icons_1.SendOutlined />} onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.sendLetter)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已发送');
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
              发送
            </antd_1.Button>);
                }
                if (row.status === 'SENT') {
                    actions.push(<antd_1.Button key="read" type="link" icon={<icons_1.EyeOutlined />} onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.readLetter)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已标记客户已读');
                                        reload();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_2 = _a.sent();
                                        handleError(e_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }}>
              标记已读
            </antd_1.Button>);
                }
                if (row.status === 'SENT' || row.status === 'READ') {
                    actions.push(<antd_1.Button key="complete" type="link" icon={<icons_1.CheckCircleOutlined />} onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.completeLetter)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已闭环');
                                        reload();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_3 = _a.sent();
                                        handleError(e_3);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }}>
              闭环
            </antd_1.Button>);
                }
                if (row.status === 'DRAFT') {
                    actions.push(<antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                            setEditing(row);
                            setModalOpen(true);
                        }}>
              编辑
            </antd_1.Button>);
                }
                if (row.status === 'DRAFT' || row.status === 'SENT' || row.status === 'READ') {
                    actions.push(<antd_1.Button key="cancel" type="link" danger onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.cancelLetter)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已取消');
                                        reload();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_4 = _a.sent();
                                        handleError(e_4);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }}>
              取消
            </antd_1.Button>);
                }
                actions.push(<antd_1.Popconfirm key="del" title="确定删除该联系函？" description="删除后将从列表移除（软删）" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, customerSuccess_1.deleteLetter)(row.id)];
                                case 1:
                                    _a.sent();
                                    messageApi.success('已删除');
                                    reload();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_5 = _a.sent();
                                    handleError(e_5);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}>
            <antd_1.Button type="link" danger icon={<icons_1.DeleteOutlined />}>
              删除
            </antd_1.Button>
          </antd_1.Popconfirm>);
                return actions;
            },
        },
    ];
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, customerSuccess_1.updateLetter)(editing.id, {
                            title: String(values.title),
                            content: values.content ? String(values.content) : undefined,
                        })];
                case 1:
                    _a.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2:
                    payload = {
                        customerId: values.customerId,
                        type: values.type,
                        title: String(values.title),
                        content: values.content ? String(values.content) : undefined,
                    };
                    return [4 /*yield*/, (0, customerSuccess_1.createLetter)(payload)];
                case 3:
                    _a.sent();
                    messageApi.success('已创建（草稿），发送走「发送」动作');
                    _a.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    reload();
                    return [2 /*return*/, true];
                case 5:
                    e_6 = _a.sent();
                    handleError(e_6);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var data, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, customerSuccess_1.listLetters)({
                                customerId: params.customerId,
                                type: params.type,
                                status: params.status,
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_7 = _a.sent();
                        handleError(e_7);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="联系函（主动触达 · 草稿 → 已发送 → 客户已读 → 已闭环）" toolBarRender={function () { return [
            <antd_1.Button key="templates" icon={<icons_1.FileTextOutlined />} onClick={function () { return setTplManageOpen(true); }}>
            模板管理
          </antd_1.Button>,
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reload}>
            刷新
          </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
            新建联系函
          </antd_1.Button>,
        ]; }} cardBordered/>

      <pro_components_1.ModalForm formRef={letterFormRef} key={(_b = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _b !== void 0 ? _b : 'create-letter'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u8054\u7CFB\u51FD\uFF1A".concat(editing.title) : '新建联系函'} width={560} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                customerId: editing.customerId,
                type: editing.type,
                title: editing.title,
                content: (_c = editing.content) !== null && _c !== void 0 ? _c : '',
            }
            : { type: 'RENEWAL' }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        {!editing && (<pro_components_1.ProFormSelect name="templateKey" label="选择模板" options={templates.map(function (t) {
                var _a;
                return ({
                    label: (0, customerSuccess_2.isSystemTemplate)(t)
                        ? "\u3010\u7CFB\u7EDF\u3011".concat((_a = customerSuccess_2.LETTER_TEMPLATE_LABELS[t.templateKey]) !== null && _a !== void 0 ? _a : t.title)
                        : "\u3010\u81EA\u5B9A\u4E49\u3011".concat(t.title),
                    value: t.templateKey,
                });
            })} placeholder="选模板自动填充标题与正文（可再编辑）" allowClear fieldProps={{
                onChange: function (key) {
                    var _a;
                    var tpl = templates.find(function (t) { return t.templateKey === key; });
                    var form = letterFormRef.current;
                    if (!tpl || !form)
                        return;
                    var cid = form.getFieldValue('customerId');
                    var customerName = cid ? ((_a = customerMap.get(cid)) !== null && _a !== void 0 ? _a : '') : undefined;
                    form.setFieldValue('type', tpl.type);
                    form.setFieldValue('title', tpl.title);
                    form.setFieldValue('content', (0, customerSuccess_2.fillTemplatePlaceholder)(tpl.content, customerName));
                },
            }}/>)}
        <pro_components_1.ProFormSelect name="customerId" label="收函客户" options={customerOptions} rules={[{ required: true, message: '请选择收函客户' }]} placeholder="选择客户（租户内）" fieldProps={{ showSearch: true, optionFilterProp: 'label' }} disabled={!!editing}/>
        <pro_components_1.ProFormSelect name="type" label="函件类型" options={Object.keys(customerSuccess_2.LETTER_TYPE_META).map(function (t) { return ({
            label: customerSuccess_2.LETTER_TYPE_META[t].text,
            value: t,
        }); })} rules={[{ required: true, message: '请选择函件类型' }]}/>
        <pro_components_1.ProFormText name="title" label="函件标题" rules={[
            { required: true, message: '请输入函件标题' },
            { max: 255, message: '最长 255 字' },
        ]} placeholder="如：2026 年度服务续费提醒函"/>
        <pro_components_1.ProFormTextArea name="content" label="函件正文" rules={[{ max: 4000, message: '最长 4000 字' }]} placeholder="尊敬的客户：您的服务将于 2026-09-30 到期……" fieldProps={{ rows: 6 }}/>
      </pro_components_1.ModalForm>

      {/* 模板管理：系统预置只读 + 租户自定义 CRUD */}
      <antd_1.Modal title="联系函模板管理" open={tplManageOpen} onCancel={function () { return setTplManageOpen(false); }} footer={null} width={760}>
        <antd_1.Space style={{ marginBottom: 12 }} wrap>
          <antd_1.Button type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
            setTplEditing(null);
            setTplFormOpen(true);
        }}>
            新建模板
          </antd_1.Button>
          <Text type="secondary">系统模板只读；租户自定义模板可新建 / 编辑 / 删除，正文可用 {'{customer}'} 占位客户名</Text>
        </antd_1.Space>
        <antd_1.Table rowKey="id" dataSource={templates} pagination={false} size="small" columns={[
            {
                title: '模板',
                dataIndex: 'title',
                render: function (_, t) {
                    var _a;
                    return (0, customerSuccess_2.isSystemTemplate)(t) ? (<antd_1.Tag color="blue">系统 · {(_a = customerSuccess_2.LETTER_TEMPLATE_LABELS[t.templateKey]) !== null && _a !== void 0 ? _a : t.title}</antd_1.Tag>) : (t.title);
                },
            },
            {
                title: '类型',
                dataIndex: 'type',
                width: 110,
                render: function (_, t) { return (<antd_1.Tag color={customerSuccess_2.LETTER_TYPE_META[t.type].color}>{customerSuccess_2.LETTER_TYPE_META[t.type].text}</antd_1.Tag>); },
            },
            {
                title: '模板键',
                dataIndex: 'templateKey',
                width: 150,
                render: function (_, t) { return <Text code>{t.templateKey}</Text>; },
            },
            {
                title: '操作',
                width: 150,
                render: function (_, t) {
                    return (0, customerSuccess_2.isSystemTemplate)(t) ? (<Text type="secondary">只读</Text>) : (<antd_1.Space size={0}>
                    <antd_1.Button type="link" size="small" icon={<icons_1.EditOutlined />} onClick={function () {
                            setTplEditing(t);
                            setTplFormOpen(true);
                        }}>
                      编辑
                    </antd_1.Button>
                    <antd_1.Popconfirm title="删除该模板？" description="删除后新建函件将不再可选" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_8;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.deleteTemplate)(t.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已删除');
                                        void reloadTemplates();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_8 = _a.sent();
                                        handleError(e_8);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }}>
                      <antd_1.Button type="link" size="small" danger icon={<icons_1.DeleteOutlined />}>
                        删除
                      </antd_1.Button>
                    </antd_1.Popconfirm>
                  </antd_1.Space>);
                },
            },
        ]}/>
      </antd_1.Modal>

      {/* 模板新建 / 编辑表单 */}
      <pro_components_1.ModalForm key={(_d = tplEditing === null || tplEditing === void 0 ? void 0 : tplEditing.id) !== null && _d !== void 0 ? _d : 'create-template'} open={tplFormOpen} onOpenChange={function (open) {
            setTplFormOpen(open);
            if (!open)
                setTplEditing(null);
        }} title={tplEditing ? "\u7F16\u8F91\u6A21\u677F\uFF1A".concat(tplEditing.title) : '新建联系函模板'} width={560} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={tplEditing
            ? {
                templateKey: tplEditing.templateKey,
                type: tplEditing.type,
                title: tplEditing.title,
                content: tplEditing.content,
            }
            : { type: 'RENEWAL' }} onFinish={function (values) { return __awaiter(_this, void 0, void 0, function () {
            var e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!tplEditing) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, customerSuccess_1.updateTemplate)(tplEditing.id, {
                                type: values.type,
                                title: values.title,
                                content: values.content,
                            })];
                    case 1:
                        _a.sent();
                        messageApi.success('已保存');
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, customerSuccess_1.createTemplate)({
                            templateKey: values.templateKey.trim(),
                            type: values.type,
                            title: values.title.trim(),
                            content: values.content.trim(),
                        })];
                    case 3:
                        _a.sent();
                        messageApi.success('已创建');
                        _a.label = 4;
                    case 4:
                        setTplFormOpen(false);
                        setTplEditing(null);
                        void reloadTemplates();
                        return [2 /*return*/, true];
                    case 5:
                        e_9 = _a.sent();
                        handleError(e_9);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        }); }} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormText name="templateKey" label="模板键" disabled={!!tplEditing} rules={[
            { required: true, message: '请输入模板键' },
            { pattern: /^[a-z0-9-]+$/, message: '仅小写字母 / 数字 / 连字符' },
        ]} placeholder="如 my-renewal（租户内唯一）"/>
        <pro_components_1.ProFormSelect name="type" label="函件类型" options={Object.keys(customerSuccess_2.LETTER_TYPE_META).map(function (t) { return ({
            label: customerSuccess_2.LETTER_TYPE_META[t].text,
            value: t,
        }); })} rules={[{ required: true, message: '请选择函件类型' }]}/>
        <pro_components_1.ProFormText name="title" label="模板标题" rules={[
            { required: true, message: '请输入模板标题' },
            { max: 255, message: '最长 255 字' },
        ]} placeholder="如：2026 年度专属续费提醒"/>
        <pro_components_1.ProFormTextArea name="content" label="模板正文" rules={[
            { required: true, message: '请输入模板正文' },
            { max: 4000, message: '最长 4000 字' },
        ]} placeholder="可用 {customer} 占位客户名，选模板时自动替换" fieldProps={{ rows: 6 }}/>
      </pro_components_1.ModalForm>
    </>);
}
// ============================================================
// Tab2 · 客户响应（响应深化）
// ============================================================
function ResponsesTable(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var customerMap = _a.customerMap, customerOptions = _a.customerOptions, messageApi = _a.messageApi, handleError = _a.handleError, initialFollowUp = _a.initialFollowUp;
    var actionRef = (0, react_1.useRef)(undefined);
    var _f = (0, react_1.useState)(false), modalOpen = _f[0], setModalOpen = _f[1];
    var _g = (0, react_1.useState)(null), editing = _g[0], setEditing = _g[1];
    var _h = (0, react_1.useState)(initialFollowUp !== null && initialFollowUp !== void 0 ? initialFollowUp : 'all'), followUpFilter = _h[0], setFollowUpFilter = _h[1];
    var reload = function () {
        var _a;
        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
    };
    var customerName = function (id) { var _a; return id ? ((_a = customerMap.get(id)) !== null && _a !== void 0 ? _a : "#".concat(id)) : '—'; };
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 64, search: false },
        {
            title: '客户',
            dataIndex: 'customerId',
            valueType: 'select',
            fieldProps: { options: customerOptions, showSearch: true, optionFilterProp: 'label' },
            width: 150,
            render: function (_, row) { return customerName(row.customerId); },
        },
        {
            title: '方式',
            dataIndex: 'type',
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customerSuccess_2.RESPONSE_TYPE_META).map(function (t) { return [
                t,
                { text: customerSuccess_2.RESPONSE_TYPE_META[t] },
            ]; })),
            width: 90,
            render: function (_, row) { return customerSuccess_2.RESPONSE_TYPE_META[row.type]; },
        },
        {
            title: '情绪',
            dataIndex: 'sentiment',
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customerSuccess_2.SENTIMENT_META).map(function (s) { return [
                s,
                { text: customerSuccess_2.SENTIMENT_META[s].text },
            ]; })),
            width: 90,
            render: function (_, row) { return (<antd_1.Tag color={customerSuccess_2.SENTIMENT_META[row.sentiment].color}>{customerSuccess_2.SENTIMENT_META[row.sentiment].text}</antd_1.Tag>); },
        },
        {
            title: '响应内容',
            dataIndex: 'content',
            width: 260,
            ellipsis: true,
            search: false,
            render: function (_, row) { return (<antd_1.Tooltip title={row.content}>
          <Text>{row.content}</Text>
        </antd_1.Tooltip>); },
        },
        {
            title: '下一步动作',
            dataIndex: 'followUpAction',
            width: 180,
            ellipsis: true,
            search: false,
            render: function (_, row) { var _a; return (_a = row.followUpAction) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '下次跟进',
            dataIndex: 'followUpAt',
            width: 180,
            search: false,
            render: function (_, r) {
                if (!r.followUpAt)
                    return '—';
                var tone = (0, customerSuccess_2.followUpTone)(r.followUpAt, r.status).tone;
                var fmt = (0, dayjs_1.default)(r.followUpAt).format('YYYY-MM-DD HH:mm');
                if (tone === 'overdue') {
                    return (<antd_1.Tag color="red" icon={<icons_1.ClockCircleOutlined />}>
              已逾期 {fmt}
            </antd_1.Tag>);
                }
                if (tone === 'dueToday') {
                    return (<antd_1.Tag color="orange" icon={<icons_1.AlertOutlined />}>
              今日到期 {fmt}
            </antd_1.Tag>);
                }
                return fmt;
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(customerSuccess_2.RESPONSE_STATUS_META).map(function (s) { return [
                s,
                { text: customerSuccess_2.RESPONSE_STATUS_META[s].text },
            ]; })),
            width: 90,
            render: function (_, row) { return (<antd_1.Tag color={customerSuccess_2.RESPONSE_STATUS_META[row.status].color}>
          {customerSuccess_2.RESPONSE_STATUS_META[row.status].text}
        </antd_1.Tag>); },
        },
        { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
        {
            title: '操作',
            valueType: 'option',
            width: 170,
            render: function (_, row) { return __spreadArray(__spreadArray([
                <antd_1.Button key="edit" type="link" icon={<icons_1.EditOutlined />} onClick={function () {
                        setEditing(row);
                        setModalOpen(true);
                    }}>
          编辑
        </antd_1.Button>
            ], (row.status !== 'RESOLVED'
                ? [
                    <antd_1.Button key="resolve" type="link" icon={<icons_1.CheckCircleOutlined />} onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_10;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, customerSuccess_1.resolveResponse)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已闭环');
                                        reload();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_10 = _a.sent();
                                        handleError(e_10);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }}>
                闭环
              </antd_1.Button>,
                ]
                : []), true), [
                <antd_1.Popconfirm key="del" title="确定删除该响应记录？" description="删除后将从列表移除（软删）" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, customerSuccess_1.deleteResponse)(row.id)];
                                case 1:
                                    _a.sent();
                                    messageApi.success('已删除');
                                    reload();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_11 = _a.sent();
                                    handleError(e_11);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }}>
          <antd_1.Button type="link" danger icon={<icons_1.DeleteOutlined />}>
            删除
          </antd_1.Button>
        </antd_1.Popconfirm>,
            ], false); },
        },
    ];
    var onFinish = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var followUpAt, payload, payload, e_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    followUpAt = values.followUpAt ? (0, dayjs_1.default)(values.followUpAt).toISOString() : undefined;
                    if (!editing) return [3 /*break*/, 2];
                    payload = {
                        type: values.type,
                        sentiment: values.sentiment,
                        content: String(values.content),
                        followUpAction: values.followUpAction ? String(values.followUpAction) : undefined,
                        followUpAt: followUpAt,
                        status: values.status,
                    };
                    return [4 /*yield*/, (0, customerSuccess_1.updateResponse)(editing.id, payload)];
                case 1:
                    _a.sent();
                    messageApi.success('已保存');
                    return [3 /*break*/, 4];
                case 2:
                    payload = {
                        customerId: values.customerId,
                        letterId: values.letterId,
                        type: values.type,
                        sentiment: values.sentiment,
                        content: String(values.content),
                        followUpAction: values.followUpAction ? String(values.followUpAction) : undefined,
                        followUpAt: followUpAt,
                    };
                    return [4 /*yield*/, (0, customerSuccess_1.createResponse)(payload)];
                case 3:
                    _a.sent();
                    messageApi.success('已记录，状态为待跟进');
                    _a.label = 4;
                case 4:
                    setModalOpen(false);
                    setEditing(null);
                    reload();
                    return [2 /*return*/, true];
                case 5:
                    e_12 = _a.sent();
                    handleError(e_12);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var data, e_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, customerSuccess_1.listResponses)({
                                customerId: params.customerId,
                                status: params.status,
                                sentiment: params.sentiment,
                                followUpOverdue: followUpFilter === 'overdue' ? true : undefined,
                                followUpDueToday: followUpFilter === 'dueToday' ? true : undefined,
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_13 = _a.sent();
                        handleError(e_13);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} params={{ followUpFilter: followUpFilter }} // 筛选变化 → 触发 request 重跑
     pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="客户响应（响应深化 · 记录反馈 + 下一步动作 + 闭环）" toolBarRender={function () { return [
            <antd_1.Select key="followUp" aria-label="跟进状态筛选" value={followUpFilter} onChange={setFollowUpFilter} options={Object.keys(customerSuccess_2.FOLLOW_UP_FILTER_META).map(function (f) { return ({
                    label: customerSuccess_2.FOLLOW_UP_FILTER_META[f].text,
                    value: f,
                }); })} style={{ width: 130 }}/>,
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reload}>
            刷新
          </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
            记录响应
          </antd_1.Button>,
        ]; }} cardBordered/>

      <pro_components_1.ModalForm key={(_b = editing === null || editing === void 0 ? void 0 : editing.id) !== null && _b !== void 0 ? _b : 'create-response'} open={modalOpen} onOpenChange={function (open) {
            setModalOpen(open);
            if (!open)
                setEditing(null);
        }} title={editing ? "\u7F16\u8F91\u54CD\u5E94\uFF08#".concat(editing.id, "\uFF09") : '记录客户响应'} width={560} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={editing
            ? {
                customerId: editing.customerId,
                letterId: (_c = editing.letterId) !== null && _c !== void 0 ? _c : undefined,
                type: editing.type,
                sentiment: editing.sentiment,
                content: editing.content,
                followUpAction: (_d = editing.followUpAction) !== null && _d !== void 0 ? _d : '',
                followUpAt: (_e = editing.followUpAt) !== null && _e !== void 0 ? _e : undefined,
                status: editing.status,
            }
            : { type: 'PHONE', sentiment: 'NEUTRAL', status: 'OPEN' }} onFinish={onFinish} submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}>
        <pro_components_1.ProFormSelect name="customerId" label="客户" options={customerOptions} rules={[{ required: true, message: '请选择客户' }]} placeholder="选择客户（租户内）" fieldProps={{ showSearch: true, optionFilterProp: 'label' }} disabled={!!editing}/>
        <pro_components_1.ProFormSelect name="letterId" label="关联联系函 ID" placeholder="可选：填联系函 ID 关联主动触达（见联系函 Tab）" allowClear/>
        <pro_components_1.ProFormSelect name="type" label="响应方式" options={Object.keys(customerSuccess_2.RESPONSE_TYPE_META).map(function (t) { return ({
            label: customerSuccess_2.RESPONSE_TYPE_META[t],
            value: t,
        }); })} rules={[{ required: true, message: '请选择响应方式' }]}/>
        <pro_components_1.ProFormSelect name="sentiment" label="响应情绪" options={Object.keys(customerSuccess_2.SENTIMENT_META).map(function (s) { return ({
            label: customerSuccess_2.SENTIMENT_META[s].text,
            value: s,
        }); })} rules={[{ required: true, message: '请选择响应情绪' }]}/>
        <pro_components_1.ProFormTextArea name="content" label="响应内容" rules={[
            { required: true, message: '请输入响应内容' },
            { max: 2000, message: '最长 2000 字' },
        ]} placeholder="客户反馈 / 诉求 / 投诉内容" fieldProps={{ rows: 4 }}/>
        <pro_components_1.ProFormText name="followUpAction" label="下一步动作" rules={[{ max: 1000, message: '最长 1000 字' }]} placeholder="响应深化：如「下周三前补发上线通知并回访」"/>
        <pro_components_1.ProFormDateTimePicker name="followUpAt" label="下次跟进时间" width="md"/>
        {editing && (<pro_components_1.ProFormSelect name="status" label="处理状态" options={Object.keys(customerSuccess_2.RESPONSE_STATUS_META).map(function (s) { return ({
                label: customerSuccess_2.RESPONSE_STATUS_META[s].text,
                value: s,
            }); })} rules={[{ required: true, message: '请选择处理状态' }]}/>)}
      </pro_components_1.ModalForm>
    </>);
}
