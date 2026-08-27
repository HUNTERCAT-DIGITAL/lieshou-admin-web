"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var icons_1 = require("@ant-design/icons");
var editions_1 = require("../config/editions");
/**
 * ProLayout 的默认配置。把菜单、标题、logo 这些跨页常量提出来便于集中维护。
 *
 * 菜单 icon 必须传 ReactNode（@ant-design/icons JSX）—— ProLayout 的 `getIcon` 只识别
 * url / iconfont 前缀 / ReactNode，纯字符串会静默丢弃（见 .ai/conversations/2026-08-23-sidebar-icons.md）。
 */
var defaultProps = {
    // 标题/logo 跟随版别（ADR-0035）：generic 显示「LieShouCloud」+ 默认 logo；客户 Edition 可注入定制品牌
    title: (0, editions_1.getEdition)().brandName,
    logo: (0, editions_1.getEdition)().logo,
    navTheme: 'light',
    siderWidth: 208,
    route: {
        path: '/',
        // 菜单项 accessKey：对应权限码（ADR-0024 Phase 2 · 后端 permissions 表权威）；缺省 = 登录即可见
        // 法律版（layer/legalmind · showLegal）：今日作战台置顶 + 隐藏通用欢迎页；通用版保持原顺序
        routes: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], ((0, editions_1.getEdition)().showLegal === true
            ? [{ path: '/admin', name: '今日作战台', icon: <icons_1.DashboardOutlined />, accessKey: null }]
            : []), true), ((0, editions_1.getEdition)().showLegal === true
            ? []
            : [{ path: '/welcome', name: '欢迎', icon: <icons_1.SmileOutlined />, accessKey: null }]), true), [
            {
                path: '/profile',
                name: '个人中心',
                icon: <icons_1.UserOutlined />,
                accessKey: null,
            },
            {
                path: '/notification',
                name: '通知中心',
                icon: <icons_1.BellOutlined />,
                accessKey: null,
            }
        ], false), ((0, editions_1.getEdition)().showLegal === true
            ? []
            : [{ path: '/admin', name: '工作台', icon: <icons_1.DashboardOutlined />, accessKey: null }]), true), [
            {
                path: '/tenant',
                name: '租户管理',
                icon: <icons_1.ClusterOutlined />,
                accessKey: 'tenant:manage',
                routes: [
                    {
                        path: '/tenant/list',
                        name: '租户列表',
                        icon: <icons_1.ShopOutlined />,
                        accessKey: 'tenant:manage',
                    },
                    {
                        path: '/role/list',
                        name: '角色管理',
                        icon: <icons_1.SafetyCertificateOutlined />,
                        accessKey: 'tenant:manage',
                    },
                    {
                        path: '/audit/list',
                        name: '审计日志',
                        icon: <icons_1.FileSearchOutlined />,
                        accessKey: 'tenant:manage',
                    },
                ],
            },
            {
                path: '/user',
                name: '用户中心',
                icon: <icons_1.TeamOutlined />,
                accessKey: 'user:list',
                routes: [
                    { path: '/user/list', name: '用户列表', icon: <icons_1.UserOutlined />, accessKey: 'user:list' },
                ],
            },
            {
                path: '/customer',
                name: 'CRM 客户',
                icon: <icons_1.ContactsOutlined />,
                accessKey: 'crm:use',
                routes: [
                    { path: '/customer/list', name: '客户列表', icon: <icons_1.SolutionOutlined /> },
                    { path: '/customer/success', name: '客户成功中心', icon: <icons_1.FundOutlined /> },
                    { path: '/lead/list', name: '线索管理', icon: <icons_1.RiseOutlined /> },
                    { path: '/contact/list', name: '联系人', icon: <icons_1.TeamOutlined /> },
                    { path: '/contract/list', name: '合同管理', icon: <icons_1.FileTextOutlined /> },
                    { path: '/member/list', name: '会员管理', icon: <icons_1.IdcardOutlined /> },
                ],
            },
            {
                path: '/inventory',
                name: '进销存',
                icon: <icons_1.ShopOutlined />,
                routes: [
                    { path: '/inventory/list', name: '库存管理', icon: <icons_1.SolutionOutlined /> },
                    /* ADR-0037 · 质检追溯（jmzz 制造版能力） */
                    { path: '/quality/list', name: '质检追溯', icon: <icons_1.ExperimentOutlined /> },
                ],
            },
            {
                path: '/finance',
                name: '财务记账',
                icon: <icons_1.FundOutlined />,
                accessKey: 'finance:use',
                routes: [
                    {
                        path: '/finance/list',
                        name: '记账本',
                        icon: <icons_1.SolutionOutlined />,
                        accessKey: 'finance:use',
                    },
                ],
            },
            {
                path: '/approval',
                name: '审批流',
                icon: <icons_1.AuditOutlined />,
                accessKey: 'approval:use',
                routes: [
                    {
                        path: '/approval/list',
                        name: '审批中心',
                        icon: <icons_1.SolutionOutlined />,
                        accessKey: 'approval:use',
                    },
                ],
            },
            {
                path: '/legal',
                name: '案件管理',
                icon: <icons_1.BookOutlined />,
                accessKey: 'legal:use',
                routes: [
                    {
                        path: '/legal/cases',
                        name: '办案列表',
                        icon: <icons_1.SolutionOutlined />,
                        accessKey: 'legal:use',
                    },
                    {
                        path: '/legal/knowledge',
                        name: '知识资产',
                        icon: <icons_1.BulbOutlined />,
                        accessKey: 'legal:use',
                    },
                    {
                        path: '/legal/growth',
                        name: '专业成长',
                        icon: <icons_1.RiseOutlined />,
                        accessKey: 'legal:use',
                    },
                ],
            },
            {
                path: '/iot',
                name: '物联网',
                icon: <icons_1.ApiOutlined />,
                accessKey: 'iot:monitor',
                routes: [
                    {
                        path: '/iot/cockpit',
                        name: '驾驶舱',
                        icon: <icons_1.RadarChartOutlined />,
                        accessKey: 'iot:monitor',
                    },
                    {
                        path: '/iot/overview',
                        name: '监控总览',
                        icon: <icons_1.DashboardOutlined />,
                        accessKey: 'iot:monitor',
                    },
                    {
                        path: '/iot/topo',
                        name: '电网拓扑',
                        icon: <icons_1.ApartmentOutlined />,
                        accessKey: 'iot:monitor',
                    },
                    {
                        path: '/iot/devices',
                        name: '设备管理',
                        icon: <icons_1.ShopOutlined />,
                        accessKey: 'iot:config',
                    },
                    {
                        path: '/iot/products',
                        name: '产品物模型',
                        icon: <icons_1.SolutionOutlined />,
                        accessKey: 'iot:config',
                    },
                    {
                        path: '/iot/rules',
                        name: '规则配置',
                        icon: <icons_1.SafetyCertificateOutlined />,
                        accessKey: 'iot:config',
                    },
                    {
                        path: '/iot/alerts',
                        name: '告警中心',
                        icon: <icons_1.FileSearchOutlined />,
                        accessKey: 'iot:monitor',
                    },
                ],
            },
        ], false),
    },
};
exports.default = defaultProps;
