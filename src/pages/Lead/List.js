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
exports.default = LeadList;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var ui_1 = require("@lieshoucloud/ui");
var useApiError_1 = require("../../hooks/useApiError");
var lead_1 = require("../../services/lead");
var user_1 = require("../../services/user");
var auth_1 = require("../../stores/auth");
var lead_2 = require("@lieshoucloud/contract-types/business/lead");
var csv_1 = require("../../utils/csv");
var ImportModal_1 = require("../../components/ImportModal");
var SOURCE_OPTIONS = Object.keys(lead_2.LEAD_SOURCE_META).map(function (s) { return ({
    label: lead_2.LEAD_SOURCE_META[s],
    value: s,
}); });
var FOLLOW_UP_OPTIONS = Object.keys(lead_2.FOLLOW_UP_TYPE_META).map(function (t) { return ({
    label: lead_2.FOLLOW_UP_TYPE_META[t],
    value: t,
}); });
var OWNER_FILTERS = [
    { label: '全部', value: 0 },
    { label: '线索池（未认领）', value: -1 },
    { label: '我认领的', value: -2 }, // 前端用 -2 表示"我"，请求时替换为实际 userId
];
function LeadList() {
    var _this = this;
    var _a;
    var actionRef = (0, react_1.useRef)(undefined);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var myUserId = (0, auth_1.useAuthStore)(function (s) { var _a; return (_a = s.user) === null || _a === void 0 ? void 0 : _a.userId; });
    var _b = (0, react_1.useState)(false), modalOpen = _b[0], setModalOpen = _b[1];
    var _c = (0, react_1.useState)(null), editing = _c[0], setEditing = _c[1];
    var _d = (0, react_1.useState)(false), importOpen = _d[0], setImportOpen = _d[1];
    var _e = (0, react_1.useState)(new Map()), userMap = _e[0], setUserMap = _e[1];
    var _f = (0, react_1.useState)(0), ownerFilter = _f[0], setOwnerFilter = _f[1];
    // 跟进 Drawer
    var _g = (0, react_1.useState)(false), followUpOpen = _g[0], setFollowUpOpen = _g[1];
    var _h = (0, react_1.useState)(null), followUpLead = _h[0], setFollowUpLead = _h[1];
    var _j = (0, react_1.useState)([]), timeline = _j[0], setTimeline = _j[1];
    var followUpForm = antd_1.Form.useForm()[0];
    // 拉租户用户用于「认领人」显示名（user-service 已按租户过滤）
    (0, react_1.useEffect)(function () {
        (0, user_1.listUsers)()
            .then(function (users) { return setUserMap(new Map(users.map(function (u) { return [u.id, u.displayName]; }))); })
            .catch(function () { });
    }, []);
    var effectiveOwner = ownerFilter === -2 ? (myUserId !== null && myUserId !== void 0 ? myUserId : 0) : ownerFilter;
    var reload = (0, react_1.useCallback)(function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); }, []);
    /** 打开跟进时间线 */
    var openFollowUp = function (lead) { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setFollowUpLead(lead);
                    setFollowUpOpen(true);
                    followUpForm.resetFields();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = setTimeline;
                    return [4 /*yield*/, (0, lead_1.listFollowUps)(lead.id)];
                case 2:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    handleError(e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var submitFollowUp = function () { return __awaiter(_this, void 0, void 0, function () {
        var values, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!followUpLead)
                        return [2 /*return*/];
                    return [4 /*yield*/, followUpForm.validateFields()];
                case 1:
                    values = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, lead_1.addFollowUp)(followUpLead.id, values)];
                case 3:
                    _b.sent();
                    messageApi.success('跟进已记录');
                    followUpForm.resetFields();
                    _a = setTimeline;
                    return [4 /*yield*/, (0, lead_1.listFollowUps)(followUpLead.id)];
                case 4:
                    _a.apply(void 0, [_b.sent()]);
                    reload();
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _b.sent();
                    handleError(e_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var run = function (action, okMsg) { return __awaiter(_this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, action()];
                case 1:
                    _a.sent();
                    messageApi.success(okMsg);
                    reload();
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    handleError(e_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            title: '线索名称',
            dataIndex: 'name',
            ellipsis: true,
            render: function (_, row) { return (row.convertedCustomerId ? "".concat(row.name, " \u2713") : row.name); },
        },
        {
            title: '联系人',
            dataIndex: 'contactName',
            width: 100,
            render: function (_, r) { var _a; return (_a = r.contactName) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '电话',
            dataIndex: 'contactPhone',
            width: 130,
            render: function (_, r) { var _a; return (_a = r.contactPhone) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '来源',
            dataIndex: 'source',
            width: 90,
            valueType: 'select',
            valueEnum: lead_2.LEAD_SOURCE_META,
            render: function (_, r) { var _a; return (_a = lead_2.LEAD_SOURCE_META[r.source]) !== null && _a !== void 0 ? _a : r.source; },
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            valueType: 'select',
            valueEnum: lead_2.LEAD_STATUS_META,
            render: function (_, r) { return <ui_1.StatusTag meta={lead_2.LEAD_STATUS_META[r.status]}/>; },
        },
        {
            title: '认领人',
            dataIndex: 'ownerId',
            width: 100,
            render: function (_, r) {
                var _a;
                return r.ownerId ? (((_a = userMap.get(r.ownerId)) !== null && _a !== void 0 ? _a : "#".concat(r.ownerId))) : (<span style={{ color: '#999' }}>线索池</span>);
            },
        },
        {
            title: '最后跟进',
            dataIndex: 'lastFollowUpAt',
            width: 160,
            valueType: 'dateTime',
            render: function (_, r) { return (r.lastFollowUpAt ? new Date(r.lastFollowUpAt).toLocaleString() : '—'); },
        },
        {
            title: '操作',
            width: 260,
            valueType: 'option',
            render: function (_, row) {
                var isPool = !row.ownerId;
                var isMine = row.ownerId === myUserId;
                var finished = row.status === 'CONVERTED' || row.status === 'LOST';
                return (<antd_1.Space size="small">
            <antd_1.Button type="link" size="small" icon={<icons_1.MessageOutlined />} disabled={finished} onClick={function () { return openFollowUp(row); }}>
              跟进
            </antd_1.Button>
            {isPool && !finished && (<antd_1.Button type="link" size="small" icon={<icons_1.CheckOutlined />} onClick={function () { return run(function () { return (0, lead_1.assignLead)(row.id); }, '已认领'); }}>
                认领
              </antd_1.Button>)}
            {isMine && row.status === 'NEW' && (<antd_1.Button type="link" size="small" icon={<icons_1.CheckOutlined />} onClick={function () { return run(function () { return (0, lead_1.convertLead)(row.id); }, '已转化'); }}>
                转化
              </antd_1.Button>)}
            {isMine && !finished && (<antd_1.Popconfirm title="释放回线索池？" onConfirm={function () { return run(function () { return (0, lead_1.releaseLead)(row.id); }, '已释放回池'); }}>
                <antd_1.Button type="link" size="small" icon={<icons_1.UndoOutlined />}>
                  释放
                </antd_1.Button>
              </antd_1.Popconfirm>)}
            {!finished && (<antd_1.Button type="link" size="small" icon={<icons_1.EditOutlined />} onClick={function () {
                            setEditing(row);
                            setModalOpen(true);
                        }}>
                编辑
              </antd_1.Button>)}
            {!finished && (<antd_1.Popconfirm title="确认删除线索？" onConfirm={function () { return run(function () { return (0, lead_1.deleteLead)(row.id); }, '已删除'); }}>
                <antd_1.Button type="link" size="small" danger icon={<icons_1.DeleteOutlined />}/>
              </antd_1.Popconfirm>)}
          </antd_1.Space>);
            },
        },
    ];
    return (<pro_components_1.PageContainer title="线索管理" subTitle="线索池 · 公海回收（认领后 7 天无跟进自动回池）">
      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" headerTitle={<antd_1.Space>
            <antd_1.Segmented options={OWNER_FILTERS} value={ownerFilter} onChange={function (v) { return setOwnerFilter(v); }}/>
            <span style={{ color: '#999', fontSize: 12 }}>
              {ownerFilter === -1
                ? '仅显示未认领线索'
                : ownerFilter === -2
                    ? '仅显示我认领的线索'
                    : '全部线索'}
            </span>
          </antd_1.Space>} toolBarRender={function () { return [
            <antd_1.Button key="refresh" icon={<icons_1.ReloadOutlined />} onClick={function () { var _a; return (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload(); }}/>,
            <antd_1.Button key="import" icon={<icons_1.UploadOutlined />} onClick={function () { return setImportOpen(true); }}>
            导入
          </antd_1.Button>,
            <antd_1.Button key="new" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () {
                    setEditing(null);
                    setModalOpen(true);
                }}>
            新建线索
          </antd_1.Button>,
        ]; }} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var data, e_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, lead_1.listLeads)((_a = params.keyword) !== null && _a !== void 0 ? _a : '', (_b = params.status) !== null && _b !== void 0 ? _b : undefined, effectiveOwner)];
                    case 1:
                        data = _c.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_4 = _c.sent();
                        handleError(e_4);
                        return [2 /*return*/, { data: [], success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} columns={columns} search={{
            filterType: 'light',
            optionRender: false,
        }} pagination={{ pageSize: 20 }}/>

      {/* 新建 / 编辑 */}
      <pro_components_1.ModalForm title={editing ? '编辑线索' : '新建线索（进入线索池）'} open={modalOpen} initialValues={editing !== null && editing !== void 0 ? editing : { source: 'MANUAL' }} modalProps={{ destroyOnClose: true, onCancel: function () { return setModalOpen(false); } }} onFinish={function (values) { return __awaiter(_this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!editing) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, lead_1.updateLead)(editing.id, values)];
                    case 1:
                        _a.sent();
                        messageApi.success('已更新');
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, lead_1.createLead)(values)];
                    case 3:
                        _a.sent();
                        messageApi.success('已创建');
                        _a.label = 4;
                    case 4:
                        setModalOpen(false);
                        reload();
                        return [2 /*return*/, true];
                    case 5:
                        e_5 = _a.sent();
                        handleError(e_5);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        }); }}>
        <pro_components_1.ProFormText name="name" label="线索名称" rules={[{ required: true }]}/>
        <pro_components_1.ProFormText name="contactName" label="联系人"/>
        <pro_components_1.ProFormText name="contactPhone" label="联系电话"/>
        <pro_components_1.ProFormText name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}/>
        <pro_components_1.ProFormSelect name="source" label="来源" options={SOURCE_OPTIONS}/>
        <pro_components_1.ProFormTextArea name="remark" label="备注"/>
      </pro_components_1.ModalForm>

      {/* CSV 导入 */}
      <ImportModal_1.default open={importOpen} title="CSV 导入线索" template={csv_1.LEAD_TEMPLATE} onImport={function (file) { return (0, lead_1.importLeads)(file); }} onClose={function () { return setImportOpen(false); }}/>

      {/* 跟进时间线 */}
      <antd_1.Drawer title={"\u8DDF\u8FDB\u8BB0\u5F55 \u00B7 ".concat((_a = followUpLead === null || followUpLead === void 0 ? void 0 : followUpLead.name) !== null && _a !== void 0 ? _a : '')} open={followUpOpen} width={480} onClose={function () { return setFollowUpOpen(false); }}>
        <antd_1.Form form={followUpForm} layout="vertical">
          <antd_1.Form.Item name="type" label="跟进方式" initialValue="NOTE">
            <pro_components_1.ProFormSelect name="type" options={FOLLOW_UP_OPTIONS} rules={[{ required: true }]} style={{ width: '100%' }}/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请填写跟进内容' }]}>
            <antd_1.Input.TextArea rows={3} placeholder="电话/拜访/微信沟通要点…"/>
          </antd_1.Form.Item>
          <antd_1.Form.Item name="nextFollowUpAt" label="下次跟进时间">
            <antd_1.Input type="datetime-local"/>
          </antd_1.Form.Item>
          <antd_1.Button type="primary" onClick={submitFollowUp} block>
            记录跟进
          </antd_1.Button>
        </antd_1.Form>

        <div style={{ marginTop: 24 }}>
          <antd_1.Timeline items={timeline.map(function (f) { return ({
            color: f.type === 'PHONE'
                ? 'blue'
                : f.type === 'VISIT'
                    ? 'green'
                    : f.type === 'WECHAT'
                        ? 'cyan'
                        : 'gray',
            children: (<div>
                  <div style={{ fontWeight: 500 }}>
                    {lead_2.FOLLOW_UP_TYPE_META[f.type]} · {new Date(f.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 4 }}>{f.content}</div>
                  {f.nextFollowUpAt && (<div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
                      下次跟进：{new Date(f.nextFollowUpAt).toLocaleString()}
                    </div>)}
                </div>),
        }); })}/>
          {timeline.length === 0 && (<div style={{ color: '#999', textAlign: 'center' }}>暂无跟进记录</div>)}
        </div>
      </antd_1.Drawer>
    </pro_components_1.PageContainer>);
}
