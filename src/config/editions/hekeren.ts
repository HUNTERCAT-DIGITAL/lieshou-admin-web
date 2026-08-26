/**
 * 版别配置 · hekeren（客户：上海何可人传媒 · 传媒内容行业）.
 */
import type { EditionConfig } from './types';

export const hekerenEdition: EditionConfig = {
  id: 'hekeren',
  brandName: '何可人传媒',
  companyName: '上海何可人传媒有限公司',
  slogan: '让好内容被看见',
  heroDesc: '上海何可人传媒有限公司（海赞集团旗下）：内容制作、媒体运营、广告营销，一站式内容服务交付。',
  logo: '/logo.png',
  primaryColor: '#eb2f96',
  defaultTenantCode: 'hekeren',
  allowRegister: false,
  industriesText: ['内容制作', '媒体运营', '广告营销', '品牌传播'],
  features: [
    { title: '内容制作', desc: '视频/图文/直播内容策划与制作。', done: true, icon: 'video-camera' },
    { title: '媒体运营', desc: '多平台账号矩阵运营与增长。', done: true, icon: 'share-alt' },
    { title: '广告营销', desc: '投放策划、效果追踪与复盘。', done: true, icon: 'bulb' },
    { title: '品牌传播（规划）', desc: 'IP 打造与整合传播。', done: false, icon: 'crown' },
  ],
  stats: [
    { label: '业务类型', value: '3' },
    { label: '内容渠道', value: '多平台' },
    { label: '交付看板', value: '在线' },
    { label: '项目复盘', value: '可溯' },
  ],
  faq: [
    { q: '这个门户是给谁用的？', a: '何可人传媒（海赞集团旗下）：内容项目与媒体运营交付管理。' },
    { q: '提供哪些服务？', a: '内容制作、媒体运营、广告营销三类业务统一看板。' },
    { q: '如何开通？', a: '专属部署：何可人租户，内容项目与渠道数据独立管理。' },
  ],
  cta: {
    title: '何可人传媒 · 内容服务',
    desc: '制作 / 运营 / 投放，一站式内容交付。',
    buttonText: '进入传媒业务',
  },
};
