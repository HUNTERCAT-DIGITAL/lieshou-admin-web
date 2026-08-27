"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var vitest_1 = require("vitest");
var react_router_dom_1 = require("react-router-dom");
var auth_1 = require("../../stores/auth");
var AccessGuard_1 = require("../AccessGuard");
(0, vitest_1.beforeEach)(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
});
function renderWith(roles) {
    auth_1.useAuthStore.setState({
        accessToken: 't',
        refreshToken: 'r',
        user: { userId: 1, username: 'u', roles: roles },
        isAuthenticated: true,
    });
    (0, react_1.render)(<react_router_dom_1.MemoryRouter>
      <AccessGuard_1.AccessGuard access="canManageTenant">
        <div>secret-content</div>
      </AccessGuard_1.AccessGuard>
    </react_router_dom_1.MemoryRouter>);
}
(0, vitest_1.describe)('AccessGuard（路由级权限兜底）', function () {
    (0, vitest_1.it)('无权限 → 渲染 403 页，不渲染受保护内容', function () {
        renderWith(['USER']);
        (0, vitest_1.expect)(react_1.screen.getByText(/没有权限/)).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.queryByText('secret-content')).not.toBeInTheDocument();
    });
    (0, vitest_1.it)('有权限 → 渲染子内容', function () {
        renderWith(['PLATFORM_ADMIN']);
        (0, vitest_1.expect)(react_1.screen.getByText('secret-content')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.queryByText(/没有权限/)).not.toBeInTheDocument();
    });
});
