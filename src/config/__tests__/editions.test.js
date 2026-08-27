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
 * 版别配置层单测（ADR-0035 · edition config · 开源版 generic/layer）.
 *
 * 注：客户版别（dwjk/haizan/hekeren/huntercat/jmzz/legalmind/linkesecurity/zhiye）
 * 已在开源化时剥离（2026-08），相关测试随客户仓。
 */
var vitest_1 = require("vitest");
var editions_1 = require("../editions");
(0, vitest_1.afterEach)(function () {
    vitest_1.vi.unstubAllEnvs();
    vitest_1.vi.unstubAllGlobals();
});
(0, vitest_1.describe)('能力组合（capabilities 模块级 · 跨行业）', function () {
    (0, vitest_1.it)('layer 声明 industries 但未声明 capabilities → 行业全量（不过滤）', function () {
        (0, vitest_1.expect)((0, editions_1.getEnabledCapabilities)(editions_1.EDITIONS.layer, 'legal')).toBeNull();
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(editions_1.EDITIONS.layer, '/legal/cases')).toBe(true);
    });
    (0, vitest_1.it)('自定义组合：capabilities 精确匹配 + 通用路径不过滤', function () {
        var custom = __assign(__assign({}, editions_1.EDITIONS.layer), { industries: ['legal', 'iot'], capabilities: ['legal/cases', 'legal/time', 'iot/devices'] });
        (0, vitest_1.expect)((0, editions_1.getEnabledCapabilities)(custom, 'legal')).toEqual(['legal/cases', 'legal/time']);
        (0, vitest_1.expect)((0, editions_1.getEnabledCapabilities)(custom, 'iot')).toEqual(['iot/devices']);
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/legal/cases')).toBe(true);
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/legal/cases/1')).toBe(true); // 子页面
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/legal/knowledge')).toBe(false); // 未启用
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/iot/devices')).toBe(true);
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/iot/alerts')).toBe(false);
        (0, vitest_1.expect)((0, editions_1.isPathCapabilityEnabled)(custom, '/customer/list')).toBe(true); // 通用路径不过滤
    });
});
(0, vitest_1.describe)('版别配置表（开源版）', function () {
    (0, vitest_1.it)('generic/layer 都有完整品牌配置（brandName/默认租户/主色/能力卡）', function () {
        for (var _i = 0, _a = ['generic', 'layer']; _i < _a.length; _i++) {
            var id = _a[_i];
            var e = editions_1.EDITIONS[id];
            (0, vitest_1.expect)(e.brandName).toBeTruthy();
            (0, vitest_1.expect)(e.defaultTenantCode).toBeTruthy();
            (0, vitest_1.expect)(e.primaryColor).toBeTruthy();
            (0, vitest_1.expect)(e.features.length).toBeGreaterThanOrEqual(4);
            (0, vitest_1.expect)(e.industriesText.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(e.logo).toMatch(/^\//);
        }
    });
    (0, vitest_1.it)('generic/layer 都有丰富化数据：能力卡图标 / stats / faq / cta', function () {
        for (var _i = 0, _a = ['generic', 'layer']; _i < _a.length; _i++) {
            var id = _a[_i];
            var e = editions_1.EDITIONS[id];
            for (var _b = 0, _c = e.features; _b < _c.length; _b++) {
                var f = _c[_b];
                (0, vitest_1.expect)(f.icon).toBeTruthy();
            }
            (0, vitest_1.expect)(e.stats.length).toBeGreaterThanOrEqual(3);
            for (var _d = 0, _e = e.stats; _d < _e.length; _d++) {
                var s = _e[_d];
                (0, vitest_1.expect)(s.label).toBeTruthy();
                (0, vitest_1.expect)(s.value).toBeTruthy();
            }
            (0, vitest_1.expect)(e.faq.length).toBeGreaterThanOrEqual(3);
            for (var _f = 0, _g = e.faq; _f < _g.length; _f++) {
                var q = _g[_f];
                (0, vitest_1.expect)(q.q).toBeTruthy();
                (0, vitest_1.expect)(q.a).toBeTruthy();
            }
            (0, vitest_1.expect)(e.cta.title).toBeTruthy();
            (0, vitest_1.expect)(e.cta.buttonText).toBeTruthy();
        }
    });
    (0, vitest_1.it)('行业版入口导航：layer（法律行业版）', function () {
        (0, vitest_1.expect)(editions_1.INDUSTRY_ENTRIES.map(function (e) { return e.edition; })).toEqual(['layer']);
        (0, vitest_1.expect)(editions_1.INDUSTRY_ENTRIES[0].href).toContain('layer.dev.lieshoucloud.huntercat.cn');
    });
});
(0, vitest_1.describe)('resolveEditionId（版别识别）', function () {
    (0, vitest_1.it)('VITE_EDITION 注入优先（layer）', function () {
        vitest_1.vi.stubEnv('VITE_EDITION', 'layer');
        (0, vitest_1.expect)((0, editions_1.resolveEditionId)()).toBe('layer');
    });
    (0, vitest_1.it)('非法 VITE_EDITION 回退域名推断', function () {
        vitest_1.vi.stubEnv('VITE_EDITION', 'bogus');
        vitest_1.vi.stubGlobal('window', { location: { hostname: 'layer.dev.lieshoucloud.huntercat.cn' } });
        (0, vitest_1.expect)((0, editions_1.resolveEditionId)()).toBe('layer');
    });
    (0, vitest_1.it)('无 env：按域名推断 layer；未知域名 → generic', function () {
        vitest_1.vi.stubGlobal('window', { location: { hostname: 'layer.dev.lieshoucloud.huntercat.cn' } });
        (0, vitest_1.expect)((0, editions_1.resolveEditionId)()).toBe('layer');
        vitest_1.vi.stubGlobal('window', { location: { hostname: 'localhost' } });
        (0, vitest_1.expect)((0, editions_1.resolveEditionId)()).toBe('generic');
        vitest_1.vi.stubGlobal('window', { location: { hostname: 'dev.lieshoucloud.huntercat.cn' } });
        (0, vitest_1.expect)((0, editions_1.resolveEditionId)()).toBe('generic');
    });
});
(0, vitest_1.describe)('editionConfigFromTenant（登录响应版别 → 配置）', function () {
    (0, vitest_1.it)('后端版别大写 → 对应配置', function () {
        (0, vitest_1.expect)((0, editions_1.editionConfigFromTenant)('LAYER').id).toBe('layer');
    });
    (0, vitest_1.it)('未知/空 → generic 兜底', function () {
        (0, vitest_1.expect)((0, editions_1.editionConfigFromTenant)('UNKNOWN').id).toBe('generic');
        (0, vitest_1.expect)((0, editions_1.editionConfigFromTenant)(null).id).toBe('generic');
        (0, vitest_1.expect)((0, editions_1.editionConfigFromTenant)(undefined).id).toBe('generic');
    });
});
(0, vitest_1.describe)('功能裁剪（hiddenMenus）', function () {
    (0, vitest_1.it)('layer（法律版）隐藏通用业务模块，保留用户中心（ADR-0035/0036）', function () {
        var expected = ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'];
        (0, vitest_1.expect)(editions_1.EDITIONS.layer.hiddenMenus).toEqual(expected);
        (0, vitest_1.expect)(editions_1.EDITIONS.layer.hiddenMenus).not.toContain('/user');
        (0, vitest_1.expect)(editions_1.EDITIONS.layer.showLegal).toBe(true);
    });
    (0, vitest_1.it)('generic 版（开源演示）裁剪闭源商业模块', function () {
        // 开源交付包不含 crm/inventory/finance/iot/legal 服务，演示端隐藏对应入口
        (0, vitest_1.expect)(editions_1.EDITIONS.generic.hiddenMenus).toEqual([
            '/customer',
            '/inventory',
            '/finance',
            '/iot',
            '/legal',
        ]);
    });
});
