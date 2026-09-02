/**
 * 系统操作手册内容（2026-09-01 · 内置手册页 ManualPage 数据源）.
 *
 * 结构：章节(chapters) → 小节(items)。渲染为左侧目录 + 右侧阅读内容。
 * 修改此文件即更新手册（随版本发布），无需改页面组件。
 */

export interface ManualItem {
  title: string;
  /** 截图路径（public/manual/*.jpg · 可选，多张） */
  images?: string[];
  /** 段落 */
  paragraphs?: string[];
  /** 步骤列表 */
  steps?: { title?: string; detail?: string }[];
  /** 注意事项/提示 */
  notes?: string[];
  /** 小表格（表头 + 行） */
  table?: { head: string[]; rows: string[][] };
}

export interface ManualChapter {
  key: string;
  title: string;
  icon: string;
  items: ManualItem[];
}

export const MANUAL_CHAPTERS: ManualChapter[] = [
  {
    key: 'overview',
    title: '系统概览',
    icon: '📘',
    items: [
      {
        title: '平台定位',
        paragraphs: [
          '本系统为「电网监控物联网平台」，面向变电站/配电场景：接入 GJXA 线缆监测设备，实时采集节点温度、局放（超声波/地电波）、环境温湿度等遥测数据。',
          '异常自动触发告警 → 值班确认 → 转工单处置 → 闭环，形成完整运维闭环。',
        ],
      },
      {
        title: '登录',
        steps: [
          { title: '打开系统', detail: '浏览器访问系统地址（如 https://dl.rgb-iot.com）' },
          { title: '输入账号', detail: '管理员分配的账号（用户名）' },
          { title: '输入密码', detail: '初始密码请联系管理员；登录后可到「个人中心」修改' },
        ],
        notes: ['登录过期会自动退出（会话 2 小时），重新登录即可', '一个账号只能登录一个会话'],
      },
      {
        title: '角色与权限',
        table: {
          head: ['角色', '职责', '可访问'],
          rows: [
            ['值班员', '实时监控、告警确认、工单处置', '工作台/设备/告警/工单/产品/规则/拓扑/报表/巡检/静默'],
            ['租户管理员', '配置管理 + 值班职责', '全部功能 + 系统设置'],
            ['平台超管', '平台级管理', '全部功能 + 系统设置(用户管理)'],
          ],
        },
        notes: ['左侧菜单仅显示当前角色可访问的功能'],
      },
    ],
  },
  {
    key: 'layout',
    title: '界面与导航',
    icon: '🧭',
    items: [
      {
        title: '界面结构',
        steps: [
          { title: '顶部栏', detail: '左侧：系统名 + 当前项目切换器；右侧：通知铃铛、驾驶舱、系统设置(管理员)、头像菜单' },
          { title: '左侧菜单', detail: '当前项目下的功能（工作台/设备/告警/工单/产品/规则/拓扑/报表/巡检/静默）' },
          { title: '头像菜单', detail: '个人中心 / 系统设置(管理员) / 操作手册 / 关于 / 退出登录' },
        ],
      },
      {
        title: '项目切换',
        paragraphs: [
          '一个用户可以管理多个项目（如不同变电站项目）。顶部栏显示当前项目，点击可切换。',
          '设备/告警/工单列表会自动按当前项目过滤——切换项目即看到该项目的数据。',
        ],
      },
      {
        title: '工作台（登录后首页）',
        paragraphs: ['值班工作台：实时概况 KPI + 告警通知横幅 + 常用入口，异常一目了然。'],
        images: ['/screenshots/manual-home.jpg'],
      },
      {
        title: '驾驶舱大屏',
        steps: [
          { title: '打开', detail: '顶部栏「驾驶舱」按钮' },
          { title: '查看', detail: '风险指数/温度/局放/告警占比/工单运维/电网拓扑，实时刷新' },
          { title: '交互', detail: '点击设备节点/列表行可查看详情；面板可放大；右下角全屏' },
        ],
        images: ['/screenshots/manual-cockpit.jpg', '/screenshots/manual-topo.jpg'],
      },
    ],
  },
  {
    key: 'device',
    title: '设备管理',
    icon: '🖥️',
    items: [
      {
        title: '设备全生命周期',
        steps: [
          { title: '① 注册/批量出厂', detail: '设备列表「注册设备」单台录入；「批量出厂」按产品批量生成（SN 唯一 + 激活二维码）' },
          { title: '② 发货', detail: '出厂设备操作「发货」，挂到项目 → 状态「待激活」' },
          { title: '③ 客户扫码激活', detail: '客户扫设备二维码（激活二维码弹窗）→ 登录 → 确认激活 → 设备绑定当前租户并重置接入密钥' },
          { title: '④ 安装运行', detail: '激活后设备可接入上报，进入「已激活」状态' },
        ],
        notes: ['出厂设备需先发货才能被客户激活', '已激活设备不再显示激活二维码', '设备激活需在客户租户下操作（厂家不能激活自己租户设备）'],
        images: ['/screenshots/manual-devices.jpg'],
      },
      {
        title: '设备列表与详情',
        paragraphs: [
          '设备列表：按产品/状态筛选，支持关键字搜索；生命周期列显示 出厂/待激活/已激活。',
          '点击「详情」进入设备详情单页：基本信息 + 产品结构（主机/局放/温度节点/气体节点）+ 属性时序曲线 + 设备事件 + 告警历史 + 工单历史 + 巡检记录 + 原始报文。',
        ],
        images: ['/screenshots/manual-device-detail.jpg'],
      },
      {
        title: '传感器配置',
        steps: [
          { title: '打开', detail: '设备详情页产品结构区「传感器配置」' },
          { title: '配置', detail: '温度节点编号/名称/颜色/位置、气体节点数量/位置、局放数量/使能' },
          { title: '保存', detail: '保存后同步到服务器（多端一致）' },
        ],
        notes: ['传感器配置落库保存，更换浏览器/设备后配置保持一致'],
        images: ['/screenshots/manual-device-manual-sensors.jpg'],
      },
      {
        title: '静默告警（设备检修）',
        steps: [
          { title: '设置', detail: '设备详情页「静默告警」→ 选时长（2h/24h/72h/7天）+ 原因' },
          { title: '效果', detail: '静默期间该设备告警不产生、不通知，到期自动恢复' },
          { title: '解除', detail: '详情页「解除静默」或「静默管理」页统一解除' },
        ],
        notes: ['设备检修/维护期间建议设置静默，避免误告警刷屏'],
      },
      {
        title: '设备导出',
        paragraphs: ['设备列表「导出 Excel」：按当前筛选导出（设备ID/名称/产品/状态/生命周期/位置等）。'],
      },
    ],
  },
  {
    key: 'alert',
    title: '告警中心',
    icon: '🚨',
    items: [
      {
        title: '告警来源',
        paragraphs: [
          '规则引擎自动判断：设备上报数据达到规则条件（阈值/事件）即产生告警。',
          '告警按 级别（预警/告警）和 状态（未确认/已确认）区分。',
        ],
      },
      {
        title: '告警处理流程',
        steps: [
          { title: '查看', detail: '左侧「告警」→ 列表按状态筛选（未确认优先处理）' },
          { title: '确认', detail: '行内「确认」→ 填写说明；或「一键确认」批量处理所有未确认告警' },
          { title: '详情', detail: '点击「详情」查看完整信息（设备/规则/指标值/阈值/时间线），可跳设备详情' },
          { title: '转工单', detail: '确认告警后可「转工单」→ 选优先级，自动生成处置工单' },
        ],
        notes: ['已确认告警显示 确认人+确认时间（处理留痕）', '工作台异常卡点击可跳转对应告警'],
        images: ['/screenshots/manual-alerts.jpg'],
      },
      {
        title: '告警导出',
        paragraphs: ['告警列表「导出 Excel」：导出当前筛选的告警明细。'],
      },
    ],
  },
  {
    key: 'ticket',
    title: '工单管理',
    icon: '🎫',
    items: [
      {
        title: '新建工单（两种方式）',
        steps: [
          { title: '告警转工单', detail: '告警详情/确认后点「转工单」，选优先级 → 生成工单' },
          { title: '手工新建', detail: '工单页「新建工单」→ 选设备 + 优先级 + 备注' },
        ],
      },
      {
        title: '工单处置流程',
        steps: [
          { title: '① 待派单', detail: '管理员/值班长在工单列表或详情点「派单」→ 选择处理人（系统用户）' },
          { title: '处理人收到通知', detail: '右上角铃铛站内通知 + 短信提醒（手机号在个人中心维护）' },
          { title: '② 处置中', detail: '处理人现场处置；工单列表显示 处理人/时间线' },
          { title: '③ 闭环', detail: '处置完成点「闭环」→ 填写处置备注' },
          { title: '重新打开', detail: '闭环后发现未处理完 → 「重新打开」回到处置中' },
        ],
        notes: ['处置中超过 24 小时未闭环 → 列表标红 + 系统定时短信提醒处理人', '派单必须选择系统用户（接收人收到通知/短信）'],
      },
      {
        title: '工单看板',
        paragraphs: [
          '顶部 KPI：待派单/高优先级/处置中/今日闭环',
          '周工单趋势：近 8 周新建/闭环折线',
          '站点工单分布：各站点工单数与状态（工单多站点优先）',
          '列表支持 状态/优先级/关键字 筛选、序号、分页、导出 Excel',
        ],
        images: ['/screenshots/manual-ops.jpg'],
      },
    ],
  },
  {
    key: 'product-rule',
    title: '产品与规则',
    icon: '⚙️',
    items: [
      {
        title: '产品管理',
        paragraphs: [
          '产品 = 设备型号，定义物模型（属性 + 命令）。接入协议固定为 GJXA_RTU（平台唯一协议，不可修改）。',
          '产品详情单页展示完整信息：基本信息 + 属性定义 + 命令定义；「编辑」可改名称/编码/启用/描述（协议锁定）。',
        ],
      },
      {
        title: '告警规则',
        steps: [
          { title: '新建规则', detail: '规则页「新建规则」：名称/级别(预警·告警)/触发(属性阈值或事件) + 动作(站内通知)' },
          { title: '配置阈值', detail: '选属性 + 比较符 + 阈值；可设 持续秒数、连续触发次数' },
          { title: '启停', detail: '规则开关控制是否生效；短信接收人可在规则或租户账号上配置' },
        ],
        notes: [
          '连续触发次数：同一规则同一设备连续命中 N 次才告警（抑制瞬时抖动）；>1 时达到后自动升级为「告警」',
          '告警触发后处理人手机号会收到短信（个人中心维护手机号）',
        ],
        images: ['/screenshots/manual-rules.jpg'],
      },
    ],
  },
  {
    key: 'report',
    title: '报表中心',
    icon: '📊',
    items: [
      {
        title: '查看报表',
        paragraphs: [
          '左侧「报表」进入：告警趋势（近7/30天折线）、设备健康（在线率/生命周期）、工单效率（平均处理时长/闭环率）。',
        ],
        images: ['/screenshots/manual-reports.jpg'],
      },
      {
        title: '导出 Excel',
        steps: [
          { title: '报表页导出', detail: '「导出 Excel」→ 多 sheet（告警趋势/设备健康/工单效率）' },
          { title: '列表导出', detail: '设备/告警/工单列表均支持「导出 Excel」（按当前筛选）' },
        ],
      },
    ],
  },
  {
    key: 'patrol-silence',
    title: '巡检与静默',
    icon: '🔍',
    items: [
      {
        title: '巡检管理',
        steps: [
          { title: '登记巡检', detail: '巡检页「登记巡检」→ 选设备 + 结果（正常/异常）+ 备注' },
          { title: '查看', detail: '巡检列表按结果/关键字筛选；设备详情「巡检记录」Tab 也可看该设备历史' },
        ],
        images: ['/screenshots/manual-patrols.jpg'],
      },
      {
        title: '静默管理',
        paragraphs: [
          '集中查看所有设备的告警静默：设备/原因/起止时间/剩余时长/状态（生效中·已过期），可统一解除。',
          '设置入口在设备详情「静默告警」。',
        ],
        images: ['/screenshots/manual-silences.jpg'],
      },
    ],
  },
  {
    key: 'settings',
    title: '系统设置',
    icon: '🔧',
    items: [
      {
        title: '进入',
        paragraphs: ['右上角头像菜单 →「系统设置」（仅管理员可见）。独立设置界面，左侧菜单分类管理平台功能。'],
        images: ['/screenshots/manual-settings-projects.jpg'],
      },
      {
        title: '项目管理',
        steps: [
          { title: '项目', detail: '客户维度分组（如「南康商会项目」）；新建/编辑/删除项目' },
          { title: '站点', detail: '进入项目详情 → 添加/删除站点（变电站/厂区/楼层级分组）' },
          { title: '设备归属', detail: '设备发货时挂项目；存量设备默认挂「默认项目」' },
        ],
      },
      {
        title: '用户管理',
        steps: [
          { title: '新建用户', detail: '账号 + 姓名 + 手机号（告警短信接收）+ 角色' },
          { title: '维护手机号', detail: '手机号是工单/告警短信接收地址，请保持可用' },
        ],
      },
      {
        title: '用户管理（截图）',
        paragraphs: ['维护租户内账号（含手机号，是告警/工单短信接收地址）。'],
        images: ['/screenshots/manual-settings-users.jpg'],
      },
      {
        title: '通知管理',
        paragraphs: [
          '查看租户内全部通知（接收人/类型/内容/状态）；支持 筛选、标记已读、删除、清空。',
          '通知来源：工单派单、工单超时提醒等。个人通知在右上角铃铛查看。',
        ],
        images: ['/screenshots/manual-settings-notifications.jpg'],
      },
      {
        title: '版本更新与关于',
        paragraphs: ['「版本更新」查看系统更新历史；「关于」查看当前版本/技术栈/后端状态。'],
      },
    ],
  },
  {
    key: 'faq',
    title: '常见问题 FAQ',
    icon: '❓',
    items: [
      {
        title: '登录提示「用户服务暂不可用」',
        steps: [
          { title: '处理', detail: '检查账号密码是否正确；租户选择是否正确；联系管理员确认账号已开通' },
        ],
      },
      {
        title: '页面提示「系统已更新，请刷新页面」',
        paragraphs: ['系统刚发布新版本，旧页面资源已失效。点「刷新页面」即可恢复，数据不会丢失。'],
      },
      {
        title: '页面加载失败/白屏',
        steps: [
          { title: '处理', detail: '点「刷新页面」或「回到首页」；仍失败则清除浏览器缓存后重试，或联系管理员' },
        ],
      },
      {
        title: '短信/通知收不到',
        steps: [
          { title: '检查', detail: '个人中心确认手机号已填写且正确；工单派单需选择系统用户；告警短信 5 分钟同规则防抖' },
        ],
      },
      {
        title: '设备告警一直刷',
        steps: [
          { title: '处理', detail: '设备检修中 → 设置「静默告警」；瞬时波动 → 调整规则「连续触发次数」' },
        ],
      },
    ],
  },
];
