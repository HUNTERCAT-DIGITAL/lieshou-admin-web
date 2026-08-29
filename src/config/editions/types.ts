/**
 * 版别（Edition）类型定义 · ADR-0035 客户项目模型（2026-09 重构：客户层与行业层解耦）.
 *
 * 分层：
 *   - 行业层（LieShouCloudPro-industry 包）提供行业能力（类型/API/工作台菜单）；
 *   - 客户层（Edition）声明「启用哪些行业能力」（industries）+ 品牌 + 租户 + 裁剪 + 专属路由；
 *   - 渲染层（各端）读 Edition 装配。
 *
 * 原则：客户差异进配置层，禁止 fork 仓库 / 复制页面；
 *       Edition 不再隐含行业语义（如 legalmind 不再等于 legal），
 *       而是声明 industries: ['legal'] 并叠加客户定制。
 */
import type { ComponentType } from 'react';
import type { EditionLogin, IndustryId } from '@lieshoucloud/contract-types';

export type EditionId = 'generic' | 'layer';

export interface EditionFeature {
  title: string;
  desc: string;
  done: boolean;
  /** 能力卡图标名（见 FeatureCard ICON_MAP，缺省回退 AppstoreOutlined） */
  icon: string;
}

export interface EditionStat {
  label: string;
  value: string;
}

export interface EditionFaq {
  q: string;
  a: string;
}

export interface EditionCta {
  title: string;
  desc: string;
  buttonText: string;
}

/**
 * 客户专属路由（extraRoutes · 2026-09 客户聚合仓模式）.
 * 机制在平台（admin-web 渲染），内容由客户仓注入（
 * 客户仓 deploy 生成各端 editions/<client>.extra.ts，指向 @lieshoucloud/legalmind 客户包）。
 */
export interface EditionExtraRoute {
  path: string;
  /** 懒加载组件工厂（客户包模块） */
  load: () => Promise<{ default: ComponentType }>;
  /**
   * 客户版菜单声明（后续客户仓注入到菜单）。
   * group 可选：同 group 的菜单项收进分组子菜单（复用 ProLayout group 渲染，2026-10 菜单治理）；
   * 缺省 group 则平铺为一级菜单。
   */
  menu?: { name: string; icon?: string; order?: number; group?: string };
  /** 权限码（缺省 = 登录可见） */
  accessKey?: string;
}

/**
 * 顶栏提醒（客户仓注入 · 2026-10 账龄预警等）.
 * load 返回提醒数（>0 显示红点）；点击跳 href；轮询刷新。
 */
export interface EditionAlert {
  /** 提醒名（按钮 title / aria-label） */
  label: string;
  /** 点击跳转路径 */
  href: string;
  /** 加载提醒数（0 = 不显示红点；失败静默为 0） */
  load: () => Promise<number>;
  /** 轮询间隔 ms（缺省 60_000） */
  pollMs?: number;
}

export interface EditionConfig {
  id: EditionId;
  /** 门户/登录品牌名（如「LieShouCloud · 开源版」） */
  brandName: string;
  /** 版权署名的公司主体（缺省回退 brandName；如凌科安时律师事务所） */
  companyName?: string;
  /** Hero 大标题 */
  slogan: string;
  /** Hero 副文案 */
  heroDesc: string;
  /** logo 相对路径（public/ 下） */
  logo: string;
  /** 主色（antd 色值，用于 Hero 渐变 / 按钮） */
  primaryColor: string;
  /** 登录页预填的默认租户编码 */
  defaultTenantCode: string;
  /** 登录/注册后默认落地页（客户版可经 Edition.homePath 定制 · 2026-10 菜单治理配套） */
  homePath?: string;
  /**
   * 启用的行业能力（客户层 ↔ 行业层解耦契约 · 2026-09）。
   * 行业能力来自 LieShouCloudPro-industry 包；此处只声明启用与否，
   * 行业菜单/路由的显隐由此派生（替代旧 showLegal/eduTeacher 硬编码语义）。
   */
  industries?: IndustryId[];
  /**
   * 启用的能力清单（模块级组合 · 2026-09，缺省 = industries 对应行业全量）。
   * 约定 CapabilityId = `${industry}/${module}`（如 'legal/cases'、'iot/devices'、'edu/teacher'），
   * 与菜单路径一致（去掉前导 '/'）。可跨行业组合（如律所 + 设备监控）。
   */
  capabilities?: string[];
  /** 登录能力配置（端薄壳化 · 2026-08-29：required=false 游客直达, mode 定登录形态） */
  login?: EditionLogin;
  /**
   * 客户专属路由（客户聚合仓模式 · 2026-09）。
   * 由客户仓 deploy 生成注入（各端 editions/<client>.extra.ts），平台只渲染槽位。
   */
  extraRoutes?: EditionExtraRoute[];
  /**
   * 顶栏提醒（客户仓注入 · 2026-10 账龄预警等）。
   * 渲染在操作区（通知铃铛前），红点数量 = load() 结果，轮询刷新。
   */
  alerts?: EditionAlert[];
  /**
   * 版别专属门户（首页）组件工厂（懒加载）。
   * 缺省（undefined）用平台通用门户 GenericPortal；
   * 客户/版别可注入专属产品介绍门户（如 LieShouBoot 产品介绍页）。
   */
  portal?: { load: () => Promise<{ default: ComponentType }> };
  /** 单租户版：隐藏登录/注册表单的租户输入，固定用 defaultTenantCode（如 dwjk 电网监控版） */
  hideTenantInput?: boolean;
  /** 隐藏菜单路径前缀（如 '/customer' 隐藏 CRM 菜单与路由；ADR-0035 配置层裁剪） */
  hiddenMenus?: string[];
  /**
   * 值班员控制台模式：登录直进工作台、隐藏个人中心/审批铃铛、工作台只展示
   * 行业版核心看板（dwjk 电网监控）。替代布局/页面层 `getEdition().id === 'dwjk'` 硬编码。
   */
  dutyConsole?: boolean;
  /**
   * 教育供应商模式（zhiye · B2B2C）：CRM 客户表单/详情显示合作伙伴扩展字段
   * （办学资质/合作区域/协议/结算周期），商品表单显示课程产品扩展字段（课时包/教案/年龄/班型）。
   */
  eduSupplier?: boolean;
  /**
   * 师资档案模块（zhiye 独有 · 智野上游师资池）：开启后显示「师资档案」菜单与 /edu/** 路由。
   */
  eduTeacher?: boolean;
  /** 法律能力域开关（ADR-0036）：layer/legalmind 版显示「案件管理」菜单与路由 */
  showLegal?: boolean;
  /** 功能开关：该版是否开放自助注册（律所版等可关闭） */
  allowRegister: boolean;
  /** 门户「覆盖行业」卡片 */
  industriesText: string[];
  /** 门户「核心能力」卡片 */
  features: EditionFeature[];
  /** 门户「数据统计」条（版别相关数字） */
  stats: EditionStat[];
  /** 门户「常见问题」折叠面板 */
  faq: EditionFaq[];
  /** 门户底部 CTA 横幅 */
  cta: EditionCta;
}
