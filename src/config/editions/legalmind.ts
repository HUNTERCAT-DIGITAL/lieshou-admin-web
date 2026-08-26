/**
 * 版别配置 · legalmind（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const legalmindEdition: EditionConfig = {
    id: 'legalmind',
    industries: ['legal'],
    // LegalMind Unity · 智法云枢（凌科安时联合定制版 · ADR-0036 · 2026-08-24）
    brandName: 'LegalMind · 智法云枢',
    companyName: '江西凌科安时律师事务所',
    slogan: '律师成长操作系统',
    heroDesc:
      'LM Unity · Counsel —— 让专业沉淀，让卓越生长；每一次真实工作沉淀为能力，每一次持续精进汇聚成卓越。',
    logo: '/logo-legalmind.png', // LegalMind Unity mark（legalmind-unity-mark-v6）
    primaryColor: '#02429B', // 取自 logo 主导深蓝（智法云枢品牌蓝）
    showLegal: true,
    // 凌科安时定制：只保留律所业务（用户中心/案件管理/工作台），隐藏通用模块
    hiddenMenus: ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'],
    // 单租户（jxlkas）：登录不体现「租户」概念（律师只需账号密码）
    hideTenantInput: true,
    defaultTenantCode: 'jxlkas',
    allowRegister: false,
    industriesText: ['律师事务所', '会计师事务所', '法务咨询', '知识产权代理', '公证机构'],
    features: [
      {
        title: '案件管理',
        desc: '线索 → 委托 → 立案 → 结案全流程，承办人/协办人责任清晰。',
        done: true,
        icon: 'folder',
      },
      {
        title: '卷宗文书',
        desc: '电子卷宗归档，文书模板一键生成，版本留痕可追溯。',
        done: true,
        icon: 'file',
      },
      {
        title: '计时计费',
        desc: '律师工时记录，按小时/按件计费，账单自动生成。',
        done: true,
        icon: 'clock',
      },
      {
        title: '知识沉淀',
        desc: '每一次真实工作沉淀为能力：办案经验、文书模板、专业积累持续复用。',
        done: false,
        icon: 'audit',
      },
    ],
    stats: [
      { label: '办案环节在线', value: '4' },
      { label: '文书模板', value: '10+' },
      { label: '全程留痕', value: '100%' },
      { label: '审计可追溯', value: '100%' },
    ],
    faq: [
      {
        q: '案件数据如何隔离？',
        a: '按租户（律所）行级隔离，跨所访问返回 404；案件卷宗仅本所成员可见，审计日志全程留痕。',
      },
      {
        q: '支持计时计费吗？',
        a: '支持。律师工时记录、按小时/按件计费、账单自动生成，审批通过后自动入账。',
      },
      {
        q: 'LegalMind 如何开通？',
        a: '联系平台为律所开通专属租户（LegalMind Unity 定制版），管理员邀请团队成员加入；暂不开放自助注册（保障执业合规）。',
      },
    ],
    cta: {
      title: '让专业沉淀，让卓越生长',
      desc: '从线索到结案全流程在线，办案数据沉淀为团队能力，持续精进汇聚卓越。',
      buttonText: '进入 LegalMind',
    },
  };
