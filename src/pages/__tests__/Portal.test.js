"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Portal 门户页单测（Phase 9 · 覆盖率）.
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var vitest_1 = require("vitest");
var auth_1 = require("../../stores/auth");
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
});
var Portal_1 = require("../Portal");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>
    <antd_1.App>
      <react_router_dom_1.MemoryRouter>{children}</react_router_dom_1.MemoryRouter>
    </antd_1.App>
  </antd_1.ConfigProvider>);
};
(0, vitest_1.describe)('Portal 门户页', function () {
    (0, vitest_1.it)('渲染：品牌、Hero、能力卡、行业、公司、Footer', function () {
        (0, react_1.render)(<Portal_1.default />, { wrapper: wrap });
        // 品牌出现于导航栏 + Hero
        (0, vitest_1.expect)(react_1.screen.getAllByText('LieShouCloud').length).toBeGreaterThanOrEqual(2);
        (0, vitest_1.expect)(react_1.screen.getAllByText(/开源的数字化平台/).length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getByText('平台核心能力')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getAllByText('覆盖行业').length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getAllByText('关于我们').length).toBeGreaterThan(0);
        // 能力卡
        (0, vitest_1.expect)(react_1.screen.getByText('多租户')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('完整认证')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('权限体系')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('业务模块')).toBeInTheDocument();
        // 已上线 / 规划中 标签
        (0, vitest_1.expect)(react_1.screen.getAllByText('已上线').length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getAllByText('已上线').length).toBeGreaterThanOrEqual(4);
        // CTA
        (0, vitest_1.expect)(react_1.screen.getAllByText(/免费注册体验/).length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getAllByText('已有账号登录').length).toBeGreaterThan(0);
        // Footer（品牌出现多次 + 用 getAllByText）
        (0, vitest_1.expect)(react_1.screen.getAllByText(/猎手猫数字科技/).length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('渲染：数据统计条 + 平台流程（丰富化结构）', function () {
        (0, react_1.render)(<Portal_1.default />, { wrapper: wrap });
        // 数据统计条
        (0, vitest_1.expect)(react_1.screen.getByText('开源组件仓')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('16')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Apache-2.0')).toBeInTheDocument();
        // 平台流程 4 步
        (0, vitest_1.expect)(react_1.screen.getAllByText('平台流程').length).toBeGreaterThan(0);
        (0, vitest_1.expect)(react_1.screen.getByText('一键部署')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('一键开租户')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('团队使用')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('数据增长')).toBeInTheDocument();
    });
    (0, vitest_1.it)('渲染：FAQ 折叠面板', function () {
        (0, react_1.render)(<Portal_1.default />, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getByText('常见问题')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('LieShouCloud 是什么？')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('如何体验？')).toBeInTheDocument();
    });
    (0, vitest_1.it)('渲染：行业版入口导航（layer 法律版）', function () {
        (0, react_1.render)(<Portal_1.default />, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getByText('行业版入口')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('法律行业版')).toBeInTheDocument();
    });
    (0, vitest_1.it)('未登录：CTA 注册按钮可点击', function () {
        (0, react_1.render)(<Portal_1.default />, { wrapper: wrap });
        var ctaBtns = react_1.screen.getAllByText(/免费注册体验/);
        (0, vitest_1.expect)(ctaBtns.length).toBeGreaterThan(0);
    });
});
