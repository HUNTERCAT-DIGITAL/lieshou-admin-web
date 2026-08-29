/**
 * 管理后台 · 版别（Edition）类型定义 · 端自身骨架
 * 客户差异进配置层：VITE_EDITION 构建期注入 + 端内 EditionConfig 最小集。
 * 待上游统一重构后，与客户注入槽位（extraRoutes）一并对齐共享契约。
 */
import type { ComponentType } from 'react';

export interface EditionLoginConfig {
  /** false = 游客直达（跳过登录） */
  required?: boolean;
  /** 登录形态：password 账号密码（骨架先实现 password） */
  mode?: 'password' | 'code';
}

/** 客户注入路由（懒加载组件工厂 · 对齐 admin-web 既有 extraRoutes React 语义） */
export interface EditionExtraRoute {
  path: string;
  load: () => Promise<{ default: ComponentType }>;
  title?: string;
  /** true = 独立页（不带布局，如外部落地页） */
  standalone?: boolean;
}

export interface EditionConfig {
  id: string;
  /** 品牌名（登录页/启动页展示） */
  brandName: string;
  /** 品牌标语 */
  slogan?: string;
  /** 品牌 logo（public 资源路径） */
  logo?: string;
  /** 登录默认租户（缺省 default） */
  tenantCode?: string;
  /** 登录能力配置 */
  login?: EditionLoginConfig;
  /** 客户注入路由 */
  extraRoutes?: EditionExtraRoute[];
}
