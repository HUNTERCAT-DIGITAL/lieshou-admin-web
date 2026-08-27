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
exports.default = ApprovalList;
/**
 * 审批流 · 列表页（Phase 9 · ADR-0032）.
 *
 * 三个 Tab：待我审批（inbox，带角标）/ 我发起的（mine）/ 全部（all）。
 * 操作：发起（Modal）· 通过 / 驳回（仅审批人）· 撤销（仅发起人）。
 */
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var useApiError_1 = require("../../hooks/useApiError");
var user_1 = require("../../services/user");
var approval_1 = require("../../services/approval");
var approval_2 = require("@lieshoucloud/contract-types/business/approval");
var auth_1 = require("../../stores/auth");
var TYPE_OPTIONS = Object.keys(approval_2.APPROVAL_TYPE_META).map(function (t) { return ({
    label: approval_2.APPROVAL_TYPE_META[t].text,
    value: t,
}); });
function ApprovalList() {
    var _this = this;
    var actionRef = (0, react_1.useRef)(undefined);
    var _a = antd_1.App.useApp(), messageApi = _a.message, modalApi = _a.modal;
    var handleError = (0, useApiError_1.useApiError)();
    var currentUser = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var _b = (0, react_1.useState)('inbox'), tab = _b[0], setTab = _b[1];
    var _c = (0, react_1.useState)(false), createOpen = _c[0], setCreateOpen = _c[1];
    var _d = (0, react_1.useState)({ inbox: 0, mine: 0 }), counts = _d[0], setCounts = _d[1];
    var _e = (0, react_1.useState)(null), rejectTarget = _e[0], setRejectTarget = _e[1];
    var _f = (0, react_1.useState)(''), rejectComment = _f[0], setRejectComment = _f[1];
    var _g = (0, react_1.useState)([]), approvers = _g[0], setApprovers = _g[1];
    // 阶段 2 · 审批人下拉（ADR-0032）：租户用户列表（gateway 注入 X-Tenant-Id）
    (0, react_1.useEffect)(function () {
        void (0, user_1.listUsers)()
            .then(function (users) {
            return setApprovers(users.map(function (u) { return ({
                id: u.id,
                label: "".concat(u.displayName || u.username, " (#").concat(u.id, ")"),
            }); }));
        })
            .catch(function () { return setApprovers([]); });
    }, []);
    var refreshCounts = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _a = setCounts;
                    return [4 /*yield*/, (0, approval_1.getApprovalCounts)()];
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
    var reloadAll = function () {
        var _a;
        (_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.reload();
        void refreshCounts();
    };
    var userId = currentUser === null || currentUser === void 0 ? void 0 : currentUser.userId;
    var columns = [
        { title: 'ID', dataIndex: 'id', width: 56, search: false },
        {
            title: '类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(approval_2.APPROVAL_TYPE_META).map(function (t) { return [
                t,
                { text: approval_2.APPROVAL_TYPE_META[t].text },
            ]; })),
            render: function (_, row) { return (<antd_1.Tag color={approval_2.APPROVAL_TYPE_META[row.type].color}>{approval_2.APPROVAL_TYPE_META[row.type].text}</antd_1.Tag>); },
        },
        { title: '标题', dataIndex: 'title', ellipsis: true, search: false },
        {
            title: '金额',
            dataIndex: 'amount',
            width: 110,
            search: false,
            render: function (_, row) { return (row.amount !== null ? "\u00A5 ".concat(Number(row.amount).toFixed(2)) : '—'); },
        },
        { title: '发起人', dataIndex: 'requesterId', width: 80, search: false },
        { title: '审批人', dataIndex: 'approverId', width: 80, search: false },
        {
            title: '状态',
            dataIndex: 'status',
            width: 96,
            valueType: 'select',
            valueEnum: Object.fromEntries(Object.keys(approval_2.APPROVAL_STATUS_META).map(function (s) { return [
                s,
                { text: approval_2.APPROVAL_STATUS_META[s].text },
            ]; })),
            render: function (_, row) { return (<antd_1.Tag color={approval_2.APPROVAL_STATUS_META[row.status].color}>
          {approval_2.APPROVAL_STATUS_META[row.status].text}
        </antd_1.Tag>); },
        },
        {
            title: '意见',
            dataIndex: 'comment',
            width: 140,
            ellipsis: true,
            search: false,
            render: function (_, row) { var _a; return (_a = row.comment) !== null && _a !== void 0 ? _a : '—'; },
        },
        {
            title: '提交时间',
            dataIndex: 'createdAt',
            width: 160,
            search: false,
            render: function (_, row) { return new Date(row.createdAt).toLocaleString('zh-CN'); },
        },
        {
            title: '操作',
            valueType: 'option',
            width: 180,
            render: function (_, row) {
                var isApprover = userId !== null && row.approverId === userId;
                var isRequester = userId !== null && row.requesterId === userId;
                if (row.status !== 'PENDING') {
                    return <antd_1.Typography.Text type="secondary">已处理</antd_1.Typography.Text>;
                }
                return [
                    isApprover ? (<antd_1.Button key="approve" type="link" icon={<icons_1.CheckOutlined />} style={{ color: '#52c41a' }} onClick={function () { return onDecide(row, 'approve'); }}>
              通过
            </antd_1.Button>) : null,
                    isApprover ? (<antd_1.Button key="reject" type="link" danger icon={<icons_1.CloseOutlined />} onClick={function () { return onDecide(row, 'reject'); }}>
              驳回
            </antd_1.Button>) : null,
                    isRequester ? (<antd_1.Popconfirm key="cancel" title="确定撤销这条审批？" okText="撤销" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, approval_1.cancelApproval)(row.id)];
                                    case 1:
                                        _a.sent();
                                        messageApi.success('已撤销');
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
              <antd_1.Button type="link" icon={<icons_1.StopOutlined />}>
                撤销
              </antd_1.Button>
            </antd_1.Popconfirm>) : null,
                    !isApprover && !isRequester ? (<antd_1.Typography.Text key="hint" type="secondary">
              无权操作
            </antd_1.Typography.Text>) : null,
                ];
            },
        },
    ];
    /** 通过/驳回（驳回走受控 Modal 填意见） */
    var onDecide = function (row, action) {
        if (action === 'approve') {
            modalApi.confirm({
                title: "\u901A\u8FC7\u5BA1\u6279 #".concat(row.id),
                content: (<div>
            <antd_1.Typography.Paragraph style={{ marginBottom: 4 }}>{row.title}</antd_1.Typography.Paragraph>
            <antd_1.Typography.Text type="secondary">确定通过这条审批？</antd_1.Typography.Text>
          </div>),
                okText: '通过',
                cancelText: '取消',
                onOk: function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, (0, approval_1.approveApproval)(row.id)];
                            case 1:
                                _a.sent();
                                messageApi.success('已通过');
                                reloadAll();
                                return [3 /*break*/, 3];
                            case 2:
                                e_2 = _a.sent();
                                handleError(e_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
            });
            return;
        }
        setRejectComment('');
        setRejectTarget(row);
    };
    var onRejectConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!rejectTarget)
                        return [2 /*return*/];
                    if (!rejectComment.trim()) {
                        messageApi.warning('请填写驳回意见');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, approval_1.rejectApproval)(rejectTarget.id, rejectComment.trim())];
                case 2:
                    _a.sent();
                    messageApi.success('已驳回');
                    setRejectTarget(null);
                    reloadAll();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    handleError(e_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var onCreate = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, approval_1.createApproval)({
                            type: values.type,
                            title: values.title.trim(),
                            amount: values.amount ? Number(values.amount) : undefined,
                            detail: values.detail ? values.detail.trim() : undefined,
                            approverId: Number(values.approverId),
                        })];
                case 1:
                    _a.sent();
                    messageApi.success('已发起审批');
                    setCreateOpen(false);
                    reloadAll();
                    return [2 /*return*/, true];
                case 2:
                    e_4 = _a.sent();
                    handleError(e_4);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<pro_components_1.PageContainer title="审批流" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={reloadAll}>
          刷新
        </antd_1.Button>,
            <antd_1.Button key="create" type="primary" icon={<icons_1.PlusOutlined />} onClick={function () { return setCreateOpen(true); }}>
          发起审批
        </antd_1.Button>,
        ]}>
      <antd_1.Tabs activeKey={tab} onChange={function (k) { return setTab(k); }} items={[
            {
                key: 'inbox',
                label: "\u5F85\u6211\u5BA1\u6279".concat(counts.inbox > 0 ? " (".concat(counts.inbox, ")") : ''),
            },
            { key: 'mine', label: '我发起的' },
            { key: 'all', label: '全部' },
        ]} style={{ marginBottom: 12 }}/>

      {/* 驳回意见 Modal */}
      <antd_1.Modal title={rejectTarget ? "\u9A73\u56DE\u5BA1\u6279 #".concat(rejectTarget.id) : ''} open={rejectTarget !== null} onOk={function () { return void onRejectConfirm(); }} onCancel={function () { return setRejectTarget(null); }} okText="驳回" okButtonProps={{ danger: true }} cancelText="取消" width={440} destroyOnClose>
        <antd_1.Typography.Paragraph style={{ marginBottom: 8 }}>
          {rejectTarget === null || rejectTarget === void 0 ? void 0 : rejectTarget.title}
        </antd_1.Typography.Paragraph>
        <antd_1.Input.TextArea value={rejectComment} onChange={function (e) { return setRejectComment(e.target.value); }} placeholder="必填：说明驳回原因" rows={3} maxLength={500}/>
      </antd_1.Modal>

      <pro_components_1.ProTable actionRef={actionRef} rowKey="id" columns={columns} request={function (params) { return __awaiter(_this, void 0, void 0, function () {
            var role, data, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        role = tab === 'all' ? 'all' : tab;
                        return [4 /*yield*/, (0, approval_1.listApprovals)({
                                role: role,
                                status: params.status,
                                type: params.type,
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { data: data, success: true, total: data.length }];
                    case 2:
                        e_5 = _a.sent();
                        handleError(e_5);
                        return [2 /*return*/, { data: [], success: false, total: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        }); }} pagination={{ pageSize: 10, showSizeChanger: false }} search={{ labelWidth: 'auto' }} dateFormatter="string" headerTitle="审批请求（租户内数据）" options={{ setting: { draggable: true, checkable: true } }} cardBordered/>

      {/* 发起审批 */}
      <pro_components_1.ModalForm key="create-approval" open={createOpen} onOpenChange={setCreateOpen} title="发起审批" width={460} modalProps={{ destroyOnClose: true, maskClosable: false }} initialValues={{ type: 'EXPENSE' }} onFinish={onCreate} submitter={{ searchConfig: { submitText: '提交', resetText: '取消' } }}>
        <pro_components_1.ProFormSelect name="type" label="类型" options={TYPE_OPTIONS} rules={[{ required: true, message: '请选择类型' }]}/>
        <pro_components_1.ProFormText name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]} placeholder="如：报销 8 月差旅费"/>
        <pro_components_1.ProFormText name="amount" label="金额（元）" fieldProps={{ type: 'number', min: 0.01, step: 0.01 }} placeholder="选填，金额类单据填" transform={function (v) { return Number(v); }}/>
        <pro_components_1.ProFormTextArea name="detail" label="详情" placeholder="选填，补充说明"/>
        <pro_components_1.ProFormSelect name="approverId" label="审批人" showSearch options={approvers} fieldProps={{ optionFilterProp: 'label', placeholder: '选择审批人（租户用户）' }} rules={[{ required: true, message: '请选择审批人' }]}/>
      </pro_components_1.ModalForm>
    </pro_components_1.PageContainer>);
}
