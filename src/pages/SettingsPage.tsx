/**
 * 系统设置页（2026-09-01 · 平台功能集中管理）.
 *
 * 右上角「系统设置」进入（仅管理员）——自带左侧菜单栏，集中管理：
 * 项目管理（设备安装分组）/ 用户管理（账号·手机号）/ 系统信息（版本·后端状态）。
 * 左侧主菜单不再承载平台管理项（项目/用户均为项目外平台功能）。
 */
import { useState } from 'react';
import { Button, Descriptions, Layout, Menu, Tag, Typography } from 'antd';
import { InfoCircleOutlined, ProjectOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';

import { CHANGELOG, CURRENT_VERSION } from '@lieshoucloud/dwjk/industry/changelog';
import ProjectsPage from '@lieshoucloud/dwjk/industry/pages/Projects';
import UsersPage from './UsersPage';

const { Sider, Content } = Layout;

type SettingsKey = 'projects' | 'users' | 'about';

const MENU_ITEMS = [
  { key: 'projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'about', icon: <InfoCircleOutlined />, label: '系统信息' },
];

function SettingsAbout() {
  const latest = CHANGELOG[0];
  return (
    <div style={{ maxWidth: 560 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        系统信息
      </Typography.Title>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="当前版本">
          <Tag color="blue" style={{ fontSize: 13 }}>v{CURRENT_VERSION}</Tag>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            {latest?.date} · {latest?.title}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="技术栈">
          Vite 6 + React 19 + Ant Design 5 · Java 21 + Spring Boot 3.5
        </Descriptions.Item>
      </Descriptions>
      <Button type="link" style={{ paddingLeft: 0 }} onClick={() => window.location.assign('/about')}>
        查看完整系统信息（关于页） ›
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsKey>('projects');

  return (
    <Layout style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <Typography.Text strong style={{ fontSize: 15 }}>
            <SettingOutlined style={{ marginRight: 6, color: '#02429B' }} />
            系统设置
          </Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[active]}
          items={MENU_ITEMS}
          onClick={({ key }) => setActive(key as SettingsKey)}
          style={{ borderInlineEnd: 'none' }}
        />

      </Sider>
      <Content style={{ padding: 16, background: '#f5f5f5', overflow: 'auto' }}>
        {active === 'projects' && <ProjectsPage />}
        {active === 'users' && <UsersPage />}
        {active === 'about' && <SettingsAbout />}
      </Content>
    </Layout>
  );
}
