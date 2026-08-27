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
exports.default = Profile;
/**
 * 个人中心（Phase 9 · Admin 体验打磨）.
 *
 * 展示当前登录用户信息（/auth/me）：用户名、UID、租户、角色；支持手动刷新。
 */
var icons_1 = require("@ant-design/icons");
var pro_components_1 = require("@ant-design/pro-components");
var antd_1 = require("antd");
var react_1 = require("react");
var useApiError_1 = require("../hooks/useApiError");
var auth_1 = require("../stores/auth");
var ui_1 = require("@lieshoucloud/ui");
var editions_1 = require("../config/editions");
var Text = antd_1.Typography.Text;
function Profile() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f;
    var handleError = (0, useApiError_1.useApiError)();
    var cached = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var fetchMe = (0, auth_1.useAuthStore)(function (s) { return s.fetchMe; });
    // 法律版（layer/legalmind）：单租户场景，前端不体现「租户」概念（ADR-0035 配置层）
    var hideTenant = (0, editions_1.getEdition)().showLegal === true;
    var _g = (0, react_1.useState)(cached), me = _g[0], setMe = _g[1];
    var _h = (0, react_1.useState)(false), loading = _h[0], setLoading = _h[1];
    var load = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    _a = setMe;
                    return [4 /*yield*/, fetchMe()];
                case 2:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _b.sent();
                    handleError(e_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [fetchMe, handleError]);
    (0, react_1.useEffect)(function () {
        void load();
    }, [load]);
    return (<pro_components_1.PageContainer title="个人中心" extra={[
            <antd_1.Button key="reload" icon={<icons_1.ReloadOutlined />} onClick={function () { return void load(); }} loading={loading}>
          刷新
        </antd_1.Button>,
        ]}>
      <pro_components_1.ProCard bordered style={{ maxWidth: 720 }}>
        <antd_1.Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <antd_1.Space size="middle">
            <antd_1.Avatar size={56} icon={<icons_1.UserOutlined />} style={{ background: '#1677ff' }}/>
            <div>
              <antd_1.Typography.Title level={4} style={{ margin: 0 }}>
                {(_a = me === null || me === void 0 ? void 0 : me.username) !== null && _a !== void 0 ? _a : '(unknown)'}
              </antd_1.Typography.Title>
              {!hideTenant && (<Text type="secondary">
                  {(me === null || me === void 0 ? void 0 : me.tenantCode) ? "\u79DF\u6237\uFF1A".concat(me.tenantCode) : '未绑定租户'}
                </Text>)}
            </div>
          </antd_1.Space>

          <antd_1.Descriptions column={1} bordered size="small" items={__spreadArray(__spreadArray([
            { key: 'userId', label: '用户 ID', children: (_b = me === null || me === void 0 ? void 0 : me.userId) !== null && _b !== void 0 ? _b : '—' },
            { key: 'username', label: '用户名', children: (_c = me === null || me === void 0 ? void 0 : me.username) !== null && _c !== void 0 ? _c : '—' }
        ], (hideTenant
            ? []
            : [
                { key: 'tenantId', label: '租户 ID', children: (_d = me === null || me === void 0 ? void 0 : me.tenantId) !== null && _d !== void 0 ? _d : '—' },
                { key: 'tenantCode', label: '租户编码', children: (_e = me === null || me === void 0 ? void 0 : me.tenantCode) !== null && _e !== void 0 ? _e : '—' },
            ]), true), [
            {
                key: 'roles',
                label: '角色',
                children: ((_f = me === null || me === void 0 ? void 0 : me.roles) !== null && _f !== void 0 ? _f : []).map(function (r) { return <ui_1.RoleTag key={r} role={r}/>; }),
            },
        ], false)}/>
        </antd_1.Space>
      </pro_components_1.ProCard>
    </pro_components_1.PageContainer>);
}
