/**
 * 版别配置层单测（ADR-0035 · edition config · 开源版 generic/layer）.
 *
 * 注：客户版别（dwjk/haizan/hekeren/huntercat/jmzz/legalmind/linkesecurity/zhiye）
 * 已在开源化时剥离（2026-08），相关测试随客户仓。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { EditionConfig } from '../editions';
import { EDITIONS, editionConfigFromTenant, getEnabledCapabilities, isPathCapabilityEnabled, resolveEditionId, INDUSTRY_ENTRIES } from '../editions';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('能力组合（capabilities 模块级 · 跨行业）', () => {
  it('layer 声明 industries 但未声明 capabilities → 行业全量（不过滤）', () => {
    expect(getEnabledCapabilities(EDITIONS.layer, 'legal')).toBeNull();
    expect(isPathCapabilityEnabled(EDITIONS.layer, '/legal/cases')).toBe(true);
  });

  it('自定义组合：capabilities 精确匹配 + 通用路径不过滤', () => {
    const custom: EditionConfig = {
      ...EDITIONS.layer,
      industries: ['legal', 'iot'],
      capabilities: ['legal/cases', 'legal/time', 'iot/devices'],
    };
    expect(getEnabledCapabilities(custom, 'legal')).toEqual(['legal/cases', 'legal/time']);
    expect(getEnabledCapabilities(custom, 'iot')).toEqual(['iot/devices']);
    expect(isPathCapabilityEnabled(custom, '/legal/cases')).toBe(true);
    expect(isPathCapabilityEnabled(custom, '/legal/cases/1')).toBe(true); // 子页面
    expect(isPathCapabilityEnabled(custom, '/legal/knowledge')).toBe(false); // 未启用
    expect(isPathCapabilityEnabled(custom, '/iot/devices')).toBe(true);
    expect(isPathCapabilityEnabled(custom, '/iot/alerts')).toBe(false);
    expect(isPathCapabilityEnabled(custom, '/customer/list')).toBe(true); // 通用路径不过滤
  });
});

describe('版别配置表（开源版）', () => {
  it('generic/layer 都有完整品牌配置（brandName/默认租户/主色/能力卡）', () => {
    for (const id of ['generic', 'layer'] as const) {
      const e = EDITIONS[id];
      expect(e.brandName).toBeTruthy();
      expect(e.defaultTenantCode).toBeTruthy();
      expect(e.primaryColor).toBeTruthy();
      expect(e.features.length).toBeGreaterThanOrEqual(4);
      expect(e.industriesText.length).toBeGreaterThan(0);
      expect(e.logo).toMatch(/^\//);
    }
  });

  it('generic/layer 都有丰富化数据：能力卡图标 / stats / faq / cta', () => {
    for (const id of ['generic', 'layer'] as const) {
      const e = EDITIONS[id];
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

  it('行业版入口导航：layer（法律行业版）', () => {
    expect(INDUSTRY_ENTRIES.map((e) => e.edition)).toEqual(['layer']);
    expect(INDUSTRY_ENTRIES[0].href).toContain('layer.dev.lieshoucloud.huntercat.cn');
  });
});

describe('resolveEditionId（版别识别）', () => {
  it('VITE_EDITION 注入优先（layer）', () => {
    vi.stubEnv('VITE_EDITION', 'layer');
    expect(resolveEditionId()).toBe('layer');
  });

  it('非法 VITE_EDITION 回退域名推断', () => {
    vi.stubEnv('VITE_EDITION', 'bogus');
    vi.stubGlobal('window', { location: { hostname: 'layer.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('layer');
  });

  it('无 env：按域名推断 layer；未知域名 → generic', () => {
    vi.stubGlobal('window', { location: { hostname: 'layer.dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('layer');
    vi.stubGlobal('window', { location: { hostname: 'localhost' } });
    expect(resolveEditionId()).toBe('generic');
    vi.stubGlobal('window', { location: { hostname: 'dev.lieshoucloud.huntercat.cn' } });
    expect(resolveEditionId()).toBe('generic');
  });
});

describe('editionConfigFromTenant（登录响应版别 → 配置）', () => {
  it('后端版别大写 → 对应配置', () => {
    expect(editionConfigFromTenant('LAYER').id).toBe('layer');
  });

  it('未知/空 → generic 兜底', () => {
    expect(editionConfigFromTenant('UNKNOWN').id).toBe('generic');
    expect(editionConfigFromTenant(null).id).toBe('generic');
    expect(editionConfigFromTenant(undefined).id).toBe('generic');
  });
});

describe('功能裁剪（hiddenMenus）', () => {
  it('layer（法律版）隐藏通用业务模块，保留用户中心（ADR-0035/0036）', () => {
    const expected = ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'];
    expect(EDITIONS.layer.hiddenMenus).toEqual(expected);
    expect(EDITIONS.layer.hiddenMenus).not.toContain('/user');
    expect(EDITIONS.layer.showLegal).toBe(true);
  });

  it('generic 版（开源演示）裁剪闭源商业模块', () => {
    // 开源交付包不含 crm/inventory/finance/iot/legal 服务，演示端隐藏对应入口
    expect(EDITIONS.generic.hiddenMenus).toEqual([
      '/customer',
      '/inventory',
      '/finance',
      '/iot',
      '/legal',
    ]);
  });
});
