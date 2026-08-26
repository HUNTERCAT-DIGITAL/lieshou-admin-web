/**
 * 版别配置 · jmzz（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const jmzzEdition: EditionConfig = {
    id: 'jmzz',
    industries: [],
    brandName: '猎手云 Pro · 制造版',
    slogan: '让每一家制造企业都拥有数字化车间底座',
    heroDesc:
      '面向精密制造企业的数字化运营平台：物料管理、出入库、生产订单、质检追溯，从接单到交付全链路在线。',
    logo: '/logo.png',
    primaryColor: '#fa8c16',
    defaultTenantCode: 'jmzz',
    allowRegister: false,
    industriesText: ['精密加工', '电子制造', '模具注塑', '五金冲压', '装备制造', '汽配零部件'],
    features: [
      {
        title: '物料管理',
        desc: 'BOM 与物料档案，库存实时可查，安全库存预警。',
        done: true,
        icon: 'database',
      },
      {
        title: '出入库',
        desc: '采购入库 / 领料出库扫码作业，库存流水可追溯。',
        done: true,
        icon: 'swap',
      },
      {
        title: '生产订单',
        desc: '接单 → 排产 → 报工 → 入库，订单进度透明。',
        done: true,
        icon: 'setting',
      },
      {
        title: '质检追溯',
        desc: '来料/制程/成品检验记录，批次追溯一键定位。',
        done: true,
        icon: 'experiment',
      },
    ],
    stats: [
      { label: '车间环节在线', value: '5' },
      { label: '库存实时', value: '100%' },
      { label: '批次追溯', value: '100%' },
      { label: '低库存预警', value: '自动' },
    ],
    faq: [
      {
        q: '支持批次追溯吗？',
        a: '支持。采购批次入库到成品出库全程关联，质检异常可一键定位到批次与供应商。',
      },
      {
        q: '能对接现有 ERP 吗？',
        a: '开放标准 API 与 CSV 导入导出，可与主流 ERP / 财务软件对接；具体方案可联系平台评估。',
      },
      {
        q: '制造版如何开通？',
        a: '联系平台开通 jmzz 租户，管理员邀请团队成员加入；制造版暂不开放自助注册。',
      },
    ],
    cta: {
      title: '让每一家制造企业都拥有数字化车间底座',
      desc: '从接单到交付全链路在线，批次可追溯、库存可预警。',
      buttonText: '进入制造版',
    },
  };
