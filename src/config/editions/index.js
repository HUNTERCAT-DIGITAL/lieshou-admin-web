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
exports.INDUSTRY_ENTRIES = exports.EDITIONS = void 0;
exports.resolveEditionId = resolveEditionId;
exports.getEdition = getEdition;
exports.getEditionIndustries = getEditionIndustries;
exports.getEnabledCapabilities = getEnabledCapabilities;
exports.isPathCapabilityEnabled = isPathCapabilityEnabled;
exports.getEditionHiddenMenus = getEditionHiddenMenus;
exports.editionConfigFromTenant = editionConfigFromTenant;
exports.getExtraEdition = getExtraEdition;
var generic_1 = require("./generic");
var layer_1 = require("./layer");
/** 部署版别环境变量（构建期注入，如 VITE_EDITION=zhiye） */
var EDITION_ENV_KEY = 'VITE_EDITION';
exports.EDITIONS = {
    generic: generic_1.genericEdition,
    layer: layer_1.layerEdition,
};
/** 从 VITE_EDITION 环境变量解析版别（非法值回退 undefined → 继续走域名推断） */
function editionFromEnv() {
    var _a;
    var v = (_a = import.meta.env) === null || _a === void 0 ? void 0 : _a[EDITION_ENV_KEY];
    if (v && v in exports.EDITIONS)
        return v;
    return null;
}
/** 从域名推断版别（legalmind./layer./zhiye./dwjk. 前缀 或 .jmzz. 中缀 → 对应版；其余 generic）
 *
 * 注：jmzz 入口 2026-08-25 起为 `dev.jmzz.lieshoucloud.huntercat.cn`（中缀形式），
 * 旧前缀 `jmzz.` 一并兼容；layer/zhiye 仍为前缀形式。 */
function editionFromHostname(host) {
    if (host.startsWith('layer.'))
        return 'layer';
    return 'generic';
}
/** 解析当前部署版别（env 优先 → 域名推断 → generic） */
function resolveEditionId() {
    var _a;
    return ((_a = editionFromEnv()) !== null && _a !== void 0 ? _a : (typeof window === 'undefined' ? 'generic' : editionFromHostname(window.location.hostname)));
}
/** 当前部署版别配置（门户/登录页展示用）.
 * 基础版（generic 等）+ 版别增强（extra 注入：品牌/门户/专属路由等，2026-09 客户聚合仓模式）叠加。
 */
function getEdition() {
    var base = exports.EDITIONS[resolveEditionId()];
    return __assign(__assign({}, base), getExtraEdition());
}
/**
 * 客户版别启用的行业能力（客户层 ↔ 行业层解耦入口 · 2026-09）。
 * 替代旧的 showLegal/eduTeacher 硬编码行业语义——行业显隐统一由
 * Edition.industries 派生；功能级增强开关（eduSupplier/dutyConsole 等）保留在配置里。
 */
function getEditionIndustries(edition) {
    var _a;
    return (_a = edition.industries) !== null && _a !== void 0 ? _a : [];
}
/**
 * 客户在某行业启用的能力清单（模块级组合 · 2026-09）。
 * - capabilities 已声明 → 精确匹配该行业子集；
 * - 未声明（null）→ 行业全量。
 */
function getEnabledCapabilities(edition, industry) {
    var _a;
    var caps = (_a = edition.capabilities) !== null && _a !== void 0 ? _a : [];
    if (caps.length === 0)
        return null;
    return caps.filter(function (c) { return c.startsWith("".concat(industry, "/")); });
}
/** 某菜单路径是否被客户能力裁剪（行业子集声明时按能力前缀匹配） */
function isPathCapabilityEnabled(edition, path) {
    var seg = path.split('/');
    var industry = seg[1]; // '/legal/cases' → 'legal'
    if (!industry || !['legal', 'iot', 'edu'].includes(industry))
        return true; // 通用路径不过滤
    var caps = getEnabledCapabilities(edition, industry);
    if (caps === null)
        return true; // 行业全量
    return caps.some(function (c) { return path === "/".concat(c) || path.startsWith("/".concat(c, "/")); });
}
/**
 * 版别隐藏菜单前缀：配置 hiddenMenus + 条件性隐藏（ADR-0035 配置层）.
 *
 * 例如非 zhiye 版别（未开启 eduTeacher）→ 师资档案 /edu 菜单与路由一并隐藏。
 */
function getEditionHiddenMenus(edition) {
    var _a;
    var extra = [];
    if (!edition.eduTeacher)
        extra.push('/edu');
    return __spreadArray(__spreadArray([], ((_a = edition.hiddenMenus) !== null && _a !== void 0 ? _a : []), true), extra, true);
}
/** 后端返回的租户版别（TokenResponse.tenantEdition）→ 前端配置（未知回退 generic） */
function editionConfigFromTenant(tenantEdition) {
    var id = (tenantEdition !== null && tenantEdition !== void 0 ? tenantEdition : '').toLowerCase();
    return id in exports.EDITIONS ? exports.EDITIONS[id] : exports.EDITIONS.generic;
}
/**
 * 客户仓注入的 Edition 增强（extraRoutes 等 · 2026-09 客户聚合仓模式）.
 * 独立仓库（无客户仓）glob 不匹配 → 空；客户仓 deploy:prepare 生成 `*.extra.ts` 后自动合并。
 */
var EXTRA_MODULES = import.meta.glob('./*.extra.ts', {
    eager: true,
});
function getExtraEdition() {
    return Object.values(EXTRA_MODULES)
        .map(function (m) { var _a; return (_a = m.default) !== null && _a !== void 0 ? _a : {}; })
        .reduce(function (acc, cur) { return (__assign(__assign({}, acc), cur)); }, {});
}
exports.INDUSTRY_ENTRIES = [
    {
        edition: 'layer',
        name: '法律行业版',
        desc: '律所 / 事务所办案数字化',
        href: 'https://layer.dev.lieshoucloud.huntercat.cn',
    },
];
