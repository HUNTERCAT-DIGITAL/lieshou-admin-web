/**
 * 版别配置 · layer（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const layerEdition: EditionConfig = {
    id: 'layer',
    industries: ['legal'],
    brandName: '猎手云 Pro · 法律版',
    slogan: '让每一家律所都拥有数字化办案平台',
    heroDesc:
      '面向律所与事务所的数字化协作平台：客户线索、案件管理、卷宗文书、计时计费、审批留痕，全流程在线。',
    logo: '/logo.png',
    primaryColor: '#722ed1',
    defaultTenantCode: 'layer',
    showLegal: true,
    // 法律版裁剪：与律所业务无关的通用模块隐藏（ADR-0035 配置层）；保留 用户中心/案件管理/工作台
    hiddenMenus: ['/tenant', '/customer', '/lead', '/inventory', '/finance', '/approval', '/iot'],
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
        title: '审批留痕',
        desc: '用印、减免、风险代理多级审批，全程审计可查。',
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
        q: '法律版如何开通？',
        a: '联系平台为律所开通 layer 租户，管理员邀请团队成员加入；法律版暂不开放自助注册（保障执业合规）。',
      },
    ],
    cta: {
      title: '让每一家律所都拥有数字化办案平台',
      desc: '从线索到结案全流程在线，留痕可溯、责任清晰。',
      buttonText: '进入法律版',
    },
  };
