/**
 * 系统设置页（2026-09-01 · standalone 独立壳）.
 *
 * 用户下拉「系统设置」进入（管理员）——独立于业务主壳：
 * 顶部栏（品牌 + 返回 ×）+ 自带左侧菜单栏（项目管理/用户管理/系统信息）+ 内容区。
 * 进入后不再显示业务左侧菜单（平台功能与项目内功能隔离）。
 */
import { useState } from 'react';
import { Button, Layout, Menu, Typography } from 'antd';
import {
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProjectsPage from '@lieshoucloud/dwjk/industry/pages/Projects';
import ChangelogPage from '@lieshoucloud/dwjk/industry/pages/Changelog';
import UsersPage from './UsersPage';
import AboutPage from './AboutPage';

const { Sider, Content } = Layout;

type SettingsKey = 'projects' | 'users' | 'about' | 'changelog';

const MENU_ITEMS = [
  { key: 'projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'changelog', icon: <FileTextOutlined />, label: '版本更新' },
  { key: 'about', icon: <InfoCircleOutlined />, label: '关于' },
];

/** 支持 URL ?tab=changelog 直达（更新弹窗「查看全部」跳转） */
function initialTab(search: URLSearchParams): SettingsKey {
  const t = search.get('tab');
  return t === 'changelog' ? 'changelog' : t === 'users' ? 'users' : t === 'about' ? 'about' : 'projects';
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState<SettingsKey>(() => initialTab(searchParams));

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* 顶部栏（standalone 无主壳 · 自身顶栏） */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
          flex: '0 0 auto',
        }}
      >
        <Typography.Text strong style={{ fontSize: 16, color: '#02429B' }}>
          <SettingOutlined style={{ marginRight: 8 }} />
          系统设置
        </Typography.Text>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate('/home')}
          title="关闭系统设置"
        />
      </div>
      <Layout style={{ background: '#fff' }}>
        <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0', background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[active]}
            items={MENU_ITEMS}
            onClick={({ key }) => setActive(key as SettingsKey)}
            style={{ borderInlineEnd: 'none' }}
          />
        </Sider>
        <Content style={{ padding: 20, background: '#fff' }}>
          {active === 'projects' && <ProjectsPage />}
          {active === 'users' && <UsersPage />}
          {active === 'changelog' && <ChangelogPage />}
          {active === 'about' && <AboutPage />}
        </Content>
      </Layout>
    </Layout>
  );
}
