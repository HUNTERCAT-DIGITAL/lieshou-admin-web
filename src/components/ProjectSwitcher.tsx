/**
 * 顶栏项目选择器（2026-09-01 · 多项目管理）.
 *
 * 显示当前查看的项目；下拉切换（存 localStorage，全局生效）。
 * 一个用户可管理多个项目 → 顶部明确当前数据范围；项目管理入口在右上角（管理员）。
 */
import { useEffect, useState } from 'react';
import { Dropdown, Tag, Typography } from 'antd';
import { DownOutlined, ProjectOutlined } from '@ant-design/icons';

// 客户 industry 能力可选匹配（dwjk 等客户包带 industry/api；haizan 等无则隐藏）
// 2026-09-01 修复：消除对 dwjk 客户包的编译期硬依赖（与 AboutPage/SettingsPage 同款 glob）
const INDUSTRY_MODULES = import.meta.glob('../packages/*/src/industry/api*');
const HAS_INDUSTRY_API = Object.keys(INDUSTRY_MODULES).length > 0;

const STORAGE_KEY = 'dwjk:current-project';

type IndustryProject = { id: number; name: string; code?: string };

export default function ProjectSwitcher() {
  const [projects, setProjects] = useState<IndustryProject[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    // 无客户 industry 能力（haizan 等）→ 不渲染
    if (!HAS_INDUSTRY_API) return;
    const path = Object.keys(INDUSTRY_MODULES).find((p) => p.endsWith('/api.ts') || p.endsWith('/api/index.ts'));
    if (!path) return;
    void INDUSTRY_MODULES[path]()
      .then((m) => (m as { listIotProjects?: () => Promise<IndustryProject[]> }).listIotProjects?.() ?? Promise.resolve([] as IndustryProject[]))
      .then((ps: IndustryProject[]) => {
        setProjects(ps);
        // 恢复上次选择；无则默认第一个（首个项目 = 最近创建）
        const saved = localStorage.getItem(STORAGE_KEY);
        const valid = saved && ps.some((p) => p.id === Number(saved));
        setCurrent(valid ? Number(saved) : ps[0]?.id ?? null);
      })
      .catch(() => {});
  }, []);

  if (!HAS_INDUSTRY_API) return null;

  const select = (id: number | null) => {
    setCurrent(id);
    if (id) localStorage.setItem(STORAGE_KEY, String(id));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const name = current != null ? projects.find((p) => p.id === current)?.name : null;
  // 仅一个项目时也展示（明确当前范围），无项目时隐藏
  if (projects.length === 0) return null;

  const items = [
    ...projects.map((p) => ({
      key: String(p.id),
      label: (
        <span>
          <ProjectOutlined style={{ marginRight: 6 }} />
          {p.name}
          {p.code ? <Typography.Text type="secondary" style={{ fontSize: 12 }}>（{p.code}）</Typography.Text> : null}
        </span>
      ),
    })),
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: current != null ? [String(current)] : [],
        onClick: ({ key }) => select(Number(key)),
      }}
      trigger={['click']}
    >
      <Tag
        style={{
          cursor: 'pointer',
          margin: 0,
          padding: '4px 10px',
          fontSize: 13,
          background: '#f5f8ff',
          border: '1px solid #d6e4ff',
          color: '#02429B',
        }}
      >
        <ProjectOutlined style={{ marginRight: 6 }} />
        {name ?? '选择项目'}
        <DownOutlined style={{ marginLeft: 6, fontSize: 10 }} />
      </Tag>
    </Dropdown>
  );
}
