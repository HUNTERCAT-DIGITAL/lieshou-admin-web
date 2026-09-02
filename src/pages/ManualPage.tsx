/**
 * 系统操作手册页（2026-09-01 · 用户下拉「操作手册」进入，全员可读）.
 *
 * 两种视图：
 * - 默认：左侧章节目录 + 右侧阅读（antd 交互）
 * - ?print=1 打印/PDF 视图：封面 + 全章节连续排版（无菜单，适配打印导出 PDF）
 * 内容源：docs/manualContent.ts（改内容无需动组件）。
 */
import { useState } from 'react';
import { Button, Image, Layout, Menu, Typography } from 'antd';
import { ArrowLeftOutlined, BookOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { MANUAL_CHAPTERS, type ManualChapter, type ManualItem } from '../docs/manualContent';

const { Sider, Content } = Layout;

function ItemBlock({ item, print }: { item: ManualItem; print?: boolean }) {
  return (
    <div style={{ marginBottom: print ? 18 : 24, pageBreakInside: 'avoid' }}>
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
      {item.images && item.images.length > 0 && (
        <div style={{ margin: '10px 0 14px' }}>
          {item.images.map((src, i) => (
            <Image
              key={i}
              src={src}
              width={print ? 460 : 560}
              style={{ border: '1px solid #e8e8e8', borderRadius: 8, marginBottom: 6 }}
              alt={`${item.title} 截图 ${i + 1}`}
              preview={!print}
            />
          ))}
        </div>
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

function ChapterView({ chapter, print }: { chapter: ManualChapter; print?: boolean }) {
  return (
    <section style={{ pageBreakBefore: print ? 'always' : 'auto', marginBottom: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 16, borderBottom: '2px solid #02429B', paddingBottom: 8 }}>
        {chapter.icon} {chapter.title}
      </Typography.Title>
      {chapter.items.map((item, i) => (
        <ItemBlock key={i} item={item} print={print} />
      ))}
    </section>
  );
}

export default function ManualPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printMode = searchParams.get('print') === '1';
  const [active, setActive] = useState(MANUAL_CHAPTERS[0]?.key ?? '');

  const chapter = MANUAL_CHAPTERS.find((c) => c.key === active) ?? MANUAL_CHAPTERS[0];

  // ── 打印/PDF 视图：封面 + 全章节连续 ──
  if (printMode) {
    return (
      <>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .manual-print { padding: 0 !important; }
        }
      `}</style>
      <div className="manual-print" style={{ background: '#fff', padding: '40px 56px', fontFamily: 'inherit' }}>
        {/* 封面 */}
        <div
          style={{
            textAlign: 'center',
            padding: '160px 0 80px',
            pageBreakAfter: 'always',
          }}
        >
          <Typography.Title level={1} style={{ fontSize: 40, marginBottom: 20 }}>
            电网监控物联网平台
          </Typography.Title>
          <Typography.Title level={3} style={{ fontWeight: 400, color: '#555' }}>
            系统操作手册
          </Typography.Title>
          <div style={{ marginTop: 48, color: '#888', fontSize: 14, lineHeight: 2 }}>
            <div>设备接入 · 告警闭环 · 工单处置 · 报表分析</div>
            <div style={{ marginTop: 40 }}>版本：v1.2.0</div>
            <div>日期：{new Date().toLocaleDateString('zh-CN')}</div>
          </div>
        </div>

        {MANUAL_CHAPTERS.map((c) => (
          <ChapterView key={c.key} chapter={c} print />
        ))}
      </div>
      </>
    );
  }

  // ── 默认阅读视图 ──
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
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
        <div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href="/downloads/dwjk-manual.pdf"
            download="电网监控平台操作手册.pdf"
            style={{ marginRight: 8 }}
          >
            下载 PDF
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.open('/manual?print=1', '_blank')}
            style={{ marginRight: 8 }}
          >
            打印视图
          </Button>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} title="返回系统" />
        </div>
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
