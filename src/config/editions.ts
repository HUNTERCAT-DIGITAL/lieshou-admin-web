/**
 * 版别（Edition）配置层 · ADR-0035 客户项目模型.
 *
 * 三个行业版（layer/zhiye/jmzz）与通用版共用同一套 apps/admin 代码，
 * 门户/登录的品牌、文案、主色、默认租户、功能开关全部由本配置表驱动——
 * 「客户差异进配置层，禁止 fork 仓库 / 复制页面」。
 *
 * 版别识别优先级：
 *   1. VITE_EDITION 构建期注入（docker-compose 各行业版覆盖文件设置，正式部署）
 *   2. 域名推断（layer./zhiye./jmzz. 前缀，dev 环境兜底）
 *   3. generic（通用版，本地 localhost 默认）
 *
 * 登录响应中的 tenantEdition（后端权威）存 session，用于登录后的品牌展示；
 * 门户/登录页展示用部署版别（本配置）。
 */

export type EditionId = 'generic' | 'layer' | 'zhiye' | 'jmzz' | 'legalmind' | 'dwjk';

export interface EditionFeature {
  title: string;
  desc: string;
  done: boolean;
  /** 能力卡图标名（见 FeatureCard ICON_MAP，缺省回退 AppstoreOutlined） */
  icon: string;
}

export interface EditionStat {
  label: string;
  value: string;
}

export interface EditionFaq {
  q: string;
  a: string;
}

export interface EditionCta {
  title: string;
  desc: string;
  buttonText: string;
}

export interface EditionConfig {
  id: EditionId;
  /** 门户/登录品牌名（如「猎手云 Pro · 教育版」） */
  brandName: string;
  /** 版权署名的公司主体（缺省回退 brandName；如凌科安时律师事务所） */
  companyName?: string;
  /** Hero 大标题 */
  slogan: string;
  /** Hero 副文案 */
  heroDesc: string;
  /** logo 相对路径（public/ 下） */
  logo: string;
  /** 主色（antd 色值，用于 Hero 渐变 / 按钮） */
  primaryColor: string;
  /** 登录页预填的默认租户编码 */
  defaultTenantCode: string;
  /** 单租户版：隐藏登录/注册表单的租户输入，固定用 defaultTenantCode（如 dwjk 电网监控版） */
  hideTenantInput?: boolean;
  /** 隐藏菜单路径前缀（如 '/customer' 隐藏 CRM 菜单与路由；ADR-0035 配置层裁剪） */
  hiddenMenus?: string[];
  /**
   * 值班员控制台模式：登录直进工作台、隐藏个人中心/审批铃铛、工作台只展示
   * 行业版核心看板（dwjk 电网监控）。替代布局/页面层 `getEdition().id === 'dwjk'` 硬编码。
   */
  dutyConsole?: boolean;
  /**
   * 教育供应商模式（zhiye · B2B2C）：CRM 客户表单/详情显示合作伙伴扩展字段
   * （办学资质/合作区域/协议/结算周期），商品表单显示课程产品扩展字段（课时包/教案/年龄/班型）。
   */
  eduSupplier?: boolean;
  /**
   * 师资档案模块（zhiye 独有 · 智野上游师资池）：开启后显示「师资档案」菜单与 /edu/** 路由；
   * 其他版别默认隐藏（配置层 · ADR-0035）。
   */
  eduTeacher?: boolean;
  /** 法律能力域开关（ADR-0036）：layer/legalmind 版显示「案件管理」菜单与路由 */
  showLegal?: boolean;
  /** 功能开关：该版是否开放自助注册（律所版等可关闭） */
  allowRegister: boolean;
  /** 门户「覆盖行业」卡片 */
  industries: string[];
  /** 门户「核心能力」卡片 */
  features: EditionFeature[];
  /** 门户「数据统计」条（版别相关数字） */
  stats: EditionStat[];
  /** 门户「常见问题」折叠面板 */
  faq: EditionFaq[];
  /** 门户底部 CTA 横幅 */
  cta: EditionCta;
}

/** 部署版别环境变量（构建期注入，如 VITE_EDITION=zhiye） */
const EDITION_ENV_KEY = 'VITE_EDITION';

export const EDITIONS: Record<EditionId, EditionConfig> = {
  generic: {
    id: 'generic',
    brandName: '猎手云 Pro',
    slogan: '让每一家企业都拥有自己的数字化平台',
    heroDesc:
      '多租户 SaaS 平台：线下成交 → 一键开租户 → 客户在租户内使用业务全流程数字化模块。一个平台，服务所有客户。',
    logo: '/logo.png',
    primaryColor: '#1677ff',
    defaultTenantCode: 'jxlkas',
    allowRegister: true,
    industries: ['诊所·药店', '新零售·商超', '制衣·制造', '代账·财税', '教育机构', '律所·事务所'],
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
  },
  layer: {
    id: 'layer',
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
    industries: ['律师事务所', '会计师事务所', '法务咨询', '知识产权代理', '公证机构'],
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
  },
  legalmind: {
    id: 'legalmind',
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
    industries: ['律师事务所', '会计师事务所', '法务咨询', '知识产权代理', '公证机构'],
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
  },
  zhiye: {
    id: 'zhiye',
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
    industries: ['青少年科技教育', '机器人编程', '少儿编程', '科学实验', '创客教育', '素质教育'],
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
  },
  jmzz: {
    id: 'jmzz',
    brandName: '猎手云 Pro · 制造版',
    slogan: '让每一家制造企业都拥有数字化车间底座',
    heroDesc:
      '面向精密制造企业的数字化运营平台：物料管理、出入库、生产订单、质检追溯，从接单到交付全链路在线。',
    logo: '/logo.png',
    primaryColor: '#fa8c16',
    defaultTenantCode: 'jmzz',
    allowRegister: false,
    industries: ['精密加工', '电子制造', '模具注塑', '五金冲压', '装备制造', '汽配零部件'],
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
  },
  dwjk: {
    id: 'dwjk',
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
    industries: ['电网', '变电站', '配电自动化', '新能源', '电力运维', '储能电站'],
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
  },
};

/** 从 VITE_EDITION 环境变量解析版别（非法值回退 undefined → 继续走域名推断） */
function editionFromEnv(): EditionId | null {
  const v = import.meta.env?.[EDITION_ENV_KEY] as string | undefined;
  if (v && v in EDITIONS) return v as EditionId;
  return null;
}

/** 从域名推断版别（layer./zhiye./legalmind. 前缀 或 .jmzz. 中缀 → 对应版；其余 generic）
 *
 * 注：jmzz 入口 2026-08-25 起为 `dev.jmzz.lieshoucloud.huntercat.cn`（中缀形式），
 * 旧前缀 `jmzz.` 一并兼容；layer/zhiye 仍为前缀形式。 */
function editionFromHostname(host: string): EditionId {
  if (host.startsWith('legalmind.')) return 'legalmind';
  if (host.startsWith('layer.')) return 'layer';
  if (host.startsWith('zhiye.')) return 'zhiye';
  if (host.startsWith('jmzz.') || host.includes('.jmzz.')) return 'jmzz';
  if (host.startsWith('dwjk.')) return 'dwjk';
  return 'generic';
}

/** 解析当前部署版别（env 优先 → 域名推断 → generic） */
export function resolveEditionId(): EditionId {
  return (
    editionFromEnv() ??
    (typeof window === 'undefined' ? 'generic' : editionFromHostname(window.location.hostname))
  );
}

/** 当前部署版别配置（门户/登录页展示用） */
export function getEdition(): EditionConfig {
  return EDITIONS[resolveEditionId()];
}

/**
 * 版别隐藏菜单前缀：配置 hiddenMenus + 条件性隐藏（ADR-0035 配置层）.
 *
 * 例如非 zhiye 版别（未开启 eduTeacher）→ 师资档案 /edu 菜单与路由一并隐藏。
 */
export function getEditionHiddenMenus(edition: EditionConfig): string[] {
  const extra: string[] = [];
  if (!edition.eduTeacher) extra.push('/edu');
  return [...(edition.hiddenMenus ?? []), ...extra];
}

/** 后端返回的租户版别（TokenResponse.tenantEdition）→ 前端配置（未知回退 generic） */
export function editionConfigFromTenant(tenantEdition?: string | null): EditionConfig {
  const id = (tenantEdition ?? '').toLowerCase();
  return id in EDITIONS ? EDITIONS[id as EditionId] : EDITIONS.generic;
}

/** 行业版入口导航（通用门户用）：指向各行业版域名 */
export interface IndustryEntry {
  edition: EditionId;
  name: string;
  desc: string;
  href: string;
}

export const INDUSTRY_ENTRIES: IndustryEntry[] = [
  {
    edition: 'layer',
    name: '法律行业版',
    desc: '律所 / 事务所办案数字化',
    href: 'https://layer.dev.lieshoucloud.huntercat.cn',
  },
  {
    edition: 'zhiye',
    name: '教育行业版',
    desc: '教育机构招生与教务平台',
    href: 'https://zhiye.dev.lieshoucloud.huntercat.cn',
  },
  {
    edition: 'jmzz',
    name: '精密制造版',
    desc: '制造企业数字化车间底座',
    href: 'https://dev.jmzz.lieshoucloud.huntercat.cn',
  },
  {
    edition: 'dwjk',
    name: '电网监控版',
    desc: '变电站 / 配电物联网监控平台',
    href: 'https://dwjk.dev.lieshoucloud.huntercat.cn',
  },
];
