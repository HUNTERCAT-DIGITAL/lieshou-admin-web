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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * boot.extra.ts · 由 lieshou-boot scripts/prepare.mjs 自动生成，勿手改。
 * 自动装配 features：品牌 + 门户 + 专属路由。
 */
var boot_1 = require("@lieshoucloud/boot");
exports.default = __assign(__assign({}, boot_1.bootBrand), { portal: { load: function () { return Promise.resolve().then(function () { return require('@lieshoucloud/boot/features/portal/ui/admin/BootPortal'); }); } }, extraRoutes: [
        { path: '/dashboard', load: function () { return Promise.resolve().then(function () { return require('@lieshoucloud/boot/features/dashboard/ui/admin/Dashboard'); }); }, menu: { name: 'Dashboard' } },
    ] });
