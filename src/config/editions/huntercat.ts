/**
 * 版别配置 · huntercat（客户：南昌猎手猫数字科技 · 猎手云平台厂商 + 数字化服务商）.
 * 平台厂商身份 → 全能力可见（不裁剪）；服务商专属入口由 extraRoutes 注入。
 */
import type { EditionConfig } from './types';

export const huntercatEdition: EditionConfig = {
  id: 'huntercat',
  brandName: '猎手猫数字',
  companyName: '南昌猎手猫数字科技有限公司',
  slogan: '让每一家企业都拥有自己的数字化平台',
  heroDesc: '猎手云平台厂商（HUNTERCAT-DIGITAL）· 海赞集团旗下数字化服务商：完整平台能力 + 客户实施交付管理。',
  logo: '/logo.png',
  primaryColor: '#1677ff',
  defaultTenantCode: 'huntercat',
  allowRegister: false,
  industriesText: ['数字化平台', 'SaaS 实施', '行业解决方案', '定制开发'],
  features: [
    { title: '完整平台', desc: 'CRM/进销存/财务/审批 + edu/legal/iot 全行业能力。', done: true, icon: 'appstore' },
    { title: '服务交付', desc: '实施项目、交付单、客户成功管理一站式。', done: true, icon: 'tool' },
    { title: '多行业样板', desc: '教育/法律/物联网行业版预设部署入口。', done: true, icon: 'cluster' },
    { title: '定制开发（规划）', desc: '客户专属增量包交付（客户聚合仓模式）。', done: false, icon: 'code' },
  ],
  stats: [
    { label: '行业能力', value: '3' },
    { label: '多端支持', value: '4' },
    { label: '客户交付', value: '样板' },
    { label: '平台演进', value: 'Bottom-Up' },
  ],
  faq: [
    { q: '这个门户是给谁用的？', a: '猎手猫（平台厂商 + 数字化服务商）：平台全能力 + 客户实施交付管理；行业版由预设部署入口进入。' },
    { q: '平台能力有哪些？', a: 'CRM、进销存、财务、审批 + 教育/法律/物联网行业能力，四端（admin-web/mobile/mini-program/desktop）。' },
    { q: '如何交付新客户？', a: '客户聚合仓模式：每客户一个交付仓（submodule pin + 增量包 + 注入），零 fork 零合并地狱。' },
  ],
  cta: {
    title: '猎手猫 · 数字化服务',
    desc: '完整平台能力 + 客户实施交付，一站式。',
    buttonText: '进入服务交付',
  },
};
