/**
 * 系统设置页（2026-09-01 · standalone 独立壳）.
 *
 * 用户下拉「系统设置」进入（管理员）——独立于业务主壳：
 * 顶部栏（品牌 + 返回 ×）+ 自带左侧菜单栏（用户管理/关于 + 客户 industry 可选）+ 内容区。
 * 进入后不再显示业务左侧菜单（平台功能与项目内功能隔离）。
 *
 * 2026-09-01 修复：移除对 dwjk 客户包的编译期硬依赖（ProjectsPage/ChangelogPage），
 * 改为客户包 industry/pages glob 可选匹配（dwjk 有 → 显示；haizan 等无 → 隐藏）。
 */
import { lazy, Suspense, useMemo, useState } from 'react';
import { Button, Layout, Menu, Spin, theme, Typography } from 'antd';
import {
  BgColorsOutlined,
  BellOutlined,
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { readThemeColor, setThemeColor, THEME_PRESETS } from '../config/themePresets';

import UsersPage from './UsersPage';
import NotificationsPage from './NotificationsPage';
import AboutPage from './AboutPage';

const { Sider, Content } = Layout;

type SettingsKey = 'projects' | 'users' | 'notifications' | 'theme' | 'about' | 'changelog';

/**
 * 客户 industry 页可选匹配（dwjk 等客户包带 industry/pages/*；haizan 等无则隐藏对应菜单）。
 * glob 只匹配存在路径；客户包无该目录时数组为空 → HAS_INDUSTRY_PAGES=false。
 */
// 只匹配 pages 顶层（不含 __tests__ 子目录），避免打包测试文件
const INDUSTRY_MODULES = import.meta.glob('../../../packages/*/src/industry/pages/*.tsx');
const HAS_INDUSTRY_PAGES = Object.keys(INDUSTRY_MODULES).length > 0;

/** 懒加载客户 industry 页：从 glob 结果按文件名取模块（避免静态 import 触发 tsc 解析 dwjk 路径） */
function lazyIndustry(leaf: 'Projects' | 'Changelog') {
  const path = Object.keys(INDUSTRY_MODULES).find((p) => p.endsWith(`/${leaf}.tsx`));
  if (!path) return null;
  return lazy(INDUSTRY_MODULES[path] as () => Promise<{ default: React.ComponentType }>);
}
const ProjectsPage = lazyIndustry('Projects');
const ChangelogPage = lazyIndustry('Changelog');

const MENU_ITEMS = [
  ...(HAS_INDUSTRY_PAGES
    ? [
        { key: 'projects' as const, icon: <ProjectOutlined />, label: '项目管理' },
        { key: 'changelog' as const, icon: <FileTextOutlined />, label: '版本更新' },
      ]
    : []),
  { key: 'theme' as const, icon: <BgColorsOutlined />, label: '主题色' },
  { key: 'notifications' as const, icon: <BellOutlined />, label: '通知管理' },
  { key: 'users' as const, icon: <TeamOutlined />, label: '用户管理' },
  { key: 'about' as const, icon: <InfoCircleOutlined />, label: '关于' },
];

/** 支持 URL ?tab=changelog 直达（更新弹窗「查看全部」跳转） */
function initialTab(search: URLSearchParams): SettingsKey {
  const t = search.get('tab');
  return t === 'changelog' ? 'changelog'
    : t === 'theme' ? 'theme'
    : t === 'notifications' ? 'notifications'
    : t === 'users' ? 'users'
    : t === 'about' ? 'about'
    : HAS_INDUSTRY_PAGES ? 'projects' : 'users';
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState<SettingsKey>(() => initialTab(searchParams));
  const { token } = theme.useToken();

  const content = useMemo(() => {
    switch (active) {
      case 'projects':
        return ProjectsPage ? (
          <Suspense fallback={<Spin style={{ display: 'block', margin: '40px auto' }} />}>
            <ProjectsPage />
          </Suspense>
        ) : null;
      case 'notifications':
        return <NotificationsPage />;
      case 'changelog':
        return ChangelogPage ? (
          <Suspense fallback={<Spin style={{ display: 'block', margin: '40px auto' }} />}>
            <ChangelogPage />
          </Suspense>
        ) : null;
      case 'theme':
        return <ThemePane />;
      case 'users':
        return <UsersPage />;
      default:
        return <AboutPage />;
    }
  }, [active]);

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
        <Typography.Text strong style={{ fontSize: 16, color: token.colorPrimary }}>
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
        <Content style={{ padding: 20, background: '#fff' }}>{content}</Content>
      </Layout>
    </Layout>
  );
}


/** 系统设置 · 主题色（与顶部调色盘同一存储/预设，双向同步） */
function ThemePane() {
  const { token } = theme.useToken();
  const current = readThemeColor();
  const clear = () => {
    try { localStorage.removeItem('lieshoucloud:themeColor'); } catch { /* ignore */ }
    window.location.reload();
  };
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Typography.Title level={4}>全局主题色</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
        与顶部「调色盘」同一套颜色、同步生效；选择立即应用到全站并记忆。未选时跟随版别默认色。
      </Typography.Paragraph>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {THEME_PRESETS.map((p) => {
          const active = current === p.color;
          return (
            <div
              key={p.color}
              role="button"
              onClick={() => {
                if (!active) { setThemeColor(p.color); window.location.reload(); }
              }}
              style={{
                width: 150,
                padding: '14px 12px',
                borderRadius: 12,
                border: active ? `2px solid ${p.color}` : '1px solid #e5e5e5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: active ? `${p.color}14` : '#fff',
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 11, background: p.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontWeight: active ? 600 : 400 }}>{p.name}</span>
              {active && <span style={{ color: p.color, marginLeft: 'auto' }}>✓</span>}
            </div>
          );
        })}
        <div
          role="button"
          onClick={clear}
          style={{
            width: 150,
            padding: '14px 12px',
            borderRadius: 12,
            border: '1px dashed #d9d9d9',
            cursor: 'pointer',
            textAlign: 'center',
            color: token.colorTextSecondary,
          }}
        >
          跟随版别默认
        </div>
      </div>
    </div>
  );
}
