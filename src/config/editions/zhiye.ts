/**
 * 版别配置 · zhiye（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const zhiyeEdition: EditionConfig = {
    id: 'zhiye',
    industries: ['edu'],
    // 深圳市智野教育科技有限公司 · 青少年科技教育（B2B2C：上游师资/课程供应商 ↔ 有办学资质合作伙伴）
    brandName: '智野教育 · 青少年科技教育',
    slogan: '师资与课程，支撑每一家有资质的合作伙伴',
    heroDesc:
      '青少年科技教育 B2B2C 协同平台：智野教育作为上游供应商，输出标准师资与课程产品；与有办学资质的合作伙伴共建——伙伴负责招生、教学、收费，智野负责师资供给、课程研发与供应协同。',
    logo: '/logo.png', // [TODO: 智野 logo 待提供，替换 public/ 下文件]
    primaryColor: '#13c2c2', // [TODO: 智野品牌主色待确认，默认沿用教育青]
    defaultTenantCode: 'zhiye',
    allowRegister: true,
    eduSupplier: true,
    eduTeacher: true,
    industriesText: ['青少年科技教育', '机器人编程', '少儿编程', '科学实验', '创客教育', '素质教育'],
    features: [
      {
        title: '合作伙伴',
        desc: '机构资质、办学许可、合作区域与协议台账，伙伴准入清晰可控。',
        done: true,
        icon: 'team',
      },
      {
        title: '师资档案',
        desc: '师资档案、资质证书、课时产能统一管理，供应资源一目了然。',
        done: true,
        icon: 'idcard',
      },
      {
        title: '课程产品',
        desc: '课程体系、课时包、标准教案产品化，向合作伙伴稳定输出。',
        done: true,
        icon: 'file',
      },
      {
        title: '供应结算',
        desc: '课程采购、师资派遣、课时消耗全程留痕，按合作周期自动对账。',
        done: false,
        icon: 'account-book',
      },
    ],
    stats: [
      { label: '供应链路环节', value: '4' },
      { label: '师资课程标准化', value: '100%' },
      { label: '伙伴资质存档', value: '100%' },
      { label: '供应对账', value: '自动' },
    ],
    faq: [
      {
        q: '这个系统是给谁用的？',
        a: '给智野教育及其合作伙伴使用：智野作为上游供应商管理师资与课程，有办学资质的合作伙伴负责招生、教学与收费，双方在平台上协同。',
      },
      {
        q: '合作伙伴怎么加入？',
        a: '由智野教育为合作机构开通专属租户并录入资质（办学许可等）；伙伴在各自工作区内完成招生、教学与收费的日常运营。',
      },
      {
        q: '供应结算怎么做？',
        a: '课程采购、师资派遣、课时消耗全程留痕，支持按合作周期自动对账；财务模块上线后账单自动生成、双向可查。',
      },
    ],
    cta: {
      title: '上游供应 · 伙伴协同',
      desc: '师资与课程标准化输出，伙伴资质可溯，供应结算清晰可对账。',
      buttonText: '进入智野教育',
    },
  };
