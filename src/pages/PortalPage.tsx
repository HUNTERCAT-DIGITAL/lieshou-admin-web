/**
 * 管理后台 · 门户页（公开官网 landing · 端自身骨架）.
 *
 * 结构：顶部导航（品牌 + 锚点 + 下载下拉 + 登录）→ 品牌 hero → 产品介绍 → 产品功能 → 多端入口。
 * 内容（介绍/功能/入口）由 edition.portal 注入，端层只渲染结构。
 */
import { DownloadOutlined, LoginOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../config/editions';

export default function PortalPage() {
  const edition = getEdition();
  const portal = edition.portal;
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const go = () => navigate(isAuthenticated ? (edition.homePath ?? '/home') : '/login');

  const downloadEntries = (portal?.entries ?? []).filter((e) => e.kind === 'download');

  return (
    <div className="portal-page">
      {/* 顶部导航 */}
      <header className="portal-nav">
        <div className="portal-nav-inner">
          <a className="portal-nav-brand" href="#hero">
            {edition.logo && (
              <img
                className="portal-nav-logo"
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${edition.logo.replace(/^\//, '')}`}
                alt={edition.brandName}
              />
            )}
            <span>{edition.brandName}</span>
          </a>
          <nav className="portal-nav-links">
            {portal?.intro && portal.intro.length > 0 && <a href="#intro">产品介绍</a>}
            {portal?.features && portal.features.length > 0 && <a href="#features">产品功能</a>}
            {portal?.entries && portal.entries.length > 0 && <a href="#entries">多端访问</a>}
          </nav>
          <div className="portal-nav-actions">
            {downloadEntries.length > 0 && (
              <Dropdown
                menu={{
                  items: downloadEntries.map((e) => ({
                    key: e.label,
                    label: (
                      <a href={e.url} target="_blank" rel="noreferrer">
                        {e.label}
                      </a>
                    ),
                  })),
                }}
              >
                <Button icon={<DownloadOutlined />} size="middle">
                  下载
                </Button>
              </Dropdown>
            )}
            <Button type="primary" icon={<LoginOutlined />} onClick={go}>
              {isAuthenticated ? '进入工作台' : '登录'}
            </Button>
          </div>
        </div>
      </header>

      {/* ① 品牌 hero */}
      <section className="portal-hero" id="hero">
        <h1 className="portal-title">{edition.brandName}</h1>
        {edition.slogan && <p className="portal-slogan">{edition.slogan}</p>}
        {edition.heroDesc && <p className="portal-desc">{edition.heroDesc}</p>}
        <button type="button" className="portal-cta" onClick={go}>
          {isAuthenticated ? '进入工作台' : '立即登录'}
        </button>
      </section>

      {/* ② 产品介绍 */}
      {portal?.intro && portal.intro.length > 0 && (
        <section className="portal-section" id="intro">
          <h2 className="portal-section-title">产品介绍</h2>
          <div className="portal-intro">
            {portal.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ③ 产品功能 */}
      {portal?.features && portal.features.length > 0 && (
        <section className="portal-section" id="features">
          <h2 className="portal-section-title">产品功能</h2>
          <div className="feature-grid">
            {portal.features.map((f) => (
              <div className="feature-card" key={f.title}>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ④ 多端入口 */}
      {portal?.entries && portal.entries.length > 0 && (
        <section className="portal-section" id="entries">
          <h2 className="portal-section-title">多端访问</h2>
          <div className="entry-grid">
            {portal.entries.map((e) => (
              <div className="entry-card" key={e.label}>
                <h3 className="entry-title">{e.label}</h3>
                {e.desc && <p className="entry-desc">{e.desc}</p>}
                {e.kind === 'qrcode' && e.url && (
                  <QRCodeSVG value={e.url} size={132} className="entry-qrcode" />
                )}
                {e.kind === 'download' && e.url && (
                  <a className="entry-btn" href={e.url} target="_blank" rel="noreferrer">
                    下载
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {edition.companyName && (
        <footer className="portal-footer">
          © {new Date().getFullYear()} {edition.companyName}
        </footer>
      )}
    </div>
  );
}
