/**
 * 版别（Edition）配置层 · ADR-0035 客户项目模型（2026-09 重构：客户层 ↔ 行业层解耦）.
 *
 * - 客户差异进配置层，禁止 fork 仓库 / 复制页面；
 * - 每客户/每预设一个文件（config/editions/<id>.ts），本文件聚合 + 提供解析工具；
 * - Edition.industries（IndustryId[]）声明启用的行业能力（来自 industry 包），
 *   行业菜单/路由显隐由 `getEditionIndustries` 派生。
 *
 * 版别识别优先级：
 *   1. VITE_EDITION 构建期注入（docker-compose 各行业版覆盖文件设置，正式部署）
 *   2. 域名推断（legalmind./layer./zhiye./jmzz./dwjk. 前缀，dev 环境兜底）
 *   3. generic（通用版，本地 localhost 默认）
 *
 * 登录响应中的 tenantEdition（后端权威）存 session，用于登录后的品牌展示；
 * 门户/登录页展示用部署版别（本配置）。
 */
import type { IndustryId } from '@lieshoucloud/types';

import { genericEdition } from './generic';
import { layerEdition } from './layer';
import type { EditionConfig, EditionId } from './types';

export type { EditionConfig, EditionCta, EditionExtraRoute, EditionFaq, EditionFeature, EditionId, EditionStat } from './types';

/** 部署版别环境变量（构建期注入，如 VITE_EDITION=zhiye） */
const EDITION_ENV_KEY = 'VITE_EDITION';

export const EDITIONS: Record<EditionId, EditionConfig> = {
  generic: genericEdition,
  layer: layerEdition,
};

/** 从 VITE_EDITION 环境变量解析版别（非法值回退 undefined → 继续走域名推断） */
function editionFromEnv(): EditionId | null {
  const v = import.meta.env?.[EDITION_ENV_KEY] as string | undefined;
  if (v && v in EDITIONS) return v as EditionId;
  return null;
}

/** 从域名推断版别（legalmind./layer./zhiye./dwjk. 前缀 或 .jmzz. 中缀 → 对应版；其余 generic）
 *
 * 注：jmzz 入口 2026-08-25 起为 `dev.jmzz.lieshoucloud.huntercat.cn`（中缀形式），
 * 旧前缀 `jmzz.` 一并兼容；layer/zhiye 仍为前缀形式。 */
function editionFromHostname(host: string): EditionId {
  if (host.startsWith('layer.')) return 'layer';
  return 'generic';
}

/** 解析当前部署版别（env 优先 → 域名推断 → generic） */
export function resolveEditionId(): EditionId {
  return (
    editionFromEnv() ??
    (typeof window === 'undefined' ? 'generic' : editionFromHostname(window.location.hostname))
  );
}

/** 当前部署版别配置（门户/登录页展示用） */
export function getEdition(): EditionConfig {
  return EDITIONS[resolveEditionId()];
}

/**
 * 客户版别启用的行业能力（客户层 ↔ 行业层解耦入口 · 2026-09）。
 * 替代旧的 showLegal/eduTeacher 硬编码行业语义——行业显隐统一由
 * Edition.industries 派生；功能级增强开关（eduSupplier/dutyConsole 等）保留在配置里。
 */
export function getEditionIndustries(edition: EditionConfig): IndustryId[] {
  return edition.industries ?? [];
}

/**
 * 客户在某行业启用的能力清单（模块级组合 · 2026-09）。
 * - capabilities 已声明 → 精确匹配该行业子集；
 * - 未声明（null）→ 行业全量。
 */
export function getEnabledCapabilities(edition: EditionConfig, industry: string): string[] | null {
  const caps = edition.capabilities ?? [];
  if (caps.length === 0) return null;
  return caps.filter((c) => c.startsWith(`${industry}/`));
}

/** 某菜单路径是否被客户能力裁剪（行业子集声明时按能力前缀匹配） */
export function isPathCapabilityEnabled(edition: EditionConfig, path: string): boolean {
  const seg = path.split('/');
  const industry = seg[1]; // '/legal/cases' → 'legal'
  if (!industry || !['legal', 'iot', 'edu'].includes(industry)) return true; // 通用路径不过滤
  const caps = getEnabledCapabilities(edition, industry);
  if (caps === null) return true; // 行业全量
  return caps.some((c) => path === `/${c}` || path.startsWith(`/${c}/`));
}

/**
 * 版别隐藏菜单前缀：配置 hiddenMenus + 条件性隐藏（ADR-0035 配置层）.
 *
 * 例如非 zhiye 版别（未开启 eduTeacher）→ 师资档案 /edu 菜单与路由一并隐藏。
 */
export function getEditionHiddenMenus(edition: EditionConfig): string[] {
  const extra: string[] = [];
  if (!edition.eduTeacher) extra.push('/edu');
  return [...(edition.hiddenMenus ?? []), ...extra];
}

/** 后端返回的租户版别（TokenResponse.tenantEdition）→ 前端配置（未知回退 generic） */
export function editionConfigFromTenant(tenantEdition?: string | null): EditionConfig {
  const id = (tenantEdition ?? '').toLowerCase();
  return id in EDITIONS ? EDITIONS[id as EditionId] : EDITIONS.generic;
}

/**
 * 客户仓注入的 Edition 增强（extraRoutes 等 · 2026-09 客户聚合仓模式）.
 * 独立仓库（无客户仓）glob 不匹配 → 空；客户仓 deploy:prepare 生成 `*.extra.ts` 后自动合并。
 */
const EXTRA_MODULES = import.meta.glob<{ default?: Partial<EditionConfig> }>('./*.extra.ts', {
  eager: true,
});

export function getExtraEdition(): Partial<EditionConfig> {
  return Object.values(EXTRA_MODULES)
    .map((m) => m.default ?? {})
    .reduce<Partial<EditionConfig>>((acc, cur) => ({ ...acc, ...cur }), {});
}

/** 行业版入口导航（通用门户用）：指向各行业版域名 */
export interface IndustryEntry {
  edition: EditionId;
  name: string;
  desc: string;
  href: string;
}

export const INDUSTRY_ENTRIES: IndustryEntry[] = [
  {
    edition: 'layer',
    name: '法律行业版',
    desc: '律所 / 事务所办案数字化',
    href: 'https://layer.dev.lieshoucloud.huntercat.cn',
  },
];
