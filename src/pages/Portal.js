"use strict";
/**
 * 门户页（Phase 8 · 获客入口）.
 *
 * 未登录访问 / 时展示：版别专属门户（edition.portal，如 LieShouBoot 产品介绍页）优先，
 * 缺省回退 GenericPortal（平台通用门户）。
 * 行业/客户版门户由客户仓经 edition.portal / extraRoutes 注入（2026-09 客户聚合仓模式）。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Portal;
var react_1 = require("react");
var GenericPortal_1 = require("./portal/GenericPortal");
var editions_1 = require("../config/editions");
function Portal() {
    var _a;
    var edition = (0, editions_1.getEdition)();
    // 版别专属门户组件（懒加载）；缺省用通用门户
    var portalLoad = (_a = edition.portal) === null || _a === void 0 ? void 0 : _a.load;
    var PortalComponent = portalLoad
        ? (0, react_1.lazy)(portalLoad)
        : GenericPortal_1.default;
    return (<react_1.Suspense fallback={null}>
      <PortalComponent />
    </react_1.Suspense>);
}
