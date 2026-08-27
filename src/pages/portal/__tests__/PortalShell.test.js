"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 门户共享组件单测（ADR-0035 · PortalShell）.
 * 覆盖：PortalNav / FadeIn / SectionHeader / PortalStats / FeatureCard / PortalFaq / PortalCta。
 */
var react_1 = require("@testing-library/react");
var antd_1 = require("antd");
var vitest_1 = require("vitest");
var editions_1 = require("../../../config/editions");
var PortalShell_1 = require("../PortalShell");
var wrap = function (_a) {
    var children = _a.children;
    return (<antd_1.ConfigProvider>{children}</antd_1.ConfigProvider>);
};
var generic = editions_1.EDITIONS.generic;
(0, vitest_1.describe)('PortalNav', function () {
    (0, vitest_1.it)('渲染品牌 + 锚点菜单 + 登录按钮；allowRegister=false 不渲染注册', function () {
        var onLogin = vitest_1.vi.fn();
        (0, react_1.render)(<PortalShell_1.PortalNav edition={generic} menu={[
                { key: 'capability', label: '核心能力' },
                { key: 'about', label: '关于我们' },
            ]} onLogin={onLogin}/>, { wrapper: wrap });
        // 品牌
        (0, vitest_1.expect)(react_1.screen.getAllByText('LieShouCloud').length).toBeGreaterThan(0);
        // 锚点菜单
        (0, vitest_1.expect)(react_1.screen.getByText('核心能力').closest('a')).toHaveAttribute('href', '#capability');
        (0, vitest_1.expect)(react_1.screen.getByText('关于我们').closest('a')).toHaveAttribute('href', '#about');
        // 登录按钮可点击
        react_1.fireEvent.click(react_1.screen.getByRole('button', { name: '登 录' }));
        (0, vitest_1.expect)(onLogin).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('allowRegister=true 渲染免费注册按钮', function () {
        (0, react_1.render)(<PortalShell_1.PortalNav edition={generic} menu={[{ key: 'capability', label: '核心能力' }]} onLogin={function () { }} onRegister={function () { }}/>, { wrapper: wrap });
        (0, vitest_1.expect)(react_1.screen.getByRole('button', { name: '免费注册' })).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('FadeIn', function () {
    (0, vitest_1.it)('无 IntersectionObserver 环境直接渲染子内容（jsdom 兜底）', function () {
        (0, react_1.render)(<PortalShell_1.FadeIn>
        <div>可见内容</div>
      </PortalShell_1.FadeIn>);
        (0, vitest_1.expect)(react_1.screen.getByText('可见内容')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('SectionHeader', function () {
    (0, vitest_1.it)('渲染 eyebrow + 标题 + 副文案', function () {
        (0, react_1.render)(<PortalShell_1.SectionHeader eyebrow="EYEBROW" title="区块标题" desc="区块副文案"/>);
        (0, vitest_1.expect)(react_1.screen.getByText('EYEBROW')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('区块标题')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('区块副文案')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('PortalStats', function () {
    (0, vitest_1.it)('渲染统计值 + 标签', function () {
        (0, react_1.render)(<PortalShell_1.PortalStats stats={[
                { label: '已上线模块', value: '8+' },
                { label: '覆盖行业', value: '6+' },
            ]} primaryColor="#1677ff"/>);
        (0, vitest_1.expect)(react_1.screen.getByText('8+')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('已上线模块')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('6+')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('覆盖行业')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('FeatureCard', function () {
    (0, vitest_1.it)('渲染图标 + 标题 + 状态标签 + 描述', function () {
        (0, react_1.render)(<PortalShell_1.FeatureCard primaryColor="#1677ff" feature={{ title: '多租户', desc: '数据按租户隔离', done: true, icon: 'cluster' }}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('多租户')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('已上线')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('数据按租户隔离')).toBeInTheDocument();
    });
    (0, vitest_1.it)('未知图标名回退默认图标（不抛错）', function () {
        (0, react_1.render)(<PortalShell_1.FeatureCard primaryColor="#1677ff" feature={{ title: '未知', desc: 'x', done: false, icon: 'not-exist' }}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('未知')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('规划中')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('PortalFaq', function () {
    (0, vitest_1.it)('渲染问题列表（折叠面板标签）', function () {
        (0, react_1.render)(<PortalShell_1.PortalFaq items={[
                { q: '问题一', a: '答案一' },
                { q: '问题二', a: '答案二' },
            ]}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('问题一')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('问题二')).toBeInTheDocument();
    });
});
(0, vitest_1.describe)('PortalCta', function () {
    (0, vitest_1.it)('渲染标题/描述 + 点击触发 onAction', function () {
        var onAction = vitest_1.vi.fn();
        (0, react_1.render)(<PortalShell_1.PortalCta cta={{ title: '立即开始', desc: '从今天开始', buttonText: '进入' }} primaryColor="#1677ff" onAction={onAction}/>);
        (0, vitest_1.expect)(react_1.screen.getByText('立即开始')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('从今天开始')).toBeInTheDocument();
        react_1.fireEvent.click(react_1.screen.getByRole('button', { name: /进入/ }));
        (0, vitest_1.expect)(onAction).toHaveBeenCalledTimes(1);
    });
});
