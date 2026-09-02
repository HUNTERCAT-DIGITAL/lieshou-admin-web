/**
 * 系统操作手册页（2026-09-01 · 用户下拉「操作手册」进入，全员可读）.
 *
 * 左侧章节目录 + 右侧阅读内容（段落/步骤/注意事项/表格）。
 * 内容源：docs/manualContent.ts（改内容无需动组件）。
 */
import { useState } from 'react';
import { Button, Layout, Menu, Typography } from 'antd';
import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { MANUAL_CHAPTERS, type ManualChapter, type ManualItem } from '../docs/manualContent';

const { Sider, Content } = Layout;

function ItemBlock({ item }: { item: ManualItem }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Typography.Title level={5} style={{ marginBottom: 10 }}>
        {item.title}
      </Typography.Title>
      {item.paragraphs?.map((p, i) => (
        <Typography.Paragraph key={i} style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
          {p}
        </Typography.Paragraph>
      ))}
      {item.steps && item.steps.length > 0 && (
        <ol style={{ paddingLeft: 22, marginBottom: 10 }}>
          {item.steps.map((s, i) => (
            <li key={i} style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 4 }}>
              <b>{s.title ?? ''}</b>
              {s.title && s.detail ? '：' : ''}
              {s.detail}
            </li>
          ))}
        </ol>
      )}
      {item.table && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '10px 0',
            fontSize: 12,
          }}
        >
          <thead>
            <tr>
              {item.table.head.map((h, i) => (
                <th
                  key={i}
                  style={{
                    border: '1px solid #e8e8e8',
                    padding: '6px 10px',
                    background: '#fafafa',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.table.rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} style={{ border: '1px solid #e8e8e8', padding: '6px 10px' }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {item.notes && item.notes.length > 0 && (
        <div
          style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            color: '#ad6800',
            lineHeight: 1.8,
          }}
        >
          {item.notes.map((n, i) => (
            <div key={i}>💡 {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterView({ chapter }: { chapter: ManualChapter }) {
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        {chapter.icon} {chapter.title}
      </Typography.Title>
      {chapter.items.map((item, i) => (
        <ItemBlock key={i} item={item} />
      ))}
    </div>
  );
}

export default function ManualPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(MANUAL_CHAPTERS[0]?.key ?? '');

  const chapter = MANUAL_CHAPTERS.find((c) => c.key === active) ?? MANUAL_CHAPTERS[0];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* 顶部栏（standalone · 与系统设置同构） */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Typography.Text strong style={{ fontSize: 16, color: '#02429B' }}>
          <BookOutlined style={{ marginRight: 8 }} />
          系统操作手册
        </Typography.Text>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} title="返回系统" />
      </div>
      <Layout style={{ background: '#fff' }}>
        <Sider width={210} theme="light" style={{ borderRight: '1px solid #f0f0f0', background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[active]}
            items={MANUAL_CHAPTERS.map((c) => ({ key: c.key, icon: <span>{c.icon}</span>, label: c.title }))}
            onClick={({ key }) => setActive(key)}
            style={{ borderInlineEnd: 'none' }}
          />
        </Sider>
        <Content style={{ padding: '24px 32px', background: '#fff', maxWidth: 860 }}>
          {chapter && <ChapterView chapter={chapter} />}
        </Content>
      </Layout>
    </Layout>
  );
}
