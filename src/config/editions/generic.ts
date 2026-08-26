/**
 * 版别配置 · generic（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const genericEdition: EditionConfig = {
    id: 'generic',
    industries: [],
    brandName: '猎手云 Pro',
    slogan: '让每一家企业都拥有自己的数字化平台',
    heroDesc:
      '多租户 SaaS 平台：线下成交 → 一键开租户 → 客户在租户内使用业务全流程数字化模块。一个平台，服务所有客户。',
    logo: '/logo.png',
    primaryColor: '#1677ff',
    defaultTenantCode: 'jxlkas',
    allowRegister: true,
    industriesText: ['诊所·药店', '新零售·商超', '制衣·制造', '代账·财税', '教育机构', '律所·事务所'],
    features: [
      {
        title: '多租户',
        desc: '客户线下成交后一键开租户，数据按租户隔离，独立运营自己的业务。',
        done: true,
        icon: 'cluster',
      },
      {
        title: '完整认证',
        desc: '账号密码 / 短信 / 邮箱验证码登录，注册、忘记密码、邀请加入，获客零门槛。',
        done: true,
        icon: 'safety',
      },
      {
        title: '权限体系',
        desc: '平台管理员 / 租户管理员 / 普通用户三级角色，管理操作安全可控。',
        done: true,
        icon: 'team',
      },
      {
        title: '业务模块（规划）',
        desc: 'CRM 客户管理、进销存、财务记账、数据看板即将上线，一体化经营。',
        done: false,
        icon: 'appstore',
      },
    ],
    stats: [
      { label: '已上线模块', value: '8+' },
      { label: '覆盖行业', value: '6+' },
      { label: '多端支持', value: '4' },
      { label: '数据隔离', value: '100%' },
    ],
    faq: [
      {
        q: '猎手云 Pro 是什么？',
        a: '面向 B 端的多租户 SaaS 平台：客户线下成交后，平台一键开租户，客户在租户内使用 CRM、进销存、财务等数字化模块。',
      },
      {
        q: '如何开通并使用？',
        a: '通用版支持自助开通：门户/登录页「免费开通」→ 填写租户与管理员 → 立即创建租户并登录；也可在登录页注册体验（通用版默认租户 jxlkas）。',
      },
      {
        q: '多租户数据安全吗？',
        a: '租户间数据行级隔离 + 应用层强制过滤，跨租户访问返回 404；关键操作全程审计日志，可追溯。',
      },
      {
        q: '支持哪些端？',
        a: 'Web 管理台、桌面客户端、移动 App、微信小程序四端同步，随时随地处理业务。',
      },
    ],
    cta: {
      title: '立即开启你的数字化平台',
      desc: '从开租户到团队上线，最快当天跑通第一个业务。',
      buttonText: '免费注册体验',
    },
  };
