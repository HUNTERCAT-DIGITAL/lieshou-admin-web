"use strict";
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
/**
 * EditionGuard 单测：版别裁剪路由兜底（ADR-0035）.
 */
var react_1 = require("@testing-library/react");
var vitest_1 = require("vitest");
var react_router_dom_1 = require("react-router-dom");
var editions_1 = require("../../config/editions");
var EditionGuard_1 = require("../EditionGuard");
vitest_1.vi.mock('../../config/editions', function () { return ({
    getEdition: vitest_1.vi.fn(),
    // 与真实实现同语义（配置层条件性隐藏）：非 eduTeacher 版别隐藏师资档案 /edu
    getEditionHiddenMenus: function (edition) {
        var _a;
        return __spreadArray(__spreadArray([], ((_a = edition.hiddenMenus) !== null && _a !== void 0 ? _a : []), true), (edition.eduTeacher ? [] : ['/edu']), true);
    },
}); });
var mockedGetEdition = vitest_1.vi.mocked(editions_1.getEdition);
(0, vitest_1.beforeEach)(function () {
    vitest_1.vi.restoreAllMocks();
    mockedGetEdition.mockReturnValue({
        id: 'generic',
        brandName: 'test',
        slogan: '',
        heroDesc: '',
        logo: '',
        primaryColor: '#1677ff',
        defaultTenantCode: 'huntercat',
        allowRegister: true,
        industriesText: [],
        features: [],
        stats: [],
        faq: [],
        cta: { title: '', desc: '', buttonText: '' },
    });
});
function renderAt(path) {
    (0, react_1.render)(<react_router_dom_1.MemoryRouter initialEntries={[path]}>
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="*" element={<EditionGuard_1.EditionGuard>
              <div>guard-content</div>
            </EditionGuard_1.EditionGuard>}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.MemoryRouter>);
}
(0, vitest_1.describe)('EditionGuard（版别路由裁剪）', function () {
    (0, vitest_1.it)('generic 版不裁剪，任何路径都渲染内容', function () {
        renderAt('/customer/list');
        (0, vitest_1.expect)(react_1.screen.getByText('guard-content')).toBeTruthy();
    });
    (0, vitest_1.it)('layer 版命中隐藏前缀（/customer 等）→ 渲染 404', function () {
        mockedGetEdition.mockReturnValue({
            id: 'layer',
            brandName: 'test',
            slogan: '',
            heroDesc: '',
            logo: '',
            primaryColor: '#722ed1',
            defaultTenantCode: 'layer',
            allowRegister: false,
            hiddenMenus: ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'],
            industriesText: [],
            features: [],
            stats: [],
            faq: [],
            cta: { title: '', desc: '', buttonText: '' },
        });
        renderAt('/customer/list');
        (0, vitest_1.expect)(react_1.screen.queryByText('guard-content')).toBeNull();
    });
    (0, vitest_1.it)('非 eduTeacher 版别命中 /edu 师资档案 → 渲染 404（配置层条件性隐藏）', function () {
        renderAt('/edu/teacher/list');
        (0, vitest_1.expect)(react_1.screen.queryByText('guard-content')).toBeNull();
    });
    (0, vitest_1.it)('layer 版未命中隐藏前缀（/user）→ 正常渲染', function () {
        mockedGetEdition.mockReturnValue({
            id: 'layer',
            brandName: 'test',
            slogan: '',
            heroDesc: '',
            logo: '',
            primaryColor: '#722ed1',
            defaultTenantCode: 'layer',
            allowRegister: false,
            hiddenMenus: ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'],
            industriesText: [],
            features: [],
            stats: [],
            faq: [],
            cta: { title: '', desc: '', buttonText: '' },
        });
        renderAt('/user/list');
        (0, vitest_1.expect)(react_1.screen.getByText('guard-content')).toBeTruthy();
    });
});
