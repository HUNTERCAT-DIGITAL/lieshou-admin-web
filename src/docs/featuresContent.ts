/**
 * 平台功能进度数据（2026-09 · 功能完成情况页数据源）.
 *
 * 两部分：已完成功能（done，含完成度/状态/说明）+ 未完成/规划（todo，含优先级/状态）。
 * 维护此文件即更新页面（随版本发布）。
 */

export interface FeatureDone {
  name: string;
  /** 完成度 0-100 */
  percent: number;
  /** 状态：生产运行 / 部分场景待完善 */
  status: string;
  summary: string;
  /** 上线时间（2026-MM） */
  launched: string;
}

export interface FeatureTodo {
  name: string;
  priority: '高' | '中' | '低';
  status: '进行中' | '规划中' | '待评估';
  note: string;
}

export const FEATURE_DONE: FeatureDone[] = [
  { name: '登录认证与角色权限', percent: 95, status: '生产运行', summary: '账号登录/会话管理/角色裁剪（值班员/管理员/超管）；登录到期自动退出', launched: '2026-08' },
  { name: '工作台', percent: 95, status: '生产运行', summary: '实时概况 KPI/告警通知横幅/常用入口/异常设备', launched: '2026-08' },
  { name: '驾驶舱大屏', percent: 90, status: '生产运行', summary: '风险指数/温度分布/局放/告警占比/工单运维/电网拓扑，全屏电视墙', launched: '2026-08' },
  { name: '设备管理', percent: 95, status: '生产运行', summary: '列表/详情/产品结构（主机·局放·温度·气体节点）/时序曲线/事件/照片', launched: '2026-08' },
  { name: '设备全生命周期', percent: 90, status: '生产运行', summary: '批量出厂（SN+激活二维码）→ 发货挂项目 → 客户扫码激活（迁移租户+重置密钥）', launched: '2026-09' },
  { name: '传感器配置落库', percent: 100, status: '生产运行', summary: '节点编号/位置/颜色/使能保存到后端，多端一致', launched: '2026-09' },
  { name: '告警中心', percent: 90, status: '生产运行', summary: '规则引擎自动告警/确认/一键确认/详情/转工单；指标中文展示', launched: '2026-08' },
  { name: '告警静默', percent: 100, status: '生产运行', summary: '设备检修期静默告警（不落库不通知），到期自动恢复，集中管理页', launched: '2026-09' },
  { name: '规则引擎', percent: 90, status: '生产运行', summary: '属性阈值/事件触发；连续触发次数（抑制抖动+级别升级）；站内通知动作', launched: '2026-08' },
  { name: '工单管理', percent: 95, status: '生产运行', summary: '告警转单+手工建单/派单（选系统用户）/闭环/重新打开/超时标红/看板（周趋势·站点分布）/导出', launched: '2026-09' },
  { name: '通知模块', percent: 95, status: '生产运行', summary: '铃铛（未读角标）/派单·超时自动通知/短信提醒/通知管理页（筛选·已读·删除）', launched: '2026-09' },
  { name: '产品物模型', percent: 90, status: '生产运行', summary: '产品 CRUD/属性命令定义/详情页；协议固定 GJXA_RTU', launched: '2026-08' },
  { name: '项目与站点', percent: 90, status: '生产运行', summary: '项目（客户维度）→ 站点分组；设备挂项目；顶栏项目切换按项目过滤数据', launched: '2026-09' },
  { name: '报表中心', percent: 90, status: '生产运行', summary: '告警趋势/设备健康/工单效率 + 一键导出 Excel（多 sheet）', launched: '2026-09' },
  { name: '巡检管理', percent: 90, status: '生产运行', summary: '登记巡检（设备/结果/备注）/租户级列表/设备详情巡检历史', launched: '2026-09' },
  { name: '系统设置', percent: 95, status: '生产运行', summary: '项目/用户/通知/版本更新/关于 集中管理（管理员）', launched: '2026-09' },
  { name: '系统操作手册', percent: 95, status: '生产运行', summary: '内置图文手册（10 章+截图）+ PDF 下载交付版', launched: '2026-09' },
  { name: '界面友好化', percent: 95, status: '生产运行', summary: '全站时间统一/指标 i18n 中文/错误边界（更新提示刷新）/表格统一 ProTable 风格', launched: '2026-09' },
];

export const FEATURE_TODO: FeatureTodo[] = [
  { name: '标签批量打印（出厂二维码 PDF 批量下载）', priority: '高', status: '规划中', note: '批量出厂后一键下载全部激活二维码标签，贴标发货' },
  { name: '客户自助注册开通租户', priority: '高', status: '规划中', note: '客户扫码注册 → 自动开通租户账号，无需管理员预建' },
  { name: '告警聚合/抑制策略', priority: '中', status: '待评估', note: '风暴告警收敛（如同一设备短时多条同类合并展示）' },
  { name: '报表钻取（按项目/站点维度趋势）', priority: '中', status: '规划中', note: '报表可按当前项目/站点过滤与对比' },
  { name: '工单超时阈值页面化配置', priority: '中', status: '规划中', note: 'TICKET_TIMEOUT_HOURS 环境变量 → 系统设置可视化配置' },
  { name: '移动端/小程序功能同步', priority: '中', status: '进行中', note: 'H5/小程序工单看板已铺，其余模块按需同步' },
  { name: '照片上传完善（巡检/设备现场拍照）', priority: '低', status: '规划中', note: '管理后台照片上传交互完善，当前 H5 已有' },
  { name: '审计日志页面', priority: '低', status: '规划中', note: '关键操作（登录/派单/删除）审计记录可视化' },
];
