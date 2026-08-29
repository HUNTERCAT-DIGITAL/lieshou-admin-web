/**
 * 版别配置 · generic（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const genericEdition: EditionConfig = {
    id: 'generic',
    industries: [],
    // 开源交付包只提供开源服务模块（user/admin/auth/approval + 基础）；
    // CRM/进销存/财务/IoT/案件等闭源商业模块不在交付包内，演示端隐藏入口（gateway 侧同步配置开关）
    hiddenMenus: ['/customer', '/inventory', '/finance', '/iot', '/legal'],
    brandName: 'LieShouCloud',
    slogan: '开源的数字化平台 · 全栈演示项目',
    heroDesc:
      'LieShouCloud（猎手云）开源版演示项目：多租户 SaaS 数字化平台，前后端全栈开源（Apache-2.0），支持 Web / 桌面 / 移动 / 小程序四端，一键自部署即可体验。',
    logo: '/logo.png',
    primaryColor: '#1677ff',
    defaultTenantCode: 'default',
    // 上游薄壳化(2026-08-29): generic 登录后落地引用包介绍页
    homePath: '/about',
    login: { required: true, mode: 'password' },
    allowRegister: true,
    industriesText: ['多租户 SaaS', 'CRM 客户管理', '进销存', '财务记账', '审批流', '四端覆盖'],
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
        title: '业务模块',
        desc: '多租户开租户、RBAC 权限、审批流、审计日志等模块开箱即用；CRM/进销存/财务等商业模块可扩展接入。',
        done: true,
        icon: 'appstore',
      },
    ],
    stats: [
      { label: '开源组件仓', value: '16' },
      { label: '后端服务', value: '5' },
      { label: '多端支持', value: '4' },
      { label: '开源协议', value: 'Apache-2.0' },
    ],
    faq: [
      {
        q: 'LieShouCloud 是什么？',
        a: 'LieShouCloud（猎手云）是开源的数字化平台演示项目：多租户 SaaS 底座 + 租户/用户/RBAC/审批流/审计等模块，前后端代码全部开源（Apache-2.0），可一键自部署；CRM/进销存/财务等商业模块可扩展接入。',
      },
      {
        q: '如何体验？',
        a: '开源版支持自助开通：门户/登录页「免费开通」→ 填写租户与管理员 → 立即创建租户并登录；也可在登录页注册体验（默认租户 default）。',
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
      title: '立即体验开源演示',
      desc: '从开租户到跑通第一个业务，最快当天完成，全部开源可自部署。',
      buttonText: '免费注册体验',
    },
  };
