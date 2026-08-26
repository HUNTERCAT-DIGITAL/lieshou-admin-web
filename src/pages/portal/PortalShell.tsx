/**
 * 门户共享组件库（ADR-0035 · 行业版门户）.
 *
 * Hero / Footer 之外新增一套通用区块组件，四个版别门户共用：
 *  - PortalNav（吸顶导航） / FadeIn（滚动淡入） / SectionHeader（区块标题）
 *  - PortalStats（数据统计条） / FeatureCard（能力卡） / PortalFaq（FAQ 折叠） / PortalCta（CTA 横幅）
 * 品牌 / 文案 / 主色 / 数据全部来自 EditionConfig——「客户差异进配置层，禁止 fork 仓库」。
 */

import {
  AccountBookOutlined,
  AppstoreOutlined,
  AuditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Space, Tag, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type {
  EditionConfig,
  EditionCta,
  EditionFaq,
  EditionFeature,
  EditionStat,
} from '../../config/editions';

const { Title, Paragraph, Text } = Typography;

/* ============================================================
 * Hero / Footer（原有，保持导出兼容）
 * ============================================================ */

interface HeroProps {
  edition: EditionConfig;
  onLogin: () => void;
  onRegister?: () => void;
}

/** 门户 Hero：品牌 + 口号 + CTA（登录 / 可选注册） */
export function PortalHero({ edition, onLogin, onRegister }: HeroProps) {
  return (
    <div style={heroStyle(edition.primaryColor)}>
      <Space direction="vertical" size="middle" align="center">
        <div style={styles.brand}>
          <img src={edition.logo} alt={edition.brandName} style={styles.logo} />
          <span style={styles.brandText}>{edition.brandName}</span>
        </div>
        <Title style={{ margin: 0, color: '#fff', textAlign: 'center' }}>{edition.slogan}</Title>
        <Paragraph
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 16,
            maxWidth: 640,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {edition.heroDesc}
        </Paragraph>
        <Space size="middle">
          {onRegister && edition.allowRegister && (
            <Button type="primary" size="large" style={styles.heroBtn} onClick={onRegister}>
              免费注册体验 <ArrowRightOutlined />
            </Button>
          )}
          <Button
            size="large"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.4)',
            }}
            onClick={onLogin}
          >
            已有账号登录
          </Button>
        </Space>
      </Space>
    </div>
  );
}

/** 门户页脚：dwjk 等专属版只显示平台品牌（隐藏公司主体与产品线名） */
export function PortalFooter({ brandName }: { brandName?: string }) {
  return (
    <div style={styles.footer}>
      <Typography.Text style={{ color: 'rgba(255,255,255,0.65)' }}>
        {brandName ? `© 2026 ${brandName}` : '© 2026 南昌猎手猫数字科技有限公司 · 猎手云 Pro · All rights reserved.'}
      </Typography.Text>
    </div>
  );
}

/* ============================================================
 * PortalNav · 吸顶导航（logo + 品牌 + 锚点菜单 + 登录）
 * ============================================================ */

export interface NavItem {
  /** 锚点 key（对应区块 id） */
  key: string;
  label: string;
}

interface NavProps {
  edition: EditionConfig;
  menu: NavItem[];
  onLogin: () => void;
  onRegister?: () => void;
}

/** 吸顶导航：sticky 不遮挡 Hero，滚动过顶后吸附 */
export function PortalNav({ edition, menu, onLogin, onRegister }: NavProps) {
  return (
    <div style={styles.nav}>
      <a href="#top" style={styles.navBrand}>
        <img src={edition.logo} alt={edition.brandName} style={styles.navLogo} />
        <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }}>
          {edition.brandName}
        </span>
      </a>
      <div style={styles.navMenu}>
        {menu.map((m) => (
          <a key={m.key} href={`#${m.key}`} style={styles.navLink}>
            {m.label}
          </a>
        ))}
      </div>
      <Space size="small">
        {onRegister && edition.allowRegister && (
          <Button type="primary" ghost size="small" onClick={onRegister}>
            免费注册
          </Button>
        )}
        <Button
          type="primary"
          size="small"
          style={{ background: edition.primaryColor, borderColor: edition.primaryColor }}
          onClick={onLogin}
        >
          登录
        </Button>
      </Space>
    </div>
  );
}

/* ============================================================
 * FadeIn · 滚动淡入上滑（IntersectionObserver，零依赖）
 * ============================================================ */

interface FadeInProps {
  children: React.ReactNode;
  /** 动画延迟 ms（多卡片交错） */
  delay?: number;
  style?: React.CSSProperties;
}

/** 进入视口淡入上滑；无 IntersectionObserver 环境（jsdom）直接显示 */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
 * SectionHeader · 统一区块标题（小标 / 标题 / 副文案）
 * ============================================================ */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  desc?: string;
}

export function SectionHeader({ eyebrow, title, desc }: SectionHeaderProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      {eyebrow && (
        <Text type="secondary" style={{ letterSpacing: 2, fontSize: 13 }}>
          {eyebrow}
        </Text>
      )}
      <Title level={2} style={{ marginTop: eyebrow ? 8 : 0, marginBottom: desc ? 8 : 0 }}>
        {title}
      </Title>
      {desc && (
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          {desc}
        </Paragraph>
      )}
    </div>
  );
}

/* ============================================================
 * PortalStats · 数据统计条（版别相关数字）
 * ============================================================ */

interface StatsProps {
  stats: EditionStat[];
  primaryColor: string;
}

export function PortalStats({ stats, primaryColor }: StatsProps) {
  return (
    <div style={{ background: '#001529' }}>
      <div style={styles.statsRow}>
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 100}>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: primaryColor }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.label}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * FeatureCard · 能力卡（图标来自配置 icon 名 → ICON_MAP）
 * ============================================================ */

const ICON_MAP: Record<string, React.ReactNode> = {
  cluster: <ClusterOutlined />,
  safety: <SafetyCertificateOutlined />,
  team: <TeamOutlined />,
  appstore: <AppstoreOutlined />,
  folder: <FolderOpenOutlined />,
  file: <FileTextOutlined />,
  clock: <ClockCircleOutlined />,
  audit: <AuditOutlined />,
  'user-add': <UserAddOutlined />,
  idcard: <IdcardOutlined />,
  calendar: <CalendarOutlined />,
  'account-book': <AccountBookOutlined />,
  database: <DatabaseOutlined />,
  swap: <SwapOutlined />,
  setting: <SettingOutlined />,
  experiment: <ExperimentOutlined />,
};

interface FeatureCardProps {
  feature: EditionFeature;
  primaryColor: string;
}

export function FeatureCard({ feature, primaryColor }: FeatureCardProps) {
  const icon = ICON_MAP[feature.icon] ?? <AppstoreOutlined />;
  return (
    <div style={styles.featureCard}>
      <div style={{ fontSize: 30, color: primaryColor }}>{icon}</div>
      <Space style={{ marginTop: 12 }}>
        <Text strong style={{ fontSize: 16 }}>
          {feature.title}
        </Text>
        {feature.done ? <Tag color="green">已上线</Tag> : <Tag>规划中</Tag>}
      </Space>
      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
        {feature.desc}
      </Paragraph>
    </div>
  );
}

/* ============================================================
 * PortalFaq · 常见问题折叠面板
 * ============================================================ */

interface FaqProps {
  items: EditionFaq[];
}

export function PortalFaq({ items }: FaqProps) {
  return (
    <Collapse ghost items={items.map((f, i) => ({ key: String(i), label: f.q, children: f.a }))} />
  );
}

/* ============================================================
 * PortalCta · 底部转化横幅（版别主色渐变）
 * ============================================================ */

interface CtaProps {
  cta: EditionCta;
  primaryColor: string;
  onAction: () => void;
}

export function PortalCta({ cta, primaryColor, onAction }: CtaProps) {
  return (
    <div
      style={{
        background: `linear-gradient(120deg, ${primaryColor}, ${primaryColor}99)`,
        padding: '64px 24px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          {cta.title}
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>{cta.desc}</Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ background: '#fff', borderColor: '#fff' }}
          onClick={onAction}
        >
          {cta.buttonText} <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
 * 样式
 * ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 56,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
  },
  navBrand: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  navLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    objectFit: 'contain',
    marginRight: 8,
    background: '#fff',
  },
  navMenu: { display: 'flex', gap: 20 },
  navLink: { color: 'rgba(0,0,0,0.65)', textDecoration: 'none', fontSize: 14 },
  brand: { display: 'flex', alignItems: 'center', marginBottom: 8 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    objectFit: 'contain',
    marginRight: 8,
    background: '#fff',
  },
  brandText: { fontSize: 18, fontWeight: 600, color: '#fff' },
  heroBtn: { background: '#fff', color: '#1677ff' },
  footer: { background: '#001529', padding: '24px', textAlign: 'center' },
  statsRow: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '48px 24px',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureCard: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
    height: '100%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
};

/** Hero 渐变背景（按版别主色生成三档渐变） */
function heroStyle(primary: string): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 55%, ${primary}66 100%)`,
    padding: '96px 24px',
    display: 'flex',
    justifyContent: 'center',
  };
}
