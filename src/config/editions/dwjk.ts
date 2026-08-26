/**
 * 版别配置 · dwjk（客户/行业预设）
 * 客户层声明（industries: 启用的行业能力）+ 品牌/租户/裁剪。
 */
import type { EditionConfig } from './types';

export const dwjkEdition: EditionConfig = {
    id: 'dwjk',
    industries: ['iot'],
    brandName: '物联网云平台',
    slogan: '让每一座变电站都拥有智能监控底座',
    heroDesc:
      '面向电网运行企业的物联网监控平台：设备接入、遥测遥信、告警规则、运维工单，从感知到处置全链路在线。',
    logo: '/logo.png',
    primaryColor: '#1677ff',
    defaultTenantCode: 'dwjk',
    hideTenantInput: true,
    dutyConsole: true,
    allowRegister: false,
    // 电网监控版裁剪：CRM/线索/进销存/财务/审批与设备运维无关，隐藏菜单与路由（ADR-0035）
    hiddenMenus: [
      '/customer',
      '/lead',
      '/inventory',
      '/finance',
      '/approval',
      '/welcome',
      '/profile',
    ],
    industriesText: ['电网', '变电站', '配电自动化', '新能源', '电力运维', '储能电站'],
    features: [
      {
        title: '设备接入',
        desc: 'TCP / HTTP 多协议设备接入，端口即协议，秒级建连与认证。',
        done: true,
        icon: 'api',
      },
      {
        title: '遥测遥信',
        desc: '电压/电流/功率等遥测实时采集，设备影子快照与历史时序可查。',
        done: true,
        icon: 'dashboard',
      },
      {
        title: '告警规则',
        desc: '阈值越限/事件触发规则引擎，自动下发指令或回调第三方。',
        done: true,
        icon: 'alert',
      },
      {
        title: '运维工单',
        desc: '告警转工单、审批流转、处置闭环，运维过程全程留痕。',
        done: false,
        icon: 'setting',
      },
    ],
    stats: [
      { label: '设备在线率', value: '≥99.9%' },
      { label: '数据采集', value: '秒级' },
      { label: '告警响应', value: '自动' },
      { label: '运维闭环', value: '工单化' },
    ],
    faq: [
      {
        q: '支持哪些设备协议接入？',
        a: '支持二进制帧 / JSON 行两种 TCP 自定义协议与 HTTP 上报；协议 SPI 可按项目扩展新编解码器。',
      },
      {
        q: '遥测数据能存多久？',
        a: '属性时序追加式存储，预留 TimescaleDB 超表演进；按租户隔离，可随时导出。',
      },
      {
        q: '电网监控版如何开通？',
        a: '本项目为专属部署工作空间，由平台线下开通 dwjk 租户与设备凭证；不开放自助注册。',
      },
    ],
    cta: {
      title: '让每一座变电站都拥有智能监控底座',
      desc: '设备秒级接入、遥测实时可见、告警自动处置，运维全流程在线。',
      buttonText: '进入电网监控版',
    },
  };
