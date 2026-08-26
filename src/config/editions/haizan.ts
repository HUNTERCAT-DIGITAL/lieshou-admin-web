/**
 * 版别配置 · haizan（客户：深圳海赞数字智能科技 · 集团投资管理门户）.
 * 定位：投资管理门户，不涉子公司业务系统（各子公司各自维护现有版别/独立域名）。
 * industries 为空 = 纯门户版别；业务菜单全部裁剪，仅保留集团专属路由（extraRoutes 注入）。
 */
import type { EditionConfig } from './types';

export const haizanEdition: EditionConfig = {
  id: 'haizan',
  brandName: '海赞集团 · 投资管理',
  companyName: '深圳海赞数字智能科技有限公司',
  slogan: '洞察布局，让投资更有远见',
  heroDesc: '深圳海赞数字智能科技有限公司（集团）投资管理门户：被投企业档案、投资组合、投后概览一站式掌握；旗下企业独立运营、独立入口。',
  logo: '/logo.png',
  primaryColor: '#02429B',
  defaultTenantCode: 'haizan',
  allowRegister: false,
  // 纯投资管理门户：隐藏全部业务菜单（子公司业务各自独立）
  hiddenMenus: [
    '/customer',
    '/lead',
    '/contact',
    '/contract',
    '/member',
    '/quality',
    '/inventory',
    '/finance',
    '/approval',
    '/legal',
    '/iot',
    '/edu',
    '/welcome',
    '/profile',
  ],
  industriesText: ['股权投资', '投后管理', '集团管控', '数字化投资'],
  features: [
    { title: '投资组合', desc: '被投企业档案与持股台账，一览集团版图。', done: true, icon: 'cluster' },
    { title: '投后概览', desc: '按行业/城市聚合的被投企业统计看板。', done: true, icon: 'dashboard' },
    { title: '独立入口', desc: '旗下企业各自独立域名独立运营，门户统一导航。', done: true, icon: 'link' },
    { title: '投后管理（规划）', desc: '经营数据回传、投后里程碑跟踪。', done: false, icon: 'fund' },
  ],
  stats: [
    { label: '被投企业', value: '7' },
    { label: '涉足行业', value: '4+' },
    { label: '覆盖城市', value: '5' },
    { label: '独立入口', value: '7' },
  ],
  faq: [
    { q: '这个门户是给谁用的？', a: '海赞集团投资管理团队：查看被投企业档案、投资组合与投后概览；不介入子公司业务系统。' },
    { q: '子公司如何访问各自系统？', a: '各子公司独立域名独立入口（如 zhiye.* / legalmind.*），在门户导航中统一罗列。' },
    { q: '投资门户如何开通？', a: '集团专属部署：海赞租户 haizan，仅门户团队可见；子公司租户数据相互隔离。' },
  ],
  cta: {
    title: '海赞集团投资管理门户',
    desc: '投资版图一目了然，独立入口统一导航。',
    buttonText: '进入投资门户',
  },
};
