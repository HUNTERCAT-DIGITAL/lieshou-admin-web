"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = CustomerDetail;
/**
 * 客户详情独立页（Phase 9 · URL 可直达）.
 *
 * 路径 `/customer/detail/:id`：
 * - 详情从抽屉改为独立页面（URL 可分享/刷新）
 * - 后端 404（不存在/跨租户/已软删）→ Result 404 + 返回列表
 * - 编辑/删除动作从抽屉搬到页面
 */
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var antd_1 = require("antd");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useApiError_1 = require("../../hooks/useApiError");
var editions_1 = require("../../config/editions");
var crm_1 = require("../../services/crm");
var user_1 = require("../../services/user");
var customer_1 = require("@lieshoucloud/contract-types/business/customer");
var Text = antd_1.Typography.Text;
/** 教育供应商模式（zhiye · B2B2C）：客户即合作伙伴，展示资质/协议字段 */
var eduSupplier = (0, editions_1.getEdition)().eduSupplier === true;
function CustomerDetail() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var id = (0, react_router_dom_1.useParams)().id;
    var customerId = Number(id);
    var messageApi = antd_1.App.useApp().message;
    var handleError = (0, useApiError_1.useApiError)();
    var _o = (0, react_1.useState)(null), customer = _o[0], setCustomer = _o[1];
    var _p = (0, react_1.useState)(true), loading = _p[0], setLoading = _p[1];
    var _q = (0, react_1.useState)(false), notFound = _q[0], setNotFound = _q[1];
    var _r = (0, react_1.useState)(false), editing = _r[0], setEditing = _r[1];
    var _s = (0, react_1.useState)(new Map()), userMap = _s[0], setUserMap = _s[1];
    var ownerName = (0, react_1.useCallback)(function (oid) {
        var _a;
        if (oid === undefined || oid === null)
            return '—';
        return (_a = userMap.get(oid)) !== null && _a !== void 0 ? _a : "#".concat(oid);
    }, [userMap]);
    var load = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, users, e_1, is404;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!Number.isFinite(customerId) || customerId <= 0) {
                        setNotFound(true);
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setNotFound(false);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([(0, crm_1.getCustomer)(customerId), (0, user_1.listUsers)()])];
                case 2:
                    _a = _b.sent(), data = _a[0], users = _a[1];
                    setCustomer(data);
                    setUserMap(new Map(users.map(function (u) { return [u.id, u.displayName]; })));
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _b.sent();
                    is404 = typeof e_1 === 'object' &&
                        e_1 !== null &&
                        'status' in e_1 &&
                        e_1.status === 404;
                    if (is404) {
                        setNotFound(true);
                    }
                    else {
                        handleError(e_1);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [customerId, handleError]);
    (0, react_1.useEffect)(function () {
        void load();
    }, [load]);
    var onDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!customer)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, crm_1.deleteCustomer)(customer.id)];
                case 2:
                    _a.sent();
                    messageApi.success('已删除');
                    navigate('/customer/list', { replace: true });
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    handleError(e_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var onSave = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, updated, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!customer)
                        return [2 /*return*/];
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
                        revenueShare: values.revenueShare === undefined || values.revenueShare === ''
                            ? undefined
                            : Number(values.revenueShare),
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, crm_1.updateCustomer)(customer.id, payload)];
                case 2:
                    updated = _a.sent();
                    setCustomer(updated);
                    messageApi.success('已保存');
                    setEditing(false);
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    handleError(e_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // ===== 404 =====
    if (notFound) {
        return (<pro_components_1.PageContainer title="客户详情">
        <antd_1.Result status="404" title="客户不存在或已删除" subTitle="该客户可能已被软删、不存在，或不属于当前租户。" extra={<antd_1.Button type="primary" onClick={function () { return navigate('/customer/list'); }}>
              返回客户列表
            </antd_1.Button>}/>
      </pro_components_1.PageContainer>);
    }
    return (<pro_components_1.PageContainer title={(customer === null || customer === void 0 ? void 0 : customer.name) ? "\u5BA2\u6237\u8BE6\u60C5\uFF1A".concat(customer.name) : '客户详情'} breadcrumb={{
            items: [
                { title: 'CRM 客户', path: '/customer/list' },
                { title: '客户列表', path: '/customer/list' },
                { title: (_a = customer === null || customer === void 0 ? void 0 : customer.name) !== null && _a !== void 0 ? _a : '详情' },
            ],
        }} extra={customer
            ? [
                <antd_1.Button key="back" icon={<icons_1.ArrowLeftOutlined />} onClick={function () { return navigate('/customer/list'); }}>
                返回列表
              </antd_1.Button>,
                <antd_1.Button key="edit" type="primary" icon={<icons_1.EditOutlined />} onClick={function () { return setEditing(!editing); }}>
                {editing ? '取消编辑' : '编辑'}
              </antd_1.Button>,
                <antd_1.Popconfirm key="del" title="确定删除该客户？" description={"".concat(customer.name, " \u5220\u9664\u540E\u5C06\u4ECE\u5217\u8868\u79FB\u9664\uFF08\u8F6F\u5220\uFF09")} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={function () { return void onDelete(); }}>
                <antd_1.Button danger icon={<icons_1.DeleteOutlined />}>
                  删除
                </antd_1.Button>
              </antd_1.Popconfirm>,
            ]
            : [
                <antd_1.Button key="back" onClick={function () { return navigate('/customer/list'); }}>
                返回列表
              </antd_1.Button>,
            ]}>
      <pro_components_1.ProCard loading={loading} bordered>
        {customer && !editing && (<antd_1.Descriptions column={2} bordered size="small" items={__spreadArray([
                { key: 'name', label: '客户名称', children: customer.name },
                {
                    key: 'status',
                    label: '跟进状态',
                    children: (<antd_1.Tag color={customer_1.STATUS_META[customer.status].color}>
                    {customer_1.STATUS_META[customer.status].text}
                  </antd_1.Tag>),
                },
                { key: 'contactName', label: '联系人', children: (_b = customer.contactName) !== null && _b !== void 0 ? _b : '—' },
                { key: 'contactPhone', label: '联系电话', children: (_c = customer.contactPhone) !== null && _c !== void 0 ? _c : '—' },
                { key: 'email', label: '邮箱', children: (_d = customer.email) !== null && _d !== void 0 ? _d : '—', span: 2 },
                { key: 'address', label: '地址', children: (_e = customer.address) !== null && _e !== void 0 ? _e : '—', span: 2 },
                { key: 'ownerId', label: '负责人', children: ownerName(customer.ownerId) },
                { key: 'createdBy', label: '创建人', children: ownerName(customer.createdBy) },
                { key: 'createdAt', label: '创建时间', children: customer.createdAt },
                { key: 'updatedAt', label: '更新时间', children: (_f = customer.updatedAt) !== null && _f !== void 0 ? _f : '—' },
                { key: 'updatedBy', label: '最后更新人', children: ownerName(customer.updatedBy) },
                {
                    key: 'remark',
                    label: '备注',
                    children: (_g = customer.remark) !== null && _g !== void 0 ? _g : '—',
                    span: 2,
                }
            ], (eduSupplier
                ? [
                    {
                        key: 'licenseNo',
                        label: '办学许可证号',
                        children: (_h = customer.licenseNo) !== null && _h !== void 0 ? _h : '—',
                    },
                    {
                        key: 'licenseAttach',
                        label: '办学资质附件',
                        children: (_j = customer.licenseAttach) !== null && _j !== void 0 ? _j : '—',
                    },
                    { key: 'region', label: '合作区域', children: (_k = customer.region) !== null && _k !== void 0 ? _k : '—' },
                    {
                        key: 'contractPeriod',
                        label: '合作协议期',
                        children: (_l = customer.contractPeriod) !== null && _l !== void 0 ? _l : '—',
                    },
                    {
                        key: 'revenueShare',
                        label: '智野分成比例',
                        children: customer.revenueShare !== null ? "".concat(customer.revenueShare, "%") : '—',
                    },
                    {
                        key: 'settleCycle',
                        label: '结算周期',
                        children: (_m = customer.settleCycle) !== null && _m !== void 0 ? _m : '—',
                    },
                ]
                : []), true)}/>)}
        {customer && editing && (<EditForm customer={customer} ownerOptions={__spreadArray([], userMap.entries(), true).sort(function (a, b) { return a[1].localeCompare(b[1]); })
                .map(function (_a) {
                var uid = _a[0], name = _a[1];
                return ({ label: "".concat(name, "\uFF08#").concat(uid, "\uFF09"), value: uid });
            })} onSubmit={onSave} onCancel={function () { return setEditing(false); }}/>)}
      </pro_components_1.ProCard>
    </pro_components_1.PageContainer>);
}
/** 简易行内编辑表单（避免搬 CustomerList 整段 ModalForm 代码；保持此页独立可读） */
function EditForm(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    var customer = _a.customer, ownerOptions = _a.ownerOptions, onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    var _1 = (0, react_1.useState)({
        name: customer.name,
        contactName: (_b = customer.contactName) !== null && _b !== void 0 ? _b : '',
        contactPhone: (_c = customer.contactPhone) !== null && _c !== void 0 ? _c : '',
        email: (_d = customer.email) !== null && _d !== void 0 ? _d : '',
        address: (_e = customer.address) !== null && _e !== void 0 ? _e : '',
        ownerId: (_f = customer.ownerId) !== null && _f !== void 0 ? _f : undefined,
        status: customer.status,
        remark: (_g = customer.remark) !== null && _g !== void 0 ? _g : '',
        // 教育版（zhiye · 合作伙伴）扩展字段
        licenseNo: (_h = customer.licenseNo) !== null && _h !== void 0 ? _h : '',
        licenseAttach: (_j = customer.licenseAttach) !== null && _j !== void 0 ? _j : '',
        region: (_k = customer.region) !== null && _k !== void 0 ? _k : '',
        contractPeriod: (_l = customer.contractPeriod) !== null && _l !== void 0 ? _l : '',
        settleCycle: (_m = customer.settleCycle) !== null && _m !== void 0 ? _m : '',
        revenueShare: (_o = customer.revenueShare) !== null && _o !== void 0 ? _o : undefined,
    }), values = _1[0], setValues = _1[1];
    var update = function (k, v) { return setValues(function (s) {
        var _a;
        return (__assign(__assign({}, s), (_a = {}, _a[k] = v, _a)));
    }); };
    /** 分成比例输入值（Record 里可能是 number 或 ''） */
    var revenueShareValue = (_p = values.revenueShare) !== null && _p !== void 0 ? _p : '';
    return (<antd_1.Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Field label="客户名称" required>
        <input data-testid="detail-name" value={String((_q = values.name) !== null && _q !== void 0 ? _q : '')} onChange={function (e) { return update('name', e.target.value); }} style={inputStyle}/>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="联系人">
          <input value={String((_r = values.contactName) !== null && _r !== void 0 ? _r : '')} onChange={function (e) { return update('contactName', e.target.value); }} style={inputStyle}/>
        </Field>
        <Field label="联系电话">
          <input value={String((_s = values.contactPhone) !== null && _s !== void 0 ? _s : '')} onChange={function (e) { return update('contactPhone', e.target.value); }} style={inputStyle}/>
        </Field>
      </div>
      <Field label="邮箱">
        <input value={String((_t = values.email) !== null && _t !== void 0 ? _t : '')} onChange={function (e) { return update('email', e.target.value); }} style={inputStyle}/>
      </Field>
      <Field label="地址">
        <input value={String((_u = values.address) !== null && _u !== void 0 ? _u : '')} onChange={function (e) { return update('address', e.target.value); }} style={inputStyle}/>
      </Field>
      <Field label="负责人">
        <select value={values.ownerId === undefined ? '' : String(values.ownerId)} onChange={function (e) {
            return update('ownerId', e.target.value === '' ? undefined : Number(e.target.value));
        }} style={inputStyle}>
          <option value="">未指定</option>
          {ownerOptions.map(function (o) { return (<option key={o.value} value={o.value}>
              {o.label}
            </option>); })}
        </select>
      </Field>
      <Field label="跟进状态" required>
        <select value={String(values.status)} onChange={function (e) { return update('status', e.target.value); }} style={inputStyle}>
          {['NEW', 'FOLLOWING', 'CONVERTED', 'LOST'].map(function (s) { return (<option key={s} value={s}>
              {customer_1.STATUS_META[s].text}
            </option>); })}
        </select>
      </Field>
      <Field label="备注">
        <textarea value={String((_v = values.remark) !== null && _v !== void 0 ? _v : '')} onChange={function (e) { return update('remark', e.target.value); }} rows={3} style={__assign(__assign({}, inputStyle), { resize: 'vertical' })}/>
      </Field>
      {/* 教育版（zhiye · 合作伙伴）扩展字段：仅 eduSupplier 版别渲染 */}
      {eduSupplier && (<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="办学许可证号">
              <input value={String((_w = values.licenseNo) !== null && _w !== void 0 ? _w : '')} onChange={function (e) { return update('licenseNo', e.target.value); }} style={inputStyle}/>
            </Field>
            <Field label="合作区域">
              <input value={String((_x = values.region) !== null && _x !== void 0 ? _x : '')} onChange={function (e) { return update('region', e.target.value); }} style={inputStyle}/>
            </Field>
          </div>
          <Field label="办学资质附件">
            <input value={String((_y = values.licenseAttach) !== null && _y !== void 0 ? _y : '')} onChange={function (e) { return update('licenseAttach', e.target.value); }} style={inputStyle}/>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="合作协议期">
              <input value={String((_z = values.contractPeriod) !== null && _z !== void 0 ? _z : '')} onChange={function (e) { return update('contractPeriod', e.target.value); }} style={inputStyle}/>
            </Field>
            <Field label="结算周期">
              <select value={String((_0 = values.settleCycle) !== null && _0 !== void 0 ? _0 : '')} onChange={function (e) { return update('settleCycle', e.target.value); }} style={inputStyle}>
                <option value="">未设置</option>
                <option value="月">月结</option>
                <option value="季">季结</option>
                <option value="学期">学期结</option>
              </select>
            </Field>
            <Field label="智野分成比例（%）">
              <input type="number" min="0" max="100" step="0.01" value={revenueShareValue} onChange={function (e) {
                return update('revenueShare', e.target.value === '' ? undefined : Number(e.target.value));
            }} style={inputStyle} placeholder="如 60（智野按 60% 分成）"/>
            </Field>
          </div>
        </>)}
      <antd_1.Space>
        <antd_1.Button type="primary" onClick={function () { return void onSubmit(values); }} data-testid="detail-save">
          保存
        </antd_1.Button>
        <antd_1.Button onClick={onCancel}>取消</antd_1.Button>
      </antd_1.Space>
    </antd_1.Space>);
}
function Field(_a) {
    var label = _a.label, required = _a.required, children = _a.children;
    return (<div>
      <div style={{ marginBottom: 4 }}>
        <Text strong>
          {label}
          {required && <span style={{ color: '#cf1322' }}> *</span>}
        </Text>
      </div>
      {children}
    </div>);
}
var inputStyle = {
    width: '100%',
    padding: '6px 11px',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    fontSize: 14,
};
