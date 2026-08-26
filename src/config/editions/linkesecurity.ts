/**
 * 版别配置 · linkesecurity（客户：深圳凌科数安科技 · 数字安全服务商）.
 * 与江西凌科安时律师事务所（legalmind）为独立主体。通用能力全开 + 专属安全服务入口（extraRoutes）。
 */
import type { EditionConfig } from './types';

export const linkesecurityEdition: EditionConfig = {
  id: 'linkesecurity',
  brandName: '凌科数安',
  companyName: '深圳凌科数安科技有限公司',
  slogan: '让每一家企业都拥有安全感',
  heroDesc: '深圳凌科数安科技有限公司（海赞集团旗下）：数字安全服务——安全评估、等保合规、渗透测试、安全运维，一站式交付。',
  logo: '/logo.png',
  primaryColor: '#1677ff',
  defaultTenantCode: 'linkesecurity',
  allowRegister: false,
  industriesText: ['网络安全', '等保合规', '渗透测试', '安全运维'],
  features: [
    { title: '安全评估', desc: '企业安全基线评估与风险清单。', done: true, icon: 'safety' },
    { title: '等保合规', desc: '等保 2.0 合规差距分析与整改。', done: true, icon: 'audit' },
    { title: '渗透测试', desc: '黑盒/白盒渗透，漏洞闭环。', done: true, icon: 'bug' },
    { title: '安全运维（规划）', desc: '7x24 安全监控与应急响应。', done: false, icon: 'alert' },
  ],
  stats: [
    { label: '服务类型', value: '4' },
    { label: '风险闭环', value: '100%' },
    { label: '等保支持', value: '2.0' },
    { label: '交付看板', value: '在线' },
  ],
  faq: [
    { q: '这个门户是给谁用的？', a: '凌科数安科技（海赞集团旗下）：数字安全服务交付管理；与凌科安时律所（legalmind）为独立主体。' },
    { q: '提供哪些安全服务？', a: '安全评估、等保合规、渗透测试、安全运维，四类服务统一交付看板。' },
    { q: '如何开通？', a: '专属部署：凌科数安租户，服务项目与客户数据独立管理。' },
  ],
  cta: {
    title: '凌科数安 · 数字安全服务',
    desc: '评估 / 等保 / 渗透 / 运维，一站式安全交付。',
    buttonText: '进入安全服务',
  },
};
