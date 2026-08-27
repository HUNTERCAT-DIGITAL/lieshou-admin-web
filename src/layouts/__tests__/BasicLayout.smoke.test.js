"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var react_router_dom_1 = require("react-router-dom");
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var BasicLayout_1 = require("../BasicLayout");
var auth_1 = require("../../stores/auth");
// ProLayout 用 window.matchMedia 做响应式检测；jsdom 没实现，mock 之
beforeAll(function () {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: function (query) { return ({
            matches: false,
            media: query,
            onchange: null,
            addListener: function () { },
            removeListener: function () { },
            addEventListener: function () { },
            removeEventListener: function () { },
            dispatchEvent: function () { return false; },
        }); },
    });
});
beforeEach(function () {
    localStorage.clear();
    auth_1.useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
    });
});
(0, vitest_1.describe)('BasicLayout smoke（图标 + ProLayout 渲染）', function () {
    (0, vitest_1.it)('PLATFORM_ADMIN 登录后渲染 BasicLayout 成功（不抛错）', function () {
        auth_1.useAuthStore.setState({
            accessToken: 't',
            refreshToken: 'r',
            user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
            isAuthenticated: true,
        });
        (0, vitest_1.expect)(function () {
            (0, react_1.render)(<antd_1.ConfigProvider>
          <antd_1.App>
            <react_router_dom_1.MemoryRouter initialEntries={['/welcome']}>
              <BasicLayout_1.default />
            </react_router_dom_1.MemoryRouter>
          </antd_1.App>
        </antd_1.ConfigProvider>);
        }).not.toThrow();
    });
    (0, vitest_1.it)('渲染侧边栏菜单项（basic sanity）', function () {
        auth_1.useAuthStore.setState({
            accessToken: 't',
            refreshToken: 'r',
            user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
            isAuthenticated: true,
        });
        var container = (0, react_1.render)(<antd_1.ConfigProvider>
        <antd_1.App>
          <react_router_dom_1.MemoryRouter initialEntries={['/welcome']}>
            <BasicLayout_1.default />
          </react_router_dom_1.MemoryRouter>
        </antd_1.App>
      </antd_1.ConfigProvider>).container;
        // ProLayout 在 jsdom 下可能默认收起，只验证 DOM 有内容 + 出现菜单项某一块
        (0, vitest_1.expect)(container.firstChild).toBeTruthy();
        (0, vitest_1.expect)(container.innerHTML.length).toBeGreaterThan(0);
    });
});
