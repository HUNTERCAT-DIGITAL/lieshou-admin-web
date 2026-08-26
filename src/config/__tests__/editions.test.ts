/**
 * 版别配置层单测（ADR-0035 · edition config）.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EDITIONS, editionConfigFromTenant, resolveEditionId, INDUSTRY_ENTRIES } from '../editions';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('版别配置表', () => {
  it('五个版别都有完整品牌配置（brandName/默认租户/主色/能力卡）', () => {
    for (const id of ['generic', 'layer', 'zhiye', 'jmzz', 'legalmind'] as const) {
      const e = EDITIONS[id];
      expect(e.brandName).toBeTruthy();
      expect(e.defaultTenantCode).toBeTruthy();
      expect(e.primaryColor).toBeTruthy();
      expect(e.features.length).toBeGreaterThanOrEqual(4);
      expect(e.industries.length).toBeGreaterThan(0);
      expect(e.logo).toMatch(/^\//);
    }
  });

  it('五个版别都有丰富化数据：能力卡图标 / stats / faq / cta', () => {
    for (const id of ['generic', 'layer', 'zhiye', 'jmzz', 'legalmind'] as const) {
      const e = EDITIONS[id];
      // 每张能力卡都配了图标
      for (const f of e.features) {
        expect(f.icon).toBeTruthy();
      }
      expect(e.stats.length).toBeGreaterThanOrEqual(3);
      for (const s of e.stats) {
        expect(s.label).toBeTruthy();
        expect(s.value).toBeTruthy();
      }
      expect(e.faq.length).toBeGreaterThanOrEqual(3);
      for (const q of e.faq) {
        expect(q.q).toBeTruthy();
        expect(q.a).toBeTruthy();
      }
      expect(e.cta.title).toBeTruthy();
      expect(e.cta.buttonText).toBeTruthy();
    }
  });

  it('行业版入口导航：三个行业版 + 各自域名', () => {
    expect(INDUSTRY_ENTRIES.map((e) => e.edition)).toEqual(['layer', 'zhiye', 'jmzz', 'dwjk']);
    for (const e of INDUSTRY_ENTRIES) {
      // layer/zhiye 前缀形式；jmzz 2026-08-25 起为 dev.jmzz. 中缀形式
      if (e.edition === 'jmzz') {
        expect(e.href).toContain('dev.jmzz.lieshoucloud.huntercat.cn');
      } else {
        expect(e.href).toContain(`${e.edition}.dev.lieshoucloud.huntercat.cn`);
      }
    }
  });
});

describe('resolveEditionId（版别识别）', () => {
  it('VITE_EDITION 注入优先（正式部署）', () => {
    vi.stubEnv('VITE_EDITION', 'legalmind');
    expect(resolveEditionId()).toBe('legalmind');
    vi.stubEnv('VITE_EDITION', 'zhiye');
    expect(resolveEditionId()).toBe('zhiye');
  });

  it('非法 VITE_EDITION 回退域名推断', () => {
    vi.stubEnv('VITE_EDITION', 'bogus');
    vi.stubGlobal('window', { location: { hostname: 'layer.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('layer');
  });

  it('无 env：按域名推断', () => {
    vi.stubGlobal('window', { location: { hostname: 'legalmind.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('legalmind');
    // jmzz 新入口为中缀形式 dev.jmzz.；旧前缀 jmzz. 仍兼容
    vi.stubGlobal('window', { location: { hostname: 'dev.jmzz.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('jmzz');
    vi.stubGlobal('window', { location: { hostname: 'jmzz.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('jmzz');
    vi.stubGlobal('window', { location: { hostname: 'zhiye.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('zhiye');
  });

  it('localhost / 未知域名 → generic', () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } });
    expect(resolveEditionId()).toBe('generic');
    vi.stubGlobal('window', { location: { hostname: 'dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('generic');
  });
});

describe('editionConfigFromTenant（登录响应版别 → 配置）', () => {
  it('后端版别大写 → 对应配置', () => {
    expect(editionConfigFromTenant('LEGALMIND').id).toBe('legalmind');
    expect(editionConfigFromTenant('ZHIYE').id).toBe('zhiye');
    expect(editionConfigFromTenant('LAYER').id).toBe('layer');
  });

  it('未知/空 → generic 兜底', () => {
    expect(editionConfigFromTenant('UNKNOWN').id).toBe('generic');
    expect(editionConfigFromTenant(null).id).toBe('generic');
    expect(editionConfigFromTenant(undefined).id).toBe('generic');
  });
});

describe('单租户版（hideTenantInput）', () => {
  it('dwjk 版隐藏租户输入并固定默认租户 dwjk', () => {
    expect(EDITIONS.dwjk.hideTenantInput).toBe(true);
    expect(EDITIONS.dwjk.defaultTenantCode).toBe('dwjk');
  });

  it('generic 版保持多租户（不隐藏租户输入）', () => {
    expect(EDITIONS.generic.hideTenantInput).toBeFalsy();
  });
});

describe('功能裁剪（hiddenMenus）', () => {
  it('dwjk 版隐藏 CRM/线索/进销存/财务/审批（电网监控无关功能）', () => {
    expect(EDITIONS.dwjk.hiddenMenus).toEqual(
      expect.arrayContaining(['/customer', '/lead', '/inventory', '/finance', '/approval']),
    );
    expect(EDITIONS.dwjk.hiddenMenus).not.toContain('/iot');
    expect(EDITIONS.dwjk.hiddenMenus).not.toContain('/audit');
  });

  it('generic 版不裁剪（多租户 SaaS 全功能）', () => {
    expect(EDITIONS.generic.hiddenMenus).toBeUndefined();
  });

  it('法律版（layer/legalmind）隐藏通用业务模块，保留案件/用户/工作台（ADR-0035/0036）', () => {
    const expected = [
      '/tenant',
      '/customer',
      '/lead',
      '/inventory',
      '/finance',
      '/approval',
      '/iot',
    ];
    expect(EDITIONS.layer.hiddenMenus).toEqual(expected);
    expect(EDITIONS.legalmind.hiddenMenus).toEqual(expected);
    // 律所业务保留：用户中心（成员管理）/ 案件管理（法律能力域）
    for (const id of ['layer', 'legalmind'] as const) {
      expect(EDITIONS[id].hiddenMenus).not.toContain('/user');
      expect(EDITIONS[id].hiddenMenus).not.toContain('/legal');
      expect(EDITIONS[id].showLegal).toBe(true);
    }
  });
});
