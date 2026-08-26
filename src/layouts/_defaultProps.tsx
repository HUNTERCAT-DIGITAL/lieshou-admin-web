import {
  ApartmentOutlined,
  ApiOutlined,
  AuditOutlined,
  BookOutlined,
  BulbOutlined,
  ClusterOutlined,
  ContactsOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FundOutlined,
  IdcardOutlined,
  RadarChartOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  SmileOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ProLayoutProps } from '@ant-design/pro-components';
import { getEdition } from '../config/editions';

/**
 * ProLayout 的默认配置。把菜单、标题、logo 这些跨页常量提出来便于集中维护。
 *
 * 菜单 icon 必须传 ReactNode（@ant-design/icons JSX）—— ProLayout 的 `getIcon` 只识别
 * url / iconfont 前缀 / ReactNode，纯字符串会静默丢弃（见 .ai/conversations/2026-08-23-sidebar-icons.md）。
 */
const defaultProps: ProLayoutProps = {
  // 标题/logo 跟随版别（ADR-0035）：legalmind 部署显示「LegalMind · 智法云枢」+ 定制 logo
  title: getEdition().brandName,
  logo: getEdition().logo,
  navTheme: 'light',
  siderWidth: 208,
  route: {
    path: '/',
    // 菜单项 accessKey：对应权限码（ADR-0024 Phase 2 · 后端 permissions 表权威）；缺省 = 登录即可见
    // 法律版（layer/legalmind · showLegal）：今日作战台置顶 + 隐藏通用欢迎页；通用版保持原顺序
    routes: [
      ...(getEdition().showLegal === true
        ? [{ path: '/admin', name: '今日作战台', icon: <DashboardOutlined />, accessKey: null }]
        : []),
      ...(getEdition().showLegal === true
        ? []
        : [{ path: '/welcome', name: '欢迎', icon: <SmileOutlined />, accessKey: null }]),
      {
        path: '/profile',
        name: '个人中心',
        icon: <UserOutlined />,
        accessKey: null,
      },
      ...(getEdition().showLegal === true
        ? []
        : [{ path: '/admin', name: '工作台', icon: <DashboardOutlined />, accessKey: null }]),
      {
        path: '/tenant',
        name: '租户管理',
        icon: <ClusterOutlined />,
        accessKey: 'tenant:manage',
        routes: [
          {
            path: '/tenant/list',
            name: '租户列表',
            icon: <ShopOutlined />,
            accessKey: 'tenant:manage',
          },
          {
            path: '/role/list',
            name: '角色管理',
            icon: <SafetyCertificateOutlined />,
            accessKey: 'tenant:manage',
          },
          {
            path: '/audit/list',
            name: '审计日志',
            icon: <FileSearchOutlined />,
            accessKey: 'tenant:manage',
          },
        ],
      },
      {
        path: '/user',
        name: '用户中心',
        icon: <TeamOutlined />,
        accessKey: 'user:list',
        routes: [
          { path: '/user/list', name: '用户列表', icon: <UserOutlined />, accessKey: 'user:list' },
        ],
      },
      {
        path: '/customer',
        name: 'CRM 客户',
        icon: <ContactsOutlined />,
        accessKey: 'crm:use',
        routes: [
          { path: '/customer/list', name: '客户列表', icon: <SolutionOutlined /> },
          { path: '/customer/success', name: '客户成功中心', icon: <FundOutlined /> },
          { path: '/lead/list', name: '线索管理', icon: <RiseOutlined /> },
          { path: '/contact/list', name: '联系人', icon: <TeamOutlined /> },
          { path: '/contract/list', name: '合同管理', icon: <FileTextOutlined /> },
          { path: '/member/list', name: '会员管理', icon: <IdcardOutlined /> },
        ],
      },
      {
        // zhiye 教育行业版 · 师资档案 + 师资派遣 + 供应结算（智野 B2B2C 供应侧）；非 eduTeacher 版别由 hiddenMenus 隐藏
        path: '/edu',
        name: '师资档案',
        icon: <IdcardOutlined />,
        routes: [
          { path: '/edu/teacher/list', name: '教师列表', icon: <SolutionOutlined /> },
          { path: '/edu/dispatch/list', name: '师资派遣', icon: <TeamOutlined /> },
          { path: '/edu/supply/list', name: '供应单', icon: <SolutionOutlined /> },
          { path: '/edu/consumption/list', name: '消课明细', icon: <SolutionOutlined /> },
          { path: '/edu/settlement/list', name: '结算单', icon: <SolutionOutlined /> },
        ],
      },
      {
        path: '/inventory',
        name: '进销存',
        icon: <ShopOutlined />,
        routes: [
          { path: '/inventory/list', name: '库存管理', icon: <SolutionOutlined /> },
          /* ADR-0037 · 质检追溯（jmzz 制造版能力） */
          { path: '/quality/list', name: '质检追溯', icon: <ExperimentOutlined /> },
        ],
      },
      {
        path: '/finance',
        name: '财务记账',
        icon: <FundOutlined />,
        accessKey: 'finance:use',
        routes: [
          {
            path: '/finance/list',
            name: '记账本',
            icon: <SolutionOutlined />,
            accessKey: 'finance:use',
          },
        ],
      },
      {
        path: '/approval',
        name: '审批流',
        icon: <AuditOutlined />,
        accessKey: 'approval:use',
        routes: [
          {
            path: '/approval/list',
            name: '审批中心',
            icon: <SolutionOutlined />,
            accessKey: 'approval:use',
          },
        ],
      },
      {
        path: '/legal',
        name: '案件管理',
        icon: <BookOutlined />,
        accessKey: 'legal:use',
        routes: [
          {
            path: '/legal/cases',
            name: '办案列表',
            icon: <SolutionOutlined />,
            accessKey: 'legal:use',
          },
          {
            path: '/legal/knowledge',
            name: '知识资产',
            icon: <BulbOutlined />,
            accessKey: 'legal:use',
          },
          {
            path: '/legal/growth',
            name: '专业成长',
            icon: <RiseOutlined />,
            accessKey: 'legal:use',
          },
        ],
      },
      {
        path: '/iot',
        name: '物联网',
        icon: <ApiOutlined />,
        accessKey: 'iot:monitor',
        routes: [
          {
            path: '/iot/cockpit',
            name: '驾驶舱',
            icon: <RadarChartOutlined />,
            accessKey: 'iot:monitor',
          },
          {
            path: '/iot/overview',
            name: '监控总览',
            icon: <DashboardOutlined />,
            accessKey: 'iot:monitor',
          },
          {
            path: '/iot/topo',
            name: '电网拓扑',
            icon: <ApartmentOutlined />,
            accessKey: 'iot:monitor',
          },
          {
            path: '/iot/devices',
            name: '设备管理',
            icon: <ShopOutlined />,
            accessKey: 'iot:config',
          },
          {
            path: '/iot/products',
            name: '产品物模型',
            icon: <SolutionOutlined />,
            accessKey: 'iot:config',
          },
          {
            path: '/iot/rules',
            name: '规则配置',
            icon: <SafetyCertificateOutlined />,
            accessKey: 'iot:config',
          },
          {
            path: '/iot/alerts',
            name: '告警中心',
            icon: <FileSearchOutlined />,
            accessKey: 'iot:monitor',
          },
        ],
      },
    ],
  },
};

export default defaultProps;
